"""
Projeto: Sistema de Recomendação Personalizada de Livros para o Booklog
Disciplina: Inteligência Artificial - 7ºK
Professor: Prof. Dr. Leandro Zerbinatti

Integrantes:
- Gabriel Nottoli Buck - RA 10425384 - 10425384@mackenzista.com.br
- Julia Andrade - RA 10427828 - 10427828@mackenzista.com.br
- João Vitor Rocha Miranda - RA 10427273 - 10427273@mackenzista.com.br

Descrição:
Análise exploratória e preparação do conjunto de dados da N1.

Histórico:
15/09/2026 - Grupo - criação da análise exploratória da N1.
15/09/2026 - Grupo - revisão editorial e validação integral da entrega.
"""

from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"

books = pd.read_csv(RAW / "books.csv")
ratings = pd.read_csv(RAW / "ratings.csv")

ratings["rating"] = pd.to_numeric(ratings["rating"], errors="raise")
ratings["interaction_date"] = pd.to_datetime(ratings["interaction_date"], errors="raise")

if not ratings["rating"].between(1, 5).all():
    raise ValueError("Existem notas fora da escala de 1 a 5.")

if ratings.duplicated(["user_id", "book_id"]).any():
    raise ValueError("Existem pares leitor-livro duplicados.")

if books["book_id"].duplicated().any():
    raise ValueError("Existem book_id duplicados.")

if not set(ratings["book_id"]).issubset(set(books["book_id"])):
    raise ValueError("Existem avaliações de livros ausentes no catálogo.")

books_clean = books.drop_duplicates().sort_values("book_id").reset_index(drop=True)
ratings_clean = (
    ratings.drop_duplicates()
    .sort_values(["user_id", "interaction_date", "book_id"])
    .reset_index(drop=True)
)

PROCESSED.mkdir(parents=True, exist_ok=True)
books_clean.to_csv(PROCESSED / "books_clean.csv", index=False)
ratings_clean.to_csv(
    PROCESSED / "ratings_clean.csv",
    index=False,
    date_format="%Y-%m-%d",
)

n_users = ratings_clean["user_id"].nunique()
n_books = books_clean["book_id"].nunique()
n_ratings = len(ratings_clean)
sparsity = 1 - n_ratings / (n_users * n_books)

print(f"Leitores: {n_users}")
print(f"Livros: {n_books}")
print(f"Avaliações: {n_ratings}")
print(f"Nota média: {ratings_clean['rating'].mean():.2f}")
print(f"Esparsidade: {sparsity:.1%}")
