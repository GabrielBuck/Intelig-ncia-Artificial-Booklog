/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Funções de ranking híbrido/conteúdo/colaborativo (pesos fixos em código).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/recommendation-ranking.util.ts.
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
  canonicalGenre,
  isMeaningfulMetadata,
  normalizeMetadata,
  recommendationGenres,
} from '../../books/utils/recommendation-metadata.util';
import type { Book } from '../../books/entities/book.entity';
import { canonicalWorkKey } from '../../books/utils/book-canonical.util';
import type {
  RecommendationInput,
  RecommendationResult,
  RecommendationResultMeta,
  RecommendedBook,
} from '../types/recommendation.types';

export { canonicalWorkKey } from '../../books/utils/book-canonical.util';

export interface RankingOptions {
  provider: string;
  source: string;
  temporary: boolean;
  strategy: RecommendationResultMeta['strategy'];
}

export interface RecommendationContext {
  personalized: boolean;
  libraryBookIds: Set<string>;
  libraryWorkKeys: Set<string>;
  preferredGenreCounts: Map<string, number>;
  preferredAuthorCounts: Map<string, number>;
  preferredLanguageCounts: Map<string, number>;
  preferredTagCounts: Map<string, number>;
  profileFavoriteGenres: Set<string>;
  trendingRankById: Map<string, number>;
  trendingRankByWorkKey: Map<string, number>;
  collaborativeWorkScores: Map<string, number>;
  strongestCollaborativeScore: number;
  behaviorBookIds: Set<string>;
  /**
   * Books whose latest card answer is "not interested": they do not come back.
   * A like is not here: it is a taste signal (behavior events) and the liked
   * book may stay on the list.
   */
  dismissedBookIds: Set<string>;
  searchQueries: string[];
  averageSessionPages: number | null;
  averagePagesPerMinute: number | null;
  preferredPageCount: number | null;
  explicitSignalTypesByBookId: Map<string, Set<string>>;
}

interface ScoredBook {
  book: Book;
  score: number;
  reasons: string[];
  personalAffinity: boolean;
}

