import {
  EMOTION_BAR_COLORS,
  EMOTION_LABELS,
} from "@/lib/lexical/emotion-ui";
import type { Emotion, LexicalAnalysisResult } from "@/lib/lexical/types";
import { EMOTIONS } from "@/lib/lexical/types";

interface ResultsCardProps {
  result: LexicalAnalysisResult | null;
}

export function ResultsCard({ result }: ResultsCardProps) {
  const visible = Boolean(result);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-bg-elevated p-6 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      aria-live="polite"
    >
      <h2 className="mb-4 text-sm font-semibold text-text-secondary">
        Resultados
      </h2>

      {!result && (
        <p className="text-sm text-text-muted">
          Escribe un texto y pulsa Analizar para ver el indicador emocional.
        </p>
      )}

      {result && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {result.confidence}%
              </p>
              <p className="text-xs text-text-muted">Nivel de confianza</p>
            </div>
            <span className="rounded-lg bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-hover">
              {EMOTION_LABELS[result.emotion]}
            </span>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-text-secondary">
            {result.summary}
          </p>

          <div className="mb-5 space-y-3">
            <p className="text-xs font-medium text-text-muted">
              Distribución estimada
            </p>
            {EMOTIONS.map((emotion) => (
              <ScoreBar
                key={emotion}
                emotion={emotion}
                value={result.scores[emotion]}
              />
            ))}
          </div>

          {result.matchedTokens.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-text-muted">
                Palabras que influyeron
              </p>
              <ul className="flex flex-wrap gap-2">
                {result.matchedTokens.slice(0, 14).map((item, index) => (
                  <li
                    key={`${item.token}-${item.emotion}-${index}`}
                    className="rounded-md bg-bg-secondary px-2 py-1 text-xs text-text-secondary"
                  >
                    {item.negated ? "¬" : ""}
                    {item.matchedAs ?? item.token}{" "}
                    <span className="text-text-muted">
                      ({EMOTION_LABELS[item.emotion].toLowerCase()}
                      {item.source !== "word" ? ` · ${item.source}` : ""})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ScoreBar({ emotion, value }: { emotion: Emotion; value: number }) {
  const pct = Math.round(value * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-text-secondary">
          {EMOTION_LABELS[emotion]}
        </span>
        <span className="tabular-nums text-text-muted">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${EMOTION_BAR_COLORS[emotion]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
