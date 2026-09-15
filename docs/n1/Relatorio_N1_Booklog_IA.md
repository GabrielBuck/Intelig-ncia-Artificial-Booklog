# Sistema de recomendação personalizada de livros para o Booklog

**Gabriel Nottoli Buck** - RA 10425384 - 10425384@mackenzista.com.br  
**Julia Andrade** - RA 10427828 - 10427828@mackenzista.com.br  
**João Vitor Rocha Miranda** - RA 10427273 - 10427273@mackenzista.com.br

Professor: Prof. Dr. Leandro Zerbinatti  
Disciplina: Inteligência Artificial - 7ºK  
Universidade Presbiteriana Mackenzie - FCI

## Resumo

Neste trabalho, propomos um sistema de recomendação personalizada de livros para o Booklog, plataforma desenvolvida pelo nosso grupo como Trabalho de Conclusão de Curso. O problema parte da dificuldade de encontrar leituras relevantes em catálogos amplos quando rankings gerais não representam as preferências individuais dos leitores. Nosso objetivo é desenvolver e avaliar uma abordagem capaz de estimar a afinidade entre usuários e livros. Escolhemos a opção Framework e utilizaremos Python e ferramentas compatíveis com o conteúdo da disciplina. Para a N1, utilizamos um conjunto hipotético autorizado pelo professor, com 30 leitores, 36 livros e 345 avaliações. A análise exploratória identificou nota média de 3,62, mediana de 3,5, ausência de valores faltantes ou pares duplicados e esparsidade de 68,1% na matriz usuário x livro. Na N2, compararemos um baseline não personalizado com ao menos uma abordagem personalizada, usando métricas adequadas à tarefa. Também consideraremos privacidade, viés de popularidade, diversidade e explicabilidade.

**Palavras-chave:** sistemas de recomendação; inteligência artificial; aprendizado de máquina; livros; personalização.

## Abstract

In this work, we propose a personalized book recommendation system for Booklog, a platform developed by our group as an undergraduate final project. The problem arises from the difficulty of finding relevant books in large catalogs when general rankings do not represent individual reader preferences. Our goal is to develop and evaluate an approach capable of estimating the affinity between users and books. We selected the Framework option and will use Python and tools compatible with the course content. For N1, we used a hypothetical dataset authorized by the professor, with 30 readers, 36 books, and 345 ratings. The exploratory analysis found a mean rating of 3.62, a median of 3.5, no missing values or duplicated user-book pairs, and 68.1% sparsity in the user-book matrix. In N2, we will compare a non-personalized baseline with at least one personalized approach using metrics appropriate to the task. We will also consider privacy, popularity bias, diversity, and explainability.

**Keywords:** recommender systems; artificial intelligence; machine learning; books; personalization.

## 1. Introdução

### 1.1 Contextualização

O Booklog é uma plataforma de leitura desenvolvida pelo nosso grupo como Trabalho de Conclusão de Curso. O sistema reúne recursos de descoberta e acompanhamento de livros, como avaliações, resenhas, listas e clubes de leitura. Para a disciplina de Inteligência Artificial, escolhemos desenvolver um módulo experimental de recomendação personalizada ligado a esse contexto.

### 1.2 Justificativa

Uma lista geral de livros populares não representa necessariamente o interesse de cada leitor. A personalização pode tornar a descoberta de livros mais relevante ao considerar preferências e interações anteriores. O tema também é aderente à disciplina, pois permite aplicar aprendizado de máquina a um problema real e mensurável.

### 1.3 Objetivo

Nosso objetivo geral é desenvolver e avaliar uma abordagem de recomendação personalizada de livros para o Booklog. Para isso, vamos analisar e preparar os dados, construir um baseline não personalizado, testar uma abordagem personalizada e comparar os resultados com métricas adequadas.

### 1.4 Opção do projeto

Escolhemos a opção Framework. A implementação será feita em Python, com prioridade para ferramentas trabalhadas na disciplina, como Scikit-learn. A escolha do algoritmo final dependerá da estrutura e da qualidade do dataset.

## 2. Referencial Teórico

Sistemas de recomendação organizam itens de acordo com a preferência estimada de um usuário. Entre as abordagens mais comuns estão filtragem colaborativa, recomendação baseada em conteúdo e métodos híbridos (AGGARWAL, 2016). Neste projeto, a técnica será escolhida de acordo com a estrutura da base e com os conteúdos trabalhados na disciplina.

