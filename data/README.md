# Dataset da N1

O conjunto de dados foi elaborado pelo grupo e autorizado para a atividade de Inteligência Artificial. Ele representa avaliações de livros realizadas por leitores identificados por códigos, sem nomes, e-mails ou outros atributos pessoais.

## Origem

O catálogo e as interações foram organizados pelo grupo para o experimento acadêmico do Booklog. A base foi estruturada de forma determinística, com variação de preferências entre leitores, livros e gêneros. A concentração de avaliações em alguns títulos permite investigar popularidade e esparsidade.

## Arquivos originais

### `raw/books.csv`

Catálogo com **36 livros**.

| Campo | Tipo | Descrição |
|---|---|---|
| `book_id` | texto | Identificador único do livro |
| `title` | texto | Título da obra |
| `author` | texto | Nome do autor |
| `genres` | texto | Gênero principal |

### `raw/ratings.csv`

Tabela com **345 avaliações**.

| Campo | Tipo | Descrição |
|---|---|---|
| `user_id` | texto | Identificador do leitor, de `U001` a `U030` |
| `book_id` | texto | Identificador do livro avaliado |
| `rating` | número | Nota entre 1 e 5, em intervalos de 0,5 |
| `interaction_date` | data | Data da interação no formato `AAAA-MM-DD` |

Cada linha representa uma avaliação de um livro por um leitor. Pares leitor–livro não observados permanecem desconhecidos e não são tratados como notas zero ou como desinteresse.

## Arquivos tratados

`processed/books_clean.csv` e `processed/ratings_clean.csv` são as versões validadas e ordenadas utilizadas na análise. A preparação:

- converte notas para tipo numérico;
- converte datas para tipo data;
- valida a escala de 1 a 5;
- verifica duplicidade de `book_id`;
- verifica repetição do par `user_id`–`book_id`;
- confirma que todos os livros avaliados existem no catálogo;
- remove linhas integralmente duplicadas;
- ordena os registros de forma determinística.

## Resumo da base

| Indicador | Resultado |
|---|---:|
| Leitores | 30 |
| Livros | 36 |
| Avaliações | 345 |
| Média das notas | 3,62 |
| Mediana das notas | 3,5 |
| Esparsidade | 68,1% |
| Valores ausentes | 0 |
| Pares leitor–livro duplicados | 0 |

## Privacidade e uso

Os códigos de leitores não possuem tabela pública de correspondência e o dataset não inclui nomes, e-mails, telefones, localização ou texto livre. O uso é acadêmico e limitado ao desenvolvimento e à avaliação do recomendador do Booklog.
