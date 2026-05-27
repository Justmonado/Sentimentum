/**
 * Pipeline: tokenizar → puntuar → normalizar → balancear → confianza → resumen.
 */
import { balanceNormalizedScores, buildScoringMetadata } from "./balance";
import { computeConfidence } from "./confidence";
import {
  computeRawScores,
  detectRiskFlags,
  normalizeScores,
  pickDominantEmotion,
} from "./scoring";
import { splitIntoContrastClauses } from "./context";
import { buildSummary } from "./summary";
import { normalizeText, tokenize } from "./tokenize";
import type { LexicalAnalysisResult } from "./types";

export { normalizeText } from "./tokenize";

export function analyzeText(text: string): LexicalAnalysisResult {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Texto vacío");
  }

  const normalized = normalizeText(trimmed);
  const tokens = tokenize(normalized);
  const clauses = splitIntoContrastClauses(tokens);
  const usedContrastSplit = clauses.length > 1;

  const { scores: rawScores, matches } = computeRawScores(normalized);
  const normalizedScores = normalizeScores(rawScores);
  const meta = buildScoringMetadata(rawScores, matches, clauses.length);
  const scores = balanceNormalizedScores(normalizedScores, meta);
  const emotion = pickDominantEmotion(scores);
  const confidence = computeConfidence({ scores, meta });
  const riskFlags = detectRiskFlags(normalized);
  const summary = buildSummary(
    emotion,
    scores,
    matches,
    confidence,
    usedContrastSplit,
  );

  return {
    scores,
    emotion,
    confidence,
    matchedTokens: matches,
    riskFlags,
    summary,
  };
}