export function buildRecommendationContext(
  input: RecommendationInput,
): RecommendationContext {
  const profileFavoriteGenres = new Set(
    input.favoriteGenres
      .filter(isMeaningfulGenre)
      .map(canonicalGenre)
      .map(normalizeText),
  );
  const personalizingBookEvents = input.behaviorEvents.filter(
    isPersonalizingBookEvent,
  );
  const personalized =
    Boolean(input.userId) &&
    input.basedOnLibrary &&
    (input.libraryBooks.length > 0 ||
      profileFavoriteGenres.size > 0 ||
      personalizingBookEvents.length > 0 ||
      input.personalizationSignals.length > 0 ||
      input.behaviorEvents.some(isSearchEvent) ||
      input.readingSessions.length > 0);
  const libraryBookIds = new Set(input.libraryItems.map((item) => item.bookId));
  const libraryWorkKeys = new Set(input.libraryBooks.map(canonicalWorkKey));
  const libraryItemByBookId = new Map(
    input.libraryItems.map((item) => [item.bookId, item]),
  );
  const sessionsByBookId = groupReadingSessionsByBookId(input);
  const behaviorBookIds = new Set([
    ...personalizingBookEvents.map((event) => event.bookId),
    ...input.personalizationSignals.map((signal) => signal.bookId),
  ]);
  const preferredGenreCounts = new Map<string, number>();
  const preferredAuthorCounts = new Map<string, number>();
  const preferredLanguageCounts = new Map<string, number>();
  const preferredTagCounts = new Map<string, number>();
  const collaborativeWorkScores = buildCollaborativeWorkScores(input);
  const dismissedBookIds = dismissedBookIdsFrom(input.feedbackEvents ?? input.behaviorEvents);

  // A genre explicitly selected in the profile is a strong signal and also
  // personalizes new accounts before they have library history.
  for (const genre of profileFavoriteGenres) {
    increment(preferredGenreCounts, genre, 8);
  }

  if (personalized) {
    for (const book of input.libraryBooks) {
      const item = libraryItemByBookId.get(book.id);
      const weight = libraryBookPreferenceWeight(
        item,
        sessionsByBookId.get(book.id) ?? [],
      );

      for (const genre of recommendationGenres(book)) {
        increment(preferredGenreCounts, normalizeText(genre), weight);
      }

      for (const author of book.authors.filter(isMeaningfulMetadata)) {
        increment(preferredAuthorCounts, normalizeText(author), weight);
      }

      if (book.language) {
        increment(
          preferredLanguageCounts,
          normalizeText(book.language),
          weight,
        );
      }

      for (const tag of item?.tags ?? []) {
        increment(preferredTagCounts, normalizeText(tag), weight * 0.8);
      }
    }

    const behaviorGenreCounts = new Map<string, number>();
    const behaviorAuthorCounts = new Map<string, number>();
    const behaviorLanguageCounts = new Map<string, number>();
    for (const book of input.behaviorBooks) {
      const weight = behaviorBookPreferenceWeight(
        book.id,
        personalizingBookEvents,
        input.personalizationSignals,
      );
      for (const genre of recommendationGenres(book)) {
        increment(behaviorGenreCounts, normalizeText(genre), weight);
      }

      for (const author of book.authors.filter(isMeaningfulMetadata)) {
        increment(behaviorAuthorCounts, normalizeText(author), weight);
      }

      if (book.language) {
        increment(behaviorLanguageCounts, normalizeText(book.language), weight);
      }
    }
    // Incidental activity may refine established taste, but cannot replace it.
    mergeBehaviorPreferences(preferredGenreCounts, behaviorGenreCounts);
    mergeBehaviorPreferences(preferredAuthorCounts, behaviorAuthorCounts);
    mergeBehaviorPreferences(preferredLanguageCounts, behaviorLanguageCounts);
  }

  const timedSessions = input.readingSessions.filter(
    (session) => session.pagesRead > 0,
  );
  const sessionsWithDuration = timedSessions.filter(
    (session) => (session.durationMinutes ?? 0) > 0,
  );

  return {
    personalized,
    libraryBookIds,
    libraryWorkKeys,
    preferredGenreCounts,
    preferredAuthorCounts,
    preferredLanguageCounts,
    preferredTagCounts,
    profileFavoriteGenres,
    collaborativeWorkScores,
    strongestCollaborativeScore:
      collaborativeWorkScores.size === 0
        ? 0
        : Math.max(...collaborativeWorkScores.values()),
    behaviorBookIds,
    dismissedBookIds,
    searchQueries: [
      ...new Set(
        input.behaviorEvents
          .filter(isSearchEvent)
          .map((event) => event.query?.trim())
          .filter((query): query is string => Boolean(query)),
      ),
    ].slice(0, 8),
    averageSessionPages:
      timedSessions.length === 0
        ? null
        : timedSessions.reduce((sum, session) => sum + session.pagesRead, 0) /
          timedSessions.length,
    averagePagesPerMinute:
      sessionsWithDuration.length === 0
        ? null
        : sessionsWithDuration.reduce(
            (sum, session) =>
              sum +
              session.pagesRead / Math.max(session.durationMinutes ?? 1, 1),
            0,
          ) / sessionsWithDuration.length,
    preferredPageCount: preferredPageCount(
      input.libraryBooks,
      input.libraryItems,
    ),
    explicitSignalTypesByBookId: groupSignalTypes(input),
    trendingRankById: new Map(
      input.trendingBooks.map((book, index) => [book.id, index]),
    ),
    trendingRankByWorkKey: new Map(
      input.trendingBooks.map((book, index) => [canonicalWorkKey(book), index]),
    ),
  };
}

