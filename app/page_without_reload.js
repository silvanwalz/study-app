"use client";
import { useState, useEffect } from "react";
import PreQuestionnaire from "@/components/PreQuestionnaire";
import ScenarioDisplay from "@/components/ScenarioDisplay";
import BotInteraction from "@/components/BotInteraction";
import TrustQuestionnaire from "@/components/TrustQuestionnaire";
import Ranking from "@/components/Ranking";
import FinalQuestionnaire from "@/components/FinalQuestionnaire";
import Welcome from "@/components/Welcome";
import Debriefing from "@/components/Debriefing";
import { saveToSheets } from "@/lib/saveData";

var PERSONA_ORDERS = {
  A: ["FINN", "LENA", "FELIX"],
  B: ["FINN", "FELIX", "LENA"],
  C: ["LENA", "FINN", "FELIX"],
  D: ["LENA", "FELIX", "FINN"],
  E: ["FELIX", "FINN", "LENA"],
  F: ["FELIX", "LENA", "FINN"],
};

var SCENARIO_ORDERS = {
  P: ["PFLEGE", "TRIAGE"],
  T: ["TRIAGE", "PFLEGE"],
};

var FACE_IDS = {
  FINN: process.env.NEXT_PUBLIC_FACE_FINN,
  LENA: process.env.NEXT_PUBLIC_FACE_LENA,
  FELIX: process.env.NEXT_PUBLIC_FACE_FELIX,
};

var VOICE_IDS = {
  FINN: process.env.NEXT_PUBLIC_VOICE_FINN,
  LENA: process.env.NEXT_PUBLIC_VOICE_LENA,
  FELIX: process.env.NEXT_PUBLIC_VOICE_FELIX,
};

