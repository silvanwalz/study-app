"use client";

export default function Debriefing({ participantId }) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="text-4xl mb-4">\u2705</div>
      <h2 className="text-2xl font-bold mb-4">Vielen Dank für deine Teilnahme!</h2>

      <div className="text-left bg-gray-50 rounded-lg p-6 mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
        <p>
          Du hast soeben an einer Studie zur Wirkung von KI-Companions bei moralischen
          Entscheidungssituationen teilgenommen. Die drei Bots, mit denen du gesprochen hast,
          hatten bewusst unterschiedliche Kommunikationsstile: analytisch-neutral, empathisch-validierend
          und konfrontativ-ehrlich.
        </p>
        <p>
          Ziel der Studie ist es zu untersuchen, wie diese unterschiedlichen Stile das Vertrauen
          in KI-Companions beeinflussen. Deine Antworten helfen, besser zu verstehen, wie
          KI-Systeme verantwortungsvoll gestaltet werden können.
        </p>
        <p>
          Die Szenarien waren fiktiv und dienten ausschliesslich als Gesprächsgrundlage.
          Falls dich die Themen emotional beschäftigen, zögere nicht, mit einer
          Vertrauensperson darüber zu sprechen.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1">Fragen zur Studie?</p>
        <p>[Name und Kontaktdaten der Studienleitung einfügen]</p>
      </div>

      <p className="text-xs text-gray-400">
        Teilnehmer-ID: {participantId}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Du kannst dieses Fenster jetzt schliessen.
      </p>
    </div>
  );
}
