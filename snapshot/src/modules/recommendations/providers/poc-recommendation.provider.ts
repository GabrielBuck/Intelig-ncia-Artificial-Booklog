/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Provedor por grafo de livros com percurso guloso e fallback híbrido.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/poc-recommendation.provider.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import { Injectable } from '@nestjs/common';

import {
  isMeaningfulMetadata,
  recommendationGenres,
} from '../../books/utils/recommendation-metadata.util';
import type { Book } from '../../books/entities/book.entity';
import type { LibraryItem } from '../../library/entities/library-item.entity';
import type { RecommendationProvider } from './recommendation-provider.interface';
import {
  buildCandidatePool,
  buildHybridRecommendationResult,
  buildRecommendationContext,
  canonicalWorkKey,
  countSharedValues,
  normalizeText,
  rankHybridCandidates,
  resolveRankingStrategy,
  titleTokenOverlap,
  type RecommendationContext,
} from './recommendation-ranking.util';
import type {
  RecommendationInput,
  RecommendationResult,
  RecommendedBook,
} from '../types/recommendation.types';

interface GraphStep {
  book: Book;
  origin: Book;
  weight: number;
  reasons: string[];
}

@Injectable()
export class PocRecommendationProvider implements RecommendationProvider {
  async recommendBooks(
    input: RecommendationInput,
  ): Promise<RecommendationResult> {
    const context = buildRecommendationContext(input);
    const strategy = resolveRankingStrategy(
      input,
      context.personalized ? 'graph' : 'trending',
    );

    if (
      !context.personalized ||
      strategy === 'trending' ||
      strategy === 'collaborative' ||
      strategy === 'hybrid' ||
      strategy === 'contentBased'
    ) {
      return buildHybridRecommendationResult(input, {
        provider: 'poc',
        source: 'poc',
        temporary: false,
        strategy,
      });
    }

    const graphItems = this.buildGraphChain(input, context, strategy);

    if (graphItems.length >= input.limit) {
      return {
        items: graphItems,
        meta: {
          personalized: true,
          strategy,
          provider: 'poc',
          temporary: false,
        },
      };
    }

    const selectedIds = new Set(graphItems.map((item) => item.bookId));
    const filler = rankHybridCandidates(input, context, {
      provider: 'poc',
      source: 'poc',
      temporary: false,
      strategy: strategy === 'graph' ? 'hybrid' : strategy,
    }).filter((item) => !selectedIds.has(item.bookId));

    return {
      items: [...graphItems, ...filler].slice(0, input.limit),
      meta: {
        personalized: true,
        strategy,
        provider: 'poc',
        temporary: false,
      },
    };
  }

  private buildGraphChain(
    input: RecommendationInput,
    context: RecommendationContext,
    strategy: Exclude<RecommendationInput['strategy'], 'auto'>,
  ): RecommendedBook[] {
    const candidates = buildCandidatePool(input).filter(
      (book) =>
        !context.dismissedBookIds.has(book.id) &&
        (input.includeAlreadyInLibrary ||
          (!context.libraryBookIds.has(book.id) &&
            !context.libraryWorkKeys.has(canonicalWorkKey(book)))),
    );
    const seedBooks = this.sortedSeedBooks(input);
    let current = seedBooks[0] ?? input.libraryBooks[0];

    if (!current) {
      return [];
    }

    const selected = new Set<string>();
    const recommendations: RecommendedBook[] = [];

    while (recommendations.length < input.limit) {
      const anchoredCandidates = candidates.filter((book) =>
        seedBooks.some((seed) => this.edgeWeight(seed, book).weight > 0),
      );
      const next = this.findStrongestEdge(
        current,
        anchoredCandidates,
        selected,
      );

      if (!next) {
        break;
      }

      selected.add(next.book.id);
      recommendations.push(
        this.toGraphRecommendation(next, input.includeReasons, strategy),
      );
      current = next.book;
    }

    return recommendations;
  }

