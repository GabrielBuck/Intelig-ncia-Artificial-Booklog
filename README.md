# Sistema de Recomendação Personalizada de Livros para o Booklog

Projeto da disciplina **Inteligência Artificial — 7ºK**, da Faculdade de Computação e Informática da Universidade Presbiteriana Mackenzie, desenvolvido como módulo experimental associado ao TCC Booklog.

## Identificação

| Integrante | RA | E-mail |
|---|---:|---|
| Gabriel Nottoli Buck | 10425384 | 10425384@mackenzista.com.br |
| Julia Andrade | 10427828 | 10427828@mackenzista.com.br |
| João Vitor Rocha Miranda | 10427273 | 10427273@mackenzista.com.br |

**Professor:** Prof. Dr. Leandro Zerbinatti

**Semestre:** 2026/2

**Opção do projeto:** Framework

## Problema e objetivo

Rankings gerais favorecem livros populares, mas não representam necessariamente os interesses de cada leitor. O projeto investiga como dados de livros e avaliações podem estimar afinidade e ordenar títulos de forma personalizada.

**Pergunta de pesquisa:** como técnicas de Inteligência Artificial podem utilizar dados de livros e preferências de leitores para gerar recomendações personalizadas no Booklog?

O objetivo é desenvolver e avaliar uma abordagem de recomendação personalizada, comparando-a com um baseline não personalizado. A N1 contempla definição do problema, dataset, análise exploratória, preparação dos dados, metodologia e discussão ética. A implementação e a avaliação dos modelos compõem a N2.

## Dataset da N1

O conjunto de dados foi elaborado pelo grupo e autorizado para a atividade. Ele contém:

- **30 leitores** identificados de `U001` a `U030`;
- **36 livros** de seis gêneros;
- **345 avaliações** em escala de 1 a 5;
- datas de interação;
- metadados de título, autor e gênero.

Os identificadores não expõem nomes, e-mails ou outros dados pessoais. O dicionário, a origem e as regras de preparação estão em [`data/README.md`](data/README.md).

## Resultados da análise exploratória

| Indicador | Resultado |
|---|---:|
| Leitores | 30 |
| Livros | 36 |
| Avaliações | 345 |
| Média das notas | 3,62 |
| Mediana das notas | 3,5 |
| Valores ausentes | 0 |
| Pares leitor–livro duplicados | 0 |
| Avaliações por leitor | 9 a 15 |
| Esparsidade da matriz leitor × livro | 68,1% |

A esparsidade mostra que 68,1% das combinações possíveis entre leitores e livros não possuem avaliação. Esse comportamento é compatível com a formulação de um sistema de recomendação e exige cuidado na divisão dos dados e na avaliação dos modelos.

## Estrutura

```text
.
├── data/
│   ├── README.md
│   ├── raw/
│   │   ├── books.csv
│   │   └── ratings.csv
│   └── processed/
│       ├── books_clean.csv
│       └── ratings_clean.csv
├── docs/n1/
│   ├── README.md
│   └── Relatorio_N1_Booklog_IA.md
├── notebooks/
│   └── 01_analise_exploratoria.ipynb
├── src/
│   └── analise_exploratoria.py
├── .gitignore
├── requirements.txt
└── README.md
```

## Execução

Requer Python 3.11 ou superior.

```bash
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1

python -m pip install -r requirements.txt
jupyter notebook notebooks/01_analise_exploratoria.ipynb
```

A mesma preparação pode ser reproduzida pela linha de comando:

```bash
python src/analise_exploratoria.py
```

## Metodologia

1. Validar colunas, tipos, chaves, notas e relações entre os arquivos.
2. Verificar ausências e duplicidades.
3. Analisar distribuição das notas e atividade por leitor, livro e gênero.
4. Calcular a esparsidade da matriz leitor × livro.
5. Gerar os arquivos tratados de forma determinística.
6. Na N2, comparar um baseline não personalizado com uma abordagem personalizada adequada à base.

A escolha entre previsão de nota, classificação de interesse ou avaliação direta de ranking será justificada pela técnica aplicada. As métricas candidatas são MAE ou RMSE para regressão; precisão, recall e F1 para classificação; e Precision@K ou Recall@K para ranking.

## Ética e responsabilidade

O dataset publicado utiliza identificadores de leitores sem associação com nomes ou contatos. A evolução do projeto deve manter minimização de dados, controle de acesso e transparência sobre o caráter estimado das recomendações.

A avaliação também deve observar viés de popularidade, concentração em poucos gêneros ou autores, baixa diversidade, bolhas de filtro e cold start. O sistema não deve afirmar que conhece o gosto do leitor; ele estima afinidade a partir dos dados disponíveis.

## Entrega N1

| Exigência | Evidência no repositório |
|---|---|
| Proposta e definição do problema | README e relatório |
| Integrantes, RAs e e-mails | README, relatório, notebook e fonte Python |
| Dataset e descrição | `data/raw/` e `data/README.md` |
| Preparação dos dados | `src/analise_exploratoria.py` e `data/processed/` |
| Análise exploratória | notebook executado |
| Ética e responsabilidade | README e relatório |
| Metodologia e resultados esperados | relatório da N1 |
| Referências citadas | relatório da N1 |
| Cabeçalho e histórico dos fontes | notebook e fonte Python |

O relatório textual está em [`docs/n1/Relatorio_N1_Booklog_IA.md`](docs/n1/Relatorio_N1_Booklog_IA.md).

## Continuidade para a N2

A N2 implementará o baseline, a abordagem personalizada, o protocolo de separação dos dados e a avaliação objetiva. Técnicas adicionais, como TF-IDF, somente serão incorporadas quando contribuírem diretamente para o problema e estiverem justificadas pelos experimentos.
