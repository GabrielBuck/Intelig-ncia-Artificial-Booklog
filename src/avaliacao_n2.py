"""
Projeto: Sistema de Recomendação Personalizada de Livros para o Booklog
Universidade Presbiteriana Mackenzie - Faculdade de Computação e Informática
Disciplina: Inteligência Artificial - 7ºK - 2026/2
Professor: Prof. Dr. Leandro Zerbinatti

Integrantes:
- Gabriel Nottoli Buck - RA 10425384 - 10425384@mackenzista.com.br
- Julia Andrade - RA 10427828 - 10427828@mackenzista.com.br
- João Vitor Rocha Miranda - RA 10427273 - 10427273@mackenzista.com.br
- Juan Nacif - RA 10428509 - 10428509@mackenzista.com.br

Descrição:
Avaliação offline da N2. Separa a base acadêmica da N1 por tempo (corte em
10/09/2026), gera rankings com cinco estratégias e calcula Precision@K,
Recall@K, NDCG@K, cobertura do catálogo e intervalos bootstrap pareados.

Estratégias:
1. Popularidade global (baseline não personalizado, Pandas).
2. TF-IDF + similaridade de cosseno (scikit-learn), configuração fixa.
3. Conteúdo do backend   -> cópia do provedor TypeScript (strategy=contentBased).
4. Híbrido do backend    -> cópia do provedor TypeScript (strategy=hybrid).
5. Grafo do backend      -> cópia do provedor TypeScript (strategy=graph).
As estratégias 3-5 são executadas por snapshot/academic/run-offline.ts, que
recebe somente dados de treino. Os pesos do backend são regras heurísticas
definidas em código; nada é treinado ou ajustado no conjunto de teste.

Uso (na raiz do repositório):
    npm --prefix snapshot ci && npm --prefix snapshot run build
    python src/avaliacao_n2.py

Histórico:
18/11/2026 - Grupo - criação do protocolo temporal, das estratégias e métricas.
18/11/2026 - Grupo - integração com a cópia acadêmica dos provedores do backend,
             bootstrap pareado, gráficos e manifesto de proveniência.
"""

from __future__ import annotations

import hashlib
import json
import platform
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import pandas as pd

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import sklearn  # noqa: E402
from sklearn.feature_extraction.text import TfidfVectorizer  # noqa: E402
from sklearn.metrics.pairwise import cosine_similarity  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
RESULTS = ROOT / "results"
GRAPHS = RESULTS / "graficos"
SNAPSHOT = ROOT / "snapshot"
RUNNER = SNAPSHOT / "dist" / "academic" / "run-offline.js"

# ---------------------------------------------------------------------------
# Parâmetros fixos do protocolo (definidos antes da leitura das métricas).
# ---------------------------------------------------------------------------
CUTOFF = pd.Timestamp("2026-09-10")      # treino: datas < corte; teste: >= corte
RELEVANCE_THRESHOLD = 4.0                # relevante: nota de teste >= 4
KS = (5, 10)
LIST_LIMIT = 10                          # rankings gerados até 10 itens
BOOTSTRAP_SAMPLES = 10_000
SEED = 42
TFIDF_PARAMS = {"ngram_range": (1, 2), "strip_accents": "unicode", "sublinear_tf": True}
TFIDF_POSITIVE_MIN = 4.0                 # perfil TF-IDF: livros de treino com nota >= 4
COLLABORATIVE_LIMITS = {"seed_books": 20, "readers": 25, "items": 150}  # iguais ao serviço

STRATEGIES = ["popularidade", "tfidf", "conteudo", "hibrido", "grafo"]
LABELS = {
    "popularidade": "Popularidade",
    "tfidf": "TF-IDF",
    "conteudo": "Conteúdo do backend",
    "hibrido": "Híbrido do backend",
    "grafo": "Grafo do backend",
}
BACKEND_STRATEGY = {"conteudo": "contentBased", "hibrido": "hybrid", "grafo": "graph"}


# ---------------------------------------------------------------------------
# Dados e separação temporal
# ---------------------------------------------------------------------------
def load_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    books = pd.read_csv(PROCESSED / "books_clean.csv")
    ratings = pd.read_csv(PROCESSED / "ratings_clean.csv")
    ratings["interaction_date"] = pd.to_datetime(ratings["interaction_date"], errors="raise")
    ratings["rating"] = pd.to_numeric(ratings["rating"], errors="raise")
    assert not ratings.duplicated(["user_id", "book_id"]).any(), "pares duplicados"
    assert set(ratings["book_id"]) <= set(books["book_id"]), "livro fora do catálogo"
    return books, ratings


