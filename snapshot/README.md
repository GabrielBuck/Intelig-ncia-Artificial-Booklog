# Cópia acadêmica dos provedores de recomendação

Esta pasta contém **somente** os arquivos do backend BookLog necessários para executar, offline, as estratégias *conteúdo*, *híbrido* e *grafo* sobre a base acadêmica da N1. Não é um espelho do backend e não é o código em produção.

- **Origem:** repositório privado `Bin4ryLibr4ry/booklog-backend`, commit `063583bbcf1d7a9718bd53867c714757e1950283`, consultado somente em leitura.
- **O que foi copiado:** 21 arquivos (provedores, funções de ranking, elegibilidade, tipos, normalização de metadados e os testes unitários originais desses módulos). A lista e os hashes estão em [`copied-files.json`](copied-files.json).
- **O que foi alterado:** apenas um cabeçalho acadêmico em comentário no topo de cada arquivo. O corpo é idêntico ao original; `python src/avaliacao_n2.py` e os testes Python verificam isso comparando o SHA-256 do conteúdo após o marcador `/* [fim do cabecalho academico] */`.
- **Nenhum ajuste de algoritmo** foi feito para melhorar métricas. Pesos e regras são os do commit de referência.
- **Fora da cópia:** controlador HTTP, serviço com banco/cache, repositórios PostgreSQL, autenticação, configuração, variáveis de ambiente e qualquer credencial.

## Arquivos próprios da N2

| Arquivo | Função |
|---|---|
| `academic/run-offline.ts` | Adaptador: converte o treino em itens de biblioteca, reproduz a coleta colaborativa limitada do serviço (20 livros, 25 leitores, 150 itens) e chama os provedores. |
| `package.json`, `package-lock.json` | Dependências mínimas com versões fixas (`@nestjs/common` só para o decorador `@Injectable`). |
| `tsconfig.json`, `jest.config.js` | Compilação e testes isolados. |

## Comandos (a partir da raiz do repositório)

```bash
npm --prefix snapshot ci
npm --prefix snapshot run build
npm --prefix snapshot test
```

`npm test` executa 4 suítes originais (39 testes): ranking, elegibilidade, similaridade entre livros e metadados. As 3 suítes restantes das 47 verificações citadas no relatório (serviço, visibilidade e integração HTTP) dependem do backend completo; o registro da execução está em [`../results/backend-selected-tests.json`](../results/backend-selected-tests.json).

## Mapa rápido para a apresentação

- Pesos do híbrido: `src/modules/recommendations/providers/recommendation-ranking.util.ts`, linhas 419 (coocorrência ×12), 425 (gênero ×56), 442 (autor ×64) e 492 (penalidade −35).
- Pesos do grafo: `src/modules/recommendations/providers/poc-recommendation.provider.ts`, linhas 211 (gênero) e 218 (autor).
