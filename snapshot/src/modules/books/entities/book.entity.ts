/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Tipo Book utilizado pelos provedores.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/books/entities/book.entity.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { BookIdentifiers } from '../utils/book-identifiers';

/** Where each part of a book record came from (internal; not sent to the app). */
export interface BookProvenance {
  metadataSource?: string;
  authorsSource?: string;
  coverSource?: string;
  descriptionSource?: string;
  pagesSource?: string;
  genresSource?: string;
  commercialSource?: string;
  /** When the Open Library edition/work details were read (lazy enrichment). */
  enrichedAt?: string;
  /** Last failed enrichment, so a provider outage is not retried on every read. */
  enrichAttemptedAt?: string;
}

/**
 * 'provisional': created from a CSV row that no source knew, with the file's
 * data only, while the nightly enrichment looks for it (7 days at most).
 * 'not_found': that search gave up; the book stays with what the file had.
 */
export type BookCatalogStatus = 'ready' | 'provisional' | 'not_found';

export interface Book {
  id: string;
  externalToken: string | null;
  title: string;
  subtitle: string | null;
  authors: string[];
  /** BookLog's own genre(s), classified from the provider's raw categories. */
  genres: string[];
  /** Subgenres of `genres`, from BookLog's own taxonomy (e.g. Romance -> Dark romance). */
  subgenres?: string[];
  /** Who the book is written for (e.g. "Jovem Adulto"). Empty when unknown: never guessed. */
  audience?: string[];
  /** Recurring topics (e.g. "Dragões", "LGBTQ+"), kept apart from genre and audience. */
  themes?: string[];
  /**
   * How the work is published (manga, comic, light novel...), from
   * `PUBLICATION_TYPES`. Null when unknown: never defaulted to "book".
   */
  publicationType?: string | null;
  /**
   * The physical form of this edition: 'print', 'ebook' or 'audiobook' (see
   * `BOOK_FORMATS`). Null when unknown: never defaulted to "print".
   */
  format?: string | null;
  /** The series this edition belongs to (e.g. "Iron Hearts"), from the catalog. Null when unknown. */
  series?: string | null;
  /** Which volume of the series ("2"), from the catalog. Null when unknown. */
  volume?: string | null;
  /** Who reads an audiobook aloud (Amazon/Audible contributors with role "narrator"). */
  narrators?: string[];
  /** The raw category/subject list the provider sent, kept apart from `genres`. */
  subjects?: string[];
  identifiers?: BookIdentifiers;
  provenance?: BookProvenance;
  publisher?: string | null;
  publishedYear: number | null;
  pageCount: number;
  language: string;
  synopsis: string | null;
  coverUrl: string | null;
  isbn: string | null;
  aggregateRating: number | null;
  ratingCount?: number;
  sourceProvider?: string | null;
  sourceMarketplace?: string | null;
  sourceId?: string | null;
  detailPageUrl?: string | null;
  sourceFetchedAt?: string | null;
  sourceExpiresAt?: string | null;
  /** Absent means 'ready'. */
  catalogStatus?: BookCatalogStatus;
  /**
   * The reader who created it as a "título privado": only they see it, it is
   * never copied to the catalog and never enriched or merged. Null otherwise.
   */
  ownerId?: string | null;
  /** How many readers added it to their library (internal; used to pick between editions). */
  addedCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * A book every reader can open (`GET /books/:id`): not a título privado and
 * not a provisional import still being completed. Lists that show one reader
 * books from other readers (recommendations, "also read") keep only these.
 */
export function isSharedBook(book: Pick<Book, 'ownerId' | 'catalogStatus'>): boolean {
  return !book.ownerId && (book.catalogStatus ?? 'ready') === 'ready';
}
