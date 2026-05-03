"use client";
import { useState } from "react";

var TPA_DISTRUST_ITEMS = [
  { id: "TPA-1", text: "KI-Systeme sind täuschend." },
  { id: "TPA-2", text: "KI-Systeme verhalten sich hinterhältig." },
  { id: "TPA-3", text: "Ich bin misstrauisch gegenüber den Absichten, Handlungen oder Ergebnissen von KI-Systemen." },
  { id: "TPA-4", text: "Ich bin vorsichtig im Umgang mit KI-Systemen." },
  { id: "TPA-5", text: "Die Handlungen von KI-Systemen könnten schädliche Folgen haben." },
];

var TPA_TRUST_ITEMS = [
  { id: "TPA-6", text: "Ich habe Zuversicht in KI-Systeme." },
  { id: "TPA-7", text: "KI-Systeme geben mir ein Gefühl von Sicherheit." },
  { id: "TPA-8", text: "KI-Systeme handeln integer." },
  { id: "TPA-9", text: "KI-Systeme sind verlässlich." },
  { id: "TPA-10", text: "KI-Systeme sind zuverlässig." },
  { id: "TPA-11", text: "Ich kann KI-Systemen vertrauen." },
  { id: "TPA-12", text: "KI-Systeme sind mir vertraut." },
];

var ALL_TPA_ITEMS = TPA_DISTRUST_ITEMS.concat(TPA_TRUST_ITEMS);

