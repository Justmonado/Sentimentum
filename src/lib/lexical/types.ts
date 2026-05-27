export const EMOTIONS = ["felicidad", "tristeza", "enojo"] as const;

export type Emotion = (typeof EMOTIONS)[number];

export type AnalysisEmotion = Emotion | "neutral";

export type EmotionScores = Record<Emotion, number>;

/** Pesos multi-emoción: una palabra aporta a varios buckets a la vez. */
export type HybridWeights = Partial<Record<Emotion, number>>;

export type MatchSource = "word" | "bigram" | "phrase";

export interface LexiconEntryMeta {
  weight: number;
  ambiguous?: boolean;
  skipNegation?: boolean;
  tags?: string[];
}

export interface PhraseEntry {
  phrase: string;
  /** Compatibilidad: emoción única cuando no hay `weights`. */
  emotion?: Emotion;
  weight: number;
  /** Emociones híbridas para la frase completa. */
  weights?: HybridWeights;
  forceNegated?: boolean;
  skipNegation?: boolean;
}

export interface BigramEntry {
  first: string;
  second: string;
  emotion?: Emotion;
  weight: number;
  weights?: HybridWeights;
}

/** Una contribución atómica al score (tras léxico + modificador de cláusula). */
export interface EmotionContribution {
  emotion: Emotion;
  value: number;
}

export interface MatchedToken {
  token: string;
  emotion: Emotion;
  weight: number;
  negated: boolean;
  source: MatchSource;
  matchedAs?: string;
  /** Marca coincidencias con reparto híbrido (explicabilidad). */
  hybrid?: boolean;
}

export interface LexicalAnalysisResult {
  scores: EmotionScores;
  emotion: AnalysisEmotion;
  confidence: number;
  matchedTokens: MatchedToken[];
  riskFlags: string[];
  summary: string;
}

export type FaceLevel = 1 | 2 | 3 | 4 | 5;

export interface ClauseAnalysisState {
  modifier: number;
  negationWindowRemaining: number;
}

export interface TextClause {
  tokens: string[];
  followsContrast: boolean;
}

/** Metadatos para balanceo post-normalización. */
export interface ScoringMetadata {
  rawScores: EmotionScores;
  matchCount: number;
  hybridMatchCount: number;
  activeEmotionCount: number;
  sadnessAngerOverlap: boolean;
  clauseCount: number;
}
