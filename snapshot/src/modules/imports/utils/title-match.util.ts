/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Função foldText usada pelo classificador de gêneros.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/imports/utils/title-match.util.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
export interface TitleMatchScore {
  titleScore: number;
  authorMatches: boolean;
}

export const HIGH_CONFIDENCE_TITLE_SCORE = 0.85;

/** "Trono de Vidro (Série #5)" -> "Trono de Vidro" */
const TRAILING_SERIES = /\s*\([^()]*#[\d.,]+\)\s*$/;

export function stripSeries(title: string): string {
  return title.replace(TRAILING_SERIES, '').trim();
}

export function foldText(value: string | null | undefined): string[] {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Sørensen–Dice coefficient over character bigrams, 0..1. */
export function similarity(a: string, b: string): number {
  if (a === b) return a.length > 0 ? 1 : 0;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = (text: string): Map<string, number> => {
    const counts = new Map<string, number>();
    for (let index = 0; index < text.length - 1; index += 1) {
      const pair = text.slice(index, index + 2);
      counts.set(pair, (counts.get(pair) ?? 0) + 1);
    }
    return counts;
  };
  const first = bigrams(a);
  const second = bigrams(b);
  let shared = 0;

  for (const [pair, count] of first) {
    shared += Math.min(count, second.get(pair) ?? 0);
  }

  return (2 * shared) / (a.length - 1 + (b.length - 1));
}

export function scoreCandidate(
  csvTitle: string,
  csvAuthor: string,
  candidateTitle: string,
  candidateAuthors: string[],
): TitleMatchScore {
  const wanted = foldText(stripSeries(csvTitle)).join(' ');
  const found = foldText(stripSeries(candidateTitle)).join(' ');
  const surname = foldText(csvAuthor).at(-1) ?? '';

  return {
    titleScore: similarity(wanted, found),
    authorMatches:
      surname.length > 0 &&
      candidateAuthors.some((name) => foldText(name).includes(surname)),
  };
}

export function isHighConfidence(score: TitleMatchScore): boolean {
  return score.titleScore >= HIGH_CONFIDENCE_TITLE_SCORE && score.authorMatches;
}

/**
 * A looser title for the last search: no series, no subtitle.
 * "Trono de Vidro: A Herdeira (Série #1)" -> "Trono de Vidro"
 */
export function relaxTitle(title: string): string {
  return stripSeries(title)
    .split(/\s*(?::|\s[-–—]\s|\()\s*/)[0]
    .trim();
}