export function buildCandidatePool(input: RecommendationInput): Book[] {
  const byId = new Map<string, Book>();

  for (const book of [
    ...input.trendingBooks,
    ...input.catalogBooks,
    ...input.collaborativeBooks,
  ]) {
    byId.set(book.id, book);
  }

  const filtered = [...byId.values()].filter(
    (book) =>
      isFirstSeriesBook(book) &&
      matchesGenre(book, input.genre) &&
      matchesAuthor(book, input.author) &&
      (input.includeAlreadyInLibrary ||
        !input.libraryBooks.some((owned) =>
          sameRecommendationWork(book, owned),
        )),
  );

  const selected: Book[] = [];
  for (const book of dedupeBooksByWork(filtered)) {
    if (!selected.some((other) => sameRecommendationWork(book, other)))
      selected.push(book);
  }
  return selected;
}

export function buildHybridRecommendationResult(
  input: RecommendationInput,
  options: RankingOptions,
): RecommendationResult {
  const context = buildRecommendationContext(input);
  const items = rankHybridCandidates(input, context, options);

  return {
    items,
    meta: {
      personalized: context.personalized && options.strategy !== 'trending',
      strategy: options.strategy,
      provider: options.provider,
      temporary: options.temporary,
    },
  };
}

export function rankHybridCandidates(
  input: RecommendationInput,
  context: RecommendationContext,
  options: RankingOptions,
): RecommendedBook[] {
  const personalized = context.personalized && input.strategy !== 'trending';
  const scoredItems = buildCandidatePool(input)
    .filter(
      (book) =>
        !context.dismissedBookIds.has(book.id) &&
        (input.includeAlreadyInLibrary ||
          (!context.libraryBookIds.has(book.id) &&
            !context.libraryWorkKeys.has(canonicalWorkKey(book)))),
    )
    .map((book) => scoreHybridBook(book, input, context))
    // A personalized section must not silently fill empty slots with books
    // that have no affinity at all; those belong in the discovery/trending UI.
    .filter((item) => !personalized || item.score > 0)
    .sort(sortScoredBooks);

  return selectPersonalizedBooks(
    scoredItems,
    input.limit,
    personalized,
    input.strategy === 'collaborative',
  ).map((item) =>
    toRecommendedBook(
      item,
      input.includeReasons,
      options.strategy,
      options.source,
    ),
  );
}

export function resolveRankingStrategy(
  input: RecommendationInput,
  preferred: RecommendationResultMeta['strategy'],
): RecommendationResultMeta['strategy'] {
  if (input.strategy === 'auto') {
    return preferred;
  }

  return input.strategy;
}

export function normalizeText(value: string): string {
  return normalizeMetadata(value);
}

export function countSharedValues(left: string[], right: string[]): string[] {
  const rightValues = new Set(right.map(normalizeText));
  return left.filter((value) => rightValues.has(normalizeText(value)));
}

export function titleTokenOverlap(left: string, right: string): number {
  const leftTokens = toTitleTokens(left);
  const rightTokens = toTitleTokens(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      matches += 1;
    }
  }

  return matches / Math.max(leftTokens.size, rightTokens.size);
}

