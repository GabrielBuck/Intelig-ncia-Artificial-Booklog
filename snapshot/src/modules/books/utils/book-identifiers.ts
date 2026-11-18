/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Normalização de ISBN usada pela elegibilidade.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/books/utils/book-identifiers.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
/**
 * The only place that knows how book identifiers look and how they relate.
 * Every provider, the CSV import and the Amazon matching normalize through here,
 * so two spellings of the same code always compare equal.
 */

/** Identifiers the BookLog knows for a book (stored in `books.identifiers`). */
export interface BookIdentifiers {
  isbn10?: string;
  isbn13?: string;
  /** Amazon product id. For print books it is often the ISBN-10; Kindle ones start with B0. */
  asin?: string;
  /** How the ASIN was confirmed on Amazon (for commercial lookups). */
  asinMatchedBy?: AsinMatch;
  goodreads?: string[];
  /** The Maratona export's edicao_id, so a second import of the file finds the book at once. */
  maratona?: string;
  openLibraryWork?: string;
  openLibraryEdition?: string;
  oclc?: string[];
}

export type AsinMatch = 'known_asin' | 'isbn10' | 'isbn13';

export type IdentifierKind = 'isbn10' | 'isbn13' | 'asin';

export interface ClassifiedIdentifier {
  kind: IdentifierKind;
  value: string;
}

