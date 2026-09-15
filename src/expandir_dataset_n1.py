"""
Expansao do dataset da N1 - Booklog IA

Integrantes:
- Gabriel Nottoli Buck - RA 10425384
- Julia Andrade - RA 10427828
- Joao Vitor Rocha Miranda - RA 10427273

Descricao:
Script reprodutivel para gerar a estrutura de dados utilizada na analise
exploratoria da N1. A estrutura representa leitores, livros e interacoes
necessarias para investigar recomendacao personalizada.

Historico:
| Data | Autor | Alteracao |
| 15/09/2026 | Grupo | Estrutura inicial de expansao |
| 15/09/2026 | Grupo | Inclusao de leitores, livros e interacoes |
"""

import csv
from pathlib import Path

GENRES = ["Fantasia", "Romance", "Ficcao Cientifica", "Misterio", "Literatura Classica", "Distopia"]
FORMATS = ["Fisico", "Digital", "Ambos"]
FREQUENCIES = ["1 livro/mes", "2-3 livros/mes", "4+ livros/mes"]


def write_csv(path, headers, rows):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(rows)


def create_readers(output="data/raw/readers.csv"):
    rows = []
    for index in range(1, 151):
        rows.append([
            f"U{index:03d}",
            ["18-25", "26-35", "36-50"][index % 3],
            GENRES[index % len(GENRES)],
            FREQUENCIES[index % len(FREQUENCIES)],
            FORMATS[index % len(FORMATS)],
            f"2026-{(index % 12)+1:02d}-{(index % 27)+1:02d}",
        ])
    write_csv(output, ["reader_id", "age_range", "favorite_genre", "reading_frequency", "preferred_format", "registration_date"], rows)


def create_books(output="data/raw/books.csv"):
    rows = []
    for index in range(1, 201):
        rows.append([
            f"B{index:03d}",
            f"Livro {index}",
            f"Autor {index}",
            GENRES[index % len(GENRES)],
            2000 + (index % 27),
            150 + (index * 7 % 500),
            "Português",
        ])
    write_csv(output, ["book_id", "title", "author", "main_genre", "publication_year", "pages", "language"], rows)


def create_ratings(output="data/raw/ratings.csv"):
    rows = []
    for index in range(1, 3001):
        reader = ((index * 7) % 150) + 1
        book = ((index * 13) % 200) + 1
        rows.append([
            f"U{reader:03d}",
            f"B{book:03d}",
            (index % 5) + 1,
            ["finished", "favorite", "wishlist"][index % 3],
            f"2026-{(index % 12)+1:02d}-{(index % 27)+1:02d}",
        ])
    write_csv(output, ["reader_id", "book_id", "rating", "interaction_type", "interaction_date"], rows)


if __name__ == "__main__":
    create_readers()
    create_books()
    create_ratings()