function scoreHybridBook(
  book: Book,
  input: RecommendationInput,
  context: RecommendationContext,
): ScoredBook {
  const reasons: string[] = [];
  let score = 0;
  let personalAffinity = false;

  if (context.personalized && input.strategy !== 'trending') {
    const genreScore = weightedMatchScore(
      recommendationGenres(book),
      context.preferredGenreCounts,
    );
    const authorScore = weightedMatchScore(
      book.authors.filter(isMeaningfulMetadata),
      context.preferredAuthorCounts,
    );
    const languageScore = book.language
      ? weightedMatchScore([book.language], context.preferredLanguageCounts)
      : 0;
    const tagScore = weightedTextMatchScore(book, context.preferredTagCounts);
    const pageFitScore = pageCountFit(book, context.preferredPageCount);
    const sessionFit = readingSessionFit(book, context.averageSessionPages);
    let personalizationScore = 0;
    let affinityScore = 0;

    const queryMatch = matchingSearchQuery(book, context.searchQueries);
    const collaborativeScore = collaborativeMatchScore(book, context);

    if (queryMatch) {
      personalizationScore += 24;
      affinityScore += 24;
      reasons.push(`Porque combina com sua busca recente por "${queryMatch}".`);
    }

    if (context.behaviorBookIds.has(book.id)) {
      const behaviorPoints = Math.min(
        30,
        behaviorBookPreferenceWeight(
          book.id,
          input.behaviorEvents,
          input.personalizationSignals,
        ) * 2.4,
      );
      personalizationScore += behaviorPoints;
      affinityScore += behaviorPoints;
      reasons.push(explicitSignalReason(book.id, context));
    }

    personalAffinity =
      genreScore > 0 ||
      authorScore > 0 ||
      tagScore > 0 ||
      Boolean(queryMatch) ||
      context.behaviorBookIds.has(book.id);

    if (collaborativeScore > 0 && input.strategy !== 'contentBased') {
      const collaborativePoints =
        input.strategy === 'collaborative'
          ? 58 * collaborativeScore
          : 12 * collaborativeScore;
      personalizationScore += collaborativePoints;
      affinityScore += Math.max(12, collaborativePoints);
    }

    if (genreScore > 0) {
      const genrePoints = 56 * genreScore;
      personalizationScore += genrePoints;
      affinityScore += genrePoints;
      const matchingGenres = matchingLabels(
        recommendationGenres(book),
        context.preferredGenreCounts,
      );
      reasons.push(
        matchingGenres.some((genre) =>
          context.profileFavoriteGenres.has(normalizeText(genre)),
        )
          ? `Porque voce disse no seu perfil que gosta de ${formatLabels(matchingGenres)}.`
          : `Porque compartilha ${formatLabels(matchingGenres)} com a sua biblioteca.`,
      );
    }

    if (authorScore > 0) {
      const authorPoints = 64 * authorScore;
      personalizationScore += authorPoints;
      affinityScore += authorPoints;
      reasons.push(
        `Porque voce ja tem livros de ${formatLabels(matchingLabels(book.authors, context.preferredAuthorCounts))}.`,
      );
    }

    if (tagScore > 0) {
      const tagPoints = 18 * tagScore;
      personalizationScore += tagPoints;
      affinityScore += tagPoints;
      reasons.push('Porque conversa com temas salvos na sua biblioteca.');
    }

    if (collaborativeScore > 0 && input.strategy !== 'contentBased') {
      const socialReason =
        'Leitores com gosto parecido tambem salvaram ou avaliaram este livro.';
      if (input.strategy === 'collaborative') reasons.unshift(socialReason);
      else reasons.push(socialReason);
    }

    if (languageScore > 0) {
      personalizationScore += 4 * languageScore;
    }

    if (pageFitScore > 0 && affinityScore > 0) {
      personalizationScore += pageFitScore;
    }

    if (sessionFit > 0 && affinityScore > 0) {
      personalizationScore += sessionFit;
    }

    if ((pageFitScore > 0 || sessionFit > 0) && affinityScore >= 18) {
      reasons.push(
        'Porque o tamanho combina com seu ritmo recente de leitura.',
      );
    }

    if ((context.averagePagesPerMinute ?? 0) > 0 && affinityScore > 0) {
      personalizationScore += Math.min(
        1.5,
        Math.max(0, (context.averagePagesPerMinute ?? 0) / 2),
      );
    }

    score += personalizationScore;

    if (affinityScore <= 0) {
      score -= 35;
    }
  }

  const rating = book.aggregateRating ?? 0;
  if (rating >= 4) {
    score += context.personalized ? 7 : 15;
    reasons.push(`Porque leitores avaliaram bem (${rating.toFixed(1)}).`);
  } else {
    score += context.personalized
      ? Math.min(5, rating)
      : Math.min(12, rating * 2.4);
  }

  const trendingRank = context.trendingRankById.get(book.id);
  const trendingWorkRank = context.trendingRankByWorkKey.get(
    canonicalWorkKey(book),
  );
  if (trendingRank !== undefined || trendingWorkRank !== undefined) {
    const resolvedTrendingRank = trendingRank ?? trendingWorkRank ?? 0;
    score += context.personalized
      ? Math.max(0, 1 - resolvedTrendingRank * 0.08)
      : Math.max(2, 10 - resolvedTrendingRank * 0.5);
    reasons.push('Porque este livro esta em alta no catalogo BookLog.');
  }

  if (input.genre && matchesGenre(book, input.genre)) {
    score += 10;
    reasons.push(
      `Porque corresponde ao filtro ${localizeMetadataLabel(input.genre)}.`,
    );
  }

  if (input.author && matchesAuthor(book, input.author)) {
    score += 10;
    reasons.push(
      `Porque corresponde ao filtro de autor ${input.author.trim()}.`,
    );
  }

  if (
    (context.libraryBookIds.has(book.id) ||
      context.libraryWorkKeys.has(canonicalWorkKey(book))) &&
    input.includeAlreadyInLibrary &&
    context.personalized
  ) {
    reasons.push(
      'Ja esta na sua biblioteca; incluido porque includeAlreadyInLibrary=true.',
    );
  }

  if (reasons.length === 0) {
    reasons.push('Recomendacao popular do catalogo BookLog.');
  }

  return {
    book,
    score: normalizeScore(score),
    reasons: dedupeReasons(reasons),
    personalAffinity,
  };
}

