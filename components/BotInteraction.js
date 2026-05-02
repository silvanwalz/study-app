"use client";
import { useRef, useState, useEffect } from "react";
import Daily from "@daily-co/daily-js";

export default function BotInteraction({
  faceId,
  systemPrompt,
  firstMessage,
  voiceId,
  persona,
  scenario,
  participantId,
  group,
  interactionIndex,
  onSessionEnd,
}) {
  var videoRef = useRef(null);
  var audioRef = useRef(null);
  var callObjectRef = useRef(null);
  var timerRef = useRef(null);
  var userTranscriptRef = useRef([]);
  var sessionStartTimeRef = useRef(null);
  var sessionIdRef = useRef(null);

  var [isConnected, setIsConnected] = useState(false);
  var [isLoading, setIsLoading] = useState(false);
  var [timeLeft, setTimeLeft] = useState(330);
  var [isSaving, setIsSaving] = useState(false);

  // Merge user transcript chunks that are less than 5 seconds apart
  var mergeUserChunks = function (entries) {
    var merged = [];
    entries.forEach(function (entry) {
      var last = merged[merged.length - 1];
      if (last) {
        var timeDiff = (new Date(entry.timestamp) - new Date(last.timestamp)) / 1000;
        if (timeDiff < 5) {
          last.content = last.content + " " + entry.content;
          return;
        }
      }
      merged.push({
        role: "user",
        content: entry.content,
        timestamp: entry.timestamp,
      });
    });
    return merged;
  };

  // Fetch bot responses from OpenAI via server-side proxy
  var fetchBotResponses = async function () {
    try {
      var res = await fetch("/api/get-completions?limit=20");
      var data = await res.json();

      if (!data.data) return { responses: [], completionIds: [] };

      var sessionStart = sessionStartTimeRef.current;
      var botResponses = [];
      var completionIds = [];

      data.data.forEach(function (completion) {
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
            });
            completionIds.push(completion.id);
          }
        }
      });

      botResponses.sort(function (a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });

      return { responses: botResponses, completionIds: completionIds };
    } catch (error) {
      console.error("Failed to fetch bot responses:", error);
      return { responses: [], completionIds: [] };
    }
  };

  // Save transcript to Google Drive
  var saveTranscriptToDrive = async function (fullTranscript, completionIds) {
    var url = process.env.NEXT_PUBLIC_TRANSCRIPT_URL;
    if (!url) {
      console.warn("No TRANSCRIPT_URL configured");
      console.log("TRANSCRIPT:", JSON.stringify(fullTranscript, null, 2));
      return;
    }

    var payload = {
      participantId: participantId,
      group: group,
      persona: persona,
      scenario: scenario,
      sequence: interactionIndex + 1,
      sessionId: sessionIdRef.current || "unknown",
      openaiCompletionIds: completionIds,
      savedAt: new Date().toISOString(),
      transcript: fullTranscript,
    };

    try {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      console.log("Transcript saved to Drive (" + fullTranscript.length + " entries)");
    } catch (error) {
      console.error("Failed to save transcript:", error);
    }
  };

  var startSession = async function () {
    setIsLoading(true);
    userTranscriptRef.current = [];
    sessionStartTimeRef.current = Math.floor(Date.now() / 1000);

    try {
      var requestBody = {
        faceId: faceId,
        systemPrompt: systemPrompt,
        firstMessage: firstMessage,
        customLLMConfig: {
          model: "gpt-4.1",
          baseURL: "https://api.openai.com/v1",
          llmAPIKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        },
        language: "de",
        maxSessionLength: 330,
        maxIdleTime: 60,
        ttsProvider: "ElevenLabs",
        voiceId: voiceId,
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
        console.error("API error:", data);
        setIsLoading(false);
        return;
      }

      sessionIdRef.current = data.sessionId;

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

      // Capture user speech via app-message events
      callObject.on("app-message", function (event) {
        if (!event.data) return;
        try {
          var msgData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (msgData.is_final === true && msgData.text && msgData.text.trim() !== "") {
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
        setIsLoading(false);

        timerRef.current = setInterval(function () {
          setTimeLeft(function (prev) {
            if (prev <= 1) {
              endSession();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      });

      callObject.on("error", function (error) {
        console.error("Daily error:", error);
        setIsLoading(false);
      });

      callObject.on("left-meeting", function () {
        setIsConnected(false);
        if (timerRef.current) clearInterval(timerRef.current);
      });

      await callObject.join({ url: data.roomUrl });

    } catch (error) {
      console.error("Connection error:", error);
      setIsLoading(false);
    }
  };

  var endSession = async function () {
    if (timerRef.current) clearInterval(timerRef.current);

    if (callObjectRef.current) {
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }

    setIsConnected(false);
    setIsSaving(true);

    // Wait for OpenAI to process the last completion
    await new Promise(function (resolve) { setTimeout(resolve, 3000); });

    // Fetch bot responses
    var result = await fetchBotResponses();
    var botResponses = result.responses;
    var completionIds = result.completionIds;

    // Merge user chunks
    var mergedUser = mergeUserChunks(userTranscriptRef.current);

    // Combine and sort by timestamp
    var fullTranscript = mergedUser.concat(botResponses);
    fullTranscript.sort(function (a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    console.log("Full transcript:", fullTranscript.length, "entries (" + mergedUser.length + " user, " + botResponses.length + " bot)");
    console.log("OpenAI Completion IDs:", completionIds);

    // Save to Google Drive
    await saveTranscriptToDrive(fullTranscript, completionIds);

    setIsSaving(false);

    onSessionEnd({
      sessionId: sessionIdRef.current,
      persona: persona,
      scenario: scenario,
      participantId: participantId,
      duration: 330 - timeLeft,
      openaiCompletionIds: completionIds,
      transcriptEntries: fullTranscript.length,
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(function () {
    return function () {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
      }
    };
  }, []);

  var formatTime = function (seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ":" + s.toString().padStart(2, "0");
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">
        Gespräch mit {persona}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {scenario === "PFLEGE" ? "Pflege-Dilemma" : "Triage-Dilemma"}
      </p>

      <div className="relative mx-auto w-80 h-80 bg-gray-900 rounded-lg overflow-hidden mb-4">
        <video ref={videoRef} autoPlay playsInline
          className="w-full h-full object-cover" />
        <audio ref={audioRef} autoPlay />

        {isConnected && (
          <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded text-sm">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Time warning banner */}
      {isConnected && timeLeft <= 30 && timeLeft > 0 && (
        <div className="bg-orange-100 border border-orange-300 text-orange-700 px-4 py-2 rounded-lg mb-4 text-sm">
          Das Gespräch endet in K\u00FCrze.
        </div>
      )}

      {!isConnected && !isLoading && !isSaving && (
        <button onClick={startSession}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700">
          Gespräch starten
        </button>
      )}

      {isLoading && (
        <p className="text-gray-500">Verbindung wird hergestellt...</p>
      )}

      {isConnected && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Sprich frei ins Mikrofon. Das Gespräch endet automatisch.
          </p>
          <button onClick={endSession}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm">
            Gespräch beenden
          </button>
        </div>
      )}

      {isSaving && (
        <p className="text-gray-500">Gespräch wird gespeichert...</p>
      )}
    </div>
  );
}