O uso de aprendizado de máquina exige separação clara entre preparação, treinamento e avaliação, além de métricas compatíveis com o tipo de problema (GÉRON, 2019). Esses princípios orientarão os experimentos da N2.

## 3. Descrição do Problema

Queremos estimar quais livros têm maior afinidade com cada usuário. A entrada poderá combinar identificadores de usuários e livros, avaliações e metadados como autor e gênero. A saída será um score ou ranking de livros ainda não avaliados pelo usuário. Como referência, usaremos um baseline simples para verificar se a personalização acrescenta valor.

## 4. Aspectos Éticos do Uso da IA e Responsabilidade

Os dados desta N1 são hipotéticos e não contêm informações pessoais. Em uma aplicação real, utilizaremos apenas os dados necessários ao experimento e removeremos identificadores pessoais antes de qualquer publicação. Também trataremos a recomendação como uma estimativa, e não como uma certeza sobre o gosto do leitor.

Durante a avaliação, observaremos possíveis efeitos de viés de popularidade, baixa diversidade e concentração das recomendações em poucos livros ou gêneros. Transparência, privacidade, explicabilidade e responsabilização são princípios relevantes para o uso responsável de IA (ALMEIDA; NAS, 2024).

## 5. Dataset

### 5.1 Origem e estrutura dos dados

Para a N1, utilizamos um conjunto de dados hipotético autorizado pelo professor para representar de forma coerente o problema de recomendação. A base não contém usuários reais nem dados pessoais. Os livros formam um catálogo controlado e as avaliações foram construídas para representar preferências variadas entre leitores e gêneros.

A base contém 30 leitores hipotéticos, 36 livros e 345 avaliações. As interações possuem `user_id`, `book_id`, `rating` e `interaction_date`. O catálogo possui `book_id`, `title`, `author` e `genres`. Os identificadores de usuários são pseudônimos no formato U001 a U030. As notas variam de 1 a 5 em intervalos de 0,5.

### 5.2 Análise exploratória e preparação dos dados

A análise exploratória foi realizada em Python. Verificamos quantidade de registros, usuários e livros, valores ausentes, duplicidades, distribuição das notas, interações por usuário e por livro, gêneros e esparsidade. A base apresentou nota média de 3,62 e mediana de 3,5. Não foram encontrados valores ausentes, `book_id` duplicados ou pares usuário-livro repetidos. Cada leitor possui entre 9 e 15 avaliações, e a matriz usuário x livro apresenta 68,1% de esparsidade.

A preparação consistiu na validação dos tipos, escala de notas, chaves, duplicidades e ordenação dos dados. As etapas estão registradas no notebook do projeto.

## 6. Metodologia e Resultados Esperados

### 6.1 Metodologia

Nossa pesquisa é aplicada, quantitativa e experimental. Primeiro, analisamos e preparamos o dataset. Na N2, construiremos um baseline não personalizado e selecionaremos uma abordagem personalizada compatível com os dados. Se a tarefa for formulada como previsão de nota, consideraremos MAE ou RMSE; para classificação, precisão, recall e F1; para ranking, Precision@K e Recall@K.

### 6.2 Resultados esperados

Na N1, obtivemos uma base hipotética organizada e adequada para o experimento. Na N2, esperamos produzir um ranking personalizado e comparar seu desempenho com um baseline não personalizado. Não definimos previamente um valor mínimo de desempenho. Consideraremos o experimento válido se conseguirmos medir o comportamento das abordagens de forma consistente e registrar suas limitações.

## 7. Referências

AGGARWAL, Charu C. *Recommender Systems: The Textbook*. Cham: Springer, 2016. DOI: 10.1007/978-3-319-29659-3.

ALMEIDA, Virgílio; NAS, Elen. Desafios da IA responsável na pesquisa científica. *Revista USP*, São Paulo, n. 141, p. 17-28, abr./maio/jun. 2024.

GÉRON, Aurélien. *Hands-On Machine Learning with Scikit-Learn and TensorFlow: Concepts, Tools, and Techniques to Build Intelligent Systems*. 2. ed. Sebastopol: O'Reilly, 2019.
