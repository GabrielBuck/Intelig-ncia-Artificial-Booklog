/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Testes unitários originais de elegibilidade.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/recommendation-eligibility.util.spec.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { Book } from '../../books/entities/book.entity';
import {
  isFirstSeriesBook,
  sameRecommendationWork,
} from './recommendation-eligibility.util';
import { buildCandidatePool } from './recommendation-ranking.util';
import type { RecommendationInput } from '../types/recommendation.types';
const book = (id: string, fields: Partial<Book> = {}): Book =>
  ({
    id,
    title: id,
    authors: ['Ursula Le Guin'],
    isbn: null,
    ...fields,
  }) as Book;
describe('recommendation eligibility', () => {
  it('recognizes a translated edition by shared work identity without guessing from its author', () => {
    const original = book('a', {
      title: 'The Left Hand of Darkness',
      identifiers: { openLibraryWork: '/works/OL59818W' },
    });
    const translated = book('b', {
      title: 'A mão esquerda da escuridão',
      language: 'pt-BR',
      identifiers: { openLibraryWork: 'OL59818W' },
    });
    expect(sameRecommendationWork(original, translated)).toBe(true);
    expect(
      sameRecommendationWork(
        original,
        book('c', { title: 'The Dispossessed' }),
      ),
    ).toBe(false);
  });
  it('recognizes editions despite a subtitle and normalized accents, and equivalent ISBN spellings', () => {
    expect(
      sameRecommendationWork(
        book('a', { title: 'O mágico: edição ilustrada' }),
        book('b', { title: 'O magico' }),
      ),
    ).toBe(true);
    expect(
      sameRecommendationWork(
        book('a', { isbn: '8501107115' }),
        book('b', { isbn: '9788501107114' }),
      ),
    ).toBe(true);
  });
  it('only admits known first volumes and never treats an omnibus or unknown series volume as first', () => {
    expect(
      isFirstSeriesBook(book('first', { series: 'Earthsea', volume: '1' })),
    ).toBe(true);
    expect(
      isFirstSeriesBook(book('roman', { series: 'Earthsea', volume: 'I' })),
    ).toBe(true);
    for (const volume of ['2', '1-3', '0', null, '1.5'])
      expect(
        isFirstSeriesBook(book('later', { series: 'Earthsea', volume })),
      ).toBe(false);
    expect(
      isFirstSeriesBook(book('unknown', { title: 'A saga, Livro 2' })),
    ).toBe(false);
    expect(isFirstSeriesBook(book('standalone'))).toBe(true);
  });
  it('filters owned translations and sequels before ranking, including trending without personalization', () => {
    const owned = book('owned', {
      title: 'Original',
      identifiers: { openLibraryWork: 'OL59818W' },
    });
    const translation = book('translation', {
      title: 'Tradução',
      identifiers: { openLibraryWork: 'OL59818W' },
    });
    const sequel = book('sequel', { series: 'Saga', volume: '2' });
    const first = book('first', { series: 'Saga', volume: '1' });
    const input = {
      catalogBooks: [translation, sequel, first],
      trendingBooks: [],
      collaborativeBooks: [],
      libraryBooks: [owned],
      includeAlreadyInLibrary: false,
      basedOnLibrary: false,
    } as unknown as RecommendationInput;
    expect(buildCandidatePool(input).map((book) => book.id)).toEqual(['first']);
  });
});
