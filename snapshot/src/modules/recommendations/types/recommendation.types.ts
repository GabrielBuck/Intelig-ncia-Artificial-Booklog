/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Tipos de entrada e saída das recomendações.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/types/recommendation.types.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../../books/entities/book.entity';
import type { LibraryItem } from '../../library/entities/library-item.entity';
import type { ReadingSession } from '../../library/entities/reading-session.entity';
import type { RecommendationEvent } from '../entities/recommendation-event.entity';

export const RECOMMENDATION_STRATEGIES = [
  'auto',
  'contentBased',
  'collaborative',
  'graph',
  'trending',
  'hybrid',
] as const;

export type RecommendationStrategy =
  (typeof RECOMMENDATION_STRATEGIES)[number];

export type RecommendationPersonalizationSignalType =
  | 'review'
  | 'annotation'
  | 'feedPost'
  | 'feedComment'
  | 'feedLike';

/** A reader action tied to a specific book, collected at request time. */
export interface RecommendationPersonalizationSignal {
  bookId: string;
  type: RecommendationPersonalizationSignalType;
  weight: number;
}

export interface RecommendationInput {
  userId?: string;
  limit: number;
  genre?: string;
  author?: string;
  basedOnLibrary: boolean;
  includeAlreadyInLibrary: boolean;
  includeReasons: boolean;
  strategy: RecommendationStrategy;
  catalogBooks: Book[];
  trendingBooks: Book[];
  libraryItems: LibraryItem[];
  libraryBooks: Book[];
  collaborativeItems: LibraryItem[];
  collaborativeBooks: Book[];
  behaviorBooks: Book[];
  behaviorEvents: RecommendationEvent[];
  /**
   * The reader's explicit card answers (liked / not interested), read apart
   * from `behaviorEvents` so other events never push them out of the window.
   * "Not interested" excludes the book; a like is a taste signal. When absent,
   * the answers inside `behaviorEvents` are used.
   */
  feedbackEvents?: RecommendationEvent[];
  personalizationSignals: RecommendationPersonalizationSignal[];
  readingSessions: ReadingSession[];
  favoriteGenres: string[];
}

export interface RecommendedBook {
  book: Book;
  bookId: string;
  score: number;
  recommendationReason: string;
  recommendationReasons: string[];
  strategy: Exclude<RecommendationStrategy, 'auto'>;
  source: string;
}

export interface RecommendationResultMeta {
  personalized: boolean;
  strategy: Exclude<RecommendationStrategy, 'auto'>;
  provider: string;
  temporary: boolean;
}

export interface RecommendationResult {
  items: RecommendedBook[];
  meta: RecommendationResultMeta;
}
