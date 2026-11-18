"""
Projeto: Sistema de Recomendação Personalizada de Livros para o Booklog
Disciplina: Inteligência Artificial - 7ºK - 2026/2 - Prof. Dr. Leandro Zerbinatti

Integrantes:
- Gabriel Nottoli Buck - RA 10425384 - 10425384@mackenzista.com.br
- Julia Andrade - RA 10427828 - 10427828@mackenzista.com.br
- João Vitor Rocha Miranda - RA 10427273 - 10427273@mackenzista.com.br
- Juan Nacif - RA 10428509 - 10428509@mackenzista.com.br

Descrição:
Testes automatizados do protocolo da N2: métricas em casos controlados,
separação temporal sem vazamento, exclusão dos livros de treino, integridade
da cópia do backend e coerência dos números publicados no relatório.
Execute `python src/avaliacao_n2.py` antes, pois parte dos testes lê results/.

Uso: python -m unittest discover -s tests -v

Histórico:
18/11/2026 - Grupo - criação dos testes da avaliação N2.
"""

import json
import sys
import unittest
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

import avaliacao_n2 as A  # noqa: E402


class MetricTests(unittest.TestCase):
    def test_precision_recall_ndcg_controlled_case(self):
        ranked = ["a", "x", "b", "y", "z"]
        rel = {"a", "b", "c"}
        self.assertAlmostEqual(A.precision_at_k(ranked, rel, 5), 2 / 5)
        self.assertAlmostEqual(A.recall_at_k(ranked, rel, 5), 2 / 3)
        import math
        dcg = 1 / math.log2(2) + 1 / math.log2(4)
        idcg = 1 / math.log2(2) + 1 / math.log2(3) + 1 / math.log2(4)
        self.assertAlmostEqual(A.ndcg_at_k(ranked, rel, 5), dcg / idcg)

    def test_short_list_is_divided_by_k(self):
        self.assertAlmostEqual(A.precision_at_k(["a"], {"a"}, 5), 0.2)

    def test_perfect_ranking_has_ndcg_one(self):
        self.assertAlmostEqual(A.ndcg_at_k(["a", "b", "x"], {"a", "b"}, 5), 1.0)


class ProtocolTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.books, cls.ratings = A.load_data()
        cls.train, cls.test = A.temporal_split(cls.ratings)

    def test_dataset_matches_n1(self):
        self.assertEqual(len(self.books), 36)
        self.assertEqual(len(self.ratings), 345)
        self.assertEqual(self.ratings.user_id.nunique(), 30)

    def test_temporal_split_counts_and_no_leakage(self):
        self.assertEqual(len(self.train), 273)
        self.assertEqual(len(self.test), 72)
        self.assertLess(self.train.interaction_date.max(), A.CUTOFF)
        self.assertGreaterEqual(self.test.interaction_date.min(), A.CUTOFF)
        overlap = set(zip(self.train.user_id, self.train.book_id)) & set(zip(self.test.user_id, self.test.book_id))
        self.assertEqual(overlap, set())

    def test_relevance_definition(self):
        rel = A.relevant_items(self.test)
        self.assertEqual(len(rel), 20)
        self.assertEqual(sum(len(v) for v in rel.values()), 29)

    def test_popularity_uses_only_training(self):
        order = A.popularity_order(self.books, self.train)
        counts = self.train.book_id.value_counts()
        self.assertEqual(counts.loc[order[0]], counts.max())


class PublishedResultsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        path = ROOT / "results" / "rankings.json"
        if not path.exists():
            raise unittest.SkipTest("Execute src/avaliacao_n2.py antes destes testes.")
        cls.rankings = json.loads(path.read_text(encoding="utf-8"))["rankings"]
        cls.train = pd.read_csv(ROOT / "data" / "processed" / "train.csv")
        cls.summary = pd.read_csv(ROOT / "results" / "metrics_summary.csv")

    def test_no_strategy_recommends_training_books(self):
        seen = self.train.groupby("user_id").book_id.apply(set).to_dict()
        for strategy, by_user in self.rankings.items():
            for user, items in by_user.items():
                books = {i["book_id"] for i in items}
                self.assertFalse(books & seen.get(user, set()), f"{strategy}/{user}")
                self.assertEqual(len(books), len(items), "livro repetido na lista")

    def test_u003_example_used_in_the_video(self):
        top5 = {s: [i["title"] for i in self.rankings[s]["U003"][:5]] for s in self.rankings}
        targets = {"A Sociedade do Anel", "E Não Sobrou Nenhum"}
        self.assertFalse(targets & set(top5["popularidade"]))
        self.assertTrue(targets <= set(top5["hibrido"]))

    def test_numbers_cited_in_report(self):
        def get(strategy, k, metric):
            row = self.summary[(self.summary.strategy == strategy) & (self.summary.k == k)]
            return round(float(row[metric].iloc[0]), 3)
        self.assertEqual((get("hibrido", 5, "precision"), get("hibrido", 5, "recall"), get("hibrido", 5, "ndcg")), (0.16, 0.508, 0.374))
        self.assertEqual((get("popularidade", 5, "precision"), get("popularidade", 5, "recall"), get("popularidade", 5, "ndcg")), (0.1, 0.308, 0.23))
        self.assertEqual(get("tfidf", 10, "recall"), 0.8)

    def test_snapshot_body_identical_to_backend_commit(self):
        checked = A.verify_snapshot()
        self.assertEqual(len(checked), 21)
        self.assertTrue(all(c["body_matches_original"] for c in checked))


if __name__ == "__main__":
    unittest.main()
