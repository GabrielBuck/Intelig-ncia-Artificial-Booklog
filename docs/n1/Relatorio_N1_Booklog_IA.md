# Sistema de recomendação personalizada de livros para o Booklog

**Gabriel Nottoli Buck** — RA 10425384 — 10425384@mackenzista.com.br

**Julia Andrade** — RA 10427828 — 10427828@mackenzista.com.br

**João Vitor Rocha Miranda** — RA 10427273 — 10427273@mackenzista.com.br

**Juan Nacif** — RA 10428509 — 10428509@mackenzista.com.br

**Professor:** Prof. Dr. Leandro Zerbinatti

**Disciplina:** Inteligência Artificial — 7ºK

**Instituição:** Universidade Presbiteriana Mackenzie — Faculdade de Computação e Informática

**Semestre:** 2026/2

## Resumo

Este trabalho apresenta a proposta de um sistema de recomendação personalizada de livros para o Booklog, plataforma de descoberta e acompanhamento de leituras desenvolvida pelo grupo como Trabalho de Conclusão de Curso. O problema investigado é a dificuldade de localizar obras relevantes em catálogos amplos quando rankings gerais não representam as preferências individuais dos leitores. O objetivo é desenvolver e avaliar uma abordagem capaz de estimar afinidade e ordenar livros para cada leitor. O projeto segue a opção Framework e utiliza Python, Pandas e Matplotlib na análise exploratória e na preparação dos dados. O conjunto elaborado pelo grupo e autorizado para a atividade reúne 30 leitores, 36 livros e 345 avaliações. A análise identificou média de 3,62, mediana de 3,5, ausência de valores faltantes e duplicidades, além de esparsidade de 68,1% na matriz leitor × livro. Esses resultados confirmam a integridade estrutural das tabelas de livros e avaliações analisadas e orientam o protocolo experimental. Na N2, um baseline não personalizado será comparado com uma abordagem personalizada por meio de métricas adequadas à tarefa. O desenvolvimento também considera privacidade, viés de popularidade, diversidade, cold start, transparência e explicabilidade.

**Palavras-chave:** sistemas de recomendação; inteligência artificial; aprendizado de máquina; livros; personalização.

## Abstract

This paper presents a personalized book recommendation system for Booklog, a reading discovery and tracking platform developed by the group as an undergraduate final project. The investigated problem is the difficulty of finding relevant works in large catalogs when global rankings do not represent readers' individual preferences. The goal is to develop and evaluate an approach capable of estimating affinity and ranking books for each reader. The project follows the Framework option and uses Python, Pandas, and Matplotlib for exploratory analysis and data preparation. The dataset prepared by the group and authorized for the assignment contains 30 readers, 36 books, and 345 ratings. The analysis found a mean rating of 3.62, a median of 3.5, no missing values or duplicates, and 68.1% sparsity in the reader–book matrix. These results confirm the structural integrity of the analyzed book and rating tables and guide the experimental protocol. In N2, a non-personalized baseline will be compared with a personalized approach using metrics appropriate to the selected task. The development also considers privacy, popularity bias, diversity, cold start, transparency, and explainability.

**Keywords:** recommender systems; artificial intelligence; machine learning; books; personalization.

## 1. Introdução

### 1.1 Contextualização

O Booklog é uma plataforma de leitura desenvolvida pelo grupo como Trabalho de Conclusão de Curso. O sistema reúne recursos de descoberta e acompanhamento de livros, como avaliações, resenhas, diário de leitura, listas e clubes de leitura. Para a disciplina de Inteligência Artificial, o recomendador constitui um módulo experimental associado a esse contexto.

Sistemas de recomendação auxiliam leitores a localizar itens relevantes em catálogos extensos. Eles utilizam informações sobre leitores, itens ou interações anteriores para estimar preferências e organizar resultados (AGGARWAL, 2016).

### 1.2 Justificativa

Uma lista geral de livros populares não representa necessariamente o interesse de cada leitor. A personalização pode tornar a descoberta de obras mais relevante ao considerar avaliações e características dos livros. O problema é real, mensurável e compatível com a aplicação de aprendizado de máquina prevista na disciplina.

