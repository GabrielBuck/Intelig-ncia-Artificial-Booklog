# Sistema de Recomendação Personalizada de Livros para o Booklog

Projeto da disciplina **Inteligência Artificial — 7ºK — Sistemas de Informação**, Faculdade de Computação e Informática da Universidade Presbiteriana Mackenzie, 2026/2. Opção do projeto: **Framework** (Python, Pandas, scikit-learn, Matplotlib).

**Professor:** Prof. Dr. Leandro Zerbinatti

| Integrante | RA | E-mail |
|---|---:|---|
| Gabriel Nottoli Buck | 10425384 | 10425384@mackenzista.com.br |
| Julia Andrade | 10427828 | 10427828@mackenzista.com.br |
| João Vitor Rocha Miranda | 10427273 | 10427273@mackenzista.com.br |
| Juan Nacif | 10428509 | 10428509@mackenzista.com.br |

## Materiais da N2

| | |
|---|---|
| Relatório final (PDF) | [`docs/n2/Relatorio_N2_Booklog_IA.pdf`](docs/n2/Relatorio_N2_Booklog_IA.pdf) — editável em [`.docx`](docs/n2/Relatorio_N2_Booklog_IA.docx) |
| Roteiro do vídeo | [`docs/n2/Roteiro_N2_Booklog_IA.pdf`](docs/n2/Roteiro_N2_Booklog_IA.pdf) · orientações de gravação em [`docs/n2/README.md`](docs/n2/README.md) |
| Vídeo no YouTube | **pendente** (o link será adicionado aqui e na seção 7 do relatório) |
| Notebook de avaliação e demonstração | [`notebooks/02_avaliacao_recomendacoes.ipynb`](notebooks/02_avaliacao_recomendacoes.ipynb) |
| Script da avaliação | [`src/avaliacao_n2.py`](src/avaliacao_n2.py) |
| Resultados | [`results/`](results/) |
| Entrega N1 | [`docs/n1/`](docs/n1/README.md) · [`notebooks/01_analise_exploratoria.ipynb`](notebooks/01_analise_exploratoria.ipynb) |

## Problema e objetivo

Rankings gerais de popularidade não representam o gosto de cada leitor. O projeto implementa e avalia recomendações personalizadas de livros para o Booklog, comparando estratégias personalizadas com um baseline não personalizado.

- **N1:** proposta, preparação da base e análise exploratória.
- **N2:** documentação do recomendador implementado no backend do Booklog, avaliação offline reproduzível de cinco estratégias, resultados, discussão e conclusão.

## Dados

Base elaborada pelo grupo para a disciplina — **não são avaliações reais de usuários do Booklog**: 30 leitores (U001–U030), 36 livros, 345 avaliações (notas de 1 a 5 em passos de 0,5), seis gêneros, esparsidade de 68,1%. Detalhes em [`data/README.md`](data/README.md).

## Arquitetura da solução acadêmica

```text
data/processed/ratings_clean.csv
        │  corte temporal em 10/09/2026
        ├── train.csv (273) ──┬─► Popularidade (Pandas)
        │                     ├─► TF-IDF + cosseno (scikit-learn)
        │                     └─► snapshot/academic/run-offline.ts ─► provedores copiados do backend
        │                                                              (conteúdo · híbrido · grafo)
        └── test.csv (72) ────► Precision@K, Recall@K, NDCG@K, cobertura, bootstrap pareado
                                 └─► results/  ·  notebooks/02_avaliacao_recomendacoes.ipynb
```

| Pasta | Conteúdo |
|---|---|
| `data/raw`, `data/processed` | Base da N1, versões tratadas e os conjuntos efetivos de treino/teste |
| `src/` | `analise_exploratoria.py` (N1), `avaliacao_n2.py` (N2), `registrar_testes.py`, `expandir_dataset_n1.py` (protótipo não utilizado) |
| `snapshot/` | Cópia **mínima** dos provedores de recomendação do backend (commit `063583b`), corpo idêntico ao original, mais o adaptador offline — ver [`snapshot/README.md`](snapshot/README.md) |
| `tests/` | Testes Python do protocolo |
| `results/` | Métricas, rankings, saídas e justificativas do backend, bootstrap, gráficos, registros de teste e manifesto de proveniência |
| `docs/` | Relatórios N1 e N2 e roteiro |

## Estratégias avaliadas

1. **Popularidade** — número de avaliações no treino (desempate: média, `book_id`). Baseline não personalizado.
2. **TF-IDF** — `TfidfVectorizer` (autor + gênero, n-gramas 1–2, sem acentos, TF sublinear; 129 atributos) e `cosine_similarity` do scikit-learn; perfil = média ponderada (nota − 3) dos livros de treino com nota ≥ 4.
3. **Conteúdo do backend** — provedor original com `strategy=contentBased` (afinidade de gênero, autor, temas; sem coocorrência).
4. **Híbrido do backend** — provedor original com `strategy=hybrid` (conteúdo + coocorrência entre bibliotecas de leitores).
5. **Grafo do backend** — `PocRecommendationProvider`, percurso guloso em grafo de livros com complemento pelo híbrido.

