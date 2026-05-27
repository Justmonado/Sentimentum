import {
  CONTRAST_POST_BOOST,
  CONTRAST_PRIOR_DECAY,
  getPhrasesByLength,
  pictionary,
} from "./pictionary";
import {
  createClauseState,
  getClauseWeightMultiplier,
  isNegationActive,
  registerNegation,
  splitIntoContrastClauses,
  tickNegationWindow,
} from "./context";
import {
  isHybridToken,
  lookupBigramContributions,
  lookupPhraseContributions,
  lookupTokenContributions,
} from "./lexicon-lookup";
import { matchPhraseAt, tokenize } from "./tokenize";
import type {
  AnalysisEmotion,
  BigramEntry,
  ClauseAnalysisState,
  Emotion,
  EmotionContribution,
  EmotionScores,
  MatchedToken,
  PhraseEntry,
} from "./types";
import { EMOTIONS } from "./types";

const NEUTRAL_MARGIN = 0.08;
const MIN_SIGNAL = 0.12;

const NEGATION_TARGETS: Record<Emotion, Emotion[]> = {
  felicidad: ["tristeza", "enojo"],
  tristeza: ["felicidad"],
  enojo: ["felicidad", "tristeza"],
};

export function emptyScores(): EmotionScores {
  return { felicidad: 0, tristeza: 0, enojo: 0 };
}

export function applyScore(
  scores: EmotionScores,
  emotion: Emotion,
  value: number,
  negated: boolean,
): void {
  if (!negated) {
    scores[emotion] += value;
    return;
  }

  const targets = NEGATION_TARGETS[emotion];
  const share = value / targets.length;
  for (const target of targets) {
    scores[target] += share;
  }
}

function resolveNegation(
  state: ClauseAnalysisState,
  entry: { skipNegation?: boolean; forceNegated?: boolean },
): boolean {
  if (entry.skipNegation) return false;
  if (entry.forceNegated) return true;
  return isNegationActive(state);
}

function recordMatch(
  matches: MatchedToken[],
  label: string,
  contribution: EmotionContribution,
  negated: boolean,
  source: MatchedToken["source"],
  hybrid: boolean,
): void {
  matches.push({
    token: label.split(" ")[0] ?? label,
    emotion: contribution.emotion,
    weight: contribution.value,
    negated,
    source,
    matchedAs: label,
    hybrid,
  });
}

/**
 * Aplica todas las contribuciones de un lema/frase (incluye híbridos).
 * Mantiene applyScore por emoción para compatibilidad con negación existente.
 */
function applyContributions(
  scores: EmotionScores,
  matches: MatchedToken[],
  label: string,
  contributions: EmotionContribution[],
  state: ClauseAnalysisState,
  meta: { skipNegation?: boolean; forceNegated?: boolean },
  source: MatchedToken["source"],
  hybrid: boolean,
): void {
  const negated = resolveNegation(state, meta);
  for (const c of contributions) {
    applyScore(scores, c.emotion, c.value, negated);
    recordMatch(matches, label, c, negated, source, hybrid);
  }
}

function applyPhraseMatch(
  scores: EmotionScores,
  matches: MatchedToken[],
  phrase: PhraseEntry,
  state: ClauseAnalysisState,
  scale: number,
): void {
  const contributions = lookupPhraseContributions(phrase, scale);
  const hybrid = Boolean(phrase.weights);
  applyContributions(
    scores,
    matches,
    phrase.phrase,
    contributions,
    state,
    phrase,
    "phrase",
    hybrid,
  );
}

function applyBigramMatch(
  scores: EmotionScores,
  matches: MatchedToken[],
  bigram: BigramEntry,
  state: ClauseAnalysisState,
  scale: number,
): void {
  const contributions = lookupBigramContributions(bigram, scale);
  const label = `${bigram.first} ${bigram.second}`;
  const hybrid = Boolean(bigram.weights);
  applyContributions(
    scores,
    matches,
    label,
    contributions,
    state,
    {},
    "bigram",
    hybrid,
  );
}

