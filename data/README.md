# Dataset da N1

Base elaborada pelo grupo para a atividade acadêmica de recomendação de livros. Os identificadores não possuem associação pública com pessoas reais. Os dados não devem ser apresentados como comportamento real coletado do Booklog.

## Arquivos publicados

| Arquivo | Linhas | Campos |
|---|---:|---|
| `raw/books.csv` | 36 | `book_id`, `title`, `author`, `genres` |
| `raw/ratings.csv` | 345 | `user_id`, `book_id`, `rating`, `interaction_date` |
| `raw/readers.csv` | 5 | `reader_id`, `age_range`, `favorite_genre`, `reading_frequency`, `preferred_format`, `registration_date` |

`book_id` relaciona avaliações ao catálogo. `user_id` identifica os 30 leitores distintos das avaliações, de U001 a U030. `rating` contém notas de 1 a 5 em intervalos de 0,5; `interaction_date` registra a data. O catálogo contém título, autor e gênero.

O arquivo de perfis contém somente U001 a U005 e não participa da análise atual. Seus campos descrevem faixa etária, gênero favorito, frequência, formato preferido e data de cadastro. Não há um perfil completo para cada leitor avaliado.

## Resultados verificados

| Indicador | Resultado |
|---|---:|
| Leitores distintos nas avaliações | 30 |
| Livros | 36 |
| Avaliações | 345 |
| Média | 3,62 |
| Mediana | 3,5 |
| Pares leitor-livro duplicados | 0 |
| Valores ausentes nas tabelas analisadas | 0 |
| Avaliações por leitor | 9 a 15 |
| Esparsidade | 68,1% |

Das 1.080 combinações possíveis, 735 não possuem avaliação. Ausência de nota não significa rejeição.

## Preparação e reprodução

Execute `python src/analise_exploratoria.py` na raiz do projeto após instalar `requirements.txt`. O script valida notas, datas, duplicidades e referências ao catálogo, ordena registros e gera `processed/books_clean.csv` e `processed/ratings_clean.csv`. Não gera `readers_clean.csv` nem valida a cobertura dos perfis.

## Expansão experimental

O gerador `src/expandir_dataset_n1.py` é um protótipo sintético de 150 perfis, 200 livros fictícios e 3.000 registros. Os CSVs atuais não correspondem a essa expansão. O esquema gerado difere do usado pela análise, e a geração cíclica repete pares leitor-livro. Sua integração exige revisão, validação e atualização conjunta do notebook e do relatório. Não execute o protótipo sobre a base validada para reproduzir os resultados atuais.

## Limitações e uso

A base é pequena, elaborada para fins acadêmicos e não sustenta conclusões sobre o mercado editorial ou leitores reais. A N2 deverá comparar baseline e personalização com separação de treino e teste e métricas compatíveis com a tarefa.