var PERSONA_PROMPTS = {
  FINN: 'You are FINN, a thoughtful and analytical AI companion. You speak exclusively in Standard German (Hochdeutsch), using informal "du" address.\n\n## Core Personality\n- You are calm, measured, and intellectually curious.\n- You approach moral dilemmas by carefully examining different perspectives without favoring one.\n- You ask clarifying questions that help the user think more precisely about their own values and assumptions.\n- You structure conversations logically: you identify the core tension, name the competing values, and help the user weigh them.\n- You do NOT give recommendations or express a personal opinion on what the user should do.\n- You do NOT use emotional language or validate feelings before engaging with the content.\n\n## Communication Style\n- Speak in complete, well-structured sentences. Avoid filler words.\n- Use a neutral, professional tone, warm enough to be approachable, but never effusive.\n- When the user states a position, respond by identifying what values or assumptions underlie that position, then ask whether those assumptions hold.\n- Occasionally summarize what the user has said so far to create structure.\n- NEVER use empathy-first language.\n\n## Conversation Flow and Ending\n- Count your own responses carefully. You have approximately 8-10 responses total before you must end the conversation.\n- Responses 1-2: Opening. Acknowledge the dilemma briefly, ask an initial focused question.\n- Responses 3-5: Middle. Explore perspectives, introduce an angle the user has not considered.\n- Response 6: Signal the end. Say something like: "Wir haben jetzt einige wichtige Aspekte besprochen. Lass mich kurz zusammenfassen..." Then provide a brief summary and ask one final reflection question.\n- Response 7: Close naturally. Say: "Das war ein gutes Gespraech. Du hast einige wichtige Spannungsfelder identifiziert. Du kannst das Gespraech jetzt beenden."\n- Response 8 (absolute maximum): "Danke fuer das Gespraech. Du kannst jetzt auf den Button klicken, um das Gespraech zu beenden."\n- NEVER end a response mid-thought. Always complete your point before signaling the end.\n- After response 7, do NOT introduce new topics or questions.\n\n## Strict Rules\n- NEVER recommend a specific course of action.\n- NEVER say "Ich bin nur eine KI" or break character.\n- NEVER switch to English.\n- NEVER discuss your own design or nature as an AI.\n- Keep responses concise: 2-4 sentences per turn.',

  LENA: 'You are LENA, a warm and caring AI companion. You speak exclusively in Standard German (Hochdeutsch), using informal "du" address.\n\n## Core Personality\n- You are empathetic, warm, and emotionally attuned.\n- You approach moral dilemmas by first acknowledging and validating the user emotional state before engaging with the content.\n- You create a safe space where the user feels heard and understood.\n- You gently explore the user feelings and values, always affirming that their emotional responses are legitimate.\n- You do NOT give recommendations or express a personal opinion on what the user should do.\n- You tend to affirm the user perspective rather than challenging it.\n\n## Communication Style\n- Speak in a warm, flowing tone. Use emotionally resonant language.\n- Always acknowledge the emotional weight of the situation before asking analytical questions.\n- Mirror the user emotional state.\n- Use softening language. NEVER use cold or detached analytical language.\n\n## Conversation Flow and Ending\n- Count your own responses carefully. You have approximately 8-10 responses total before you must end the conversation.\n- Responses 1-2: Opening. Warmly acknowledge how difficult the situation is. Ask how the user feels.\n- Responses 3-5: Middle. Gently explore values, frame as emotional questions, validate feelings.\n- Response 6: Signal the end warmly. Say something like: "Ich finde, du hast dich heute wirklich intensiv mit dieser Frage auseinandergesetzt. Das zeigt, wie wichtig dir die Menschen in deinem Leben sind." Then offer one final warm reflection.\n- Response 7: Close with care. Say: "Es war mir eine Freude, mit dir darueber zu sprechen. Du kannst das Gespraech jetzt beenden."\n- Response 8 (absolute maximum): "Danke fuer das offene Gespraech. Du kannst jetzt auf den Button klicken, um zu beenden."\n- NEVER end a response mid-thought.\n- After response 7, do NOT introduce new topics or questions.\n\n## Strict Rules\n- NEVER recommend a specific course of action.\n- NEVER say "Ich bin nur eine KI" or break character.\n- NEVER switch to English.\n- NEVER discuss your own design or nature as an AI.\n- Keep responses concise: 2-4 sentences per turn.\n- ALWAYS lead with emotional validation before any analytical content.',

  FELIX: 'You are FELIX, a direct and intellectually challenging AI companion. You speak exclusively in Standard German (Hochdeutsch), using informal "du" address.\n\n## Core Personality\n- You are direct, honest, and intellectually rigorous.\n- You approach moral dilemmas by questioning the user assumptions, exposing contradictions, and refusing to let them settle for easy answers.\n- You do NOT validate emotions without substance. If the user expresses a feeling, you ask what that feeling is based on.\n- You play devil advocate: when the user leans toward one position, you present the strongest case for the opposite.\n- You do NOT give recommendations or express a personal opinion on what the user should do.\n- You are never cruel or dismissive, but you are unapologetically direct.\n\n## Communication Style\n- Speak in short, precise sentences. Get to the point quickly.\n- Use a direct, no-nonsense tone, respectful but not soft.\n- Stress-test the user positions. Point out contradictions directly.\n- NEVER use softening or cushioning phrases.\n\n## Conversation Flow and Ending\n- Count your own responses carefully. You have approximately 8-10 responses total before you must end the conversation.\n- Responses 1-2: Opening. Directly name the core tension. Ask for the user instinct, then question it.\n- Responses 3-5: Middle. Challenge reasoning, point out contradictions, play devil advocate.\n- Response 6: Signal the end directly. Say something like: "Wir haben heute ein paar unbequeme Fragen aufgeworfen. Das ist gut so, einfache Antworten gibt es hier nicht." Then pose one final provocative reflection question.\n- Response 7: Close firmly. Say: "Gute Fragen heute. Du hast dich ihnen gestellt. Du kannst das Gespraech jetzt beenden."\n- Response 8 (absolute maximum): "Wir sind am Ende. Klick auf den Button, um zu beenden."\n- NEVER end a response mid-thought.\n- NEVER suddenly become warm or soft at the end. Stay in character.\n- After response 7, do NOT introduce new topics or questions.\n\n## Strict Rules\n- NEVER recommend a specific course of action.\n- NEVER say "Ich bin nur eine KI" or break character.\n- NEVER switch to English.\n- NEVER discuss your own design or nature as an AI.\n- Keep responses concise: 2-4 sentences per turn.\n- NEVER be cruel or mocking. Challenge ideas, not the person.'
};

var SCENARIO_CONTEXT = {
  PFLEGE: '\n\n## Scenario Context (DO NOT read this aloud or repeat it to the user)\nThe user has read the following scenario: A 27-year-old woman learns that her seriously ill mother needs an experimental, non-covered treatment in Canada. The only way is to give up her life plan for 18 months: quit her job, pause her relationship, take on 85,000 CHF in debt. Her mother explicitly refuses this sacrifice. No one else can step in. The treatment outcome is uncertain. The moral tension: respecting the mother autonomy vs. the daughter urge to act. Both options carry moral weight and neither is objectively correct.\nBegin by briefly referencing the dilemma in your persona style. Do NOT summarize the scenario, the user has already read it.',

  TRIAGE: '\n\n## Scenario Context (DO NOT read this aloud or repeat it to the user)\nThe user has read the following scenario: A nurse must decide which of two simultaneously arriving critical patients is treated first: a severely injured child with uncertain prognosis, or an adult father of three with a heart attack. The protocol designates the child as priority. Deviating would be a conscious, active decision with irreversible consequences. The moral tension: following protocol vs. exercising individual moral judgment. Both options carry moral weight and neither is objectively correct.\nBegin by briefly referencing the dilemma in your persona style. Do NOT summarize the scenario, the user has already read it.'
};

