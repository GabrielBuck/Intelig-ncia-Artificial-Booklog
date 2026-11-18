/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Testes unitários originais de similaridade entre livros.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/book-similarity.util.spec.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../../books/entities/book.entity';
import {
  isSameWork,
  rankSimilarBooks,
  similarityScore,
} from './book-similarity.util';

function book(id: string, overrides: Partial<Book> = {}): Book {
  return {
    id,
    externalToken: null,
    title: `Livro ${id}`,
    subtitle: null,
    authors: ['Autora Um'],
    genres: ['Fantasia'],
    publishedYear: 2020,
    pageCount: 300,
    language: 'pt-BR',
    synopsis: null,
    coverUrl: null,
    isbn: null,
    aggregateRating: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('similarityScore', () => {
  it('does not connect unrelated books through unknown authors', () => {
    const a = book('a', {
      authors: ['Unknown author'],
      genres: ['Unknown type'],
    });
    const b = book('b', {
      authors: ['Unknown author'],
      genres: ['Unknown type'],
    });
    expect(rankSimilarBooks(a, [b], 10)).toEqual([]);
  });
  const base = book('base', {
    authors: ['Gege Akutami'],
    genres: ['Fantasia'],
    subgenres: ['Dark fantasy'],
    themes: ['Shounen', 'Sobrenatural'],
    publicationType: 'manga',
  });

  it('adds up what the books share', () => {
    const twin = book('twin', {
      authors: ['Gege Akutami'],
      genres: ['Fantasia'],
      subgenres: ['Dark fantasy'],
      themes: ['Shounen', 'Sobrenatural'],
      publicationType: 'manga',
    });
    const stranger = book('stranger', {
      authors: ['Outra'],
      genres: ['História'],
    });

    expect(similarityScore(base, twin)).toBeGreaterThan(
      similarityScore(base, stranger),
    );
    expect(similarityScore(base, stranger)).toBeLessThan(3);
  });

  it('does not treat "Uncategorized" as a shared genre', () => {
    const a = book('a', { authors: ['X'], genres: ['Uncategorized'] });
    const b = book('b', {
      authors: ['Y'],
      genres: ['Uncategorized'],
      language: 'en',
    });

    expect(similarityScore(a, b)).toBe(0);
  });

  it('only counts publication type when both books have one', () => {
    const withType = book('t', {
      authors: ['X'],
      genres: ['História'],
      publicationType: 'manga',
    });
    const withoutType = book('u', {
      authors: ['Y'],
      genres: ['Poesia'],
      language: 'en',
    });

    expect(similarityScore(withType, withoutType)).toBe(0);
  });
});

describe('isSameWork', () => {
  it('recognizes another edition by title and first author, and the book itself', () => {
    const a = book('a', {
      title: 'Jujutsu Kaisen 0',
      authors: ['Gege Akutami'],
    });
    const edition = book('b', {
      title: 'JUJUTSU  KAISEN 0',
      authors: ['gege akutami'],
    });
    const other = book('c', {
      title: 'Jujutsu Kaisen 1',
      authors: ['Gege Akutami'],
    });

    expect(isSameWork(a, a)).toBe(true);
    expect(isSameWork(a, edition)).toBe(true);
    expect(isSameWork(a, other)).toBe(false);
  });
});

describe('rankSimilarBooks', () => {
  const base = book('base', { authors: ['Autora Um'], genres: ['Fantasia'] });

  it('puts the same author first, drops the book itself, its editions and weak matches', () => {
    const sameAuthor = book('sa', { genres: ['História'] });
    const sameGenre = book('sg', { authors: ['Outra'] });
    const edition = book('ed', { title: base.title, authors: base.authors });
    const weak = book('weak', { authors: ['Outra'], genres: ['História'] });

    const ranked = rankSimilarBooks(
      base,
      [weak, sameGenre, edition, base, sameAuthor],
      10,
    );

    expect(ranked.map((b) => b.id)).toEqual(['sa', 'sg']);
  });

  it('breaks ties by readers and is stable, with no duplicates and a limit', () => {
    const popular = book('pop', { authors: ['Outra'], ratingCount: 900 });
    const quiet = book('quiet', { authors: ['Outra'], ratingCount: 3 });

    const ranked = rankSimilarBooks(base, [quiet, popular, popular, quiet], 1);

    expect(ranked.map((b) => b.id)).toEqual(['pop']);
  });

  it('is empty when nothing is alike', () => {
    expect(
      rankSimilarBooks(
        base,
        [book('x', { authors: ['Z'], genres: ['Poesia'], language: 'en' })],
        5,
      ),
    ).toEqual([]);
  });
});
