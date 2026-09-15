# Dataset da N1

Para esta entrega, utilizamos um **conjunto de dados hipotético**, autorizado pelo professor para representar de forma coerente o problema de recomendação de livros.

Os dados não correspondem a usuários reais. Os identificadores `U001` a `U030` representam leitores hipotéticos.

## Arquivos

### `raw/books.csv`

Catálogo com **36 livros**.

| Campo | Descrição |
|---|---|
| `book_id` | Identificador do livro |
| `title` | Título |
| `author` | Autor |
| `genres` | Gênero principal |

### `raw/ratings.csv`

Conjunto com **345 avaliações hipotéticas**.

| Campo | Descrição |
|---|---|
| `user_id` | Identificador anônimo do leitor hipotético |
| `book_id` | Identificador do livro |
| `rating` | Nota entre 1 e 5, em intervalos de 0,5 |
| `interaction_date` | Data hipotética da interação |

### `processed/`

Contém a versão validada e ordenada utilizada pela análise exploratória.

## Construção

O levantamento foi produzido de forma determinística para fins acadêmicos. Cada leitor possui preferências diferentes por gêneros, e as notas foram geradas de modo a manter variação entre usuários, livros e categorias. Alguns livros também apresentam maior frequência de avaliações para representar a concentração comum em catálogos de leitura.

O objetivo não é afirmar comportamento real dos usuários do Booklog, mas criar um cenário coerente para desenvolver e avaliar a metodologia da disciplina.

## Resumo

- usuários: **30**
- livros: **36**
- avaliações: **345**
- nota média: **3,62**
- mediana: **3,5**
- esparsidade: **68,1%**
- valores ausentes: **0**
- pares usuário-livro duplicados: **0**

A geração utiliza semente fixa (`42`), permitindo reprodução do mesmo cenário.
