"use client";
import { useRef, useState, useEffect } from "react";
import Daily from "@daily-co/daily-js";

export default function TestPage() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const callObjectRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Bereit");
  const [sessionId, setSessionId] = useState(null);

  const startSession = async () => {
    setStatus("Starte Session...");

    try {
	  var requestBody = {
        faceId: "f25b12e6-a25d-42a7-8846-3a494cedd576",
        systemPrompt: '... (gleich wie bisher) ...',
        firstMessage: "Das ist eine Situation mit mehreren Spannungsfeldern. Was war dein erster Gedanke, als du das Szenario gelesen hast?",
        customLLMConfig: {
          model: "gpt-4.1",
          baseURL: "https://api.openai.com/v1",
          llmAPIKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        },
        language: "de",
        maxSessionLength: 120,
        maxIdleTime: 30,
        ttsProvider: "ElevenLabs",
        voiceId: "5Q0t7uMcjvnagumLfvZi",
      };

      console.log("Request body:", JSON.stringify(requestBody));

      var res = await fetch("https://api.simli.ai/auto/start/configurable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-simli-api-key": process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      var data = await res.json();
      console.log("Session response:", data);

      if (!res.ok || !data.roomUrl) {
        setStatus("API Fehler: " + JSON.stringify(data));
        return;
      }

      setSessionId(data.sessionId);
      setStatus("Session erhalten, verbinde mit Daily...");

      var callObject = Daily.createCallObject({
        audioSource: true,
        videoSource: false,
      });
      callObjectRef.current = callObject;

      callObject.on("track-started", function (event) {
        console.log("Track started:", event.track.kind, event.participant);
        if (event.participant && !event.participant.local) {
          if (event.track.kind === "video" && videoRef.current) {
            videoRef.current.srcObject = new MediaStream([event.track]);
          }
          if (event.track.kind === "audio" && audioRef.current) {
            audioRef.current.srcObject = new MediaStream([event.track]);
          }
        }
      });

      callObject.on("joined-meeting", function () {
        console.log("Joined meeting!");
        setIsConnected(true);
        setStatus("Verbunden! Sprich ins Mikrofon.");
      });

      callObject.on("error", function (error) {
        console.error("Daily error:", error);
        setStatus("Daily Fehler: " + JSON.stringify(error));
      });

      callObject.on("left-meeting", function () {
        console.log("Left meeting");
        setIsConnected(false);
        setStatus("Gespräch beendet");
      });

      await callObject.join({ url: data.roomUrl });

    } catch (error) {
      console.error("Error:", error);
      setStatus("Fehler: " + error.message);
    }
  };

  var stopSession = async function () {
    if (callObjectRef.current) {
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }
    setIsConnected(false);
    setStatus("Getrennt");
  };

  useEffect(function () {
    return function () {
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Simli Test - FINN Pflege</h1>
      <p>Status: <strong>{status}</strong></p>
      {sessionId && (
        <p style={{ fontSize: "11px", color: "#999" }}>Session: {sessionId}</p>
      )}

      <div
        style={{
          width: "400px",
          height: "400px",
          background: "#111",
          margin: "20px auto",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <audio ref={audioRef} autoPlay />
      </div>

      {!isConnected ? (
        <button
          onClick={startSession}
          disabled={status.includes("...")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Test starten
        </button>
      ) : (
        <button
          onClick={stopSession}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Stoppen
        </button>
      )}

      <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        Test: FINN + Pflege-Dilemma + ElevenLabs Voice (5Q0t7uMcjvnagumLfvZi)
      </p>
    </div>
  );
}
