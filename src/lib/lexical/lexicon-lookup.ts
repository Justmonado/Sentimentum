import { getWordEntry, pictionary } from "./pictionary";
import type {
  BigramEntry,
  Emotion,
  EmotionContribution,
  HybridWeights,
  LexiconEntryMeta,
  PhraseEntry,
} from "./types";
import { EMOTIONS } from "./types";

/**
 * Convierte pesos híbridos en lista de contribuciones ordenadas.
 * Prioriza el léxico híbrido sobre entradas de una sola emoción.
 */
export function contributionsFromHybrid(
  weights: HybridWeights,
  scale: number,
): EmotionContribution[] {
  return EMOTIONS.filter((e) => (weights[e] ?? 0) > 0).map((emotion) => ({
    emotion,
    value: (weights[emotion] ?? 0) * scale,
  }));
}

export function getHybridLexiconEntry(
  token: string,
): HybridWeights | undefined {
  const lexicon = pictionary.hybridLexicon as Record<string, HybridWeights>;
  return lexicon[token];
}

/**
 * Resuelve un token: primero híbrido, luego buckets legacy por emoción.
 * Evita doble conteo (frustrado solo en hybridLexicon, no en enojo).
 */
export function lookupTokenContributions(
  token: string,
  scale: number,
): EmotionContribution[] {
  const hybrid = getHybridLexiconEntry(token);
  if (hybrid) {
    return contributionsFromHybrid(hybrid, scale);
  }

  const contributions: EmotionContribution[] = [];
  for (const emotion of EMOTIONS) {
    const entry = getWordEntry(emotion, token);
    if (entry) {
      contributions.push({ emotion, value: entry.weight * scale });
    }
  }
  return contributions;
}

export function lookupPhraseContributions(
  phrase: PhraseEntry,
  scale: number,
): EmotionContribution[] {
  if (phrase.weights) {
    return contributionsFromHybrid(phrase.weights, scale);
  }
  if (phrase.emotion) {
    return [{ emotion: phrase.emotion, value: phrase.weight * scale }];
  }
  return [];
}

export function lookupBigramContributions(
  bigram: BigramEntry,
  scale: number,
): EmotionContribution[] {
  if (bigram.weights) {
    return contributionsFromHybrid(bigram.weights, scale);
  }
  if (bigram.emotion) {
    return [{ emotion: bigram.emotion, value: bigram.weight * scale }];
  }
  return [];
}

export function getEntryMeta(
  token: string,
  emotion: Emotion,
): LexiconEntryMeta | undefined {
  return getWordEntry(emotion, token);
}

export function isHybridToken(token: string): boolean {
  return getHybridLexiconEntry(token) !== undefined;
}
