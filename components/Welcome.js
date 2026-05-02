"use client";
import { useState } from "react";

export default function Welcome({ onContinue }) {
  var [consent, setConsent] = useState(false);

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Bachelorarbeit</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Vertrauen in KI-Companions
        </h1>
        <p className="text-sm text-gray-500">
          Eine Studie zur Wirkung von KI-Personas bei moralischen Dilemmata
        </p>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Study description */}
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-6">
        <p>
          Vielen Dank, dass du an dieser Studie teilnimmst. Du wirst mit drei verschiedenen
          KI-Companions sprechen, die dir als Gesprächspartner bei moralischen Dilemmata
          dienen. Jeder Bot hat einen eigenen Kommunikationsstil, eine eigene Stimme und
          ein eigenes Gesicht.
        </p>

        <p>
          Es gibt zwei Szenarien (Dilemmata), die du im Laufe der Studie mehrfach mit
          unterschiedlichen Bots besprichst. Du wirst die Szenarien also wiederholt lesen,
          das Gespräch dazu führt du aber jeweils mit einem anderen Bot. Insgesamt führst
          du sechs Gespräche.
        </p>
      </div>

      {/* Study flow */}
      <div className="bg-gray-50 rounded-lg p-5 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">Ablauf der Studie</p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 shrink-0">1.</span>
            <span>Kurzer Vorfragebogen zu deiner Person und deiner Erfahrung mit KI <span className="text-gray-400">(ca. 5 Min)</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 shrink-0">2.</span>
            <span>6 Gespräche mit KI-Companions, jeweils ca. 5 Minuten, mit kurzem Fragebogen nach jedem Gespräch <span className="text-gray-400">(ca. 50 Min)</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 shrink-0">3.</span>
            <span>Vergleich der drei Bots <span className="text-gray-400">(ca. 5 Min)</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 shrink-0">4.</span>
            <span>Abschlussfragebogen <span className="text-gray-400">(ca. 10 Min)</span></span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Gesamtdauer: ca. 70\u201380 Minuten</p>
      </div>

      {/* Technical requirements */}
      <div className="bg-blue-50 rounded-lg p-5 mb-6">
        <p className="text-sm font-semibold text-blue-900 mb-2">Bevor du startest</p>
        <div className="space-y-1.5 text-sm text-blue-800">
          <p>\u2022 Stelle sicher, dass dein <strong>Mikrofon aktiviert</strong> ist und funktioniert.</p>
          <p>\u2022 Verwende am besten <strong>Kopfhörer</strong>, um Rückkopplungen zu vermeiden.</p>
          <p>\u2022 Sorge für eine <strong>ruhige Umgebung</strong> ohne Hintergrundgeräusche.</p>
          <p>\u2022 Sprich bitte auf <strong>Hochdeutsch</strong> (nicht Schweizerdeutsch).</p>
          <p>\u2022 Verwende idealerweise <strong>Google Chrome</strong> als Browser.</p>
        </div>
      </div>

      {/* Consent */}
      <div className="border border-gray-200 rounded-lg p-5 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-2">Datenschutz und Einwilligung</p>
        <div className="text-xs text-gray-600 leading-relaxed space-y-2 mb-4">
          <p>
            Deine Teilnahme ist freiwillig. Du kannst die Studie jederzeit ohne Angabe von
            Gründen abbrechen. Deine Daten werden pseudonymisiert verarbeitet und
            ausschliesslich für diese Bachelorarbeit verwendet.
          </p>
          <p>
            Während der Gespräche werden deine gesprochenen Beiträge zur Verarbeitung an
            folgende Cloud-Dienste übermittelt: OpenAI (USA), Simli (USA), ElevenLabs (USA).
            Die Daten werden ausschliesslich für die Spracherkennung und Antwortgenerierung
            verwendet. Die Gespräche werden als Texttranskript gespeichert.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={function (e) { setConsent(e.target.checked); }}
            className="mt-0.5 w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            Ich habe die Informationen gelesen und bin mit der Teilnahme und der
            beschriebenen Datenverarbeitung einverstanden.
          </span>
        </label>
      </div>

      {/* Start button */}
      <button
        onClick={onContinue}
        disabled={!consent}
        className={
          "w-full py-3 rounded-lg text-base font-medium transition " +
          (consent
            ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed")
        }
      >
        Studie beginnen
      </button>
    </div>
  );
}
