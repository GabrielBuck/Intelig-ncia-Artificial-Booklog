/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Normalização de metadados e gêneros usados no ranking.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/books/utils/recommendation-metadata.util.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../entities/book.entity';
import {
  classifyGenre,
  genreSearchTerms,
  UNCATEGORIZED_GENRE,
} from './genre-classifier.util';

export function normalizeMetadata(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function isMeaningfulMetadata(value: string): boolean {
  const normalized = normalizeMetadata(value)
    .replace(/[-_]/g, ' ')
    .replace(/[.!]+$/, '');
  return (
    Boolean(normalized) &&
    !/^(unknown(?: (?:author|authors|genre|type|category|categories))?|uncategorized|unclassified|sem (?:autor|autoria|categoria|genero)|(?:autor|categoria|genero|tipo) desconhecid[oa]|desconhecid[oa]|nao (?:classificado|informado)|n\/?a|outros|other|general|geral|anonymous|anonimo|various authors|varios autores|diversos autores|not available|not specified|undefined|null)$/.test(
      normalized,
    )
  );
}

export function canonicalGenre(value: string): string {
  const classified = classifyGenre([value]);
  return classified === UNCATEGORIZED_GENRE ? value.trim() : classified;
}

/** Missing categories can use explicit catalog subjects, never guessed identity. */
export function recommendationGenres(book: Book): string[] {
  const genres = book.genres.filter(isMeaningfulMetadata).map(canonicalGenre);
  if (genres.length > 0) return [...new Set(genres)];
  // Classify together so a generic "Literature/Fiction" subject cannot
  // create an additional fiction preference alongside a specific subject.
  const classified = classifyGenre(
    [...(book.subjects ?? []), ...(book.subgenres ?? [])].filter(
      isMeaningfulMetadata,
    ),
  );
  return classified === UNCATEGORIZED_GENRE ? [] : [classified];
}

export function recommendationGenreTerms(genre: string): string[] {
  return [
    ...new Set([genre, ...genreSearchTerms(genre)].map(normalizeMetadata)),
  ];
}