/** Goodreads wraps ISBNs as ="123"; strip that, hyphens, spaces and dots. */
export function cleanIdentifier(raw: string | null | undefined): string {
  return (raw ?? '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

export function isValidIsbn10(value: string): boolean {
  if (!/^\d{9}[\dX]$/.test(value)) return false;
  const sum = [...value].reduce(
    (total, char, index) =>
      total + (10 - index) * (char === 'X' ? 10 : Number(char)),
    0,
  );
  return sum % 11 === 0;
}

/** EAN-13 checksum. Every ISBN-13 is an EAN-13 with a 978/979 prefix. */
export function isValidEan13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  const sum = [...value].reduce(
    (total, char, index) => total + Number(char) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return sum % 10 === 0;
}

export function isValidIsbn13(value: string): boolean {
  return isValidEan13(value) && /^97[89]/.test(value);
}

/** Only 978-prefixed ISBN-13s have an ISBN-10 equivalent. */
export function isbn13ToIsbn10(isbn13: string): string | null {
  if (!isValidIsbn13(isbn13) || !isbn13.startsWith('978')) return null;

  const body = isbn13.slice(3, 12);
  const sum = [...body].reduce(
    (total, char, index) => total + (10 - index) * Number(char),
    0,
  );
  const check = (11 - (sum % 11)) % 11;
  return body + (check === 10 ? 'X' : String(check));
}

export function isbn10ToIsbn13(isbn10: string): string | null {
  if (!isValidIsbn10(isbn10)) return null;

  const body = `978${isbn10.slice(0, 9)}`;
  const sum = [...body].reduce(
    (total, char, index) => total + Number(char) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return body + String((10 - (sum % 10)) % 10);
}

/** Kindle and other non-ISBN Amazon ids (B0 + 8). An ISBN-10 is not an ASIN here. */
export function isKindleAsin(value: string): boolean {
  return /^B0[0-9A-Z]{8}$/.test(value);
}

export function classifyIdentifier(
  raw: string | null | undefined,
): ClassifiedIdentifier | null {
  const value = cleanIdentifier(raw);

  if (isValidIsbn10(value)) return { kind: 'isbn10', value };
  if (isValidIsbn13(value)) return { kind: 'isbn13', value };
  if (isKindleAsin(value)) return { kind: 'asin', value };
  return null;
}

/**
 * Both forms of an ISBN (or EAN-13 of a book), or null when the code is not a
 * valid ISBN. `isbn10` is null for 979 ISBNs, which have no ISBN-10.
 */
export function normalizeIsbn(
  raw: string | null | undefined,
): { isbn10: string | null; isbn13: string } | null {
  const identifier = classifyIdentifier(raw);

  if (identifier?.kind === 'isbn10') {
    return {
      isbn10: identifier.value,
      isbn13: isbn10ToIsbn13(identifier.value) as string,
    };
  }
  if (identifier?.kind === 'isbn13') {
    return {
      isbn10: isbn13ToIsbn10(identifier.value),
      isbn13: identifier.value,
    };
  }
  return null;
}

/** The ISBN-13 of a code, whatever form it came in. */
export function toIsbn13(raw: string | null | undefined): string | null {
  return normalizeIsbn(raw)?.isbn13 ?? null;
}

/** Every spelling a stored ISBN may have: ISBN-13 and ISBN-10 of each code. */
export function isbnVariants(
  codes: Array<string | null | undefined>,
): string[] {
  const variants = new Set<string>();

  for (const code of codes) {
    const isbn = normalizeIsbn(code);
    if (!isbn) continue;
    variants.add(isbn.isbn13);
    if (isbn.isbn10) variants.add(isbn.isbn10);
  }

  return [...variants];
}

/**
 * A Goodreads book id. The export gives "12345"; links give "12345.Book_Title"
 * or "12345-book-title". Anything else is not an id.
 */
export function normalizeGoodreadsId(
  raw: string | number | null | undefined,
): string | null {
  const match = /^\s*(\d{1,12})(?:[.\-_].*)?\s*$/.exec(String(raw ?? ''));
  return match && Number(match[1]) > 0 ? String(Number(match[1])) : null;
}

/** "/books/OL123M", "OL123M" -> "OL123M". Kind: M edition, W work, A author. */
export function normalizeOpenLibraryKey(
  raw: string | null | undefined,
  kind: 'M' | 'W' | 'A',
): string | null {
  const match = /(OL\d+)([MWA])\b/i.exec(raw ?? '');
  return match && match[2].toUpperCase() === kind
    ? `${match[1].toUpperCase()}${kind}`
    : null;
}

/** Amazon only accepts 10-character product ids. */
export function normalizeAsin(raw: string | null | undefined): string | null {
  const value = cleanIdentifier(raw);
  return /^[A-Z0-9]{10}$/.test(value) ? value : null;
}

/** ISBN-13 and ISBN-10 (when they exist) of all codes in the given lists. */
export function collectIsbns(codes: Array<string | null | undefined>): {
  isbn13: string[];
  isbn10: string[];
} {
  const isbn13 = new Set<string>();
  const isbn10 = new Set<string>();

  for (const code of codes) {
    const isbn = normalizeIsbn(code);
    if (!isbn) continue;
    isbn13.add(isbn.isbn13);
    if (isbn.isbn10) isbn10.add(isbn.isbn10);
  }

  return { isbn13: [...isbn13], isbn10: [...isbn10] };
}

/** True when two books share at least one ISBN, whatever form each one stores. */
export function sharesIsbn(
  a: Array<string | null | undefined>,
  b: Array<string | null | undefined>,
): boolean {
  const left = new Set(collectIsbns(a).isbn13);
  return collectIsbns(b).isbn13.some((isbn) => left.has(isbn));
}

/**
 * What identifies one edition of a book: its ISBNs (every spelling) and its
 * ASIN. Two rows with any of these in common are the same edition.
 */
export function editionKeys(book: {
  isbn?: string | null;
  identifiers?: BookIdentifiers | null;
  sourceProvider?: string | null;
  sourceId?: string | null;
}): { isbns: string[]; asin: string | null } {
  const isbns = isbnVariants([
    book.isbn,
    book.identifiers?.isbn10,
    book.identifiers?.isbn13,
  ]);
  const asin = (
    book.identifiers?.asin ??
    (book.sourceProvider === 'amazon' ? book.sourceId : null) ??
    ''
  )
    .trim()
    .toUpperCase();

  return { isbns, asin: /^[A-Z0-9]{10}$/.test(asin) ? asin : null };
}
