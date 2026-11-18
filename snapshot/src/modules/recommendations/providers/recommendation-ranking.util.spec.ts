/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Testes unitários originais do ranking.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/recommendation-ranking.util.spec.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../../books/entities/book.entity';
import { ReadingStatus } from '../../../common/types/enums';
import type { RecommendationInput } from '../types/recommendation.types';
import { buildHybridRecommendationResult } from './recommendation-ranking.util';
import { PocRecommendationProvider } from './poc-recommendation.provider';

function book(id: string, genres: string[] = [], authors = [id]): Book {
  return {
    id,
    title: id,
    genres,
    authors,
    externalToken: null,
    subtitle: null,
    publishedYear: null,
    pageCount: 200,
    language: 'pt',
    synopsis: null,
    coverUrl: null,
    isbn: null,
    aggregateRating: 5,
    createdAt: '',
    updatedAt: '',
  };
}
function input(personalCount = 6): RecommendationInput {
  const seed = book('seed', ['HQ']);
  const personal = Array.from({ length: personalCount }, (_, i) =>
    book(`hq-${i}`, ['HQ']),
  );
  const unrelated = Array.from({ length: 20 }, (_, i) => book(`random-${i}`));
  return {
    userId: 'me',
    limit: 10,
    basedOnLibrary: true,
    includeAlreadyInLibrary: false,
    includeReasons: true,
    strategy: 'hybrid',
    libraryBooks: [seed],
    libraryItems: [],
    catalogBooks: [...personal, ...unrelated],
    trendingBooks: unrelated,
    collaborativeBooks: unrelated,
    collaborativeItems: unrelated.map((candidate) => ({
      bookId: candidate.id,
      userId: 'friend',
      isFavorite: true,
      personalRating: 5,
      progressPercent: 100,
      status: ReadingStatus.FINISHED,
      id: candidate.id,
      currentPage: 200,
      tags: [],
      notes: null,
      startedAt: null,
      finishedAt: null,
      deletedAt: null,
      createdAt: '',
      updatedAt: '',
    })),
    behaviorBooks: [],
    behaviorEvents: [],
    personalizationSignals: [],
    readingSessions: [],
    favoriteGenres: [],
  };
}
function rank(data: RecommendationInput) {
  return buildHybridRecommendationResult(data, {
    provider: 'test',
    source: 'test',
    temporary: false,
    strategy: data.strategy === 'auto' ? 'hybrid' : data.strategy,
  }).items;
}

