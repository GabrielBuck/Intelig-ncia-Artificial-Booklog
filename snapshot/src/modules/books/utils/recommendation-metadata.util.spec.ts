/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Testes unitários originais de metadados.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/books/utils/recommendation-metadata.util.spec.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import {
  canonicalGenre,
  isMeaningfulMetadata,
} from './recommendation-metadata.util';

describe('recommendation metadata', () => {
  it.each([
    'Literatura cristã',
    'Christian living',
    'Cristianismo',
    'Religion',
  ])('recognizes %s in the existing religion taxonomy', (label) => {
    expect(canonicalGenre(label)).toBe('Religião e Espiritualidade');
  });
  it.each([
    'Unknown Author.',
    'Unknown type',
    'Autor desconhecido',
    'Sem categoria',
    'N/A',
    'Various authors',
    '',
  ])('ignores %s as evidence of reader taste', (label) => {
    expect(isMeaningfulMetadata(label)).toBe(false);
  });
});
