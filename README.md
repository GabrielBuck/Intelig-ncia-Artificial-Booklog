# Sistema de Recomendação Personalizada de Livros para o Booklog

Módulo experimental de Inteligência Artificial associado ao TCC Booklog, plataforma de descoberta e acompanhamento de leituras. Desenvolvimento independente do backend oficial; a integração definitiva não está definida.

**Etapa atual: estrutura inicial da N1. Sem dataset real disponibilizado, sem EDA empírica e sem modelo treinado. A entrega N1 ainda não está completa.**

## Identificação

Universidade Presbiteriana Mackenzie — Faculdade de Computação e Informática (FCI). Disciplina: Inteligência Artificial; turma: 7ºK SI – Noite; semestre: 2026/2. Professor: Prof. Dr. Leandro Zerbinatti.

| Integrante | RA | E-mail acadêmico |
|---|---|---|
| Gabriel Nottoli Buck | 10425384 | Não fornecido |
| Julia Andrade | 10427828 | Não fornecido |
| Joao Vitor Rocha Miranda | 10427273 | Não fornecido |

Os autores precisam fornecer os e-mails antes da entrega do relatório.

## Problema e objetivo

Catálogos extensos e rankings globais podem não representar os interesses individuais dos leitores. O objetivo é investigar como dados de livros e interações originais de leitores podem apoiar a estimativa de afinidade e um ranking personalizado.

**Pergunta de pesquisa:** como técnicas de Inteligência Artificial podem utilizar dados de livros e preferências/interações de leitores para gerar recomendações personalizadas de leitura no contexto do Booklog?

O projeto seguirá a **opção Framework**. A escolha entre regressão, classificação e famílias de recomendação será justificada após a coleta e a EDA. Não há promessa de que a personalização superará uma lista global.

## Organização

| Caminho | Conteúdo |
|---|---|
| `data/README.md` | Contrato dos CSVs, coleta proposta e critérios de publicação |
| `data/raw/README.md` | Orientações para as entradas originais revisadas |
| `data/processed/README.md` | Orientações para os dados tratados |
| `notebooks/01_analise_exploratoria.ipynb` | Validação, EDA, preparação e exportação |
| `src/data.py` | Funções reutilizáveis de validação e preparação |
| `tests/test_data.py` | Testes técnicos com exemplos artificiais isolados |
| `docs/n1/README.md` | Checklist e roteiro do relatório |
| `docs/metodologia.md` | Decisões em aberto e protocolo proposto para N2 |
| `requirements.txt` | Dependências da N1 |

`results/figures` e `results/tables` serão criados pelo notebook somente com dados válidos. Pastas de modelos e recomendação serão acrescentadas quando houver implementação.

## Dataset

A base principal deverá conter avaliações capturadas pelo grupo ou exportadas do Booklog com origem e condições de uso documentadas. Goodreads/Kaggle/Book-Crossing não substituem a coleta original exigida. APIs poderão fornecer metadados complementares, observadas suas condições de uso.

Formato proposto: `ratings.csv` e `books.csv`, descritos em [data/README.md](data/README.md). Nenhum CSV fictício é apresentado como dataset. Dados locais e saídas estão ignorados pelo Git por padrão; publicar a versão revisada é uma etapa explícita necessária para a entrega.

## Execução

Python 3.11 ou superior; processamento verificado em Python 3.12.14. Versões diretas fixadas; dependências transitivas não constituem um ambiente integralmente congelado.

```bash
python -m venv .venv
# Linux/macOS:
source .venv/bin/activate
# Windows PowerShell: .venv/Scripts/Activate.ps1
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
jupyter notebook notebooks/01_analise_exploratoria.ipynb
```

Execute o notebook do início ao fim. Sem os dois CSVs em `data/raw`, ele informa a pendência e não produz resultados. Dados inválidos bloqueiam a análise. Com entradas válidas, o manifesto registra hashes, versões e regras de preparação. Reinicie o kernel e execute todas as células ao trocar a coleta; arquive ou remova saídas antigas separadamente para não confundi-las com as atuais.

Scikit-learn será adicionado com versão fixada quando houver experimento; não é necessário nesta EDA.

## Metodologia provisória

1. Definir e documentar a coleta original.
2. Validar estrutura, notas, datas, chaves e relações entre os arquivos.
3. Investigar ausências, duplicidades, atividade, gêneros, concentração, cobertura e esparsidade.
4. Definir tarefa, separação dos dados e métricas antes de comparar modelos.
5. Na N2, comparar uma referência global com uma abordagem personalizada viável.

Consulte [o protocolo](docs/metodologia.md). TF-IDF só será incorporado se os metadados e o conteúdo da disciplina justificarem. Não há implementação de LLM, redes neurais ou filtragem colaborativa nesta etapa.

## Ética e responsabilidade

Históricos de leitura podem revelar preferências pessoais. Minimizar informações identificadoras: nomes, e-mails, telefones e tabelas de correspondência dos participantes não devem ser publicados. Identificadores aleatórios são pseudônimos, não garantia de anonimização; combinações de leituras e datas podem permitir reidentificação.

Investigar viés de popularidade, concentração em gêneros/autores, diversidade, bolhas de filtro e limitações para leitores sem histórico. Para novos leitores, estudar referência global transparente ou preferências iniciais; esses fluxos não estão implementados. Recomendações são estimativas, não certezas. Comissões de afiliados não compõem o objetivo experimental de afinidade.

## Status e prazos informados pelo grupo

| Marco | Data | Situação |
|---|---|---|
| Projeto N1 | 15/09/2026 | Estrutura preparada; coleta, EDA real e relatório pendentes |
| Prova N1 | 22/09/2026 | Marco da disciplina |
| Projeto/relatório N2 | 17/11/2026 | Planejado |
| Apresentação | 24/11/2026 | Vídeo de até 5 minutos e demonstração pendentes |

O [checklist N1](docs/n1/README.md) detalha as pendências. Esta estrutura não equivale ao relatório concluído.