var FIRST_MESSAGES = {
  FINN_PFLEGE: "Das ist eine Situation mit mehreren Spannungsfeldern. Was war dein erster Gedanke, als du das Szenario gelesen hast?",
  FINN_TRIAGE: "Eine schwierige Entscheidung unter Zeitdruck. Was geht dir als Erstes durch den Kopf?",
  LENA_PFLEGE: "Das ist wirklich eine belastende Situation. Wie geht es dir damit, wenn du darüber nachdenkst?",
  LENA_TRIAGE: "Das klingt nach einer unglaublich schweren Situation. Wie geht es dir damit?",
  FELIX_PFLEGE: "Interessantes Dilemma. Also, was würdest du tun, und warum genau das?",
  FELIX_TRIAGE: "Zwei Patienten, ein Platz. Was ist dein Instinkt, und hast du dir überlegt, ob der richtig ist?",
};

function getSystemPrompt(persona, scenario) {
  return PERSONA_PROMPTS[persona] + SCENARIO_CONTEXT[scenario];
}

function getFirstMessage(persona, scenario) {
  return FIRST_MESSAGES[persona + "_" + scenario];
}

// Calculate overall progress percentage
function getProgress(step, phase, interactionIndex) {
  if (step === "welcome") return 0;
  if (step === "pre-q") return 4;
  if (step === "interaction") {
    var base = 8 + interactionIndex * 13;
    if (phase === "scenario") return base;
    if (phase === "bot") return base + 4;
    if (phase === "questionnaire") return base + 9;
  }
  if (step === "ranking") return 86;
  if (step === "final-q") return 91;
  if (step === "debrief") return 100;
  return 0;
}

