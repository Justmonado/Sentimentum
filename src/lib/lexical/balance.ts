import type { EmotionScores, ScoringMetadata } from "./types";
import { EMOTIONS } from "./types";

/** Techo de dominancia cuando hay 2+ emociones activas (evita 100% artificiales). */
const MIXED_DOMINANCE_CAP = 0.88;

/** Techo absoluto salvo texto con una sola emoción léxica clara. */
const ABSOLUTE_CAP = 0.94;

/** Umbral para considerar una emoción "presente" en el reparto normalizado. */
const ACTIVE_THRESHOLD = 0.15;

/**
 * Mezcla tristeza y enojo cuando coexisten: en español clínico-cotidiano
 * frustración/decepción suelen ser dolor + irritación, no rabia pura.
 */
const SADNESS_ANGER_BLEND = 0.12;

/**
 * Penaliza picos extremos si el texto activó varias emociones en bruto.
 * Evita que un solo lema fuerte eclipse el matiz híbrido.
 */
const EXTREME_MIXED_SHRINK = 0.08;

function sumScores(scores: EmotionScores): number {
  return EMOTIONS.reduce((s, e) => s + scores[e], 0);
}

function renormalize(scores: EmotionScores): EmotionScores {
  const total = sumScores(scores);
  if (total <= 0) {
    return { felicidad: 0, tristeza: 0, enojo: 0 };
  }
  const out = { felicidad: 0, tristeza: 0, enojo: 0 };
  for (const e of EMOTIONS) {
    out[e] = Math.round((scores[e] / total) * 100) / 100;
  }
  return out;
}

function countActive(scores: EmotionScores): number {
  return EMOTIONS.filter((e) => scores[e] >= ACTIVE_THRESHOLD).length;
}

/**
 * Balanceo dinámico post-normalización.
 * No altera el léxico ni los raw scores; solo corrige distribuciones poco realistas.
 */
export function balanceNormalizedScores(
  scores: EmotionScores,
  meta: ScoringMetadata,
): EmotionScores {
  const balanced = { ...scores };
  const active = countActive(balanced);

  if (active >= 2) {
    const sorted = [...EMOTIONS].sort((a, b) => balanced[b] - balanced[a]);
    const top = sorted[0];
    const topVal = balanced[top];

    if (topVal > MIXED_DOMINANCE_CAP) {
      const excess = topVal - MIXED_DOMINANCE_CAP;
      balanced[top] = MIXED_DOMINANCE_CAP;
      const others = EMOTIONS.filter((e) => e !== top);
      const share = excess / others.length;
      for (const e of others) {
        balanced[e] += share;
      }
    }
  }

  if (
    meta.sadnessAngerOverlap &&
    balanced.tristeza >= ACTIVE_THRESHOLD &&
    balanced.enojo >= ACTIVE_THRESHOLD
  ) {
    const avg = (balanced.tristeza + balanced.enojo) / 2;
    balanced.tristeza =
      balanced.tristeza * (1 - SADNESS_ANGER_BLEND) + avg * SADNESS_ANGER_BLEND;
    balanced.enojo =
      balanced.enojo * (1 - SADNESS_ANGER_BLEND) + avg * SADNESS_ANGER_BLEND;
  }

  if (meta.activeEmotionCount >= 2 || meta.hybridMatchCount > 0) {
    for (const e of EMOTIONS) {
      if (balanced[e] > ABSOLUTE_CAP) {
        balanced[e] -= EXTREME_MIXED_SHRINK;
      }
    }
  }

  return renormalize(balanced);
}

export function buildScoringMetadata(
  rawScores: EmotionScores,
  matches: { hybrid?: boolean; emotion: string }[],
  clauseCount: number,
): ScoringMetadata {
  const activeEmotionCount = EMOTIONS.filter((e) => rawScores[e] > 0).length;
  const sadnessAngerOverlap =
    rawScores.tristeza > 0 && rawScores.enojo > 0;

  return {
    rawScores,
    matchCount: matches.length,
    hybridMatchCount: matches.filter((m) => m.hybrid).length,
    activeEmotionCount,
    sadnessAngerOverlap,
    clauseCount,
  };
}
