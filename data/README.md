# Dataset — contrato proposto, versão 1

**Coleta real ainda não disponibilizada.** Este contrato descreve o formato esperado. Confirmar escala e unidade de observação antes de coletar; alterações exigem atualizar documentação e código juntos.

## Coleta original proposta

Coletar voluntariamente avaliações de livros efetivamente lidos, por formulário ou pelo Booklog. Não pedir notas para obras desconhecidas. Permitir busca por título/autor e inclusão de obras fora do catálogo reduz indução ao gosto do grupo. Registrar vieses do catálogo e do recrutamento por conveniência.

Antes da coleta, documentar: responsável, instrumento e versão, período, recrutamento, público, critérios de inclusão, escala, desistências, deduplicação de participantes, origem/licença dos metadados e condições comunicadas de uso/publicação. Não há tamanho amostral garantido. Avaliar suficiência e sobreposição entre leitores após a coleta.

Explicar finalidade acadêmica e possível publicação de uma versão revisada. Não coletar nomes, e-mails, telefones, localização precisa ou resenhas livres nesta primeira base. Gerar `user_id` aleatório, sem derivá-lo de e-mail/RA/telefone; eventual correspondência fica privada, fora do repositório. Pseudonimização isolada não garante anonimato.

## Formato

CSV UTF-8, vírgula como separador, cabeçalho, ponto decimal e campos com vírgulas entre aspas. Identificadores são textos, preservando zeros iniciais. Somente as colunas abaixo são aceitas; extras bloqueiam a carga. Isso não detecta dados pessoais dentro de campos permitidos: revisão humana é necessária.

### `ratings.csv`

Unidade: uma avaliação explícita vigente por par usuário–livro no recorte da coleta.

| Campo | Tipo | Regra |
|---|---|---|
| `user_id` | texto | Obrigatório, pseudônimo aleatório |
| `book_id` | texto | Obrigatório, presente no catálogo |
| `rating` | número | Proposta: 1 a 5, aceitando frações; zero não representa ausência |
| `interaction_date` | data | Coluna obrigatória, valor pode estar vazio se desconhecido; quando presente: `AAAA-MM-DD` |

Não inventar datas. Definir se representam registro de avaliação; não equivalem à conclusão de leitura. Datas de aplicação do formulário não são uma sequência histórica de consumo. Datas futuras são rejeitadas conforme a data de execução. Avaliar necessidade e risco de publicação; datas omitidas não são imputadas.

Livros não avaliados são **desconhecidos**, não exemplos negativos. Não fabricar pares usuário–livro ou preencher notas ausentes com zero.

### `books.csv`

Unidade: item do catálogo, com política de obra/edição documentada antes da coleta.

| Campo | Tipo | Regra |
|---|---|---|
| `book_id` | texto | Obrigatório e único após remover cópias idênticas |
| `title` | texto | Obrigatório |
| `author` | texto | Pode estar ausente; múltiplos autores separados por `|` |
| `genres` | texto | Pode estar ausente; gêneros separados por `|`, sem elementos vazios |
| `description` | texto | Pode estar ausente; não é requisito da N1 |

Metadados de API complementam a coleta, mas não são interações originais. Registrar fonte, data de obtenção e condições de reutilização antes de publicar textos. Não unir edições automaticamente pelo título.

## Preparação implementada

- Remover espaços externos e converter campos vazios em ausências.
- Auditar ausências e cópias após normalização, antes de validar conteúdo.
- Bloquear colunas faltantes/extras, chaves/títulos ausentes, notas inválidas, datas inválidas/futuras e livros inexistentes nas avaliações.
- Remover somente linhas inteiramente idênticas após normalização, registrando contagens.
- Bloquear identificadores de livro conflitantes e pares usuário–livro repetidos com notas/datas diferentes; resolver na fonte, sem escolher arbitrariamente a última nota.
- Preservar ausências opcionais; não inventar textos, gêneros ou datas, nem ajustar transformações de aprendizado nesta EDA.

## Publicação e rastreabilidade

`raw` é um recorte original **já revisado para uso acadêmico**, não exportação irrestrita de produção. Registrar a origem real e revisar reidentificação, datas e direitos dos metadados antes de publicar. Conferir também notebook executado, figuras e tabelas por usuário.

Dados e saídas são ignorados por padrão. Após revisar a versão pública, acrescentar exceções no `.gitignore` para os arquivos aprovados e versionar os CSVs, proveniência, notebook executado e resultados selecionados. `.gitignore` não protege arquivos já versionados. Se não puder publicar dados, acordar alternativa com o professor; não afirmar que o requisito foi cumprido.

O manifesto técnico registra SHA-256 das entradas/saídas, versões e remoções; não substitui a proveniência da coleta. Não há CSV sintético em `data/`; exemplos em `tests/` verificam somente o código.
