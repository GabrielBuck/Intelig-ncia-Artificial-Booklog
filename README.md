# Sistema de Recomendação Personalizada de Livros para o Booklog

Projeto da disciplina **Inteligência Artificial - 7ºK**, da Faculdade de Computação e Informática da Universidade Presbiteriana Mackenzie.

## Integrantes

| Integrante | RA | E-mail |
|---|---:|---|
| Gabriel Nottoli Buck | 10425384 | 10425384@mackenzista.com.br |
| Julia Andrade | 10427828 | 10427828@mackenzista.com.br |
| João Vitor Rocha Miranda | 10427273 | 10427273@mackenzista.com.br |

Professor: **Prof. Dr. Leandro Zerbinatti**

## Objetivo

Desenvolver e avaliar uma abordagem de recomendação personalizada de livros para o Booklog, comparando uma estratégia personalizada com um baseline não personalizado.

**Opção do projeto:** Framework.

## N1

Nesta etapa, organizamos um conjunto de dados hipotético autorizado para a atividade, realizamos a análise exploratória e preparamos a base para os experimentos da N2.

O conjunto contém:

- **30 leitores hipotéticos**;
- **36 livros**;
- **345 avaliações** em escala de 1 a 5;
- identificadores de usuários anonimizados;
- metadados de título, autor e gênero.

Os dados são explicitamente identificados como **hipotéticos** e foram construídos apenas para fins acadêmicos. Nenhum usuário real é representado.

## Principais resultados da análise exploratória

- média das avaliações: **3,62**;
- mediana: **3,5**;
- valores ausentes: **0**;
- pares usuário-livro duplicados: **0**;
- esparsidade da matriz usuário x livro: **68,1%**;
- cada leitor possui entre **9 e 15 avaliações**.

A esparsidade confirma que a maior parte das combinações possíveis entre leitores e livros não possui avaliação, característica esperada em um problema de recomendação.

## Estrutura

```text
.
├── data/
│   ├── README.md
│   ├── raw/
│   │   ├── books.csv
│   │   └── ratings.csv
│   └── processed/
│       ├── books_clean.csv
│       └── ratings_clean.csv
├── docs/
│   └── n1/
│       └── Relatorio_N1_Booklog_IA.pdf
├── notebooks/
│   └── 01_analise_exploratoria.ipynb
├── src/
│   └── analise_exploratoria.py
├── .gitignore
├── requirements.txt
└── README.md
```

## Execução

```bash
python -m venv .venv
source .venv/bin/activate      # Linux/macOS
# .venv\Scripts\Activate.ps1  # Windows PowerShell

pip install -r requirements.txt
jupyter notebook notebooks/01_analise_exploratoria.ipynb
```

Também é possível executar a análise pela linha de comando:

```bash
python src/analise_exploratoria.py
```

## Ética e responsabilidade

Os dados desta N1 são hipotéticos e não contêm informações pessoais. Em uma aplicação real do Booklog, o projeto prevê minimização de dados, anonimização dos identificadores, transparência sobre o caráter estimado das recomendações e análise de possíveis vieses de popularidade e baixa diversidade.

## Próxima etapa

Na N2, a base será utilizada para implementar um baseline e ao menos uma abordagem personalizada. A técnica final será escolhida conforme a adequação aos dados e ao conteúdo trabalhado na disciplina.
