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
  const userTranscriptRef = useRef([]);
  const sessionStartTimeRef = useRef(null);

  // Save full transcript to Google Drive
  var saveTranscriptToDrive = async function (sid, fullTranscript) {
    var url = process.env.NEXT_PUBLIC_TRANSCRIPT_URL;
    if (!url) {
      console.warn("No TRANSCRIPT_URL configured");
      console.log("FULL TRANSCRIPT:", JSON.stringify(fullTranscript, null, 2));
      return;
    }

    var payload = {
      participantId: "TEST",
      group: "A",
      persona: "FINN",
      scenario: "PFLEGE",
      sessionId: sid || "unknown",
      savedAt: new Date().toISOString(),
      transcript: fullTranscript,
    };

    try {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      console.log("Full transcript saved to Drive (" + fullTranscript.length + " entries)");
    } catch (error) {
      console.error("Failed to save transcript:", error);
    }
  };

  // Fetch bot responses from OpenAI API via our server-side proxy
  var fetchBotResponses = async function () {
    try {
      var res = await fetch("/api/get-completions?limit=20");
      var data = await res.json();

      if (!data.data) return [];

      // Filter completions that happened during our session
      var sessionStart = sessionStartTimeRef.current;
      var botResponses = [];

      data.data.forEach(function (completion) {
        // Only include completions from after session start
        if (completion.created >= sessionStart) {
          var content = completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message &&
            completion.choices[0].message.content;

          if (content) {
            botResponses.push({
              role: "bot",
              content: content,
              timestamp: new Date(completion.created * 1000).toISOString(),
              completionId: completion.id,
            });
          }
        }
      });

      // Sort by timestamp (oldest first)
      botResponses.sort(function (a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });

      return botResponses;
    } catch (error) {
      console.error("Failed to fetch bot responses:", error);
      return [];
    }
  };

  // Merge user transcript and bot responses by timestamp
  var mergeTranscripts = function (userEntries, botEntries) {
    // First: merge consecutive user chunks that are close together (< 4 seconds apart)
    var mergedUser = [];
    userEntries.forEach(function (entry) {
      var last = mergedUser[mergedUser.length - 1];
      if (last) {
        var timeDiff = (new Date(entry.timestamp) - new Date(last.timestamp)) / 1000;
        if (timeDiff < 4) {
          // Merge with previous entry
          last.content = last.content + " " + entry.content;
          return;
        }
      }
      mergedUser.push({
        role: "user",
        content: entry.content,
        timestamp: entry.timestamp,
      });
    });

    // Combine user and bot entries
    var all = [];
    mergedUser.forEach(function (entry) { all.push(entry); });
    botEntries.forEach(function (entry) { all.push(entry); });

    // Sort by timestamp
    all.sort(function (a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    return all;
  };

  var startSession = async function () {
    setStatus("Starte Session...");
    userTranscriptRef.current = [];
    sessionStartTimeRef.current = Math.floor(Date.now() / 1000); // Unix timestamp

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

      // Capture user speech via app-message events (Deepgram transcription)
      callObject.on("app-message", function (event) {
        if (!event.data) return;
        try {
          var msgData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

          if (msgData.is_final === true && msgData.text && msgData.text.trim() !== "") {
            // Only capture user speech (not Chatbot)
            if (msgData.user_name !== "Chatbot") {
              var text = msgData.text.trim();
              var prev = userTranscriptRef.current;
              var last = prev[prev.length - 1];
              if (last && last.content === text) return;

              userTranscriptRef.current = prev.concat([{
                role: "user",
                content: text,
                timestamp: msgData.timestamp || new Date().toISOString(),
              }]);
            }
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

      callObject.on("left-meeting", async function () {
        setIsConnected(false);
        setStatus("Gespräch beendet - Lade Bot-Antworten...");

        // Wait a moment for OpenAI to process the last completion
        await new Promise(function (resolve) { setTimeout(resolve, 3000); });

        // Fetch bot responses from OpenAI
        var botResponses = await fetchBotResponses();
        console.log("Bot responses from OpenAI:", botResponses.length);
        console.log("User entries from Deepgram:", userTranscriptRef.current.length);

        // Merge into full transcript
        var fullTranscript = mergeTranscripts(userTranscriptRef.current, botResponses);
        console.log("Full transcript:", fullTranscript.length, "entries");
        console.log("Full transcript data:", JSON.stringify(fullTranscript, null, 2));

        // Auto-save to Google Drive
        await saveTranscriptToDrive(data.sessionId, fullTranscript);
        setStatus("Transkript gespeichert (" + fullTranscript.length + " Eintraege: " + userTranscriptRef.current.length + " User + " + botResponses.length + " Bot)");
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
