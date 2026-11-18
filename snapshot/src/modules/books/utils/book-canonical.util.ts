/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Chave canônica de obra (deduplicação).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/books/utils/book-canonical.util.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../entities/book.entity';

type CanonicalBookFields = Pick<
  Book,
  'id' | 'externalToken' | 'title' | 'authors' | 'isbn'
>;

export function canonicalWorkKey(book: CanonicalBookFields): string {
  const normalizedTitle = normalizeBookIdentityText(book.title);
  const normalizedAuthor = book.authors
    .map(normalizeBookIdentityText)
    .find(Boolean);

  if (normalizedTitle && normalizedAuthor) {
    return `work:${normalizedTitle}:${normalizedAuthor}`;
  }

  const isbn = normalizeIsbn(book.isbn);
  if (isbn) {
    return `isbn:${isbn}`;
  }

  if (book.externalToken?.trim()) {
    return `external:${normalizeBookIdentityText(book.externalToken)}`;
  }

  return `id:${book.id}`;
}

export function canonicalEditionKey(book: CanonicalBookFields): string {
  const isbn = normalizeIsbn(book.isbn);
  if (isbn) {
    return `isbn:${isbn}`;
  }

  if (book.externalToken?.trim()) {
    return `external:${normalizeBookIdentityText(book.externalToken)}`;
  }

  return `id:${book.id}`;
}

export function canonicalAuthorKeys(book: CanonicalBookFields): string[] {
  return book.authors.map(normalizeBookIdentityText).filter(Boolean);
}

function normalizeBookIdentityText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeIsbn(value: string | null | undefined): string | null {
  const isbn = (value ?? '').replace(/[^0-9xX]/g, '').toUpperCase();
  return isbn.length >= 10 ? isbn : null;
}