describe('personal library relevance', () => {
  it("keeps all relevant HQs and limits a friend's unrelated books to 20% of the result", () => {
    const items = rank(input());
    expect(items.slice(0, 6).map((item) => item.bookId)).toEqual(
      expect.arrayContaining(Array.from({ length: 6 }, (_, i) => `hq-${i}`)),
    );
    expect(items).toHaveLength(7);
    expect(
      items.filter((item) => item.bookId.startsWith('random-')),
    ).toHaveLength(1);
  });

  it("does not fill sparse personalized results with a friend's unrelated library", () => {
    expect(rank(input(2))).toHaveLength(2);
  });

  it('does not treat placeholder categories as shared taste', () => {
    const data = input(0);
    data.libraryBooks[0].genres = ['Sem categoria'];
    data.catalogBooks = [book('unknown', ['Sem categoria'])];
    data.collaborativeItems = [];
    data.trendingBooks = [];
    expect(rank(data)).toEqual([]);
  });

  it('still recommends uncategorized books by a known author', () => {
    const data = input(0);
    data.catalogBooks = [book('same-author', [], ['seed'])];
    expect(rank(data)[0].bookId).toBe('same-author');
  });

  it('keeps explicit collaborative and trending strategies available', () => {
    const data = input(0);
    data.strategy = 'collaborative';
    expect(rank(data)).toHaveLength(10);
    data.strategy = 'trending';
    expect(rank(data)).toHaveLength(10);
  });

  it('does not use social-only suggestions in contentBased', () => {
    const data = input(2);
    data.strategy = 'contentBased';
    expect(rank(data)).toHaveLength(2);
  });

  it('does not create graph edges from language and ratings alone', async () => {
    const data = input(2);
    data.strategy = 'graph';
    const result = await new PocRecommendationProvider().recommendBooks(data);
    expect(result.items.map((item) => item.bookId)).toEqual(['hq-0', 'hq-1']);
  });

  it('anchors graph paths to the original library', async () => {
    const data = input(0);
    data.strategy = 'graph';
    data.catalogBooks = [
      book('bridge', ['HQ', 'Cooking']),
      book('drift', ['Cooking']),
    ];
    const result = await new PocRecommendationProvider().recommendBooks(data);
    expect(result.items.map((item) => item.bookId)).toEqual(['bridge']);
  });
  it.each([
    ['Literatura cristã', 'Christian theology'],
    ['Ficção científica', 'Science fiction'],
  ])(
    'prioritizes forty %s books over a romance-heavy social catalog',
    (seedGenre, candidateGenre) => {
      const data = input(0);
      data.libraryBooks = Array.from({ length: 40 }, (_, i) =>
        book(`read-${i}`, [seedGenre], ['Unknown author']),
      );
      const relevant = Array.from({ length: 12 }, (_, i) =>
        book(`relevant-${i}`, [candidateGenre], ['Unknown author']),
      );
      data.catalogBooks = [
        ...data.catalogBooks.map((b) => ({
          ...b,
          genres: ['Romance'],
          authors: ['Unknown author'],
        })),
        ...relevant,
      ];
      const items = rank(data);
      expect(items).toHaveLength(10);
      expect(items.every((item) => item.bookId.startsWith('relevant-'))).toBe(
        true,
      );
      expect(items[0].recommendationReasons[0]).toContain('biblioteca');
    },
  );

  it.each(['Unknown author', 'Autor desconhecido', 'N/A'])(
    'does not manufacture hybrid, graph or similar-book affinity from %s',
    async (placeholder) => {
      const data = input(0);
      data.libraryBooks = [book('read', ['Unknown type'], [placeholder])];
      data.catalogBooks = [book('unrelated', ['Unknown type'], [placeholder])];
      data.collaborativeBooks = [];
      data.trendingBooks = [];
      expect(rank(data)).toEqual([]);
      data.strategy = 'graph';
      expect(
        (await new PocRecommendationProvider().recommendBooks(data)).items,
      ).toEqual([]);
    },
  );

  it('uses catalog subjects when categories are missing and normalizes author accents', () => {
    const data = input(0);
    data.libraryBooks = [
      {
        ...book('read', ['Uncategorized'], ['José Autor']),
        subjects: ['Christian theology'],
      },
    ];
    data.catalogBooks = [
      book('faith', ['Religião e Espiritualidade']),
      book('author', ['Uncategorized'], ['JOSE AUTOR']),
    ];
    expect(rank(data).map((item) => item.bookId)).toEqual(['author', 'faith']);
  });

  it('does not let many incidental romance interactions displace an established library', () => {
    const data = input(0);
    data.libraryBooks = Array.from({ length: 40 }, (_, i) =>
      book(`read-${i}`, ['Literatura cristã']),
    );
    const faith = book('faith', ['Christianity']);
    const romances = Array.from({ length: 50 }, (_, i) =>
      book(`romance-${i}`, ['Romance']),
    );
    data.behaviorBooks = romances;
    data.personalizationSignals = romances.map((b) => ({
      bookId: b.id,
      type: 'feedLike',
      weight: 2.5,
    }));
    data.catalogBooks = [faith, ...romances];
    expect(rank(data)[0].bookId).toBe('faith');
  });
  it('does not broaden a Christian library through generic literature subjects', () => {
    const data = input(0);
    data.libraryBooks = [
      {
        ...book('read', ['Literatura cristã'], ['Unknown author']),
        subjects: ['Literature', 'Christian theology'],
      },
    ];
    data.catalogBooks = [
      {
        ...book('romance', ['Romance'], ['Unknown author']),
        subjects: ['Literature'],
      },
      {
        ...book('faith', ['Uncategorized'], ['Unknown author']),
        subjects: ['Literature', 'Christian theology'],
      },
    ];
    data.trendingBooks = [];
    data.collaborativeBooks = [];
    expect(rank(data).map((item) => item.bookId)).toEqual(['faith']);
  });
});