function toRecommendedBook(
  item: ScoredBook,
  includeReasons: boolean,
  strategy: RecommendationResultMeta['strategy'],
  source: string,
): RecommendedBook {
  const reasons = includeReasons ? item.reasons : [];
  const recommendationReason =
    includeReasons && item.reasons.length > 0
      ? item.reasons[0]
      : 'Recomendado pelo BookLog.';

  return {
    book: item.book,
    bookId: item.book.id,
    score: item.score,
    recommendationReason,
    recommendationReasons: reasons,
    strategy,
    source,
  };
}

function weightedMatchScore(
  values: string[],
  preferredCounts: Map<string, number>,
): number {
  if (preferredCounts.size === 0) {
    return 0;
  }

  const total = [...preferredCounts.values()].reduce(
    (sum, count) => sum + count,
    0,
  );
  const matched = values.reduce(
    (sum, value) => sum + (preferredCounts.get(normalizeText(value)) ?? 0),
    0,
  );

  const strongestPreference = Math.max(...preferredCounts.values());
  const denominator = Math.max(strongestPreference, total * 0.45);

  return denominator === 0 ? 0 : Math.min(1, matched / denominator);
}

function weightedTextMatchScore(
  book: Book,
  preferredCounts: Map<string, number>,
): number {
  if (preferredCounts.size === 0) {
    return 0;
  }

  const searchable = normalizeText(
    [
      book.title,
      book.subtitle ?? '',
      ...book.authors,
      ...book.genres,
      book.synopsis,
    ].join(' '),
  );
  const matched = [...preferredCounts.entries()]
    .filter(([tag]) => searchable.includes(tag))
    .reduce((sum, [, weight]) => sum + weight, 0);
  const strongestPreference = Math.max(...preferredCounts.values());
  const total = [...preferredCounts.values()].reduce(
    (sum, count) => sum + count,
    0,
  );
  const denominator = Math.max(strongestPreference, total * 0.5);

  return denominator === 0 ? 0 : Math.min(1, matched / denominator);
}

function matchingLabels(
  labels: string[],
  preferredCounts: Map<string, number>,
): string[] {
  return labels.filter((label) => preferredCounts.has(normalizeText(label)));
}

function formatLabels(labels: string[]): string {
  return labels.map(localizeMetadataLabel).join(', ');
}

