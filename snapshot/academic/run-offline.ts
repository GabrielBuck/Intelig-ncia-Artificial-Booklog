/*
 * Projeto N2 de Inteligência Artificial — BookLog
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 *
 * Finalidade: adaptador offline que executa os provedores copiados do backend
 * (conteúdo, híbrido e grafo) sobre a base acadêmica da N1. Lê um JSON gerado
 * por src/avaliacao_n2.py (somente dados de TREINO) e devolve os rankings em
 * JSON. Não acessa banco, rede, credenciais nem serviços do BookLog.
 *
 * Decisões do adaptador (documentadas no relatório, seção 3.4):
 * - cada avaliação de treino vira um item de biblioteca com personalRating =
 *   nota; favoritos, progresso, tags, sessões, buscas e eventos ficam vazios;
 * - status técnico READING, que não recebe o bônus de "finished";
 * - idioma ausente recebe marcador distinto por livro (sem coincidência falsa);
 * - aggregateRating/ratingCount vêm apenas do treino; trendingBooks = [];
 * - a coleta colaborativa reproduz o percurso limitado do serviço
 *   (20 livros de origem, 25 leitores, 150 itens) sobre o treino.
 *
 * Histórico:
 * 18/11/2026 - Grupo - criação do adaptador offline da avaliação N2.
 */
import { readFileSync, writeFileSync } from 'fs';

import { ReadingStatus } from '../src/common/types/enums';
import type { Book } from '../src/modules/books/entities/book.entity';
import type { LibraryItem } from '../src/modules/library/entities/library-item.entity';
import { InMemoryRecommendationProvider } from '../src/modules/recommendations/providers/in-memory-recommendation.provider';
import { PocRecommendationProvider } from '../src/modules/recommendations/providers/poc-recommendation.provider';
import type {
  RecommendationInput,
  RecommendationStrategy,
} from '../src/modules/recommendations/types/recommendation.types';

interface InputBook {
  book_id: string;
  title: string;
  author: string;
  genre: string;
  aggregate_rating: number | null;
  rating_count: number;
}
interface InputRating {
  user_id: string;
  book_id: string;
  rating: number;
  interaction_date: string;
}
interface OfflineInput {
  limit: number;
  books: InputBook[];
  train: InputRating[];
  users: string[];
  strategies: Array<'contentBased' | 'hybrid' | 'graph'>;
  collaborative_limits: { seed_books: number; readers: number; items: number };
}

const SNAPSHOT_TIMESTAMP = '2026-09-10T00:00:00.000Z';

function toBook(row: InputBook): Book {
  return {
    id: row.book_id,
    externalToken: null,
    title: row.title,
    subtitle: null,
    authors: [row.author],
    genres: [row.genre],
    publishedYear: null,
    pageCount: 0,
    // Distinct marker per book: two missing languages must not "match".
    language: `idioma-nao-informado-${row.book_id}`,
    synopsis: null,
    coverUrl: null,
    isbn: null,
    aggregateRating: row.aggregate_rating,
    ratingCount: row.rating_count,
    createdAt: SNAPSHOT_TIMESTAMP,
    updatedAt: SNAPSHOT_TIMESTAMP,
  };
}

function toLibraryItem(row: InputRating): LibraryItem {
  return {
    id: `${row.user_id}:${row.book_id}`,
    userId: row.user_id,
    bookId: row.book_id,
    status: ReadingStatus.READING,
    currentPage: 0,
    progressPercent: 0,
    personalRating: row.rating,
    isFavorite: false,
    tags: [],
    notes: null,
    startedAt: null,
    finishedAt: null,
    createdAt: `${row.interaction_date}T00:00:00.000Z`,
    updatedAt: `${row.interaction_date}T00:00:00.000Z`,
    deletedAt: null,
  };
}