function matchBigramAt(tokens: string[], index: number): BigramEntry | null {
  const first = tokens[index];
  const second = tokens[index + 1];
  if (!first || !second) return null;

  return (
    pictionary.emotionalBigrams.find(
      (b) => b.first === first && b.second === second,
    ) ?? null
  );
}

function scoreClause(
  tokens: string[],
  clauseMultiplier: number,
): { scores: EmotionScores; matches: MatchedToken[] } {
  const scores = emptyScores();
  const matches: MatchedToken[] = [];
  const state = createClauseState();
  const phrases = getPhrasesByLength();

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    const modifierValue = pictionary.modifiers[token];
    if (modifierValue !== undefined) {
      state.modifier *= modifierValue;
      tickNegationWindow(state);
      i += 1;
      continue;
    }

    const phraseHit = matchPhraseAt(tokens, i, phrases);
    if (phraseHit) {
      const phraseEntry = pictionary.emotionalPhrases.find(
        (p) => p.phrase === phraseHit.phrase,
      );
      if (phraseEntry) {
        applyPhraseMatch(
          scores,
          matches,
          phraseEntry,
          state,
          state.modifier * clauseMultiplier,
        );
        state.modifier = 1;
        for (let k = 0; k < phraseHit.length; k += 1) {
          tickNegationWindow(state);
        }
        i += phraseHit.length;
        continue;
      }
    }

    const bigram = matchBigramAt(tokens, i);
    if (bigram) {
      applyBigramMatch(
        scores,
        matches,
        bigram,
        state,
        state.modifier * clauseMultiplier,
      );
      state.modifier = 1;
      tickNegationWindow(state);
      tickNegationWindow(state);
      i += 2;
      continue;
    }

    registerNegation(token, tokens, i, state);

    const scale = state.modifier * clauseMultiplier;
    const contributions = lookupTokenContributions(token, scale);

    if (contributions.length > 0) {
      applyContributions(
        scores,
        matches,
        token,
        contributions,
        state,
        {},
        "word",
        isHybridToken(token),
      );
      state.modifier = 1;
    }

    tickNegationWindow(state);
    i += 1;
  }

  return { scores, matches };
}

function mergeScores(target: EmotionScores, source: EmotionScores): void {
  for (const emotion of EMOTIONS) {
    target[emotion] += source[emotion];
  }
}

export function computeRawScores(normalizedText: string): {
  scores: EmotionScores;
  matches: MatchedToken[];
} {
  const tokens = tokenize(normalizedText);
  const clauses = splitIntoContrastClauses(tokens);
  const total = clauses.length;

  const accumulated = emptyScores();
  const allMatches: MatchedToken[] = [];

  clauses.forEach((clause, index) => {
    const multiplier = getClauseWeightMultiplier(
      index,
      total,
      clause.followsContrast,
      CONTRAST_PRIOR_DECAY,
      CONTRAST_POST_BOOST,
    );

    const { scores, matches } = scoreClause(clause.tokens, multiplier);
    mergeScores(accumulated, scores);
    allMatches.push(...matches);
  });

  return { scores: accumulated, matches: allMatches };
}

export function normalizeScores(raw: EmotionScores): EmotionScores {
  const total = EMOTIONS.reduce((sum, key) => sum + Math.abs(raw[key]), 0);

  if (total === 0) {
    return emptyScores();
  }

  const normalized = emptyScores();
  for (const emotion of EMOTIONS) {
    normalized[emotion] =
      Math.round((Math.max(0, raw[emotion]) / total) * 100) / 100;
  }
  return normalized;
}

export function pickDominantEmotion(scores: EmotionScores): AnalysisEmotion {
  const sorted = [...EMOTIONS].sort((a, b) => scores[b] - scores[a]);
  const [top, second] = sorted;
  const topScore = scores[top];
  const secondScore = scores[second];

  if (topScore < MIN_SIGNAL) {
    return "neutral";
  }

  if (topScore - secondScore < NEUTRAL_MARGIN) {
    return "neutral";
  }

  return top;
}

export function detectRiskFlags(normalized: string): string[] {
  return pictionary.riskPhrases.filter((phrase) =>
    normalized.includes(phrase),
  );
}
