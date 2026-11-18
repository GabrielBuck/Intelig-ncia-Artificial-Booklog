/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Enumerações comuns (ReadingStatus).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/common/types/enums.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
export enum ReadingStatus {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  FINISHED = 'FINISHED',
  BORROWED = 'BORROWED',
  ABANDONED = 'ABANDONED',
  REREAD = 'REREAD',
}

export enum AnnotationType {
  NOTE = 'NOTE',
  QUOTE = 'QUOTE',
  BOOKMARK = 'BOOKMARK',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

export enum FeedPostType {
  PROGRESS = 'PROGRESS',
  RATING = 'RATING',
  REVIEW = 'REVIEW',
  STATUS = 'STATUS',
  WISHLIST = 'WISHLIST',
}

export enum LoanStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  CANCELED = 'CANCELED',
}

export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FOLLOW = 'FOLLOW',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  LOAN = 'LOAN',
  REMINDER = 'REMINDER',
  RECOMMENDATION = 'RECOMMENDATION',
  CLUB_INVITE = 'CLUB_INVITE',
  CLUB_INVITE_ACCEPTED = 'CLUB_INVITE_ACCEPTED',
  CLUB_INVITE_DECLINED = 'CLUB_INVITE_DECLINED',
  CLUB_MEMBER_JOINED = 'CLUB_MEMBER_JOINED',
  CLUB_MESSAGE = 'CLUB_MESSAGE',
  CLUB_POST_COMMENTED = 'CLUB_POST_COMMENTED',
  CLUB_GOAL_COMPLETED = 'CLUB_GOAL_COMPLETED',
  CLUB_RANKING_CHANGED = 'CLUB_RANKING_CHANGED',
  CLUB_CHALLENGE_STARTED = 'CLUB_CHALLENGE_STARTED',
  CLUB_COMPETITION_ENDED = 'CLUB_COMPETITION_ENDED',
  SHELF_INVITE = 'SHELF_INVITE',
  SHELF_INVITE_ACCEPTED = 'SHELF_INVITE_ACCEPTED',
}
