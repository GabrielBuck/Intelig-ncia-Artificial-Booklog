/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Provedor padrão (driver hybrid) que executa o ranking híbrido.
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/recommendations/providers/in-memory-recommendation.provider.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import { Injectable } from '@nestjs/common';

import type { RecommendationProvider } from './recommendation-provider.interface';
import {
  buildHybridRecommendationResult,
  resolveRankingStrategy,
} from './recommendation-ranking.util';
import type {
  RecommendationInput,
  RecommendationResult,
} from '../types/recommendation.types';

@Injectable()
export class InMemoryRecommendationProvider implements RecommendationProvider {
  async recommendBooks(input: RecommendationInput): Promise<RecommendationResult> {
    const strategy =
      input.strategy === 'graph'
        ? 'hybrid'
        : resolveRankingStrategy(
            input,
            input.userId && input.basedOnLibrary ? 'hybrid' : 'trending',
          );

    return buildHybridRecommendationResult(input, {
      provider: 'inMemory',
      source: 'inMemory',
      temporary: false,
      strategy,
    });
  }
}
