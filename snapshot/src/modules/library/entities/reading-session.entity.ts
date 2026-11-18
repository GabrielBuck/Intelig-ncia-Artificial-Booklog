/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Tipo ReadingSession (neutralizado no experimento).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/library/entities/reading-session.entity.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
export interface ReadingSession {
  id: string;
  libraryItemId: string;
  userId: string;
  bookId: string;
  pagesRead: number;
  mode: string;
  durationMinutes: number | null;
  source: string;
  createdAt: string;
}