function localizeMetadataLabel(label: string): string {
  const localizedLabels: Record<string, string> = {
    'brazilian literature': 'Literatura brasileira',
    design: 'Design',
    fantasy: 'Fantasia',
    fiction: 'Ficcao',
    javascript: 'JavaScript',
    'personal development': 'Desenvolvimento pessoal',
    product: 'Produto',
    productivity: 'Produtividade',
    'software architecture': 'Arquitetura de software',
    'software engineering': 'Engenharia de software',
    technology: 'Tecnologia',
  };

  return localizedLabels[normalizeText(label)] ?? label.trim();
}

function matchesGenre(book: Book, genre: string | undefined): boolean {
  if (!genre?.trim()) {
    return true;
  }

  const normalizedGenre = normalizeText(genre);
  return book.genres.some((candidate) =>
    normalizeText(candidate).includes(normalizedGenre),
  );
}

function matchesAuthor(book: Book, author: string | undefined): boolean {
  if (!author?.trim()) {
    return true;
  }

  const normalizedAuthor = normalizeText(author);
  return book.authors.some((candidate) =>
    normalizeText(candidate).includes(normalizedAuthor),
  );
}

function normalizeScore(score: number): number {
  return Number(Math.min(1, Math.max(0, score / 100)).toFixed(2));
}

function matchingSearchQuery(
  book: Book,
  searchQueries: string[],
): string | null {
  const searchable = normalizeText(
    [book.title, ...book.authors, ...book.genres].join(' '),
  );

  return (
    searchQueries.find((query) => searchable.includes(normalizeText(query))) ??
    null
  );
}

function collaborativeMatchScore(
  book: Book,
  context: RecommendationContext,
): number {
  if (context.strongestCollaborativeScore <= 0) {
    return 0;
  }

  const score =
    context.collaborativeWorkScores.get(canonicalWorkKey(book)) ?? 0;
  return Math.min(1, score / context.strongestCollaborativeScore);
}

function buildCollaborativeWorkScores(
  input: RecommendationInput,
): Map<string, number> {
  if (
    input.collaborativeItems.length === 0 ||
    input.collaborativeBooks.length === 0
  ) {
    return new Map();
  }

  const bookById = new Map(
    input.collaborativeBooks.map((book) => [book.id, book]),
  );
  const scores = new Map<string, number>();

  for (const item of input.collaborativeItems) {
    const book = bookById.get(item.bookId);

    if (!book) {
      continue;
    }

    increment(scores, canonicalWorkKey(book), collaborativeItemWeight(item));
  }

  return scores;
}

function collaborativeItemWeight(
  item: RecommendationInput['collaborativeItems'][number],
): number {
  let weight = 1;
  weight += item.isFavorite ? 2.5 : 0;
  weight += (item.personalRating ?? 0) * 0.6;
  weight += Math.min(1.5, item.progressPercent / 50);
  weight += normalizeText(item.status).includes('finished') ? 1 : 0;

  return Math.max(1, weight);
}

function readingSessionFit(
  book: Book,
  averageSessionPages: number | null,
): number {
  if (!averageSessionPages || book.pageCount <= 0) {
    return 0;
  }

  const expectedSessions = book.pageCount / averageSessionPages;
  if (expectedSessions <= 8) {
    return 3;
  }

  if (expectedSessions <= 16) {
    return 2;
  }

  if (expectedSessions <= 28) {
    return 1;
  }

  return 0;
}

function pageCountFit(book: Book, preferred: number | null): number {
  if (!preferred || preferred <= 0 || book.pageCount <= 0) {
    return 0;
  }

  const distance = Math.abs(book.pageCount - preferred) / preferred;

  if (distance <= 0.15) {
    return 2;
  }

  if (distance <= 0.35) {
    return 1;
  }

  if (distance <= 0.6) {
    return 0.5;
  }

  return 0;
}

