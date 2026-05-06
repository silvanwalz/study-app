"use client";
import { useState } from "react";

// TPA Post-Measurement: Same items as baseline (Pöhler 2016, ohne Items 8 und 12)
const TPA_DISTRUST_ITEMS = [
  { id: "TPA-POST-1", text: "KI-Systeme können täuschend sein." },
  { id: "TPA-POST-2", text: "KI-Systeme verhalten sich hinterhältig." },
  { id: "TPA-POST-3", text: "Ich bin misstrauisch gegenüber den Absichten oder Ergebnissen von KI-Systemen." },
  { id: "TPA-POST-4", text: "Ich bin vorsichtig im Umgang mit KI-Systemen." },
  { id: "TPA-POST-5", text: "KI-Systeme können schädliche oder negative Folgen haben." },
];

const TPA_TRUST_ITEMS = [
  { id: "TPA-POST-6", text: "Ich habe Zuversicht in KI-Systeme." },
  { id: "TPA-POST-7", text: "KI-Systeme geben mir ein Gefühl von Sicherheit." },
  { id: "TPA-POST-9", text: "KI-Systeme sind verlässlich." },
  { id: "TPA-POST-10", text: "KI-Systeme sind zuverlässig." },
  { id: "TPA-POST-11", text: "Ich kann KI-Systemen vertrauen." },
];

const ALL_TPA_ITEMS = [...TPA_DISTRUST_ITEMS, ...TPA_TRUST_ITEMS];

// Modality items (ad-hoc, exploratory)
const MODALITY_ITEMS = [
  { id: "M1", text: "Wie wichtig war der Inhalt der Antworten für dein Vertrauen?" },
  { id: "M2", text: "Wie wichtig war der Tonfall und die Stimme für dein Vertrauen?" },
  { id: "M3", text: "Wie wichtig war das Aussehen (Gesicht, Mimik) für dein Vertrauen?" },
];

export default function FinalQuestionnaire({ onSubmit }) {
  const [tpaPost, setTpaPost] = useState({});
  const [modality, setModality] = useState({});
  const [openAnswers, setOpenAnswers] = useState({ O1: "", O2: "", O3: "" });
  const [currentBlock, setCurrentBlock] = useState(1);

  const handleTpaChange = (itemId, value) => {
    setTpaPost({ ...tpaPost, [itemId]: parseInt(value) });
  };

  const handleModalityChange = (itemId, value) => {
    setModality({ ...modality, [itemId]: parseInt(value) });
  };

  const renderLikertScale = (itemId, value, onChange, leftLabel, rightLabel) => (
    <div className="flex items-center justify-between max-w-md mx-auto mb-1">
      <span className="text-xs text-gray-400 w-24 text-right pr-2">{leftLabel}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((val) => (
          <label key={val} className="flex flex-col items-center cursor-pointer">
            <input
              type="radio"
              name={itemId}
              value={val}
              checked={value === val}
              onChange={(e) => onChange(itemId, parseInt(e.target.value))}
              className="mb-1"
            />
            <span className="text-xs">{val}</span>
          </label>
        ))}
      </div>
      <span className="text-xs text-gray-400 w-24 pl-2">{rightLabel}</span>
    </div>
  );

  const handleSubmit = () => {
    const trustItems = TPA_TRUST_ITEMS.map((item) => tpaPost[item.id]);
    const distrustItems = TPA_DISTRUST_ITEMS.map((item) => tpaPost[item.id]);
    const trustScore = trustItems.reduce((a, b) => a + b, 0) / trustItems.length;
    const distrustScore = distrustItems.reduce((a, b) => a + b, 0) / distrustItems.length;

    onSubmit({
      tpaPost,
      postTrustScore: Math.round(trustScore * 100) / 100,
      postDistrustScore: Math.round(distrustScore * 100) / 100,
      modality,
      openAnswers,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Abschlussfragebogen</h2>

      {/* Block 1: TPA Post-Measurement */}
      {currentBlock === 1 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Block 1 von 3: Deine Einstellung zu KI nach der Studie</p>
          <p className="text-sm text-gray-500 mb-6">
            Bitte bewerte die folgenden Aussagen erneut in Bezug auf KI-Systeme allgemein,
            so wie du sie jetzt, nach den Gesprächen, empfindest.
          </p>

          {ALL_TPA_ITEMS.map((item) => (
            <div key={item.id} className="mb-5">
              <p className="text-sm mb-2">{item.text}</p>
              {renderLikertScale(
                item.id,
                tpaPost[item.id],
                handleTpaChange,
                "Trifft überhaupt nicht zu",
                "Trifft voll zu"
              )}
            </div>
          ))}

          <button
            onClick={() => {
              if (Object.keys(tpaPost).length < ALL_TPA_ITEMS.length) {
                alert("Bitte bewerte alle Aussagen.");
                return;
              }
              setCurrentBlock(2);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Block 2: Modality Assessment */}
      {currentBlock === 2 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Block 2 von 3: Was war dir wichtig?</p>
          <p className="text-sm text-gray-500 mb-6">
            Denke an alle Gespräche zurück. Wie wichtig waren die folgenden Aspekte
            für dein Vertrauen in die Bots?
          </p>

          {MODALITY_ITEMS.map((item) => (
            <div key={item.id} className="mb-5">
              <p className="text-sm mb-2">{item.text}</p>
              {renderLikertScale(
                item.id,
                modality[item.id],
                handleModalityChange,
                "Überhaupt nicht wichtig",
                "Sehr wichtig"
              )}
            </div>
          ))}

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setCurrentBlock(1)}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Zurück
            </button>
            <button
              onClick={() => {
                if (Object.keys(modality).length < MODALITY_ITEMS.length) {
                  alert("Bitte bewerte alle Aussagen.");
                  return;
                }
                setCurrentBlock(3);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      {/* Block 3: Open Questions */}
      {currentBlock === 3 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Block 3 von 3: Deine Gedanken</p>
          <p className="text-sm text-gray-500 mb-6">
            Bitte beantworte die folgenden Fragen in eigenen Worten.
          </p>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Was hat dich am meisten überrascht an den Gesprächen?
            </label>
            <textarea
              value={openAnswers.O1}
              onChange={(e) => setOpenAnswers({ ...openAnswers, O1: e.target.value })}
              rows={3}
              className="border rounded px-3 py-2 w-full text-sm"
              placeholder="Deine Antwort..."
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Gab es einen Moment, in dem du einem Bot besonders vertraut oder besonders
              misstraut hast? Beschreibe diesen Moment kurz.
            </label>
            <textarea
              value={openAnswers.O2}
              onChange={(e) => setOpenAnswers({ ...openAnswers, O2: e.target.value })}
              rows={3}
              className="border rounded px-3 py-2 w-full text-sm"
              placeholder="Deine Antwort..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Würdest du in Zukunft eine KI bei einer persönlichen Entscheidung
              um Rat fragen? Warum oder warum nicht?
            </label>
            <textarea
              value={openAnswers.O3}
              onChange={(e) => setOpenAnswers({ ...openAnswers, O3: e.target.value })}
              rows={3}
              className="border rounded px-3 py-2 w-full text-sm"
              placeholder="Deine Antwort..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentBlock(2)}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Zurück
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Studie abschliessen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
