/**
 * Tokenización y normalización.
 * Separado del scoring para poder reutilizar en pruebas y en reglas de frases.
 */

/**
 * Normaliza texto para comparación con el diccionario (sin acentos, minúsculas).
 * Mejora el recall en español de México donde la ortografía varía.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"'«»]/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Divide en tokens por espacio tras la normalización.
 * Heurística simple pero predecible; las frases multi-palabra se resuelven después.
 */
export function tokenize(normalizedText: string): string[] {
  if (!normalizedText) return [];
  return normalizedText.split(" ").filter(Boolean);
}

/**
 * Une tokens contiguos en una cadena para comparar con entradas del léxico de frases.
 */
export function joinTokens(tokens: string[], start: number, length: number): string {
  return tokens.slice(start, start + length).join(" ");
}

/**
 * Detecta si en `start` comienza alguna frase de la lista (longest-match externo).
 */
export function matchPhraseAt(
  tokens: string[],
  start: number,
  phrases: readonly { phrase: string }[],
): { phrase: string; length: number } | null {
  for (const entry of phrases) {
    const parts = entry.phrase.split(" ");
    const length = parts.length;
    if (joinTokens(tokens, start, length) === entry.phrase) {
      return { phrase: entry.phrase, length };
    }
  }
  return null;
}