def temporal_split(ratings: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    order = ["interaction_date", "user_id", "book_id"]
    train = ratings[ratings["interaction_date"] < CUTOFF].sort_values(order).reset_index(drop=True)
    test = ratings[ratings["interaction_date"] >= CUTOFF].sort_values(order).reset_index(drop=True)
    # Prevenção de vazamento: nenhum registro de teste é anterior ao corte, nenhum
    # par leitor-livro aparece nos dois conjuntos e o total é preservado.
    assert train["interaction_date"].max() < CUTOFF <= test["interaction_date"].min()
    pairs_train = set(zip(train.user_id, train.book_id))
    pairs_test = set(zip(test.user_id, test.book_id))
    assert not pairs_train & pairs_test, "par leitor-livro em treino e teste"
    assert len(train) + len(test) == len(ratings)
    return train, test


def relevant_items(test: pd.DataFrame) -> dict[str, set[str]]:
    rel = test[test["rating"] >= RELEVANCE_THRESHOLD]
    return {u: set(g["book_id"]) for u, g in rel.groupby("user_id")}


# ---------------------------------------------------------------------------
# Estratégias em Python
# ---------------------------------------------------------------------------
def popularity_order(books: pd.DataFrame, train: pd.DataFrame) -> list[str]:
    stats = train.groupby("book_id")["rating"].agg(["count", "mean"])
    table = books[["book_id"]].merge(stats, left_on="book_id", right_index=True, how="left")
    table = table.fillna({"count": 0, "mean": 0.0})
    table = table.sort_values(["count", "mean", "book_id"], ascending=[False, False, True])
    return table["book_id"].tolist()


def recommend_popularity(order: list[str], seen: set[str], k: int) -> list[str]:
    return [b for b in order if b not in seen][:k]


def tfidf_model(books: pd.DataFrame) -> tuple[TfidfVectorizer, np.ndarray]:
    # O gênero é repetido para reforçar esse atributo frente ao autor.
    docs = (books["author"] + " " + books["genres"] + " " + books["genres"]).tolist()
    vectorizer = TfidfVectorizer(**TFIDF_PARAMS)
    matrix = vectorizer.fit_transform(docs)
    return vectorizer, matrix


def recommend_tfidf(
    books: pd.DataFrame, matrix, user_train: pd.DataFrame, pop_rank: dict[str, int], seen: set[str], k: int,
    pop_order: list[str],
) -> list[str]:
    positives = user_train[user_train["rating"] >= TFIDF_POSITIVE_MIN]
    if positives.empty:
        return recommend_popularity(pop_order, seen, k)  # fallback documentado
    index = {b: i for i, b in enumerate(books["book_id"])}
    rows = [index[b] for b in positives["book_id"]]
    weights = (positives["rating"] - 3.0).to_numpy()
    profile = np.asarray((matrix[rows].T @ weights) / weights.sum()).reshape(1, -1)
    sims = cosine_similarity(profile, matrix).ravel()
    candidates = [b for b in books["book_id"] if b not in seen]
    candidates.sort(key=lambda b: (-round(float(sims[index[b]]), 12), pop_rank[b], b))
    return candidates[:k]


# ---------------------------------------------------------------------------
# Estratégias do backend (cópia acadêmica em TypeScript)
# ---------------------------------------------------------------------------
def ensure_runner() -> None:
    if RUNNER.exists():
        return
    npm = shutil.which("npm")
    if npm is None or not (SNAPSHOT / "node_modules").exists():
        sys.exit(
            "Cópia do backend não compilada. Execute:\n"
            "  npm --prefix snapshot ci\n  npm --prefix snapshot run build"
        )
    subprocess.run([npm, "run", "build"], cwd=SNAPSHOT, check=True)


def run_backend(books: pd.DataFrame, train: pd.DataFrame, users: list[str]) -> dict:
    ensure_runner()
    stats = train.groupby("book_id")["rating"].agg(["count", "mean"])
    payload = {
        "limit": LIST_LIMIT,
        "books": [
            {
                "book_id": r.book_id,
                "title": r.title,
                "author": r.author,
                "genre": r.genres,
                "aggregate_rating": round(float(stats.loc[r.book_id, "mean"]), 4) if r.book_id in stats.index else None,
                "rating_count": int(stats.loc[r.book_id, "count"]) if r.book_id in stats.index else 0,
            }
            for r in books.itertuples()
        ],
        "train": [
            {"user_id": r.user_id, "book_id": r.book_id, "rating": float(r.rating),
             "interaction_date": r.interaction_date.strftime("%Y-%m-%d")}
            for r in train.itertuples()
        ],
        "users": users,
        "strategies": list(BACKEND_STRATEGY.values()),
        "collaborative_limits": COLLABORATIVE_LIMITS,
    }
    input_path = RESULTS / "backend-input.json"
    output_path = RESULTS / "backend-output.json"
    write_json(input_path, payload)
    node = shutil.which("node")
    if node is None:
        sys.exit("Node.js não encontrado. Instale Node.js 20+ (testado com 24).")
    subprocess.run([node, str(RUNNER), str(input_path), str(output_path)], check=True)
    return json.loads(output_path.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Métricas
# ---------------------------------------------------------------------------
def precision_at_k(ranked: list[str], rel: set[str], k: int) -> float:
    return sum(b in rel for b in ranked[:k]) / k  # listas curtas continuam divididas por K


def recall_at_k(ranked: list[str], rel: set[str], k: int) -> float:
    return sum(b in rel for b in ranked[:k]) / len(rel)


def ndcg_at_k(ranked: list[str], rel: set[str], k: int) -> float:
    dcg = sum(1.0 / np.log2(i + 2) for i, b in enumerate(ranked[:k]) if b in rel)
    idcg = sum(1.0 / np.log2(i + 2) for i in range(min(len(rel), k)))
    return dcg / idcg


def evaluate(rankings: dict[str, dict[str, list[str]]], rel: dict[str, set[str]], n_books: int):
    per_user, summary = [], []
    users = sorted(rel)
    for s in STRATEGIES:
        for k in KS:
            rows = []
            for u in users:
                ranked = rankings[s][u]
                rows.append({
                    "strategy": s, "k": k, "user_id": u, "n_relevant": len(rel[u]),
                    "hits": sum(b in rel[u] for b in ranked[:k]),
                    "precision": precision_at_k(ranked, rel[u], k),
                    "recall": recall_at_k(ranked, rel[u], k),
                    "ndcg": ndcg_at_k(ranked, rel[u], k),
                    "list_length": len(ranked[:k]),
                })
            per_user.extend(rows)
            frame = pd.DataFrame(rows)
            covered = {b for u in users for b in rankings[s][u][:k]}
            summary.append({
                "strategy": s, "label": LABELS[s], "k": k, "n_users": len(users),
                "precision": frame["precision"].mean(), "recall": frame["recall"].mean(),
                "ndcg": frame["ndcg"].mean(), "coverage": len(covered) / n_books,
                "distinct_books": len(covered), "short_lists": int((frame["list_length"] < k).sum()),
            })
    return pd.DataFrame(per_user), pd.DataFrame(summary)


def paired_bootstrap(per_user: pd.DataFrame) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    users = sorted(per_user["user_id"].unique())
    idx = rng.integers(0, len(users), size=(BOOTSTRAP_SAMPLES, len(users)))
    rows = []
    for k in KS:
        base = per_user[(per_user.strategy == "popularidade") & (per_user.k == k)].set_index("user_id").loc[users]
        for s in STRATEGIES[1:]:
            other = per_user[(per_user.strategy == s) & (per_user.k == k)].set_index("user_id").loc[users]
            for metric in ("ndcg", "recall"):
                diff = (other[metric] - base[metric]).to_numpy()
                boot = diff[idx].mean(axis=1)
                lo, hi = np.percentile(boot, [2.5, 97.5])
                rows.append({
                    "comparison": f"{s} - popularidade", "metric": f"{metric}@{k}",
                    "mean_difference": diff.mean(), "ci95_low": lo, "ci95_high": hi,
                    "ci_includes_zero": bool(lo <= 0 <= hi), "n_users": len(users),
                    "resamples": BOOTSTRAP_SAMPLES, "seed": SEED,
                })
    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# Saídas
# ---------------------------------------------------------------------------
def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def verify_snapshot() -> list[dict]:
    """Confirma que cada arquivo copiado do backend é idêntico ao original
    (exceto pelo cabeçalho acadêmico), usando snapshot/copied-files.json."""
    meta = json.loads((SNAPSHOT / "copied-files.json").read_text(encoding="utf-8"))
    marker = (meta["header_end_marker"] + "\n").encode()
    checked = []
    for f in meta["files"]:
        data = (ROOT / f["path"]).read_bytes().replace(b"\r\n", b"\n")
        body = data.split(marker, 1)[1]
        ok = hashlib.sha256(body).hexdigest() == f["original_sha256"]
        if not ok:
            sys.exit(f"Arquivo do snapshot difere do original: {f['path']}")
        checked.append({"path": f["path"], "original_path": f["original_path"],
                        "original_sha256": f["original_sha256"], "body_matches_original": ok})
    return checked


def plot(summary: pd.DataFrame, k: int) -> None:
    data = summary[summary.k == k].set_index("strategy").loc[STRATEGIES]
    x = np.arange(len(STRATEGIES))
    width = 0.27
    fig, ax = plt.subplots(figsize=(9, 4.3))
    for offset, metric, color in ((-width, "precision", "#9aa5b1"), (0, "recall", "#2f6f9f"), (width, "ndcg", "#d9822b")):
        bars = ax.bar(x + offset, data[metric], width, label=f"{metric.capitalize() if metric != 'ndcg' else 'NDCG'}@{k}", color=color)
        ax.bar_label(bars, fmt="%.3f", fontsize=7, padding=2)
    ax.set_xticks(x, [LABELS[s] for s in STRATEGIES], fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_ylabel("Média por leitor (20 leitores)")
    ax.set_title(f"Comparação das estratégias nas {k} primeiras sugestões (base acadêmica, offline)")
    ax.legend(frameon=False, fontsize=8)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    GRAPHS.mkdir(parents=True, exist_ok=True)
    fig.savefig(GRAPHS / f"comparacao_top{k}.png", dpi=150, metadata={"Software": None})
    plt.close(fig)


def main() -> None:
    books, ratings = load_data()
    train, test = temporal_split(ratings)
    rel = relevant_items(test)
    users_all = sorted(ratings["user_id"].unique())
    train_hist = train.groupby("user_id")["book_id"].apply(set).to_dict()

    # Conjuntos efetivos de treino e teste, publicados para verificação.
    for name, frame in (("train", train), ("test", test)):
        frame.to_csv(PROCESSED / f"{name}.csv", index=False, date_format="%Y-%m-%d")

    pop_order = popularity_order(books, train)
    pop_rank = {b: i for i, b in enumerate(pop_order)}
    vectorizer, matrix = tfidf_model(books)

    rankings: dict[str, dict[str, list[str]]] = {s: {} for s in STRATEGIES}
    for u in users_all:
        seen = train_hist.get(u, set())  # exclusão dos livros observados no treino
        rankings["popularidade"][u] = recommend_popularity(pop_order, seen, LIST_LIMIT)
        rankings["tfidf"][u] = recommend_tfidf(books, matrix, train[train.user_id == u], pop_rank, seen, LIST_LIMIT, pop_order)

    backend = run_backend(books, train, users_all)
    for s, backend_name in BACKEND_STRATEGY.items():
        for u in users_all:
            items = [i["bookId"] for i in backend["results"][backend_name][u]["items"]]
            assert not set(items) & train_hist.get(u, set()), "backend recomendou livro do treino"
            rankings[s][u] = items

    per_user, summary = evaluate(rankings, rel, len(books))
    boot = paired_bootstrap(per_user)

    RESULTS.mkdir(exist_ok=True)
    summary.round(6).to_csv(RESULTS / "metrics_summary.csv", index=False)
    per_user.round(6).to_csv(RESULTS / "metrics_per_user.csv", index=False)
    boot.round(6).to_csv(RESULTS / "paired_bootstrap.csv", index=False)
    titles = dict(zip(books.book_id, books.title))
    write_json(RESULTS / "rankings.json", {
        "description": "Rankings (até 10 itens) de todas as estratégias para os 30 leitores; métricas usam os 20 com relevantes no teste.",
        "evaluated_users": sorted(rel),
        "rankings": {s: {u: [{"rank": i + 1, "book_id": b, "title": titles[b]} for i, b in enumerate(r)]
                         for u, r in rankings[s].items()} for s in STRATEGIES},
    })
    for k in KS:
        plot(summary, k)

    per_user_train = train.groupby("user_id").size()
    split = {
        "cutoff": CUTOFF.strftime("%Y-%m-%d"),
        "train": {"ratings": len(train), "first_date": train.interaction_date.min().strftime("%Y-%m-%d"),
                  "last_date": train.interaction_date.max().strftime("%Y-%m-%d"),
                  "users": int(train.user_id.nunique()), "min_ratings_per_user": int(per_user_train.min())},
        "test": {"ratings": len(test), "first_date": test.interaction_date.min().strftime("%Y-%m-%d"),
                 "last_date": test.interaction_date.max().strftime("%Y-%m-%d"),
                 "users_with_test": int(test.user_id.nunique()),
                 "relevant_ratings": int((test.rating >= RELEVANCE_THRESHOLD).sum()),
                 "users_with_relevant": len(rel)},
        "users_without_test": sorted(set(users_all) - set(test.user_id)),
        "users_without_relevant_test": sorted(set(test.user_id) - set(rel)),
        "train_share": round(len(train) / len(ratings), 4),
        "tfidf_vocabulary_size": len(vectorizer.vocabulary_),
    }
    write_json(RESULTS / "split_summary.json", split)

    node_version = subprocess.run([shutil.which("node"), "--version"], capture_output=True, text=True).stdout.strip()
    write_json(RESULTS / "run-config.json", {
        "script": "src/avaliacao_n2.py",
        "parameters": {
            "cutoff": split["cutoff"], "relevance_threshold": RELEVANCE_THRESHOLD, "ks": list(KS),
            "list_limit": LIST_LIMIT, "bootstrap_samples": BOOTSTRAP_SAMPLES, "seed": SEED,
            "tfidf": {**{k: list(v) if isinstance(v, tuple) else v for k, v in TFIDF_PARAMS.items()},
                      "document": "author + genre + genre", "profile": "média ponderada dos livros de treino com nota >= 4, peso = nota - 3"},
            "popularity": "contagem no treino desc, média desc, book_id asc",
            "backend_collaborative_limits": COLLABORATIVE_LIMITS,
            "backend_neutralized_signals": ["favoritos", "progresso", "status de conclusão", "tags", "sessões", "buscas", "eventos", "gêneros do perfil", "tendência"],
        },
        "environment": {"python": platform.python_version(), "pandas": pd.__version__, "numpy": np.__version__,
                        "scikit-learn": sklearn.__version__, "matplotlib": matplotlib.__version__, "node": node_version},
        "external_services": "nenhum (sem banco, rede ou credenciais do BookLog)",
    })

    tracked = [
        "data/raw/books.csv", "data/raw/ratings.csv", "data/processed/books_clean.csv",
        "data/processed/ratings_clean.csv", "data/processed/train.csv", "data/processed/test.csv",
        "src/analise_exploratoria.py", "src/avaliacao_n2.py", "snapshot/academic/run-offline.ts",
        "snapshot/package.json", "snapshot/package-lock.json",
    ]
    write_json(RESULTS / "source-manifest.json", {
        "references": {
            "backend_commit": "063583bbcf1d7a9718bd53867c714757e1950283",
            "backend_repository": "Bin4ryLibr4ry/booklog-backend (privado; consultado somente em leitura)",
            "academic_n1_commit": "bec4890b43a4612dcbc5c42f5d28a4d628a38db9",
        },
        "files": [{"path": p, "sha256": sha256(ROOT / p)} for p in tracked],
        "snapshot_copied_files": verify_snapshot(),
    })

    # Resumo no terminal
    print(f"Treino: {len(train)} | Teste: {len(test)} | Leitores avaliados: {len(rel)} | "
          f"Relevantes no teste: {split['test']['relevant_ratings']} | Vocabulário TF-IDF: {split['tfidf_vocabulary_size']}")
    show = summary.copy()
    show["coverage"] = (show["coverage"] * 100).round(1)
    print(show[["label", "k", "precision", "recall", "ndcg", "coverage"]].round(3).to_string(index=False))
    print("\nBootstrap pareado (NDCG):")
    print(boot[boot.metric.str.startswith("ndcg")][["comparison", "metric", "mean_difference", "ci95_low", "ci95_high"]].round(3).to_string(index=False))


if __name__ == "__main__":
    main()
