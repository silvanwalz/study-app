"use client";
import { useState, useEffect } from "react";

var SCENARIO_TEXTS = {
  PFLEGE: {
    title: "Das Pflege-Dilemma",
    content: "Du bist 27 Jahre alt. Du hast vor acht Monaten nach langer Suche deinen Traumjob angetreten. Eine Stelle in einem kleinen, renommierten Unternehmen, die dir beruflich genau die Richtung gibt, die du dir immer gewünscht hast.\n\nDu bist in einer stabilen Beziehung. Ihr habt konkrete Pläne. Gemeinsame Wohnung, mittelfristig Familie. Zum ersten Mal in deinem Leben fühlt sich alles stimmig an.\n\nDeine Mutter ist 58 Jahre alt. Vor drei Monaten wurde sie mit einer seltenen, fortschreitenden Autoimmunerkrankung diagnostiziert. Ohne Behandlung wird sie innerhalb von zwei Jahren schwere bleibende Schäden davontragen. Sehverlust, Lähmungen, Pflegebedürftigkeit.\n\nDein Vater ist vor Jahren gegangen. Du hast keine Geschwister. Es gibt niemanden ausser dir.\n\nEs gibt eine Behandlungsoption. Ein spezialisiertes Zentrum in Kanada bietet ein experimentelles Therapieprogramm an. 18 Monate, intensive Begleitung, vielversprechende aber nicht gesicherte Resultate. Die Krankenkasse übernimmt nichts. Andere Optionen in der Schweiz sind ausgeschöpft.\n\nDie Behandlung kostet 85\u2019000 Franken. Du hast keine Ersparnisse in dieser Grössenordnung, und deine Mutter auch nicht. Eine Bank würde dir den Kredit geben, aber du würdest 12 bis 15 Jahre brauchen um ihn zurückzuzahlen. Das würde die gemeinsame Wohnung, die Familienplanung, alles was ihr aufgebaut habt, um viele Jahre verschieben. Dein Partner hat dir klar gesagt, er liebt dich, aber er kann und will nicht 15 Jahre auf Eis legen.\n\nAber es gibt noch etwas: Das Zentrum in Kanada braucht eine Begleitperson für die gesamten 18 Monate. Jemanden der bei medizinischen Entscheidungen miteinbezogen wird, der deine Mutter stabilisiert, der vor Ort ist. Die Ärzte haben es klar gesagt: Ohne soziale Unterstützung brechen 70% der Patienten die Behandlung vorzeitig ab. Deine Mutter hat niemanden ausser dir.\n\n18 Monate Kanada bedeutet: Du gibst deinen Job auf, die Stelle wird besetzt. Du gibst deine Wohnung auf. Deine Beziehung wird mit sehr hoher Wahrscheinlichkeit nicht überstehen. Du kehrst mit 29 zurück, ohne Job, ohne Beziehung, mit einem Kredit von 85\u2019000 Franken, und mit einer Mutter deren Behandlung möglicherweise trotzdem nicht gewirkt hat.\n\nDeine Mutter weiss wie viel es kostet. Sie hat dir gesagt, du sollst es nicht tun. Sie sagt es ehrlich, nicht aus falschem Stolz, sondern weil sie es wirklich so meint. Sie sagt: \u00ABIch will nicht, dass du dein Leben für mich zerstörst.\u00BB\n\nAber du weisst auch: Wenn du nicht gehst, wird sie es alleine nicht schaffen. Und du wirst zusehen wie sie sich verschlechtert, in dem Wissen, dass du die einzige Person warst die hätte helfen können.\n\nDu hast eine Woche um zu entscheiden.\n\nWas tust du?",
  },
  TRIAGE: {
    title: "Das Triage-Dilemma",
    content: "Du arbeitest seit zwei Jahren als Pflegefachperson in einem mittelgrossen Schweizer Spital. Es ist ein Donnerstagabend, kurz vor Schichtende. Die Notaufnahme ist überlastet. Grippewelle, Unterbesetzung, drei Kolleginnen sind krank.\n\nIn diesem Moment kommen innerhalb von zehn Minuten zwei Notfälle gleichzeitig herein.\n\nPatient A ist ein 7-jähriges Mädchen. Sie wurde von einem Auto erfasst. Innere Blutungen, kritischer Zustand. Ohne sofortige Operation stirbt sie mit hoher Wahrscheinlichkeit innerhalb der nächsten Stunde. Die Eltern sind im Warteraum. Das Kind ist bei Bewusstsein.\n\nPatient B ist ein 34-jähriger Mann. Schwerer Herzinfarkt. Stabiler als das Mädchen, aber nur knapp. Ohne Eingriff in den nächsten zwei Stunden sind bleibende Herzschäden sicher, der Tod möglich.\n\nEs gibt in diesem Moment nur ein verfügbares Operationsteam. Der diensthabende Arzt ist nicht erreichbar. Er ist selbst in einer anderen Notoperation. Du bist die ranghöchste Person auf dem Gang. Beide Patientenfamilien schauen dich an.\n\nDas Protokoll sagt: Schweregrad entscheidet. Das Mädchen hat Vorrang.\n\nAber du weisst aus den Unterlagen, dass Patient B drei Kinder hat. Die jüngste ist vier Monate alt. Und du weisst, dass das Mädchen, selbst wenn die Operation gelingt, aufgrund der Schwere der Verletzungen möglicherweise mit dauerhaften schweren Beeinträchtigungen leben wird. Das ist keine Gewissheit. Aber es steht so in der Ersteinschätzung des Notarztes.\n\nDas Protokoll ist klar. Aber du hast in diesem Moment faktisch die Entscheidung in der Hand. Niemand kontrolliert dich in den nächsten Minuten.\n\nFolgst du dem Protokoll, und schickst das Team zum Mädchen?\n\nOder handelst du gegen das Protokoll, und entscheidest nach deinem eigenen Urteil, in dem Wissen, dass du diese Entscheidung alleine trägst, für den Rest deines Lebens?\n\nWas tust du?",
  },
};

export default function ScenarioDisplay({ scenario, interactionIndex, onReady }) {
  var scenarioData = SCENARIO_TEXTS[scenario];
  var [hasScrolled, setHasScrolled] = useState(false);

  // Track if user has scrolled to the bottom of the scenario
  var handleScroll = function (e) {
    var el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
      setHasScrolled(true);
    }
  };

  // Reset scroll state when scenario changes
  useEffect(function () {
    setHasScrolled(false);
  }, [scenario, interactionIndex]);

  // Determine if this is a repeated scenario
  var isRepeated = interactionIndex > 1;

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{scenarioData.title}</h2>

      {isRepeated && (
        <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded mb-3 inline-block">
          Du kennst dieses Szenario bereits. Lies es trotzdem nochmals kurz durch, bevor du mit dem nächsten Bot darüber sprichst.
        </p>
      )}

      <p className="text-sm text-gray-500 mb-4">
        Bitte lies das folgende Szenario aufmerksam durch. Versetze dich so gut wie möglich
        in die beschriebene Situation. Anschliessend wirst du mit einem KI-Companion darüber sprechen.
      </p>

      <div
        className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4 whitespace-pre-line text-sm leading-relaxed max-h-96 overflow-y-auto"
        onScroll={handleScroll}
      >
        {scenarioData.content}
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Es gibt keine richtige oder falsche Antwort. Es geht um deine persönliche Einschätzung.
      </p>

      <button
        onClick={onReady}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
      >
        Ich habe das Szenario gelesen \u2014 Gespräch starten
      </button>
    </div>
  );
}
