"""
Expansão do dataset da N1 - Booklog IA

Integrantes:
- Gabriel Nottoli Buck - RA 10425384
- Julia Andrade - RA 10427828
- Joao Vitor Rocha Miranda - RA 10427273

Descrição:
Script auxiliar para geração da estrutura expandida de leitores utilizada na preparação
para análise exploratória da N1. O objetivo é manter a criação dos dados reproduzível.

Histórico:
| Data | Autor | Alteração |
| 15/09/2026 | Grupo | Estrutura inicial de expansão do dataset |
"""

import csv
from pathlib import Path

GENRES = ["Fantasia", "Romance", "Ficção Científica", "Mistério", "Literatura Clássica", "Distopia"]
FREQUENCIES = ["1 livro/mês", "2-3 livros/mês", "4+ livros/mês"]
FORMATS = ["Físico", "Digital", "Ambos"]


def create_readers(output: str = "data/raw/readers.csv"):
    path = Path(output)
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            "reader_id",
            "age_range",
            "favorite_genre",
            "reading_frequency",
            "preferred_format",
            "registration_date",
        ])

        for index in range(1, 151):
            writer.writerow([
                f"U{index:03d}",
                ["18-25", "26-35", "36-50"][index % 3],
                GENRES[index % len(GENRES)],
                FREQUENCIES[index % len(FREQUENCIES)],
                FORMATS[index % len(FORMATS)],
                f"2026-{(index % 12) + 1:02d}-{(index % 27) + 1:02d}",
            ])


if __name__ == "__main__":
    create_readers()
