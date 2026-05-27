import type {
  AnalysisEmotion,
  Emotion,
  EmotionScores,
  MatchedToken,
} from "./types";

export function buildSummary(
  emotion: AnalysisEmotion,
  scores: EmotionScores,
  matchedTokens: MatchedToken[],
  confidence: number,
  usedContrastSplit: boolean,
): string {
  if (matchedTokens.length === 0) {
    return "No detectamos palabras emocionales claras en el texto. Puede ser un mensaje neutro o usar vocabulario fuera del diccionario actual.";
  }

  const topMatches = matchedTokens
    .slice(0, 4)
    .map((m) => `"${m.matchedAs ?? m.token}"`)
    .join(", ");

  const pct = (key: Emotion) => Math.round(scores[key] * 100);

  const contrastNote = usedContrastSplit
    ? " Se consideraron segmentos del texto separados por conectores como «pero» o «aunque»."
    : "";

  if (emotion === "neutral") {
    return `Hay señales mixtas (${pct("felicidad")}% felicidad, ${pct("tristeza")}% tristeza, ${pct("enojo")}% enojo). Influencias: ${topMatches}.${contrastNote}`;
  }

  const labels: Record<Emotion, string> = {
    felicidad: "felicidad",
    tristeza: "tristeza",
    enojo: "enojo",
  };

  const strength =
    confidence >= 70
      ? "con claridad"
      : confidence >= 40
        ? "con moderación"
        : "de forma tenue";

  return `Predominio de ${labels[emotion]} ${strength} (${pct(emotion)}%). Influencias: ${topMatches}.${contrastNote}`;
}
