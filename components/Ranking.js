"use client";
import { useState } from "react";

const RANKING_DIMENSIONS = [
  {
    id: "trust",
    label: "Ordne die drei Bots danach, wie sehr du ihnen vertraut hast.",
    sublabel: "Höchstes Vertrauen zuerst.",
  },
  {
    id: "helpful",
    label: "Ordne die drei Bots danach, wie hilfreich ihr Rat war.",
    sublabel: "Hilfreichster zuerst.",
  },
  {
    id: "follow",
    label: "Wenn du in einer echten Lebenssituation vor einem moralischen Dilemma stehen würdest: Wessen Rat würdest du am ehesten folgen?",
    sublabel: "Am ehesten folgen zuerst.",
  },
  {
    id: "credible",
    label: "Ordne die drei Bots danach, wie glaubwürdig sie auf dich gewirkt haben.",
    sublabel: "Glaubwürdigster zuerst.",
  },
  {
    id: "honest",
    label: "Ordne die drei Bots danach, wie ehrlich sie auf dich gewirkt haben.",
    sublabel: "Ehrlichster zuerst.",
  },
];

export default function Ranking({ personas, onSubmit }) {
  const [rankings, setRankings] = useState({});
  const [currentDimension, setCurrentDimension] = useState(0);

  const handleSelect = (position, persona) => {
    const dimId = RANKING_DIMENSIONS[currentDimension].id;
    const currentRanking = rankings[dimId] || [null, null, null];
    const newRanking = [...currentRanking];

    const existingPos = newRanking.indexOf(persona);
    if (existingPos !== -1) {
      newRanking[existingPos] = null;
    }

    newRanking[position] = persona;
    setRankings({ ...rankings, [dimId]: newRanking });
  };

  const isCurrentComplete = () => {
    const dimId = RANKING_DIMENSIONS[currentDimension].id;
    const ranking = rankings[dimId] || [];
    return ranking.length === 3 && ranking.every((p) => p !== null);
  };

  const handleNext = () => {
    if (!isCurrentComplete()) {
      alert("Bitte ordne alle drei Bots zu.");
      return;
    }
    if (currentDimension < RANKING_DIMENSIONS.length - 1) {
      setCurrentDimension(currentDimension + 1);
    } else {
      onSubmit({
        rankings,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const dim = RANKING_DIMENSIONS[currentDimension];
  const currentRanking = rankings[dim.id] || [null, null, null];
  const placedPersonas = currentRanking.filter((p) => p !== null);
  const availablePersonas = personas.filter((p) => !placedPersonas.includes(p));

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Vergleich der drei Bots</h2>
      <p className="text-sm text-gray-500 mb-6">
        Frage {currentDimension + 1} von {RANKING_DIMENSIONS.length}
      </p>

      <p className="font-medium mb-2">{dim.label}</p>
      <p className="text-sm text-gray-500 mb-4">{dim.sublabel}</p>

      <div className="space-y-3 mb-6">
        {["1. Platz", "2. Platz", "3. Platz"].map((label, position) => (
          <div
            key={position}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-500 w-16">{label}</span>
            <div className="flex gap-2 flex-1">
              {personas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => handleSelect(position, persona)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    currentRanking[position] === persona
                      ? "bg-blue-600 text-white"
                      : availablePersonas.includes(persona) ||
                        currentRanking[position] === null
                      ? "bg-white border border-gray-300 text-gray-700 hover:border-blue-400 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          setRankings({ ...rankings, [dim.id]: [null, null, null] })
        }
        className="text-sm text-gray-500 underline mb-4 block"
      >
        Auswahl zurücksetzen
      </button>

      <div className="flex gap-4">
        {currentDimension > 0 && (
          <button
            onClick={() => setCurrentDimension(currentDimension - 1)}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Zurück
          </button>
        )}
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {currentDimension < RANKING_DIMENSIONS.length - 1
            ? "Nächste Frage"
            : "Weiter zum Abschluss"}
        </button>
      </div>
    </div>
  );
}
