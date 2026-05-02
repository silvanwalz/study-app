"use client";
import { useState } from "react";

// S-TIAS: Short Trust in Automation Scale (McGrath et al. 2025)
var S_TIAS_ITEMS = [
  { id: "S1", text: "Ich konnte dem Bot vertrauen." },
  { id: "S2", text: "Der Bot war zuverlässig." },
  { id: "S3", text: "Ich konnte mich auf den Bot verlassen." },
];

// TPA Distrust Subscale (Jian et al. 2000, two-factor model per Scharowski et al. 2025)
var TPA_DISTRUST_ITEMS = [
  { id: "D1", text: "Der Bot war täuschend." },
  { id: "D2", text: "Der Bot hat sich hinterhältig verhalten." },
  { id: "D3", text: "Ich war misstrauisch gegenüber den Absichten oder Aussagen des Bots." },
  { id: "D4", text: "Ich war vorsichtig im Umgang mit dem Bot." },
  { id: "D5", text: "Die Aussagen des Bots könnten schädliche Folgen haben." },
];

// Study-specific ad-hoc items (not from a validated scale)
var QUALITY_ITEMS = [
  { id: "Q1", text: "Der Bot hat mir geholfen, das Dilemma aus verschiedenen Perspektiven zu betrachten." },
  { id: "Q2", text: "Ich habe mich vom Bot verstanden gefühlt." },
  { id: "Q3", text: "Der Bot hat mich zum Nachdenken gebracht." },
];

var ALL_ITEMS = S_TIAS_ITEMS.concat(TPA_DISTRUST_ITEMS).concat(QUALITY_ITEMS);

export default function TrustQuestionnaire({ persona, scenario, interactionIndex, onSubmit }) {
  var [responses, setResponses] = useState({});

  var handleChange = function (itemId, value) {
    setResponses(Object.assign({}, responses, { [itemId]: parseInt(value) }));
  };

  var handleSubmit = function () {
    if (Object.keys(responses).length < ALL_ITEMS.length) {
      alert("Bitte beantworte alle Fragen.");
      return;
    }

    var trustScore =
      S_TIAS_ITEMS.map(function (item) { return responses[item.id]; }).reduce(function (a, b) { return a + b; }, 0) /
      S_TIAS_ITEMS.length;
    var distrustScore =
      TPA_DISTRUST_ITEMS.map(function (item) { return responses[item.id]; }).reduce(function (a, b) { return a + b; }, 0) /
      TPA_DISTRUST_ITEMS.length;

    onSubmit({
      persona: persona,
      scenario: scenario,
      sequence: interactionIndex + 1,
      responses: responses,
      trustScore: Math.round(trustScore * 100) / 100,
      distrustScore: Math.round(distrustScore * 100) / 100,
      timestamp: new Date().toISOString(),
    });
  };

  var renderLikertScale = function (itemId) {
    return (
      <div className="flex items-center justify-between max-w-md mx-auto mb-1">
        <span className="text-xs text-gray-400 w-24 text-right pr-2">Trifft überhaupt nicht zu</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(function (val) {
            return (
              <label key={val} className="flex flex-col items-center cursor-pointer">
                <input
                  type="radio"
                  name={itemId}
                  value={val}
                  checked={responses[itemId] === val}
                  onChange={function (e) { handleChange(itemId, parseInt(e.target.value)); }}
                  className="mb-1"
                />
                <span className="text-xs">{val}</span>
              </label>
            );
          })}
        </div>
        <span className="text-xs text-gray-400 w-24 pl-2">Trifft voll zu</span>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Fragebogen zum Gespräch</h2>
      <p className="text-sm text-gray-500 mb-6">
        Du hast gerade mit <strong>{persona}</strong> über das{" "}
        <strong>{scenario === "PFLEGE" ? "Pflege-Dilemma" : "Triage-Dilemma"}</strong> gesprochen.
        Bitte bewerte die folgenden Aussagen.
      </p>
      <p className="text-xs text-gray-400 mb-6">1 = Trifft überhaupt nicht zu \u2014 7 = Trifft voll zu</p>

      {ALL_ITEMS.map(function (item) {
        return (
          <div key={item.id} className="mb-5">
            <p className="text-sm mb-2">{item.text}</p>
            {renderLikertScale(item.id)}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mt-4 w-full"
      >
        Weiter
      </button>
    </div>
  );
}
