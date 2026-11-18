/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Regras de elegibilidade: mesma obra e primeiro volume de série.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/recommendation-eligibility.util.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../../books/entities/book.entity';
import { normalizeIsbn } from '../../books/utils/book-identifiers';

const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const workId = (book: Book) =>
  book.identifiers?.openLibraryWork?.match(/OL\d+W/i)?.[0]?.toUpperCase();
const title = (book: Book) =>
  fold(book.title.split(/[:(]/)[0])
    .replace(
      /\s+(?:\d+\s*)?(?:edicao|edition|paperback|hardcover|kindle)(?:\s+.*)?$/,
      '',
    )
    .trim();

/** Translations require a shared work identity; never infer them from the author alone. */
export function sameRecommendationWork(a: Book, b: Book): boolean {
  if (a.id === b.id) return true;
  const aw = workId(a),
    bw = workId(b);
  if (aw && bw && aw === bw) return true;
  const ai = normalizeIsbn(
    a.isbn ?? a.identifiers?.isbn13 ?? a.identifiers?.isbn10,
  );
  const bi = normalizeIsbn(
    b.isbn ?? b.identifiers?.isbn13 ?? b.identifiers?.isbn10,
  );
  if (ai && bi && ai.isbn13 === bi.isbn13) return true;
  const authorsA = a.authors.map(fold).filter(Boolean);
  if (!authorsA.some((author) => b.authors.map(fold).includes(author)))
    return false;
  if (title(a) && title(a) === title(b)) return true;
  return !!(
    a.series &&
    b.series &&
    a.volume &&
    b.volume &&
    fold(a.series) === fold(b.series) &&
    a.volume.trim() === b.volume.trim()
  );
}

/** Unknown volume in a known series is withheld, rather than guessing that it is the first. */
export function isFirstSeriesBook(book: Book): boolean {
  if (!book.series && !book.volume)
    return !/(?:\b(?:vol(?:ume)?|livro|book|tomo|parte)\.?\s*|#)\s*(?:[2-9]\d*|1\d+|II|III|IV|V|VI|VII|VIII|IX|X)\b/i.test(
      book.title,
    );
  const volume = (book.volume ?? '').trim();
  return /^(?:0*1(?:\.0+)?|I|(?:vol(?:ume)?|livro|book|tomo)\.?\s*0*1)$/i.test(
    volume,
  );
}