function preferredPageCount(
  books: Book[],
  libraryItems: RecommendationInput['libraryItems'],
): number | null {
  if (books.length === 0) {
    return null;
  }

  const itemByBookId = new Map(libraryItems.map((item) => [item.bookId, item]));
  let totalWeight = 0;
  let weightedPages = 0;

  for (const book of books) {
    if (book.pageCount <= 0) {
      continue;
    }

    const weight = libraryBookPreferenceWeight(itemByBookId.get(book.id), []);
    weightedPages += book.pageCount * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? null : weightedPages / totalWeight;
}

function libraryBookPreferenceWeight(
  item: RecommendationInput['libraryItems'][number] | undefined,
  sessions: RecommendationInput['readingSessions'],
): number {
  if (!item) {
    return 1;
  }

  const totalSessionPages = sessions.reduce(
    (sum, session) => sum + session.pagesRead,
    0,
  );
  const totalDuration = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes ?? 0),
    0,
  );

  let weight = 1;
  // Strong intentional actions should dominate generic popularity: favorite,
  // completing a book and a high personal rating all mean much more than a
  // passive catalog entry.
  weight += item.isFavorite ? 14 : 0;
  weight += (item.personalRating ?? 0) * 2;
  weight += Math.min(4, item.progressPercent / 25);
  weight += normalizeText(item.status).includes('finished') ? 9 : 0;
  weight += Math.min(4, totalSessionPages / 55);
  weight += Math.min(2.5, totalDuration / 100);

  return Math.max(1, weight);
}

function behaviorBookPreferenceWeight(
  bookId: string,
  events: RecommendationInput['behaviorEvents'],
  signals: RecommendationInput['personalizationSignals'],
): number {
  const matchingEvents = events.filter((event) => event.bookId === bookId);

  const eventWeight = matchingEvents.reduce((weight, event) => {
    const durationBoost = Math.min(2, (event.durationSeconds ?? 0) / 180);
    const typeBoost =
      event.type === 'recommendationAdded'
        ? 3
        : event.type === 'recommendationLiked'
          ? 3
          : event.type === 'bookDetail'
            ? 2
            : 0;

    return weight + typeBoost + durationBoost;
  }, 1);

  const signalWeight = signals
    .filter((signal) => signal.bookId === bookId)
    .reduce((weight, signal) => weight + signal.weight, 0);

  return eventWeight + signalWeight;
}

function isPersonalizingBookEvent(
  event: RecommendationInput['behaviorEvents'][number],
): event is RecommendationInput['behaviorEvents'][number] & { bookId: string } {
  return (
    Boolean(event.bookId) &&
    (event.type === 'bookDetail' ||
      event.type === 'recommendationAdded' ||
      event.type === 'recommendationLiked')
  );
}

/**
 * Books whose latest card answer (events come newest first) is "not
 * interested". A later like on the same book takes it back.
 */
function dismissedBookIdsFrom(
  events: RecommendationInput['behaviorEvents'],
): Set<string> {
  const latest = new Map<string, RecommendationInput['behaviorEvents'][number]['type']>();
  for (const event of events) {
    if (!event.bookId || latest.has(event.bookId)) continue;
    if (
      event.type === 'recommendationLiked' ||
      event.type === 'recommendationNotInterested'
    ) {
      latest.set(event.bookId, event.type);
    }
  }
  return new Set(
    [...latest].flatMap(([bookId, type]) =>
      type === 'recommendationNotInterested' ? [bookId] : [],
    ),
  );
}

function isSearchEvent(
  event: RecommendationInput['behaviorEvents'][number],
): boolean {
  return event.type === 'search' || event.type === 'searchScreen';
}

function groupReadingSessionsByBookId(
  input: RecommendationInput,
): Map<string, RecommendationInput['readingSessions']> {
  const byBookId = new Map<string, RecommendationInput['readingSessions']>();

  for (const session of input.readingSessions) {
    const sessions = byBookId.get(session.bookId) ?? [];
    sessions.push(session);
    byBookId.set(session.bookId, sessions);
  }

  return byBookId;
}

