/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Tipo LibraryItem (item de biblioteca).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/library/entities/library-item.entity.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import type { ReadingStatus } from '../../../common/types/enums';

export interface ReadingPeriod {
  id: string;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export interface LibraryItem {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  currentPage: number;
  progressPercent: number;
  personalRating: number | null;
  isFavorite: boolean;
  tags: string[];
  notes: string | null;
  personalCoverUrl?: string | null;
  /** Audiobooks: how long the reader took to listen, in minutes (they say it). */
  listenedMinutes?: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  readingHistory?: ReadingPeriod[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
