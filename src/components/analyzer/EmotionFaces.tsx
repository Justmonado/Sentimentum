import type { FaceLevel } from "@/lib/lexical/types";

interface FaceConfig {
  level: FaceLevel;
  label: string;
  bgClass: string;
  mouthClass: string;
  eyesClass: string;
}

const FACES: FaceConfig[] = [
  {
    level: 1,
    label: "Enojo",
    bgClass: "bg-[#d32f2f]",
    mouthClass: "face-mouth-angry",
    eyesClass: "face-eyes",
  },
  {
    level: 2,
    label: "Tristeza",
    bgClass: "bg-[#f4511e]",
    mouthClass: "face-mouth-sad",
    eyesClass: "face-eyes",
  },
  {
    level: 3,
    label: "Neutral",
    bgClass: "bg-[#f9a825]",
    mouthClass: "face-mouth-neutral",
    eyesClass: "face-eyes",
  },
  {
    level: 4,
    label: "Felicidad",
    bgClass: "bg-[#fdd835]",
    mouthClass: "face-mouth",
    eyesClass: "face-eyes",
  },
  {
    level: 5,
    label: "Muy positivo",
    bgClass: "bg-[#43a047]",
    mouthClass: "face-mouth-big",
    eyesClass: "face-eyes face-eyes-happy",
  },
];

interface EmotionFacesProps {
  activeLevel: FaceLevel | null;
}

export function EmotionFaces({ activeLevel }: EmotionFacesProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-6 pt-2"
      role="img"
      aria-label={
        activeLevel
          ? `Nivel emocional visual: ${activeLevel} de 5`
          : "Caritas de referencia emocional"
      }
    >
      {FACES.map((face) => {
        const isActive = activeLevel === face.level;
        return (
          <div
            key={face.level}
            className={`relative h-20 w-20 rounded-full transition-all duration-300 ${face.bgClass} ${
              isActive
                ? "scale-110 opacity-100 ring-2 ring-white/30"
                : "scale-100 opacity-40"
            }`}
            title={face.label}
          >
            <span className={face.eyesClass} aria-hidden />
            <span className={face.mouthClass} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}
