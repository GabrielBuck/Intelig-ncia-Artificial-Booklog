"""
Integrantes:
- Gabriel Nottoli Buck — RA 10425384 — e-mail não fornecido
- Julia Andrade — RA 10427828 — e-mail não fornecido
- Joao Vitor Rocha Miranda — RA 10427273 — e-mail não fornecido
Histórico: 15/09/2026 | Codex, a pedido do grupo | Implementação inicial.
Síntese: testes de integridade com exemplos artificiais; não são dados de pesquisa.
"""
import unittest
import tempfile
from pathlib import Path
import pandas as pd
from src.data import load_csv, prepare, summarize, SCHEMA


def artificial_inputs():
    # Identificadores e títulos artificiais, apenas para testar o software.
    books = pd.DataFrame([
        ['b1', 'Obra artificial A', 'Autor artificial', 'A', ''],
        ['b2', 'Obra artificial B', '', '', ''],
    ], columns=SCHEMA['books'], dtype='string').replace('', pd.NA)
    ratings = pd.DataFrame([
        ['u1', 'b1', '4', '2026-09-01'],
        ['u2', 'b1', '2', ''],
    ], columns=SCHEMA['ratings'], dtype='string').replace('', pd.NA)
    return ratings, books


class DataIntegrityTests(unittest.TestCase):
    def test_missing_optional_fields_and_sparse_catalog(self):
        r, b = artificial_inputs()
        r, b, removed = prepare(r, b, today='2026-09-15')
        stats = summarize(r, b)
        self.assertEqual(stats['esparsidade_catalogo'], .5)
        self.assertEqual(stats['esparsidade_livros_avaliados'], 0)
        self.assertEqual(stats['cobertura_catalogo'], .5)
        self.assertEqual(r.interaction_date.isna().sum(), 1)
        self.assertEqual(removed, {'ratings': 0, 'books': 0})

    def test_exact_duplicates_only(self):
        r, b = artificial_inputs()
        out, _, removed = prepare(pd.concat([r, r.iloc[[0]]]), b)
        self.assertEqual(len(out), 2)
        self.assertEqual(removed['ratings'], 1)
        conflicting = r.iloc[[0]].copy()
        conflicting['rating'] = '3'
        with self.assertRaisesRegex(ValueError, 'conflitante'):
            prepare(pd.concat([r, conflicting]), b)

    def test_invalid_content_rejected(self):
        for column, value in [('rating', '0'), ('rating', 'inf'), ('rating', 'texto'),
                              ('rating', pd.NA), ('book_id', 'desconhecido'),
                              ('interaction_date', '2026-02-30'),
                              ('interaction_date', '2026-9-01'),
                              ('interaction_date', '2026-09-16')]:
            with self.subTest(column=column, value=value):
                r, b = artificial_inputs(); r.loc[0, column] = value
                with self.assertRaises(ValueError):
                    prepare(r, b, today='2026-09-15')

    def test_book_conflict_and_empty_inputs(self):
        r, b = artificial_inputs()
        conflict = b.iloc[[0]].copy(); conflict['title'] = 'Outro título'
        with self.assertRaises(ValueError):
            prepare(r, pd.concat([b, conflict]))
        with self.assertRaises(ValueError):
            prepare(r.iloc[:0], b)

    def test_csv_preserves_ids_normalizes_and_rejects_extra_columns(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'ratings.csv'
            path.write_text('user_id,book_id,rating,interaction_date\n001, b1 ,4, \n')
            frame = load_csv(path, 'ratings')
            self.assertEqual(frame.loc[0, 'user_id'], '001')
            self.assertEqual(frame.loc[0, 'book_id'], 'b1')
            self.assertTrue(pd.isna(frame.loc[0, 'interaction_date']))
            path.write_text('user_id,book_id,rating,interaction_date,email\n')
            with self.assertRaises(ValueError):
                load_csv(path, 'ratings')
            path.write_text('user_id,book_id,rating,rating,interaction_date\n')
            with self.assertRaises(ValueError):
                load_csv(path, 'ratings')
            path.write_text('user_id,book_id,rating,interaction_date\nu1,b1,4,,extra\n')
            with self.assertRaises(ValueError):
                load_csv(path, 'ratings')


if __name__ == '__main__':
    unittest.main()