function groupSignalTypes(
  input: RecommendationInput,
): Map<string, Set<string>> {
  const grouped = new Map<string, Set<string>>();

  for (const signal of input.personalizationSignals) {
    const types = grouped.get(signal.bookId) ?? new Set<string>();
    types.add(signal.type);
    grouped.set(signal.bookId, types);
  }

  return grouped;
}

function explicitSignalReason(
  bookId: string,
  context: RecommendationContext,
): string {
  const types =
    context.explicitSignalTypesByBookId.get(bookId) ?? new Set<string>();

  if (types.has('review')) {
    return 'Porque voce avaliou este livro positivamente.';
  }
  if (types.has('annotation')) {
    return 'Porque voce fez anotacoes neste livro.';
  }
  if (types.has('feedComment')) {
    return 'Porque voce comentou sobre este livro no BookLog.';
  }
  if (types.has('feedLike')) {
    return 'Porque voce curtiu uma publicacao sobre este livro.';
  }
  if (types.has('feedPost')) {
    return 'Porque voce publicou sobre este livro no BookLog.';
  }
  return 'Porque voce demonstrou interesse neste livro no BookLog.';
}

function sortScoredBooks(a: ScoredBook, b: ScoredBook): number {
  return (
    b.score - a.score ||
    (b.book.aggregateRating ?? 0) - (a.book.aggregateRating ?? 0) ||
    a.book.title.localeCompare(b.book.title)
  );
}

/** Personal affinity fills the list first; social-only discovery is bounded.
 * Do not force genre diversity: a focused library should yield a focused list.
 */
function selectPersonalizedBooks(
  items: ScoredBook[],
  limit: number,
  personalized: boolean,
  collaborative: boolean,
): ScoredBook[] {
  if (!personalized || collaborative) return items.slice(0, limit);

  const personal = items
    .filter((item) => item.personalAffinity)
    .slice(0, limit);
  // At most 20% of the returned list can depend solely on other readers.
  // With fewer than four personal matches, there is insufficient evidence
  // to introduce a social-only suggestion without dominating the result.
  const discoveryLimit = Math.min(
    Math.floor(limit * 0.2),
    Math.floor(personal.length / 4),
    limit - personal.length,
  );
  const discovery = items
    .filter((item) => !item.personalAffinity)
    .slice(0, discoveryLimit);
  return [...personal, ...discovery];
}

export const isMeaningfulGenre = isMeaningfulMetadata;

function mergeBehaviorPreferences(
  target: Map<string, number>,
  behavior: Map<string, number>,
): void {
  const total = (counts: Map<string, number>) =>
    [...counts.values()].reduce((sum, value) => sum + value, 0);
  const established = total(target);
  const observed = total(behavior);
  const scale =
    established > 0 && observed > 0
      ? Math.min(1, (established * 0.25) / observed)
      : 1;
  for (const [label, weight] of behavior)
    increment(target, label, weight * scale);
}

function increment(map: Map<string, number>, key: string, amount = 1): void {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function dedupeBooksByWork(books: Book[]): Book[] {
  const byWorkKey = new Map<string, Book>();

  for (const book of books) {
    const key = canonicalWorkKey(book);
    const current = byWorkKey.get(key);

    if (!current || isBetterCandidate(book, current)) {
      byWorkKey.set(key, book);
    }
  }

  return [...byWorkKey.values()];
}

function isBetterCandidate(candidate: Book, current: Book): boolean {
  const candidateHasCover = candidate.coverUrl ? 1 : 0;
  const currentHasCover = current.coverUrl ? 1 : 0;

  return (
    (candidateHasCover - currentHasCover ||
      (candidate.aggregateRating ?? 0) - (current.aggregateRating ?? 0) ||
      (candidate.ratingCount ?? 0) - (current.ratingCount ?? 0) ||
      candidate.title.localeCompare(current.title)) > 0
  );
}

function dedupeReasons(reasons: string[]): string[] {
  return [...new Set(reasons)].slice(0, 4);
}

function toTitleTokens(title: string): Set<string> {
  return new Set(
    normalizeText(title)
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length > 2),
  );
}
