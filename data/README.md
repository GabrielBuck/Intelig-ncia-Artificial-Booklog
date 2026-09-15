# Dataset da N1

O conjunto de dados representa o cenário de uma plataforma de leitura, com leitores, catálogo de livros e interações leitor-livro. Os identificadores são códigos sem associação pública com dados pessoais.

## Origem

A estrutura foi organizada pelo grupo para o experimento acadêmico do Booklog. A base foi preparada para permitir análise exploratória de comportamento de leitura, distribuição de avaliações, popularidade e esparsidade da matriz leitor × livro.

## Arquivos originais

### `raw/readers.csv`

Cadastro anonimizado de leitores.

| Campo | Descrição |
|---|---|
| `reader_id` | Identificador do leitor |
| `age_range` | Faixa etária agregada |
| `favorite_genre` | Gênero declarado como preferência |
| `reading_frequency` | Frequência de leitura |
| `preferred_format` | Formato preferido |
| `registration_date` | Data de cadastro |

### `raw/books.csv`

Catálogo de livros.

| Campo | Descrição |
|---|---|
| `book_id` | Identificador único do livro |
| `title` | Título da obra |
| `author` | Autor |
| `main_genre` | Gênero principal |
| `publication_year` | Ano de publicação |
| `pages` | Quantidade de páginas |
| `language` | Idioma |

### `raw/ratings.csv`

Interações entre leitores e livros.

| Campo | Descrição |
|---|---|
| `reader_id` | Identificador do leitor |
| `book_id` | Identificador do livro |
| `rating` | Nota entre 1 e 5 |
| `interaction_type` | Tipo de interação |
| `interaction_date` | Data da interação |

Cada registro representa uma interação observada. Ausência de interação não representa nota zero ou rejeição.

## Estrutura esperada da base

| Indicador | Quantidade |
|---|---:|
| Leitores | 150 |
| Livros | 200 |
| Interações | 3000 |

## Preparação dos dados

A etapa de preparação deve:

- validar tipos e colunas obrigatórias;
- verificar valores ausentes;
- remover duplicidades;
- validar notas dentro da escala permitida;
- confirmar integridade entre livros e avaliações;
- gerar arquivos processados utilizados na análise.

## Privacidade e uso

O dataset não utiliza nomes, e-mails, telefones ou outros identificadores pessoais. Os dados são utilizados exclusivamente para o desenvolvimento acadêmico do sistema de recomendação personalizada do Booklog.