  private sortedSeedBooks(input: RecommendationInput): Book[] {
    const itemByBookId = new Map(
      input.libraryItems.map((item) => [item.bookId, item]),
    );

    return [...input.libraryBooks].sort(
      (left, right) =>
        seedScore(right, itemByBookId.get(right.id)) -
          seedScore(left, itemByBookId.get(left.id)) ||
        left.title.localeCompare(right.title),
    );
  }

  private findStrongestEdge(
    origin: Book,
    candidates: Book[],
    selected: Set<string>,
  ): GraphStep | null {
    const edges = candidates
      .filter((book) => book.id !== origin.id && !selected.has(book.id))
      .map((book) => {
        const edge = this.edgeWeight(origin, book);
        return edge.weight > 0 ? { book, origin, ...edge } : null;
      })
      .filter((edge): edge is GraphStep => edge !== null)
      .sort(
        (left, right) =>
          right.weight - left.weight ||
          (right.book.aggregateRating ?? 0) -
            (left.book.aggregateRating ?? 0) ||
          left.book.title.localeCompare(right.book.title),
      );

    return edges[0] ?? null;
  }

  private edgeWeight(
    origin: Book,
    candidate: Book,
  ): {
    weight: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let weight = 0;
    const sharedGenres = countSharedValues(
      recommendationGenres(origin),
      recommendationGenres(candidate),
    );
    const sharedAuthors = countSharedValues(
      origin.authors.filter(isMeaningfulMetadata),
      candidate.authors.filter(isMeaningfulMetadata),
    );
    const titleOverlap = titleTokenOverlap(origin.title, candidate.title);

    if (sharedGenres.length > 0) {
      weight += Math.min(55, 40 + sharedGenres.length * 7);
      reasons.push(
        `Aresta do grafo a partir de ${origin.title}: generos em comum ${sharedGenres.join(', ')}.`,
      );
    }

    if (sharedAuthors.length > 0) {
      weight += Math.min(35, 25 + sharedAuthors.length * 5);
      reasons.push(
        `Aresta do grafo a partir de ${origin.title}: autores em comum ${sharedAuthors.join(', ')}.`,
      );
    }

    // Language, ratings and title words cannot establish a taste connection.
    if (sharedGenres.length === 0 && sharedAuthors.length === 0) {
      return { weight: 0, reasons: [] };
    }

    if (titleOverlap > 0) {
      weight += Math.round(titleOverlap * 12);
    }

    if (origin.language === candidate.language) {
      weight += 5;
    }

    if ((candidate.aggregateRating ?? 0) >= 4) {
      weight += 8;
    }

    if (reasons.length === 0 && weight > 0) {
      reasons.push(
        `Aresta do grafo a partir de ${origin.title} com metadados compativeis.`,
      );
    }

    return {
      weight: Math.min(100, weight),
      reasons,
    };
  }

  private toGraphRecommendation(
    step: GraphStep,
    includeReasons: boolean,
    strategy: Exclude<RecommendationInput['strategy'], 'auto'>,
  ): RecommendedBook {
    const reasons = [
      `Caminho do grafo a partir de ${step.origin.title} com peso ${step.weight}.`,
      ...step.reasons,
    ];

    return {
      book: step.book,
      bookId: step.book.id,
      score: Number((step.weight / 100).toFixed(2)),
      recommendationReason: includeReasons
        ? reasons[0]
        : 'Recomendado pelo BookLog.',
      recommendationReasons: includeReasons
        ? [...new Set(reasons)].slice(0, 4)
        : [],
      strategy,
      source: 'poc',
    };
  }
}

function seedScore(book: Book, item: LibraryItem | undefined): number {
  let score = book.aggregateRating ?? 0;

  if (!item) {
    return score;
  }

  score += (item.personalRating ?? 0) * 2;
  score += item.isFavorite ? 4 : 0;
  score += item.progressPercent / 25;
  score += normalizeText(item.status).includes('FINISHED'.toLowerCase())
    ? 2
    : 0;

  return score;
}
