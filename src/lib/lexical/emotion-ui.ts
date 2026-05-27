import type { AnalysisEmotion, Emotion, FaceLevel } from "./types";

export function emotionToFaceLevel(emotion: AnalysisEmotion): FaceLevel {
  switch (emotion) {
    case "enojo":
      return 1;
    case "tristeza":
      return 2;
    case "neutral":
      return 3;
    case "felicidad":
      return 4;
    default:
      return 3;
  }
}

export const EMOTION_LABELS: Record<AnalysisEmotion, string> = {
  felicidad: "Felicidad",
  tristeza: "Tristeza",
  enojo: "Enojo",
  neutral: "Neutral / mixto",
};

export const EMOTION_BAR_COLORS: Record<Emotion, string> = {
  felicidad: "bg-positive",
  tristeza: "bg-[#f4511e]",
  enojo: "bg-negative",
};