/** Same bounded traversal as RecommendationsService.getCollaborativeLibraryItems. */
function collaborativeItemsFor(
  userId: string,
  libraryItems: LibraryItem[],
  allItems: LibraryItem[],
  limits: OfflineInput['collaborative_limits'],
): { items: LibraryItem[]; seedBooks: number; readers: string[] } {
  const seedBookIds = [...new Set(libraryItems.map((i) => i.bookId))].slice(0, limits.seed_books);
  if (seedBookIds.length === 0) return { items: [], seedBooks: 0, readers: [] };
  const readersByBook = seedBookIds.map((bookId) => allItems.filter((i) => i.bookId === bookId));
  const similarUserIds = [
    ...new Set(readersByBook.flat().map((i) => i.userId).filter((u) => u !== userId)),
  ].slice(0, limits.readers);
  const currentBookIds = new Set(seedBookIds);
  const items = similarUserIds
    .map((u) => allItems.filter((i) => i.userId === u))
    .flat()
    .filter((i) => i.userId !== userId && !currentBookIds.has(i.bookId) && !i.deletedAt)
    .slice(0, limits.items);
  return { items, seedBooks: seedBookIds.length, readers: similarUserIds };
}

async function main(): Promise<void> {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    throw new Error('Uso: node dist/academic/run-offline.js <entrada.json> <saida.json>');
  }
  const input = JSON.parse(readFileSync(inputPath, 'utf-8')) as OfflineInput;
  const books = input.books.map(toBook);
  const bookById = new Map(books.map((b) => [b.id, b]));
  const allItems = input.train.map(toLibraryItem);
  const providers = {
    contentBased: new InMemoryRecommendationProvider(),
    hybrid: new InMemoryRecommendationProvider(),
    graph: new PocRecommendationProvider(),
  };

  const results: Record<string, Record<string, unknown>> = {};
  const collaborative: Record<string, unknown> = {};

  for (const strategy of input.strategies) {
    results[strategy] = {};
    for (const userId of input.users) {
      const libraryItems = allItems.filter((i) => i.userId === userId);
      const libraryBooks = libraryItems.map((i) => bookById.get(i.bookId)!);
      const collab = collaborativeItemsFor(userId, libraryItems, allItems, input.collaborative_limits);
      const collaborativeBooks = [...new Set(collab.items.map((i) => i.bookId))].map(
        (id) => bookById.get(id)!,
      );
      collaborative[userId] = {
        seed_books: collab.seedBooks,
        similar_readers: collab.readers.length,
        collaborative_items: collab.items.length,
      };
      const request: RecommendationInput = {
        userId,
        limit: input.limit,
        basedOnLibrary: true,
        includeAlreadyInLibrary: false,
        includeReasons: true,
        strategy: strategy as RecommendationStrategy,
        catalogBooks: books,
        trendingBooks: [],
        libraryItems,
        libraryBooks,
        collaborativeItems: collab.items,
        collaborativeBooks,
        behaviorBooks: [],
        behaviorEvents: [],
        feedbackEvents: [],
        personalizationSignals: [],
        readingSessions: [],
        favoriteGenres: [],
      };
      const result = await providers[strategy].recommendBooks(request);
      results[strategy][userId] = {
        meta: result.meta,
        items: result.items.map((item, index) => ({
          rank: index + 1,
          bookId: item.bookId,
          title: item.book.title,
          score: item.score,
          strategy: item.strategy,
          source: item.source,
          recommendationReason: item.recommendationReason,
          recommendationReasons: item.recommendationReasons,
        })),
      };
    }
  }

  writeFileSync(
    outputPath,
    JSON.stringify(
      {
        generator: 'snapshot/academic/run-offline.ts',
        source_commit: '063583bbcf1d7a9718bd53867c714757e1950283',
        limit: input.limit,
        providers: {
          contentBased: 'InMemoryRecommendationProvider (strategy=contentBased)',
          hybrid: 'InMemoryRecommendationProvider (strategy=hybrid)',
          graph: 'PocRecommendationProvider (strategy=graph, fallback híbrido)',
        },
        collaborative_retrieval: collaborative,
        results,
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
