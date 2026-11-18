/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Similaridade entre livros por metadados (livros relacionados).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/book-similarity.util.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import {
  isFirstSeriesBook,
  sameRecommendationWork,
} from './recommendation-eligibility.util';
import {
  isMeaningfulMetadata,
  recommendationGenres,
} from '../../books/utils/recommendation-metadata.util';
import type { Book } from '../../books/entities/book.entity';
import { countSharedValues } from './recommendation-ranking.util';

/** A candidate needs at least this much in common to be called "similar". */
export const MIN_SIMILARITY_SCORE = 3;

/** Shared work identifiers also cover translated editions. */
export const isSameWork = sameRecommendationWork;

/**
 * How alike two books are, from what the catalog already knows: author,
 * genre, subgenre, themes, publication type, audience and language. Pure and
 * deterministic; no signal is invented for a book that lacks the field.
 */
export function similarityScore(base: Book, candidate: Book): number {
  let score = 0;

  if (
    countSharedValues(
      base.authors.filter(isMeaningfulMetadata),
      candidate.authors.filter(isMeaningfulMetadata),
    ).length > 0
  )
    score += 4;

  const baseGenres = recommendationGenres(base);
  const candidateGenres = recommendationGenres(candidate);
  if (countSharedValues(baseGenres, candidateGenres).length > 0) score += 3;

  if (
    countSharedValues(base.subgenres ?? [], candidate.subgenres ?? []).length >
    0
  ) {
    score += 2;
  }

  const sharedThemes = countSharedValues(
    base.themes ?? [],
    candidate.themes ?? [],
  ).length;
  score += Math.min(sharedThemes, 3) * 1.5;

  if (
    base.publicationType &&
    candidate.publicationType &&
    base.publicationType === candidate.publicationType
  ) {
    score += 1.5;
  }

  if (
    countSharedValues(base.audience ?? [], candidate.audience ?? []).length > 0
  ) {
    score += 1;
  }

  if (base.language && base.language === candidate.language) score += 0.5;

  return score;
}

/**
 * The books most like `base`, best first: never the book itself or another
 * edition of it, nothing below MIN_SIMILARITY_SCORE, ties broken by how many
 * readers rated the candidate and then by title (so the order is stable).
 */
export function rankSimilarBooks(
  base: Book,
  candidates: Book[],
  limit: number,
): Book[] {
  const seen = new Set<string>();

  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return isFirstSeriesBook(candidate) && !isSameWork(base, candidate);
    })
    .map((candidate) => ({
      candidate,
      score: similarityScore(base, candidate),
    }))
    .filter(({ score }) => score >= MIN_SIMILARITY_SCORE)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.candidate.ratingCount ?? 0) - (a.candidate.ratingCount ?? 0) ||
        a.candidate.title.localeCompare(b.candidate.title, 'pt-BR'),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
