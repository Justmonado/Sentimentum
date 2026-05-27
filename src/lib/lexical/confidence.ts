import type { EmotionScores, ScoringMetadata } from "./types";
import { EMOTIONS } from "./types";

export interface ConfidenceInput {
  scores: EmotionScores;
  meta: ScoringMetadata;
}

const MAX_CONFIDENCE_MIXED = 82;
const MAX_CONFIDENCE_HYBRID = 78;
const MAX_CONFIDENCE_SINGLE_CLEAR = 95;

/**
 * Entropía normalizada (0–1). Alta entropía = reparto parejo = menos certeza.
 * Complementa la separación top/second para textos ambiguos.
 */
function normalizedEntropy(scores: EmotionScores): number {
  const values = EMOTIONS.map((e) => scores[e]).filter((v) => v > 0);
  if (values.length <= 1) return 0;

  const entropy = values.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum - p * Math.log2(p);
  }, 0);

  const maxEntropy = Math.log2(values.length);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

/**
 * Confianza heurística mejorada:
 * - Entropía penaliza textos mixtos (no mostrar 95% de confianza con 33/33/33).
 * - Topes si hay híbridos o varias emociones activas (anti 100% artificial).
 * - Separación top-second y cobertura léxica (heredado, afinado).
 */
export function computeConfidence(input: ConfidenceInput): number {
  const { scores, meta } = input;

  if (meta.matchCount === 0) {
    return 0;
  }

  const sorted = EMOTIONS.map((e) => scores[e]).sort((a, b) => b - a);
  const max = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;

  if (max <= 0) {
    return 0;
  }

  const separation = (max - second) / max;
  const coverage = Math.min(meta.matchCount / 6, 1);
  const entropy = normalizedEntropy(scores);

  const contrastPenalty =
    meta.clauseCount > 1
      ? Math.max(0.72, 1 - (meta.clauseCount - 1) * 0.1)
      : 1;

  const raw =
    separation * 55 + coverage * 25 + (1 - entropy) * 20;

  let confidence = raw * contrastPenalty;

  if (meta.hybridMatchCount > 0) {
    confidence = Math.min(confidence, MAX_CONFIDENCE_HYBRID);
  } else if (meta.activeEmotionCount >= 2) {
    confidence = Math.min(confidence, MAX_CONFIDENCE_MIXED);
  } else {
    confidence = Math.min(confidence, MAX_CONFIDENCE_SINGLE_CLEAR);
  }

  if (max >= 0.9 && second >= 0.22) {
    confidence *= 0.85;
  }

  if (meta.sadnessAngerOverlap) {
    confidence *= 0.92;
  }

  return Math.round(Math.max(0, Math.min(100, confidence)));
}
