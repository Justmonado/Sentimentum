import { pictionary, NEGATION_WINDOW_SIZE } from "./pictionary";
import { joinTokens, matchPhraseAt } from "./tokenize";
import type { ClauseAnalysisState, TextClause } from "./types";

/** Estado inicial de una cláusula: sin negación ni modificador acumulado. */
export function createClauseState(): ClauseAnalysisState {
  return {
    modifier: 1,
    negationWindowRemaining: 0,
  };
}

/**
 * "sin problema" no debe activar negación sobre la palabra siguiente.
 * Heurística: lista blanca de frases completas antes de abrir ventana de negación.
 */
export function isNegationExemptAt(tokens: string[], index: number): boolean {
  const candidates = pictionary.negationExemptPhrases.map((p) => ({
    phrase: p,
  }));
  return matchPhraseAt(tokens, index, candidates) !== null;
}

/**
 * Activa ventana de negación de 3 tokens al detectar partícula negativa.
 * Ventana > 1 token: en español suele haber intensificadores entre "no" y el adjetivo
 * ("no estoy nada feliz"), a diferencia del flag booleano de una sola palabra.
 */
export function registerNegation(
  token: string,
  tokens: string[],
  index: number,
  state: ClauseAnalysisState,
): void {
  if (!(pictionary.negations as readonly string[]).includes(token)) {
    return;
  }

  if (token === "sin" && isNegationExemptAt(tokens, index)) {
    return;
  }

  state.negationWindowRemaining = NEGATION_WINDOW_SIZE;
}

/** Cada token consume un paso de la ventana, exista o no coincidencia emocional. */
export function tickNegationWindow(state: ClauseAnalysisState): void {
  if (state.negationWindowRemaining > 0) {
    state.negationWindowRemaining -= 1;
  }
}

export function isNegationActive(state: ClauseAnalysisState): boolean {
  return state.negationWindowRemaining > 0;
}

/**
 * Segmenta el texto en cláusulas usando conectores de contraste.
 * Permite que "Estoy triste pero hoy mejor" no promedie todo como un solo bloque.
 */
export function splitIntoContrastClauses(tokens: string[]): TextClause[] {
  if (tokens.length === 0) {
    return [];
  }

  const connectors = [...pictionary.contrastConnectors].sort(
    (a, b) => b.split(" ").length - a.split(" ").length,
  );

  const clauses: TextClause[] = [];
  let current: string[] = [];
  let followsContrast = false;

  let i = 0;
  while (i < tokens.length) {
    const connector = connectors.find((c) => {
      const len = c.split(" ").length;
      return joinTokens(tokens, i, len) === c;
    });

    if (connector) {
      if (current.length > 0) {
        clauses.push({ tokens: current, followsContrast });
        current = [];
      }
      followsContrast = true;
      i += connector.split(" ").length;
      continue;
    }

    current.push(tokens[i]);
    i += 1;
  }

  if (current.length > 0) {
    clauses.push({ tokens: current, followsContrast });
  }

  if (clauses.length === 0) {
    return [{ tokens, followsContrast: false }];
  }

  return clauses;
}

/**
 * Refuerzo adicional a la última cláusula del texto.
 * En narrativas con contraste, el cierre suele reflejar el estado actual ("pero al final…").
 * Separado del boost por conector para no duplicar sobrepeso en segmentos intermedios.
 */
export const END_CLAUSE_PRIORITY_BOOST = 1.28;

/**
 * Peso de cláusula según posición respecto a conectores de contraste.
 * - Cláusulas anteriores al último segmento se atenúan (postura superada).
 * - Cláusula tras "pero" / "aunque" recibe boost moderado.
 * - Última cláusula recibe prioridad de cierre (sin ML).
 */
export function getClauseWeightMultiplier(
  clauseIndex: number,
  totalClauses: number,
  followsContrast: boolean,
  priorDecay: number,
  postBoost: number,
): number {
  const isLast = clauseIndex === totalClauses - 1;
  let multiplier = 1;

  if (!isLast && totalClauses > 1) {
    multiplier *= priorDecay;
  }

  if (followsContrast) {
    multiplier *= postBoost;
  }

  if (isLast && totalClauses > 1) {
    multiplier *= END_CLAUSE_PRIORITY_BOOST;
  }

  return multiplier;
}