export default function PreQuestionnaire({ onSubmit }) {
  var [demo, setDemo] = useState({
    age: "", gender: "", education: "", isStudent: "", studyField: "", semester: ""
  });
  var [experience, setExperience] = useState({ frequency: "", purposes: [], companion: "" });
  var [tpaBaseline, setTpaBaseline] = useState({});
  var [currentBlock, setCurrentBlock] = useState(1);

  var handlePurposeToggle = function (purpose) {
    setExperience(function (prev) {
      return {
        ...prev,
        purposes: prev.purposes.includes(purpose)
          ? prev.purposes.filter(function (p) { return p !== purpose; })
          : prev.purposes.concat([purpose]),
      };
    });
  };

  var handleTpaChange = function (itemId, value) {
    setTpaBaseline(Object.assign({}, tpaBaseline, { [itemId]: parseInt(value) }));
  };

  var validateBlock1 = function () {
    if (!demo.age || !demo.gender || !demo.education || !demo.isStudent) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return false;
    }
    var age = parseInt(demo.age);
    if (age < 18 || age > 29) {
      alert("Diese Studie richtet sich an Personen zwischen 18 und 29 Jahren.");
      return false;
    }
    if (demo.isStudent === "yes" && !demo.studyField) {
      alert("Bitte gib dein Studienfach an.");
      return false;
    }
    return true;
  };

  var validateBlock2 = function () {
    if (!experience.frequency || !experience.companion) {
      alert("Bitte beantworte alle Fragen.");
      return false;
    }
    return true;
  };

  var validateBlock3 = function () {
    if (Object.keys(tpaBaseline).length < ALL_TPA_ITEMS.length) {
      alert("Bitte bewerte alle Aussagen.");
      return false;
    }
    return true;
  };

  var handleSubmit = function () {
    if (!validateBlock3()) return;

    var trustItems = TPA_TRUST_ITEMS.map(function (item) { return tpaBaseline[item.id]; });
    var distrustItems = TPA_DISTRUST_ITEMS.map(function (item) { return tpaBaseline[item.id]; });
    var trustScore = trustItems.reduce(function (a, b) { return a + b; }, 0) / trustItems.length;
    var distrustScore = distrustItems.reduce(function (a, b) { return a + b; }, 0) / distrustItems.length;

    onSubmit({
      demographics: demo,
      experience: experience,
      tpaBaseline: tpaBaseline,
      baselineTrustScore: Math.round(trustScore * 100) / 100,
      baselineDistrustScore: Math.round(distrustScore * 100) / 100,
      timestamp: new Date().toISOString(),
    });
  };

  var renderLikertScale = function (itemId, value, onChange) {
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
                  checked={value === val}
                  onChange={function (e) { onChange(itemId, parseInt(e.target.value)); }}
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
      <h2 className="text-xl font-bold mb-1">Vorfragebogen</h2>
      <p className="text-xs text-gray-400 mb-6">Alle Angaben werden pseudonymisiert verarbeitet.</p>

      {/* Block 1: Demografie */}
      {currentBlock === 1 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">Block 1 von 3: Angaben zu deiner Person</p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Wie alt bist du?</label>
            <input
              type="number"
              min="18"
              max="29"
              value={demo.age}
              onChange={function (e) { setDemo(Object.assign({}, demo, { age: e.target.value })); }}
              className="border rounded px-3 py-2 w-full"
              placeholder="18 - 29"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Geschlecht</label>
            <select
              value={demo.gender}
              onChange={function (e) { setDemo(Object.assign({}, demo, { gender: e.target.value })); }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Bitte wählen</option>
              <option value="m">Männlich</option>
              <option value="f">Weiblich</option>
              <option value="d">Divers</option>
              <option value="na">Keine Angabe</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Höchster Bildungsabschluss</label>
            <select
              value={demo.education}
              onChange={function (e) { setDemo(Object.assign({}, demo, { education: e.target.value })); }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Bitte wählen</option>
              <option value="obligatory">Obligatorische Schule</option>
              <option value="apprenticeship">Berufslehre / EFZ</option>
              <option value="matura">Matura / Gymnasium</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master oder höher</option>
              <option value="other">Anderes</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bist du aktuell Student/in?</label>
            <select
              value={demo.isStudent}
              onChange={function (e) { setDemo(Object.assign({}, demo, { isStudent: e.target.value, studyField: "", semester: "" })); }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Bitte wählen</option>
              <option value="yes">Ja</option>
              <option value="no">Nein</option>
            </select>
          </div>

          {demo.isStudent === "yes" && (
            <div className="ml-4 border-l-2 border-blue-200 pl-4 mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Studienfach / Studienrichtung</label>
                <input
                  type="text"
                  value={demo.studyField}
                  onChange={function (e) { setDemo(Object.assign({}, demo, { studyField: e.target.value })); }}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="z.B. Kommunikation, Informatik, Psychologie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Semester (optional)</label>
                <select
                  value={demo.semester}
                  onChange={function (e) { setDemo(Object.assign({}, demo, { semester: e.target.value })); }}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">Bitte wählen</option>
                  <option value="1-2">1. - 2. Semester</option>
                  <option value="3-4">3. - 4. Semester</option>
                  <option value="5-6">5. - 6. Semester</option>
                  <option value="7+">7. Semester oder höher</option>
                </select>
              </div>
            </div>
          )}

          <button
            onClick={function () { if (validateBlock1()) setCurrentBlock(2); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Block 2: KI-Erfahrung */}
      {currentBlock === 2 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">Block 2 von 3: Deine Erfahrung mit KI</p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Wie häufig nutzt du KI-Chatbots (z.B. ChatGPT, Claude, Gemini)?
            </label>
            <select
              value={experience.frequency}
              onChange={function (e) { setExperience(Object.assign({}, experience, { frequency: e.target.value })); }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Bitte wählen</option>
              <option value="never">Nie</option>
              <option value="rarely">Seltener als 1 Mal pro Monat</option>
              <option value="monthly">Monatlich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="daily">Täglich</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Für welche Zwecke nutzt du KI-Chatbots? (Mehrfachauswahl möglich)
            </label>
            {[
              { value: "info", label: "Informationssuche" },
              { value: "learning", label: "Lernen und Studium" },
              { value: "creative", label: "Kreatives Schreiben" },
              { value: "advice", label: "Persönliche Beratung" },
              { value: "emotional", label: "Emotionale Unterstützung" },
              { value: "entertainment", label: "Unterhaltung" },
              { value: "work", label: "Beruf" },
              { value: "none", label: "Nutze keine KI-Chatbots" },
            ].map(function (option) {
              return (
                <label key={option.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={experience.purposes.includes(option.value)}
                    onChange={function () { handlePurposeToggle(option.value); }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              );
            })}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Hast du schon einmal mit einem KI-Companion gesprochen (z.B. Replika, Character.AI)?
            </label>
            <select
              value={experience.companion}
              onChange={function (e) { setExperience(Object.assign({}, experience, { companion: e.target.value })); }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Bitte wählen</option>
              <option value="regular">Ja, regelmässig</option>
              <option value="tried">Ja, ausprobiert</option>
              <option value="know_it">Nein, aber kenne es</option>
              <option value="never_heard">Nein, noch nie gehört</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={function () { setCurrentBlock(1); }}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Zurück
            </button>
            <button
              onClick={function () { if (validateBlock2()) setCurrentBlock(3); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      {/* Block 3: TPA Baseline */}
      {currentBlock === 3 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Block 3 von 3: Deine grundsätzliche Einstellung zu KI</p>
          <p className="text-sm text-gray-500 mb-6">
            Bitte bewerte die folgenden Aussagen in Bezug auf KI-Systeme allgemein
            (z.B. ChatGPT, Sprachassistenten, KI-Empfehlungssysteme).
          </p>

          {ALL_TPA_ITEMS.map(function (item) {
            return (
              <div key={item.id} className="mb-5">
                <p className="text-sm mb-2">{item.text}</p>
                {renderLikertScale(item.id, tpaBaseline[item.id], handleTpaChange)}
              </div>
            );
          })}

          <div className="flex gap-4 mt-4">
            <button
              onClick={function () { setCurrentBlock(2); }}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Zurück
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Weiter zur Studie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
