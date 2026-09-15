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

## Problema

Plataformas de leitura possuem muitos livros disponíveis, porém rankings baseados apenas em popularidade não representam necessariamente a preferência individual de cada leitor. O projeto investiga como técnicas de Inteligência Artificial podem utilizar informações de leitores, livros e interações para estimar afinidade e gerar recomendações personalizadas.

## Dataset da N1

O dataset foi estruturado para representar o contexto de uma plataforma de leitura, utilizando identificadores anonimizados.

A expansão da N1 contempla:

- leitores com informações de perfil não identificáveis;
- catálogo de livros com metadados relevantes;
- histórico de interações leitor-livro;
- avaliações em escala de 1 a 5.

A estrutura foi criada para permitir análise exploratória, preparação dos dados e evolução posterior para modelos de recomendação na N2.

## Estrutura de dados

```text
raw/
├── readers.csv
├── books.csv
└── ratings.csv

processed/
├── readers_clean.csv
├── books_clean.csv
└── ratings_clean.csv
```

## Análise exploratória

A N1 analisa:

- quantidade de leitores, livros e interações;
- distribuição das avaliações;
- atividade por leitor;
- popularidade dos livros;
- distribuição por gênero;
- valores ausentes e duplicidades;
- esparsidade da matriz leitor × livro.

A análise tem como objetivo avaliar se os dados possuem características adequadas para um sistema de recomendação.

## Preparação dos dados

O processamento realiza:

1. validação de colunas e tipos;
2. tratamento de valores ausentes;
3. remoção de duplicidades;
4. validação das notas;
5. conferência das relações entre leitores, livros e avaliações;
6. geração dos arquivos processados.

## Continuidade para N2

A N2 utilizará a base preparada para comparar uma abordagem personalizada com um baseline não personalizado. A técnica final será definida conforme as características observadas nos dados e os conteúdos abordados na disciplina.

Possíveis avaliações incluem métricas adequadas ao problema de regressão, classificação ou ranking, sempre justificadas pela metodologia escolhida.

## Ética

O projeto considera privacidade, anonimização, minimização de dados, viés de popularidade, diversidade das recomendações, cold start e explicabilidade. As recomendações representam estimativas de afinidade baseadas nos dados disponíveis, não previsões absolutas sobre preferências humanas.
