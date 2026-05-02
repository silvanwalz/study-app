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
      // 1. Start Simli Auto session
      const res = await fetch("https://api.simli.ai/auto/start/configurable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-simli-api-key": process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        },
        body: JSON.stringify({
          faceId: process.env.NEXT_PUBLIC_SIMLI_FACE_ID,
          systemPrompt:
            "You are a friendly test assistant. You speak exclusively in Standard German (Hochdeutsch), using informal du. Keep responses to 1-2 sentences. Say hello and ask how the user is doing.",
          firstMessage:
            "Hallo! Schön, dass du da bist. Wie geht es dir?",
          customLLMConfig: {
            model: "gpt-4.1",
            baseURL: "https://api.openai.com/v1",
            llmAPIKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          },
          ttsProvider: "Cartesia",
          language: "de",
          maxSessionLength: 120,
          maxIdleTime: 30,
          createTranscript: true,
        }),
      });

      const data = await res.json();
      console.log("Session response:", data);

      if (!res.ok || !data.roomUrl) {
        setStatus("API Fehler: " + JSON.stringify(data));
        return;
      }

      setSessionId(data.sessionId);
      setStatus("Session erhalten, verbinde mit Daily...");

      // 2. Join the Daily room
      const callObject = Daily.createCallObject({
        audioSource: true,
        videoSource: false, // We don't send our video
      });
      callObjectRef.current = callObject;

      // Handle remote participant tracks (the avatar)
      callObject.on("track-started", (event) => {
        console.log("Track started:", event.track.kind, event.participant);
        if (event.participant && !event.participant.local) {
          if (event.track.kind === "video" && videoRef.current) {
            const stream = new MediaStream([event.track]);
            videoRef.current.srcObject = stream;
          }
          if (event.track.kind === "audio" && audioRef.current) {
            const stream = new MediaStream([event.track]);
            audioRef.current.srcObject = stream;
          }
        }
      });

      callObject.on("joined-meeting", () => {
        console.log("Joined meeting!");
        setIsConnected(true);
        setStatus("Verbunden! Sprich ins Mikrofon.");
      });

      callObject.on("error", (error) => {
        console.error("Daily error:", error);
        setStatus("Daily Fehler: " + JSON.stringify(error));
      });

      callObject.on("left-meeting", () => {
        console.log("Left meeting");
        setIsConnected(false);
        setStatus("Gespräch beendet");
      });

      // Join the room
      await callObject.join({ url: data.roomUrl });

    } catch (error) {
      console.error("Error:", error);
      setStatus("Fehler: " + error.message);
    }
  };

  const stopSession = async () => {
    if (callObjectRef.current) {
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }
    setIsConnected(false);
    setStatus("Getrennt");
  };

  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Simli Test</h1>
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
          disabled={status === "Starte Session..." || status === "Session erhalten, verbinde mit Daily..."}
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
        Dies ist ein Test.
      </p>
    </div>
  );
}