# Sistema de Recomendação Personalizada de Livros para o Booklog

Projeto da disciplina **Inteligência Artificial — 7ºK**, da Faculdade de Computação e Informática da Universidade Presbiteriana Mackenzie, desenvolvido como módulo experimental associado ao TCC Booklog.

## Identificação

| Integrante | RA | E-mail |
|---|---:|---|
| Gabriel Nottoli Buck | 10425384 | 10425384@mackenzista.com.br |
| Julia Andrade | 10427828 | 10427828@mackenzista.com.br |
| João Vitor Rocha Miranda | 10427273 | 10427273@mackenzista.com.br |
| Juan Nacif | 10428509 | Não informado |

**Professor:** Prof. Dr. Leandro Zerbinatti

**Semestre:** 2026/2

## Problema

Plataformas de leitura possuem muitos livros disponíveis, porém rankings baseados apenas em popularidade não representam necessariamente a preferência individual de cada leitor. O projeto investiga como técnicas de Inteligência Artificial podem utilizar informações de leitores, livros e interações para estimar afinidade e gerar recomendações personalizadas.

## Dataset da N1

A base publicada e analisada na N1 contém **30 leitores distintos nas avaliações, 36 livros e 345 avaliações**. Foi elaborada pelo grupo para a atividade acadêmica; não representa uma exportação de comportamento real do Booklog.

O arquivo auxiliar `data/raw/readers.csv` possui cinco perfis, sem cobertura de todos os leitores das avaliações. Esses perfis não são utilizados na análise atual.

## Estrutura de dados

```text
data/
├── raw/
│   ├── readers.csv
│   ├── books.csv
│   └── ratings.csv
└── processed/
    ├── books_clean.csv
    └── ratings_clean.csv
```

## Reprodução

```bash
python -m pip install -r requirements.txt
python src/analise_exploratoria.py
```

O notebook `notebooks/01_analise_exploratoria.ipynb` apresenta a análise exploratória. O relatório está em [docs/n1/Relatorio_N1_Booklog_IA.md](docs/n1/Relatorio_N1_Booklog_IA.md).

### Estado da expansão

`src/expandir_dataset_n1.py` é um protótipo de geração sintética de 150 perfis, 200 livros e 3.000 registros. Essa expansão não integra os CSVs nem os resultados da N1 publicados. O protótipo usa esquema diferente do pipeline atual e pode repetir pares leitor-livro; portanto, não deve substituir a base validada sem revisão e nova execução da análise. Seus títulos e autores são fictícios.

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

O processamento converte notas e datas, valida a escala de 1 a 5, verifica pares leitor-livro e identificadores de livros duplicados, confere as referências ao catálogo e ordena os registros. Gera `books_clean.csv` e `ratings_clean.csv`.

A análise da base atual encontrou média de 3,62, mediana de 3,5, nenhum valor ausente nas tabelas analisadas, nenhum par duplicado e esparsidade de 68,1%. A validação referencial não inclui a completude dos perfis auxiliares.

## Continuidade para N2

A N2 utilizará a base preparada para comparar uma abordagem personalizada com um baseline não personalizado. A técnica final será definida conforme as características observadas nos dados e os conteúdos abordados na disciplina.

Possíveis avaliações incluem métricas adequadas ao problema de regressão, classificação ou ranking, sempre justificadas pela metodologia escolhida.

## Ética

O projeto considera privacidade, anonimização, minimização de dados, viés de popularidade, diversidade das recomendações, cold start e explicabilidade. As recomendações representam estimativas de afinidade baseadas nos dados disponíveis, não previsões absolutas sobre preferências humanas.
