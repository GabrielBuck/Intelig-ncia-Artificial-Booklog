# Entrega N2

| Arquivo | Conteúdo |
|---|---|
| [`Relatorio_N2_Booklog_IA.pdf`](Relatorio_N2_Booklog_IA.pdf) | Relatório completo no template da FCI (13 páginas) |
| [`Relatorio_N2_Booklog_IA.docx`](Relatorio_N2_Booklog_IA.docx) | Versão editável do mesmo relatório |
| [`Roteiro_N2_Booklog_IA.pdf`](Roteiro_N2_Booklog_IA.pdf) | Roteiro do vídeo (até 5 minutos), dividido entre os quatro integrantes |

**Vídeo no YouTube: PENDENTE.** O endereço será inserido na seção 7 do relatório após a publicação; o PDF será exportado novamente.

## Matriz de aderência ao enunciado (N2)

| Requisito | Localização |
|---|---|
| Título, integrantes (nome, e-mail, RA), resumo | Relatório, página 1 |
| Introdução: contextualização, justificativa, objetivo, opção do projeto | Relatório, seção 1 |
| Descrição do problema | Relatório, seção 3.1 |
| Ética e responsabilidade | Relatório, seção 3.6 |
| Dataset, análise exploratória e preparação em Python | Seção 3.2; `data/`; `notebooks/01_analise_exploratoria.ipynb`; `src/analise_exploratoria.py` |
| Metodologia | Seções 3 e 4; `src/avaliacao_n2.py`; `snapshot/` |
| Resultados | Seção 5; `results/`; `notebooks/02_avaliacao_recomendacoes.ipynb` |
| Conclusão | Seção 6 |
| Endereço do GitHub e do vídeo | Seção 7 (vídeo pendente) |
| Referências | Seção 8 |
| Cabeçalho com integrantes, síntese e histórico nos fontes | Docstrings dos `.py`, primeira célula dos notebooks, cabeçalhos dos `.ts` |

## Revisão desta versão (18/11/2026)

A avaliação foi reexecutada a partir do código publicado neste repositório. Precision e Recall de todas as estratégias, as métricas do híbrido, da popularidade e do grafo em cinco posições, o corte (273/72), os 20 leitores avaliados, o vocabulário TF-IDF (129), o exemplo U003 e os 47 testes selecionados foram **confirmados**. Os valores abaixo, da versão preliminar do relatório, **não se reproduziram** e foram substituídos pelos executados (o código que gerou a versão preliminar não estava disponível; nenhuma variação de desempate testada reproduziu os números antigos):

| Item | Versão preliminar | Executado e publicado |
|---|---:|---:|
| TF-IDF, NDCG@5 | 0,342 | 0,356 |
| Conteúdo do backend, NDCG@5 | 0,374 | 0,370 |
| TF-IDF, NDCG@10 | 0,438 | 0,451 |
| Conteúdo do backend, NDCG@10 | 0,417 | 0,413 |
| Grafo do backend, cobertura@10 | 97,2% | 100,0% |
| IC 95% híbrido − popularidade, NDCG@5 | −0,035 a 0,320 | −0,036 a 0,316 |
| IC 95% híbrido − popularidade, NDCG@10 | 0,009 a 0,352 | 0,010 a 0,353 |

Consequência no texto: o híbrido passou a ter o maior NDCG@5 por margem pequena (0,374 contra 0,370 do conteúdo), e não o conteúdo. As conclusões não mudam: conteúdo isolado mantém a maior Precision@5, TF-IDF o maior Recall@5 e as maiores métricas em dez posições, e o intervalo em cinco posições continua incluindo zero.

Outras correções: curso (Sistemas de Informação) no cabeçalho; papel exato do scikit-learn e da cópia TypeScript na opção Framework; tendência e nota agregada no adaptador; caminhos de reprodução; escopo dos 47 testes (39 reproduzíveis no snapshot + 8 dependentes do backend completo); backend identificado como privado e apenas origem técnica; resumo e abstract ajustados (223 e 209 palavras).

## Roteiro: validação

**As falas atuais podem ser gravadas sem alterações.** Todos os números e exemplos citados no roteiro (273/72, 20 leitores, 50,8% contra 30,8%, 47 testes, pesos 56/64/12, U003 com *A Sociedade do Anel* e *E Não Sobrou Nenhum*) foram confirmados pela execução publicada. O roteiro não cita os valores que mudaram.

### O que cada integrante mostra na tela

| Integrante | Tempo | Telas e arquivos |
|---|---|---|
| Julia | 0:00–1:00 | Página 1 do `Relatorio_N2_Booklog_IA.pdf` (título, quatro nomes, professor, disciplina, curso, instituição). Depois, visão geral do BookLog (site ou app) sem e-mails, notificações ou dados de terceiros. |
| João | 1:00–2:10 | Fluxo perfil → candidatos → pontuação → filtros → lista com justificativas (pode ser a seção 4 do relatório). Abrir `snapshot/src/modules/recommendations/providers/recommendation-ranking.util.ts` nas linhas 419–445 (pesos 12, 56 e 64). Para o grafo, `poc-recommendation.provider.ts`, linhas 211–218. Card do app é opcional. |
| Juan | 2:10–3:20 | `notebooks/02_avaliacao_recomendacoes.ipynb` já executado: seção 2 (tabela com 273 e 72, 20 leitores) e seção 3 (tabelas de métricas). Não executar instalação durante a gravação. |
| Gabriel Buck | 3:20–4:40 | 3:20–3:45: seção 5 do notebook com `LEITOR = "U003"` (relevantes do teste e tabela das cinco primeiras sugestões; popularidade sem ✔, híbrido com dois ✔) e a tabela de justificativas. 3:45–4:15: `results/graficos/comparacao_top5.png` e tabela da seção 3. 4:15–4:40: página do repositório no GitHub (README, `docs/n2/`, `notebooks/`, `data/`, `results/`), aberta sem login. |

Antes de gravar: `python src/avaliacao_n2.py` (ou executar o notebook inteiro) para que as saídas na tela correspondam ao repositório.
