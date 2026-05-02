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
  const transcriptRef = useRef([]);

  const saveTranscriptToDrive = async function (sid, transcriptData) {
    var url = process.env.NEXT_PUBLIC_TRANSCRIPT_URL;
    if (!url) {
      console.warn("No TRANSCRIPT_URL configured, logging transcript to console");
      console.log("TRANSCRIPT:", JSON.stringify(transcriptData, null, 2));
      return;
    }

    var payload = {
      participantId: "TEST",
      group: "A",
      persona: "FINN",
      scenario: "PFLEGE",
      sessionId: sid || "unknown",
      savedAt: new Date().toISOString(),
      transcript: transcriptData,
    };

    try {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      console.log("Transcript saved to Drive (" + transcriptData.length + " entries)");
    } catch (error) {
      console.error("Failed to save transcript:", error);
    }
  };

  const startSession = async () => {
    setStatus("Starte Session...");
    transcriptRef.current = [];

    try {
      var requestBody = {
        faceId: "f25b12e6-a25d-42a7-8846-3a494cedd576",
        systemPrompt: 'You are FINN, a thoughtful and analytical AI companion. You speak exclusively in Standard German (Hochdeutsch), using informal "du" address.\n\nCore Personality:\n- You are calm, measured, and intellectually curious.\n- You approach moral dilemmas by carefully examining different perspectives without favoring one.\n- You ask clarifying questions that help the user think more precisely about their own values and assumptions.\n- You do NOT give recommendations or express a personal opinion.\n- You do NOT use emotional language or validate feelings before engaging with the content.\n\nCommunication Style:\n- Speak in complete, well-structured sentences.\n- Use a neutral, professional tone, warm enough to be approachable, but never effusive.\n- NEVER use empathy-first language.\n\nConversation Flow:\n- Begin by briefly acknowledging the dilemma, then ask a focused question.\n- After approximately 6-8 exchanges, wrap up with a brief summary and a reflection question.\n\nStrict Rules:\n- NEVER recommend a specific course of action.\n- NEVER break character or switch to English.\n- Keep responses concise: 2-4 sentences per turn.\n\nScenario Context (DO NOT read this aloud):\nThe user has read a scenario about a 27-year-old woman whose seriously ill mother needs experimental treatment in Canada. She must give up her life plan for 18 months. Her mother refuses the sacrifice. The moral tension: respecting autonomy vs. urge to act.\nBegin by briefly referencing the dilemma. Do NOT summarize it.',
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
      setStatus("Verbinde...");

      var callObject = Daily.createCallObject({
        audioSource: true,
        videoSource: false,
      });
      callObjectRef.current = callObject;

      // Avatar video/audio
      callObject.on("track-started", function (event) {
        if (event.participant && !event.participant.local) {
          if (event.track.kind === "video" && videoRef.current) {
            videoRef.current.srcObject = new MediaStream([event.track]);
          }
          if (event.track.kind === "audio" && audioRef.current) {
            audioRef.current.srcObject = new MediaStream([event.track]);
          }
        }
      });

      // Invisible transcript capture via app-message events
      callObject.on("app-message", function (event) {
        if (!event.data) return;
        try {
          var msgData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

          if (msgData.is_final === true && msgData.text && msgData.text.trim() !== "") {
            var role = msgData.user_name === "Chatbot" ? "bot" : "user";
            var text = msgData.text.trim();

            // Deduplicate
            var prev = transcriptRef.current;
            var last = prev[prev.length - 1];
            if (last && last.content === text && last.role === role) {
              return;
            }

            transcriptRef.current = prev.concat([{
              role: role,
              content: text,
              timestamp: msgData.timestamp || new Date().toISOString(),
            }]);
          }
        } catch (e) {
          // ignore
        }
      });

      callObject.on("joined-meeting", function () {
        setIsConnected(true);
        setStatus("Verbunden! Sprich ins Mikrofon.");
      });

      callObject.on("error", function (error) {
        console.error("Daily error:", error);
      });

      callObject.on("left-meeting", function () {
        setIsConnected(false);
        setStatus("Gespräch beendet - Transkript wird gespeichert...");

        // Auto-save transcript to Google Drive
        saveTranscriptToDrive(data.sessionId, transcriptRef.current).then(function () {
          setStatus("Gespräch beendet - Transkript gespeichert (" + transcriptRef.current.length + " Einträge)");
        });
      });

      await callObject.join({ url: data.roomUrl });

    } catch (error) {
      console.error("Error:", error);
      setStatus("Fehler: " + error.message);
    }
  };

  var stopSession = async function () {
    if (callObjectRef.current) {
      // The left-meeting event handler will auto-save the transcript
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }
    setIsConnected(false);
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

      <div style={{
        width: "400px",
        height: "400px",
        background: "#111",
        margin: "20px auto",
        borderRadius: "12px",
        overflow: "hidden",
      }}>
        <video ref={videoRef} autoPlay playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <audio ref={audioRef} autoPlay />
      </div>

      {!isConnected ? (
        <button onClick={startSession} disabled={status.includes("...")}
          style={{ padding: "12px 24px", fontSize: "16px", background: "#2563eb",
            color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Test starten
        </button>
      ) : (
        <button onClick={stopSession}
          style={{ padding: "12px 24px", fontSize: "16px", background: "#dc2626",
            color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Stoppen
        </button>
      )}

      <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        Test: FINN + Pflege-Dilemma + ElevenLabs Paul
      </p>
    </div>
  );
}
