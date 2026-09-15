# Dataset da N1

O conjunto de dados representa o cenário de uma plataforma de leitura para investigação de recomendação personalizada de livros. Os leitores são identificados por códigos anonimizados e não são armazenados dados pessoais diretamente identificáveis.

## Estrutura do conjunto de dados

A base é organizada em três entidades principais:

- leitores: características gerais de perfil utilizadas como contexto de recomendação;
- livros: informações do catálogo disponível;
- interações: registros de comportamento entre leitores e livros.

## Arquivos originais

### `raw/readers.csv`

Perfil anonimizado dos leitores.

| Campo | Descrição |
|---|---|
| `reader_id` | Identificador único anonimizado |
| `age_range` | Faixa etária agrupada |
| `favorite_genre` | Gênero preferido informado |
| `reading_frequency` | Frequência de leitura |
| `preferred_format` | Formato preferido |
| `registration_date` | Data de cadastro |

### `raw/books.csv`

Catálogo de livros utilizado no experimento.

| Campo | Descrição |
|---|---|
| `book_id` | Identificador único da obra |
| `title` | Título do livro |
| `author` | Autor |
| `main_genre` | Gênero principal |
| `publication_year` | Ano de publicação |
| `pages` | Quantidade de páginas |
| `language` | Idioma |

### `raw/ratings.csv`

Interações leitor-livro.

| Campo | Descrição |
|---|---|
| `reader_id` | Leitor relacionado |
| `book_id` | Livro relacionado |
| `rating` | Nota atribuída |
| `interaction_type` | Tipo de interação |
| `interaction_date` | Data da interação |

Cada registro representa uma interação observada. A ausência de interação não representa nota zero ou rejeição.

## Dimensão da base

| Indicador | Quantidade |
|---|---:|
| Leitores | 150 |
| Livros | 200 |
| Interações | 3000 |

## Preparação dos dados

A etapa de preparação contempla:

- validação dos tipos dos atributos;
- tratamento de valores ausentes;
- verificação de duplicidades;
- validação da escala de notas;
- integridade entre leitores, livros e interações;
- geração dos arquivos processados utilizados na análise exploratória.

## Relação com o projeto de IA

A estrutura permite investigar padrões de preferência entre leitores e livros e prepara o conjunto para futuras abordagens de recomendação personalizada, incluindo métodos baseados em conteúdo, filtragem colaborativa ou modelos híbridos.

## Privacidade e uso

Os identificadores utilizados não possuem associação pública com pessoas reais. Não são armazenados nomes, e-mails, telefones ou informações sensíveis. O uso é exclusivamente acadêmico no contexto do Booklog AI.