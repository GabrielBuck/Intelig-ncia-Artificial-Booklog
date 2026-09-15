# Protocolo experimental proposto

**Proposta: sem modelo implementado nem desempenho medido.** O núcleo estimará afinidade e ordenará livros; não será apenas uma solicitação de recomendações a um LLM.

## Decisões após a EDA

| Evidência | Caminho a considerar | Limitação |
|---|---|---|
| Notas explícitas e histórico suficiente | Regressão; MAE inicial, RMSE se útil | Erro de nota não demonstra qualidade de Top-N; escala ordenada e subjetiva |
| Rótulos explícitos ou limiar justificado | Classificação; precisão, recall/F1 conforme custos | Não avaliado não é desinteresse; discretização perde informação |
| Metadados consistentes, pouco histórico compartilhado | Baseado em conteúdo | Depende de cobertura/qualidade dos atributos |
| Sobreposição suficiente entre leitores | Filtragem colaborativa | Esparsidade e novos usuários/livros limitam aplicação |

Selecionar pela adequação. Se faltarem dados, ampliar a coleta ou restringir a conclusão à viabilidade. TF-IDF na N2 depende de textos utilizáveis e das aulas de PLN. Redes neurais, embeddings e métodos híbridos não são compromissos.

## Comparação planejada

Uma referência global poderá ordenar por quantidade de avaliações no **treino**, com desempate por identificador. Popularidade por avaliações não é venda. Ranking por média requer discutir suporte mínimo/suavização antes do teste. Para regressão, média global de treino é uma referência simples de nota; baseline de nota e baseline de ranking respondem a tarefas diferentes.

O modelo personalizado usará sinais do leitor e livro disponíveis no momento da recomendação. Não tratar identificadores numéricos como medidas contínuas de gosto.

## Separação e vazamento

Para leitores conhecidos, reservar interações por usuário, mantendo histórico no treino e impedindo que o mesmo par usuário–livro apareça nos dois conjuntos. Corte temporal só se as datas representarem sequência real adequada; data de formulário não é histórico de consumo. Em divisão aleatória, fixar semente, persistir a divisão e declarar que não simula previsão futura.

Não forçar divisão de usuários com uma interação; reportar elegibilidade/exclusões. Estudar novos usuários separadamente se viável. Ajustar médias, perfis, transformações e vetorizadores destinados ao modelo somente no treino de cada divisão. Nunca usar a nota-alvo para construir o próprio perfil. Não selecionar atributos/hiperparâmetros pelo teste; reservar validação quando possível. O protocolo segue as orientações de prevenção de vazamento do Scikit-learn (SCIKIT-LEARN DEVELOPERS, s.d.a).

## Avaliação

MAE/RMSE avaliam notas; classificação exige definir rótulos. ROC-AUC requer escores e ambas as classes, não somente decisões binárias. Conferir definições antes de implementar (SCIKIT-LEARN DEVELOPERS, s.d.b).

Para sustentar melhora de recomendações, planejar avaliação de ranking: fixar K, relevância, candidatos e exclusão de livros observados no treino; aplicar as mesmas regras ao baseline/modelo. Recall@K poderá ser inicial. Avaliações observadas não fornecem relevância completa do catálogo: pares não observados continuam desconhecidos e métricas offline terão viés de exposição. Documentar eventual amostragem de candidatos. Não prometer todas as métricas possíveis.

Reportar usuários elegíveis, dispersão por usuário e limitações, além da média. Investigar exposição à popularidade e diversidade de autores/gêneros quando os atributos permitirem.

## Cold start e transparência

Estudar lista global transparente ou seleção inicial de livros/gêneros para leitores novos. Metadados poderão apoiar livros novos caso uma abordagem de conteúdo seja implementada. Uma futura explicação precisa refletir os sinais usados: “o modelo estima afinidade”, sem certeza ou inferências sensíveis. Esses fluxos ainda não estão implementados.

## Referências técnicas citadas

SCIKIT-LEARN DEVELOPERS. **Common pitfalls and recommended practices**. [S. l.], [s.d.a]. Disponível em: https://scikit-learn.org/stable/common_pitfalls.html. Acesso em: 15 set. 2026.

SCIKIT-LEARN DEVELOPERS. **Metrics and scoring: quantifying the quality of predictions**. [S. l.], [s.d.b]. Disponível em: https://scikit-learn.org/stable/modules/model_evaluation.html. Acesso em: 15 set. 2026.

Fontes técnicas do protocolo; não substituem o referencial acadêmico ainda a selecionar.