As estratégias 3–5 usam **regras heurísticas com pesos fixos definidos em código** (ex.: gênero até 56 pontos, autor até 64, coocorrência até 12). Esses pesos **não foram treinados** por rede neural, nem ajustados no teste. O ranking não usa ChatGPT nem modelos generativos. O scikit-learn é usado na referência TF-IDF; as métricas são implementadas em Python/NumPy.

## Instalação

Requisitos: Python 3.11+ e Node.js 20+ (testado com Python 3.11.9 e Node.js 24.16.0).

```bash
python -m pip install -r requirements.txt
npm --prefix snapshot ci
npm --prefix snapshot run build
```

## Reprodução

```bash
python src/analise_exploratoria.py   # N1: valida e prepara a base
python src/avaliacao_n2.py           # N2: separação, 5 estratégias, métricas, gráficos
python src/registrar_testes.py       # testes Python + testes originais do snapshot
```

A avaliação é determinística (semente 42 no bootstrap; sem amostragem nas estratégias): duas execuções produzem arquivos idênticos. Ela não acessa banco, rede, credenciais ou serviços do Booklog.

## Testes

| Conjunto | Comando | Resultado |
|---|---|---|
| Protocolo N2 em Python (métricas, separação sem vazamento, exclusão do treino, U003, integridade do snapshot) | `python -m unittest discover -s tests -v` | 11/11 |
| Testes unitários originais copiados com os provedores (4 suítes) | `npm --prefix snapshot test` | 39/39 |
| 7 suítes selecionadas do módulo de recomendações, no backend original em cópia isolada (inclui as 4 acima + serviço, visibilidade e integração HTTP) | registro em [`results/backend-selected-tests.json`](results/backend-selected-tests.json) | 47/47 |

As 47 verificações são uma **seleção** do módulo de recomendações, não a suíte completa do produto. Consolidado em [`results/test-results.json`](results/test-results.json).

## Demonstração

Abra `notebooks/02_avaliacao_recomendacoes.ipynb` e execute todas as células (Jupyter ou VS Code). A seção 5 mostra, para o leitor escolhido em `LEITOR` (padrão `U003`): histórico de treino, relevantes do teste, as cinco primeiras sugestões de cada estratégia com ✔ nos acertos e as justificativas geradas pelo código do backend.

Exemplo verificado (U003): relevantes no teste são *A Sociedade do Anel* e *E Não Sobrou Nenhum*. A popularidade não recupera nenhum nas cinco primeiras posições; TF-IDF, conteúdo e híbrido recuperam ambos; o grafo recupera o primeiro.

## Resultados (20 leitores com relevantes no teste)

| Estratégia | P@5 | R@5 | NDCG@5 | Cob.@5 | P@10 | R@10 | NDCG@10 | Cob.@10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Popularidade | 0,100 | 0,308 | 0,230 | 33,3% | 0,055 | 0,333 | 0,239 | 55,6% |
| TF-IDF | 0,160 | **0,542** | 0,356 | 91,7% | **0,120** | **0,800** | **0,451** | 97,2% |
| Conteúdo do backend | **0,170** | 0,533 | 0,370 | 88,9% | 0,100 | 0,658 | 0,413 | 100,0% |
| Híbrido do backend | 0,160 | 0,508 | **0,374** | 94,4% | 0,100 | 0,658 | 0,427 | 100,0% |
| Grafo do backend | 0,150 | 0,517 | 0,313 | 94,4% | 0,105 | 0,708 | 0,383 | 100,0% |

Fonte: [`results/metrics_summary.csv`](results/metrics_summary.csv). Diferença de NDCG@5 híbrido − popularidade: 0,144 (IC bootstrap 95%: −0,036 a 0,316, inclui zero); NDCG@10: 0,188 (0,010 a 0,353). Ver [`results/paired_bootstrap.csv`](results/paired_bootstrap.csv).

**Interpretação:** a personalização superou a popularidade nesta base, mas o híbrido **não** é o melhor em todas as métricas — conteúdo isolado tem a maior Precision@5 e TF-IDF lidera Recall@5 e as métricas em dez posições. Recall@K mede recuperação de relevantes observados em um teste offline; não é satisfação de leitores nem conversão.

## Limitações

Base pequena e acadêmica; um único corte temporal; 20 leitores e 29 relevantes no teste; intervalos amplos e sem correção para múltiplas comparações; sinais do produto (favoritos, progresso, sessões, eventos, idioma) inexistentes na base e neutralizados; nenhuma avaliação com leitores reais.

## Ética

Os identificadores não se associam a pessoas reais; nenhum dado de produção, credencial ou log de usuários foi usado. O relatório discute privacidade, transparência das justificativas, viés de popularidade e bolhas de interesse (seção 3.6).

## Proveniência

- Backend Booklog (privado; origem técnica, consultado somente em leitura): commit `063583bbcf1d7a9718bd53867c714757e1950283`. O backend **não** é o artefato de entrega; esta entrega funciona sem ele.
- Base da N1 neste repositório: commit `bec4890b43a4612dcbc5c42f5d28a4d628a38db9`.
- Hashes SHA-256 de dados, scripts e arquivos copiados: [`results/source-manifest.json`](results/source-manifest.json).
