# N1 — organização da entrega

**Roteiro de trabalho, não relatório final.** Requisitos provenientes do contexto fornecido pelo grupo. O template original não foi incorporado; não declarar conformidade visual antes de aplicar e conferir o arquivo oficial.

## Aderência atual

| Exigência | Evidência / pendência |
|---|---|
| GitHub público | Repositório do projeto |
| Tema, objetivo e opção | README e protocolo metodológico |
| Integrantes e RAs | README e cabeçalhos dos fontes; e-mails não fornecidos |
| Dataset original e descrição | Contrato proposto; coleta/publicação pendentes |
| EDA e preparação Python | Notebook e módulo preparados; execução real pendente |
| Cabeçalho e histórico dos fontes | Incluídos no notebook, módulo e testes |
| Relatório | Ainda não escrito; roteiro abaixo |
| Referências | Fontes técnicas citadas no protocolo; revisão acadêmica pendente |

## Roteiro do relatório

Máximo de 20 páginas incluindo referências; resumo de 150 a 250 palavras. Adaptar ao template FCI sem perder as exigências da disciplina.

1. **Título e integrantes:** título do README, nomes, RAs corretos e e-mails fornecidos pelos autores.
2. **Resumo:** contexto, motivação, objetivo, justificativa, metodologia e resultados disponíveis. Declarar limitações; nunca apresentar expectativa como resultado observado.
3. **Introdução:** contexto Booklog, descoberta de livros, justificativa, objetivo, pergunta de pesquisa e opção Framework.
4. **Referencial teórico:** texto articulado do geral ao específico sobre recomendação e a família selecionada, apoiado em fontes realmente consultadas, sem lista de resumos.
5. **Descrição do problema:** entradas, saída, usuário-alvo, unidade usuário–livro, previsão versus ranking e escopo experimental.
6. **Ética e responsabilidade:** privacidade, reidentificação, popularidade, diversidade, bolhas, cold start, transparência, explicabilidade e independência de afiliados. Associar riscos às medidas da coleta e avaliação.
7. **Dataset, EDA e preparação:** origem real, instrumento, período, participantes/critérios, dicionário, ausências, duplicações, atividade, notas, gêneros, cobertura, concentração e esparsidade. Documentar transformações e limitações. Inserir números e gráficos somente após execução real.
8. **Metodologia e resultados esperados:** hipóteses, baseline, critérios de escolha de tarefa/modelo/métricas e prevenção de vazamento. A hipótese de melhora pode ser refutada.
9. **Resultados e discussão / considerações parciais:** na N1, achados reais da EDA e viabilidade; sem desempenho preditivo inventado.
10. **Referências:** somente fontes citadas, conforme ABNT NBR 6023 e template; não acrescentar bibliografia decorativa.

## Pendências para conclusão

- Confirmar protocolo, escala e unidade obra/edição; disponibilizar coleta original revisada e sua proveniência.
- Receber os e-mails dos autores.
- Executar e interpretar a EDA; avaliar volume e sobreposição para o experimento.
- Selecionar bibliografia pertinente, escrever e diagramar no template oficial.
- Publicar dados e resultados revisados e verificar links.

## Continuidade N2

Até 17/11/2026: fixar avaliação, implementar baseline e modelo justificado, medir resultados, discutir limites e concluir relatório. Acrescentar metodologia aplicada, resultados, conclusão, GitHub e vídeo. Em 24/11/2026: apresentação. Vídeo de até 5 minutos: integrantes, professor, disciplina, curso, instituição, problema, fundamentos de IA, solução, demonstração e repositório. Datas informadas pelo grupo.

## Verificação técnica da estrutura — 15/09/2026

Cinco testes de integridade passaram em Python 3.12.14, pandas 2.2.3, NumPy 2.3.5 e Matplotlib 3.10.8. O código das células foi executado sequencialmente em diretórios temporários nos cenários sem dados, com dados artificiais válidos e com nota inválida; `display` foi substituído por uma função sem interface nessa verificação. Foram conferidas exportações, bloqueio de entradas inválidas e ausência de saídas quando faltam dados. Esses exemplos não integram o dataset nem as saídas do notebook entregue.

A estrutura do notebook passou pela validação nbformat. A instalação de notebook 7.4.7 foi concluída, mas a execução pelo kernel Jupyter foi bloqueada pelas restrições locais de criação de sockets (Operation not permitted). Portanto a verificação sequencial do código não equivale à validação completa pelo kernel Jupyter. A instalação em ambiente virtual limpo também não foi verificada. Nenhuma dessas verificações constitui EDA real.
