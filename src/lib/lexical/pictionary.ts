import type { BigramEntry, Emotion, HybridWeights, LexiconEntryMeta, PhraseEntry } from "./types";

export const NEGATION_WINDOW_SIZE = 3;

/** Reducido vs 0.55: menos sobrepeso al castigar cláusulas anteriores a "pero". */
export const CONTRAST_PRIOR_DECAY = 0.68;

/** Reducido vs 1.2: la cláusula final sigue priorizada sin inflar artificialmente. */
export const CONTRAST_POST_BOOST = 1.08;

const e = (
  weight: number,
  meta?: Partial<Omit<LexiconEntryMeta, "weight">>,
): LexiconEntryMeta => ({ weight, ...meta });

const h = (weights: HybridWeights): HybridWeights => weights;

export const pictionary = {
  /**
   * Léxico híbrido: un lema → varias emociones con peso.
   * Mejora separación tristeza/enojo en estados como frustración o decepción.
   */
  hybridLexicon: {
    frustrado: h({ enojo: 3, tristeza: 2 }),
    frustrada: h({ enojo: 3, tristeza: 2 }),
    decepcionado: h({ tristeza: 3, enojo: 1.5 }),
    decepcionada: h({ tristeza: 3, enojo: 1.5 }),
    vacio: h({ tristeza: 3, enojo: 0.5 }),
    vacia: h({ tristeza: 3, enojo: 0.5 }),
    molesto: h({ enojo: 2, tristeza: 1.5 }),
    molesta: h({ enojo: 2, tristeza: 1.5 }),
    irritado: h({ enojo: 2.5, tristeza: 1 }),
    irritada: h({ enojo: 2.5, tristeza: 1 }),
    agotado: h({ tristeza: 2.5, enojo: 1 }),
    agotada: h({ tristeza: 2.5, enojo: 1 }),
    cansado: h({ tristeza: 2, enojo: 0.8 }),
    cansada: h({ tristeza: 2, enojo: 0.8 }),
    resentido: h({ enojo: 2, tristeza: 2.5 }),
    resentida: h({ enojo: 2, tristeza: 2.5 }),
    desilusionado: h({ tristeza: 3, enojo: 1 }),
    desilusionada: h({ tristeza: 3, enojo: 1 }),
  } satisfies Record<string, HybridWeights>,

  emociones: {
    felicidad: {
      feliz: e(2),
      alegre: e(2),
      contento: e(2),
      contenta: e(2),
      exito: e(3),
      amor: e(3),
      esperanza: e(2),
      divertido: e(2),
      maravilloso: e(3),
      positivo: e(2),
      bueno: e(2),
      buena: e(2),
      excelente: e(3),
      genial: e(3),
      perfecto: e(3),
      increible: e(3),
      emocionado: e(2),
      emocionada: e(2),
      bien: e(1, { ambiguous: true, tags: ["polaridad_contextual"] }),
      fantastico: e(3),
      gracias: e(1),
      animo: e(2),
    },
    tristeza: {
      tristeza: e(2),
      triste: e(2),
      deprimido: e(3),
      deprimida: e(3),
      depresion: e(3),
      miedo: e(2),
      miedoso: e(2),
      horrible: e(3),
      terrible: e(3),
      pesimo: e(3),
      fracaso: e(3),
      negativo: e(2),
      malo: e(2),
      mala: e(2),
      mal: e(2, { ambiguous: true }),
      solo: e(2, { ambiguous: true, tags: ["adverbio_o_adjetivo"] }),
      sola: e(2, { ambiguous: true }),
      solitario: e(2),
      llorar: e(2),
      llanto: e(2),
      perdi: e(3),
      desesperanza: e(3),
    },
    enojo: {
      enojado: e(2),
      enojada: e(2),
      enojo: e(2),
      odio: e(3),
      furioso: e(3),
      furiosa: e(3),
      rabia: e(3),
      agresivo: e(3),
      violento: e(3),
      injusto: e(2),
      injusta: e(2),
    },
  } satisfies Record<Emotion, Record<string, LexiconEntryMeta>>,

  modifiers: {
    muy: 1.5,
    mucho: 1.35,
    extremadamente: 2,
    bastante: 1.25,
    demasiado: 1.5,
    super: 1.5,
    poco: 0.5,
    algo: 0.75,
    ligeramente: 0.6,
    tan: 1.4,
    re: 1.3,
  } as Record<string, number>,

  negations: ["no", "nunca", "jamas", "ni", "sin", "tampoco"] as const,

  negationExemptPhrases: [
    "sin problema",
    "sin duda",
    "sin embargo",
    "ni modo",
  ] as const,

  contrastConnectors: ["sin embargo", "aunque", "pero"] as const,

  emotionalPhrases: [
    { phrase: "muy feliz", emotion: "felicidad", weight: 3.5 },
    { phrase: "muy contento", emotion: "felicidad", weight: 3.5 },
    { phrase: "muy triste", emotion: "tristeza", weight: 3.5 },
    { phrase: "muy enojado", emotion: "enojo", weight: 3.5 },
    {
      phrase: "me siento frustrado",
      weight: 3,
      weights: { enojo: 3, tristeza: 2 },
    },
    {
      phrase: "me siento frustrada",
      weight: 3,
      weights: { enojo: 3, tristeza: 2 },
    },
    { phrase: "no me siento bien", emotion: "tristeza", weight: 3.5 },
    { phrase: "sin esperanza", emotion: "tristeza", weight: 3, skipNegation: true },
    { phrase: "con esperanza", emotion: "felicidad", weight: 2.5, skipNegation: true },
    { phrase: "me siento mal", emotion: "tristeza", weight: 3 },
    { phrase: "estoy deprimido", emotion: "tristeza", weight: 3.5 },
    { phrase: "estoy deprimida", emotion: "tristeza", weight: 3.5 },
    {
      phrase: "que maravilloso",
      weight: 2,
      weights: { felicidad: 1, tristeza: 1.2, enojo: 0.8 },
    },
    { phrase: "pura rabia", emotion: "enojo", weight: 3.5 },
  ] satisfies PhraseEntry[],

  emotionalBigrams: [
    { first: "muy", second: "feliz", emotion: "felicidad", weight: 3.5 },
    { first: "muy", second: "triste", emotion: "tristeza", weight: 3.5 },
    { first: "muy", second: "enojado", emotion: "enojo", weight: 3.5 },
    { first: "tan", second: "feliz", emotion: "felicidad", weight: 3.2 },
    { first: "tan", second: "triste", emotion: "tristeza", weight: 3.2 },
    { first: "me", second: "duele", emotion: "tristeza", weight: 3 },
    {
      first: "me",
      second: "molesta",
      weight: 2.8,
      weights: { enojo: 2, tristeza: 1.5 },
    },
    { first: "sin", second: "animo", emotion: "tristeza", weight: 3 },
  ] satisfies BigramEntry[],

  riskPhrases: [
    "matar",
    "muerte",
    "murio",
    "fallecio",
    "suicidio",
    "morir",
    "acabar con todo",
    "no quiero vivir",
    "quiero morir",
    "hacerme dano",
  ] as const,
} as const;

function emotionLexicon(emotion: Emotion): Record<string, LexiconEntryMeta> {
  return pictionary.emociones[emotion] as Record<string, LexiconEntryMeta>;
}

export function getWordWeight(emotion: Emotion, token: string): number | undefined {
  const hybrid = pictionary.hybridLexicon as Record<string, HybridWeights>;
  if (hybrid[token]) return undefined;
  return emotionLexicon(emotion)[token]?.weight;
}

export function getWordEntry(
  emotion: Emotion,
  token: string,
): LexiconEntryMeta | undefined {
  const hybrid = pictionary.hybridLexicon as Record<string, HybridWeights>;
  if (hybrid[token]) return undefined;
  return emotionLexicon(emotion)[token];
}

export function getPhrasesByLength(): PhraseEntry[] {
  return [...pictionary.emotionalPhrases].sort(
    (a, b) => b.phrase.split(" ").length - a.phrase.split(" ").length,
  );
}
