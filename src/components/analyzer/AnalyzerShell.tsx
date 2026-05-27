"use client";

import { useCallback, useId, useState } from "react";
import { analyzeText } from "@/lib/lexical/analyzer";
import { emotionToFaceLevel } from "@/lib/lexical/emotion-ui";
import type { FaceLevel, LexicalAnalysisResult } from "@/lib/lexical/types";
import { EmotionFaces } from "./EmotionFaces";
import { ResultsCard } from "./ResultsCard";
import { RiskAlert } from "./RiskAlert";

const MAX_CHARS = 2000;

export function AnalyzerShell() {
  const textareaId = useId();
  const [text, setText] = useState("");
  const [result, setResult] = useState<LexicalAnalysisResult | null>(null);
  const [faceLevel, setFaceLevel] = useState<FaceLevel | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const handleAnalyze = useCallback(() => {
    const trimmed = text.trim();

    if (!trimmed) {
      showToast("Escribe un texto antes de analizar.");
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      showToast(`El texto no puede superar ${MAX_CHARS} caracteres.`);
      return;
    }

    try {
      const analysis = analyzeText(trimmed);
      setResult(analysis);
      setFaceLevel(emotionToFaceLevel(analysis.emotion));
    } catch {
      showToast("No pudimos analizar ese texto. Intenta de nuevo.");
    }
  }, [text, showToast]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);

    if (!value.trim()) {
      setResult(null);
      setFaceLevel(null);
    }
  }, []);

  return (
    <>
      <section className="flex flex-col gap-4">
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-text-secondary"
        >
          Escribe o pega tu texto
        </label>
        <textarea
          id={textareaId}
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          rows={6}
          maxLength={MAX_CHARS}
          placeholder="Ejemplo: Hoy no estoy muy triste, pero sí algo cansado…"
          className="w-full resize-y rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base leading-relaxed text-text-primary outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />
        <p className="text-right text-xs text-text-muted">
          {text.length}/{MAX_CHARS}
        </p>
        <button
          type="button"
          onClick={handleAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent to-[#7c3aed] px-6 py-3.5 text-base font-semibold text-white transition hover:brightness-110"
        >
          Analizar
          <span aria-hidden>→</span>
        </button>
      </section>

      {result && result.riskFlags.length > 0 && (
        <RiskAlert flags={result.riskFlags} />
      )}

      <ResultsCard result={result} />

      {result && faceLevel && <EmotionFaces activeLevel={faceLevel} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-xl border border-white/10 bg-bg-elevated px-5 py-3 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