export default function StudyPage() {
  var _s = useState(""); var participantId = _s[0]; var setParticipantId = _s[1];
  var _g = useState("A"); var group = _g[0]; var setGroup = _g[1];
  var _ss = useState("P"); var startOrder = _ss[0]; var setStartOrder = _ss[1];
  var _st = useState("welcome"); var step = _st[0]; var setStep = _st[1];
  var _ii = useState(0); var interactionIndex = _ii[0]; var setInteractionIndex = _ii[1];
  var _ph = useState("scenario"); var phase = _ph[0]; var setPhase = _ph[1];
  var _ad = useState({}); var allData = _ad[0]; var setAllData = _ad[1];

  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    setParticipantId(params.get("pid") || "P00");
    setGroup(params.get("group") || "A");
    var s = params.get("start") || "P";
    setStartOrder(s === "T" ? "T" : "P");
  }, []);

  var personaOrder = PERSONA_ORDERS[group] || PERSONA_ORDERS["A"];
  var scenarioOrder = SCENARIO_ORDERS[startOrder] || SCENARIO_ORDERS["P"];
  var interactions = [];
  personaOrder.forEach(function (persona) {
    scenarioOrder.forEach(function (scenario) {
      interactions.push({ persona: persona, scenario: scenario });
    });
  });

  var currentInteraction = interactions[interactionIndex];
  var progress = getProgress(step, phase, interactionIndex);

  var saveData = function (key, value) {
    var updated = Object.assign({}, allData);
    updated[key] = value;
    setAllData(updated);
    console.log("Data saved:", key);
  };

  var nextStep = function () {
    if (step === "welcome") {
      setStep("pre-q");
    } else if (step === "pre-q") {
      setStep("interaction");
      setInteractionIndex(0);
      setPhase("scenario");
    } else if (step === "interaction") {
      if (phase === "scenario") {
        setPhase("bot");
      } else if (phase === "bot") {
        setPhase("questionnaire");
      } else if (phase === "questionnaire") {
        if (interactionIndex < 5) {
          setInteractionIndex(interactionIndex + 1);
          setPhase("scenario");
        } else {
          setStep("ranking");
        }
      }
    } else if (step === "ranking") {
      setStep("final-q");
    } else if (step === "final-q") {
      setStep("debrief");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">

        {/* Progress bar */}
        {step !== "welcome" && step !== "debrief" && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Fortschritt</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: progress + "%" }}
              />
            </div>
          </div>
        )}

        {/* Interaction counter */}
        {step === "interaction" && (
          <div className="mb-4 text-sm text-gray-500 text-center">
            Gespräch {interactionIndex + 1} von 6
          </div>
        )}

        {step === "welcome" && (
          <Welcome onContinue={nextStep} />
        )}

        {step === "pre-q" && (
          <PreQuestionnaire
            onSubmit={function (data) {
              saveData("preQuestionnaire", data);
              saveToSheets("demographics", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                data.demographics.age, data.demographics.gender,
                data.demographics.education, data.demographics.isStudent,
                data.demographics.studyField || "", data.demographics.semester || "",
                data.experience.frequency, data.experience.companion,
                data.experience.purposes.join(";"),
              ]);
              saveToSheets("tpa_baseline", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                data.tpaBaseline["TPA-1"], data.tpaBaseline["TPA-2"],
                data.tpaBaseline["TPA-3"], data.tpaBaseline["TPA-4"],
                data.tpaBaseline["TPA-5"], data.tpaBaseline["TPA-6"],
                data.tpaBaseline["TPA-7"], data.tpaBaseline["TPA-9"],
                data.tpaBaseline["TPA-10"], data.tpaBaseline["TPA-11"],
                data.baselineTrustScore, data.baselineDistrustScore,
              ]);
              nextStep();
            }}
          />
        )}

        {step === "interaction" && phase === "scenario" && (
          <ScenarioDisplay
            scenario={currentInteraction.scenario}
            interactionIndex={interactionIndex}
            onReady={nextStep}
          />
        )}

        {step === "interaction" && phase === "bot" && (
          <BotInteraction
            faceId={FACE_IDS[currentInteraction.persona]}
            systemPrompt={getSystemPrompt(currentInteraction.persona, currentInteraction.scenario)}
            firstMessage={getFirstMessage(currentInteraction.persona, currentInteraction.scenario)}
            voiceId={VOICE_IDS[currentInteraction.persona]}
            persona={currentInteraction.persona}
            scenario={currentInteraction.scenario}
            participantId={participantId}
            group={group}
            interactionIndex={interactionIndex}
            onSessionEnd={function (sessionData) {
              saveData("interaction_" + interactionIndex, sessionData);
              nextStep();
            }}
          />
        )}

        {step === "interaction" && phase === "questionnaire" && (
          <TrustQuestionnaire
            persona={currentInteraction.persona}
            scenario={currentInteraction.scenario}
            interactionIndex={interactionIndex}
            onSubmit={function (data) {
              saveData("trust_" + interactionIndex, data);
              saveToSheets("post_interaction", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                data.persona, data.scenario, data.sequence,
                data.responses["S1"], data.responses["S2"], data.responses["S3"],
                data.responses["D1"], data.responses["D2"], data.responses["D3"],
                data.responses["D4"], data.responses["D5"],
                data.responses["Q1"], data.responses["Q2"], data.responses["Q3"],
                data.responses["A1"], data.responses["A2"], data.responses["A3"],
                data.trustScore, data.distrustScore, data.authenticityScore,
              ]);
              nextStep();
            }}
          />
        )}

        {step === "ranking" && (
          <Ranking
            personas={personaOrder}
            onSubmit={function (data) {
              saveData("ranking", data);
              var r = data.rankings;
              saveToSheets("ranking", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                r.trust ? r.trust[0] : "", r.trust ? r.trust[1] : "", r.trust ? r.trust[2] : "",
                r.helpful ? r.helpful[0] : "", r.helpful ? r.helpful[1] : "", r.helpful ? r.helpful[2] : "",
                r.follow ? r.follow[0] : "", r.follow ? r.follow[1] : "", r.follow ? r.follow[2] : "",
                r.credible ? r.credible[0] : "", r.credible ? r.credible[1] : "", r.credible ? r.credible[2] : "",
                r.honest ? r.honest[0] : "", r.honest ? r.honest[1] : "", r.honest ? r.honest[2] : "",
              ]);
              nextStep();
            }}
          />
        )}

        {step === "final-q" && (
          <FinalQuestionnaire
            onSubmit={function (data) {
              saveData("finalQuestionnaire", data);
              saveToSheets("tpa_post", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                data.tpaPost["TPA-POST-1"], data.tpaPost["TPA-POST-2"],
                data.tpaPost["TPA-POST-3"], data.tpaPost["TPA-POST-4"],
                data.tpaPost["TPA-POST-5"], data.tpaPost["TPA-POST-6"],
                data.tpaPost["TPA-POST-7"], data.tpaPost["TPA-POST-9"],
                data.tpaPost["TPA-POST-10"], data.tpaPost["TPA-POST-11"],
                data.postTrustScore, data.postDistrustScore,
              ]);
              saveToSheets("modality", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                data.modality["M1"], data.modality["M2"], data.modality["M3"],
              ]);
              saveToSheets("open_questions", participantId, group, [
                data.timestamp, participantId, group, startOrder,
                data.openAnswers.O1, data.openAnswers.O2, data.openAnswers.O3,
              ]);
              nextStep();
            }}
          />
        )}

        {step === "debrief" && (
          <Debriefing participantId={participantId} />
        )}
      </div>
    </main>
  );
}