### 1.3 Objetivos

O objetivo geral é desenvolver e avaliar uma abordagem de recomendação personalizada de livros para o Booklog.

Os objetivos específicos são:

- analisar e preparar o dataset;
- construir um baseline não personalizado;
- implementar uma abordagem personalizada adequada à base;
- comparar as abordagens com métricas compatíveis com a tarefa;
- registrar limitações técnicas e éticas do experimento.

### 1.4 Pergunta de pesquisa

Como técnicas de Inteligência Artificial podem utilizar dados de livros e preferências de leitores para gerar recomendações personalizadas no contexto do Booklog?

### 1.5 Opção do projeto

O projeto segue a opção **Framework**. A implementação utiliza Python e prioriza ferramentas compatíveis com o conteúdo da disciplina. A técnica final será definida conforme a estrutura da base e o protocolo experimental da N2.

## 2. Referencial Teórico

Sistemas de recomendação estimam a utilidade de itens para leitores e produzem listas ordenadas. As famílias mais comuns incluem filtragem colaborativa, recomendação baseada em conteúdo e métodos híbridos. A filtragem colaborativa explora padrões de interação entre leitores e livros; a recomendação baseada em conteúdo utiliza atributos dos itens, como autor e gênero; métodos híbridos combinam sinais para reduzir limitações específicas (AGGARWAL, 2016).

Em aprendizado de máquina, a preparação deve ser separada do treinamento e da avaliação para evitar vazamento de dados. A escolha das métricas também precisa acompanhar a formulação do problema: erros de previsão de nota, classificação de interesse e qualidade de ranking representam objetivos diferentes (GÉRON, 2019).

A responsabilidade no uso de IA envolve transparência, interpretabilidade, privacidade, análise de vieses e definição de responsabilidades durante o desenvolvimento e a aplicação do sistema (ALMEIDA; NAS, 2024).

## 3. Descrição do Problema

O sistema deve estimar quais livros apresentam maior afinidade com cada leitor. As entradas disponíveis são identificadores de leitores e livros, avaliações, datas de interação e metadados de título, autor e gênero. A saída será um score de preferência ou um ranking de títulos não avaliados pelo leitor.

O experimento comparará uma estratégia personalizada com um baseline global. Essa comparação permite verificar objetivamente se a personalização acrescenta valor em relação a uma lista igual para todos. Livros sem avaliação são tratados como desconhecidos, não como exemplos negativos.

## 4. Aspectos Éticos do Uso da IA e Responsabilidade

O dataset publicado utiliza identificadores de leitores sem associação com nomes, e-mails ou contatos. Uma aplicação integrada ao Booklog deverá manter minimização dos dados, controle de acesso, finalidade explícita e revisão das saídas antes de qualquer publicação.

O viés de popularidade pode ampliar a exposição de livros já conhecidos. A concentração em poucos gêneros ou autores pode reduzir diversidade e criar bolhas de filtro. O cold start dificulta recomendações para leitores e livros sem histórico. Esses riscos serão observados na escolha do baseline, na avaliação da cobertura e na análise das listas recomendadas.

As recomendações devem ser apresentadas como estimativas algorítmicas. A comunicação não deve afirmar que a IA conhece o gosto do leitor. Explicações futuras precisam refletir os sinais realmente utilizados pelo modelo. Transparência, auditabilidade e responsabilização orientam as decisões técnicas do projeto (ALMEIDA; NAS, 2024).

## 5. Dataset

### 5.1 Origem e estrutura

O conjunto de dados foi elaborado pelo grupo e autorizado para a atividade. O catálogo reúne 36 livros de seis gêneros. A tabela de interações contém 345 avaliações atribuídas por 30 leitores identificados de `U001` a `U030`.

Cada interação possui `user_id`, `book_id`, `rating` e `interaction_date`. O catálogo possui `book_id`, `title`, `author` e `genres`. As notas variam de 1 a 5 em intervalos de 0,5. A unidade de análise é o par leitor–livro avaliado.

O arquivo auxiliar `data/raw/readers.csv` contém apenas cinco perfis e não integra a análise atual. Os 30 leitores correspondem aos identificadores distintos nas avaliações. A expansão sintética mencionada no gerador não está incorporada aos CSVs analisados; seus números não constituem resultados desta N1. A base foi elaborada para a atividade acadêmica e não é uma exportação de comportamento real do Booklog.

### 5.2 Análise exploratória

A análise exploratória verificou quantidade de registros, leitores e livros, valores ausentes, duplicidades, distribuição das notas, interações por leitor e por livro, avaliações por gênero e esparsidade.

| Indicador | Resultado |
|---|---:|
| Leitores | 30 |
| Livros | 36 |
| Avaliações | 345 |
| Média das notas | 3,62 |
| Mediana das notas | 3,5 |
| Valores ausentes | 0 |
| Pares leitor–livro duplicados | 0 |
| Avaliações por leitor | 9 a 15 |
| Esparsidade da matriz leitor × livro | 68,1% |

A matriz possui 1.080 combinações possíveis entre leitores e livros, das quais 345 são observadas. As 735 combinações restantes não possuem nota. A esparsidade indica que a avaliação dos modelos deve considerar a quantidade limitada de interações por leitor e não interpretar ausências como rejeição.

### 5.3 Preparação

A preparação converteu notas e datas para os tipos apropriados, validou a escala de 1 a 5, verificou duplicidades, confirmou a integridade referencial entre avaliações e catálogo, removeu cópias integrais e ordenou os registros. Os arquivos resultantes são `books_clean.csv` e `ratings_clean.csv`, em `data/processed/`. A integridade referencial verificada limita-se à relação entre avaliações e catálogo, sem atestar a cobertura dos perfis auxiliares.

## 6. Metodologia e Resultados Esperados

### 6.1 Metodologia

A pesquisa é aplicada, quantitativa e experimental. A N1 compreende preparação e análise exploratória. Na N2, será construído um baseline não personalizado e selecionada uma abordagem personalizada compatível com os dados.

O protocolo separará dados de treino e teste sem repetir o mesmo par leitor–livro nos dois conjuntos. Estatísticas e transformações destinadas ao modelo serão ajustadas apenas no treino. A seleção de hiperparâmetros não utilizará o conjunto de teste.

Se a tarefa for previsão de nota, serão utilizadas MAE ou RMSE. Para classificação de interesse, serão consideradas precisão, recall e F1. Para avaliação direta de ranking, serão consideradas Precision@K e Recall@K. Somente as métricas coerentes com a formulação escolhida integrarão a comparação final.

### 6.2 Resultados esperados

Espera-se produzir um ranking personalizado e compará-lo com o baseline sob o mesmo protocolo. A hipótese de trabalho é que a personalização organize itens de maneira mais compatível com as preferências registradas. O experimento também deverá revelar limitações relacionadas à esparsidade, ao cold start e à diversidade. Não é estabelecido previamente um resultado mínimo, e uma ausência de melhora sobre o baseline será reportada como resultado válido.

## 7. Resultados Parciais e Discussão

A N1 entregou tabelas de livros e avaliações estruturalmente íntegras, um processo reprodutível de preparação e uma análise exploratória executável. A ausência de valores faltantes e de duplicidades reduz a necessidade de correções antes da modelagem. A esparsidade de 68,1% confirma que a maior parte das relações leitor–livro não foi observada, condição relevante para a seleção da técnica.

Os resultados desta etapa descrevem apenas o dataset. Eles não demonstram desempenho preditivo nem superioridade de uma abordagem personalizada. Essas conclusões dependem dos experimentos controlados da N2.

## 8. Referências

AGGARWAL, Charu C. *Recommender systems: the textbook*. Cham: Springer, 2016. DOI: https://doi.org/10.1007/978-3-319-29659-3.

ALMEIDA, Virgílio; NAS, Elen. Desafios da IA responsável na pesquisa científica. *Revista USP*, São Paulo, n. 141, p. 17–28, 2024. DOI: https://doi.org/10.11606/issn.2316-9036.i141p17-28.

GÉRON, Aurélien. *Hands-on machine learning with Scikit-Learn, Keras, and TensorFlow: concepts, tools, and techniques to build intelligent systems*. 2. ed. Sebastopol: O’Reilly Media, 2019.
