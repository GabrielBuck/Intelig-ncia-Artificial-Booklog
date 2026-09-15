"""
Integrantes:
- Gabriel Nottoli Buck — RA 10425384 — e-mail não fornecido
- Julia Andrade — RA 10427828 — e-mail não fornecido
- Joao Vitor Rocha Miranda — RA 10427273 — e-mail não fornecido
Histórico: 15/09/2026 | Codex, a pedido do grupo | Implementação inicial.
Síntese: carga estrita, auditoria, preparação e estatísticas do dataset original.
"""
from datetime import date
from pathlib import Path
import csv
import pandas as pd

SCHEMA = {
    'ratings': ['user_id', 'book_id', 'rating', 'interaction_date'],
    'books': ['book_id', 'title', 'author', 'genres', 'description'],
}


def load_csv(path, kind):
    """Preserva IDs textuais e rejeita cabeçalhos extras/duplicados."""
    path = Path(path)
    with path.open(encoding='utf-8-sig', newline='') as stream:
        reader = csv.reader(stream)
        columns = next(reader, [])
        for row_number, row in enumerate(reader, start=2):
            if len(row) != len(columns):
                raise ValueError(f'{kind}: quantidade de campos inválida na linha {row_number}.')
    expected = SCHEMA[kind]
    if len(columns) != len(set(columns)) or set(columns) != set(expected):
        raise ValueError(f'{kind}: cabeçalho deve conter exatamente {expected}.')
    frame = pd.read_csv(path, dtype='string', keep_default_na=False, encoding='utf-8-sig')
    for col in frame:
        frame[col] = frame[col].str.strip().replace('', pd.NA)
    return frame[expected]


def audit(frame):
    """Resumo da entrada normalizada; não imprime registros pessoais."""
    return pd.DataFrame({
        'ausentes': frame.isna().sum(),
        'percentual_ausente': frame.isna().mean().mul(100),
    })


def prepare(ratings, books, today=None):
    """Remove só cópias exatas; rejeita ambiguidades sem imputar dados."""
    for kind, frame in [('ratings', ratings), ('books', books)]:
        if set(frame.columns) != set(SCHEMA[kind]) or frame.columns.duplicated().any():
            raise ValueError(f'{kind}: colunas incompatíveis com o contrato.')
        if frame.empty:
            raise ValueError(f'{kind}: arquivo sem registros; não há EDA empírica.')
    for kind, frame, cols in [('ratings', ratings, ['user_id', 'book_id', 'rating']),
                              ('books', books, ['book_id', 'title'])]:
        if frame[cols].isna().any().any():
            raise ValueError(f'{kind}: valores obrigatórios ausentes em {cols}.')
    removed = {'ratings': int(ratings.duplicated().sum()), 'books': int(books.duplicated().sum())}
    r, b = ratings.drop_duplicates().copy(), books.drop_duplicates().copy()
    if b.book_id.duplicated().any():
        raise ValueError('books: book_id com metadados conflitantes; resolver na fonte.')
    if r.duplicated(['user_id', 'book_id']).any():
        raise ValueError('ratings: par usuário–livro conflitante; resolver na fonte.')
    if not r.book_id.isin(b.book_id).all():
        raise ValueError('ratings: referência a livro inexistente no catálogo.')
    numeric = pd.to_numeric(r.rating, errors='coerce')
    if not numeric.between(1, 5).fillna(False).all():
        raise ValueError('ratings: notas devem ser números entre 1 e 5.')
    r['rating'] = numeric.astype(float)
    dates = r.interaction_date
    parsed = pd.to_datetime(dates, format='%Y-%m-%d', errors='coerce')
    bad_format = dates.notna() & ~dates.str.fullmatch(r'\d{4}-\d{2}-\d{2}').fillna(False)
    cutoff = pd.Timestamp(today or date.today())
    if bad_format.any() or (dates.notna() & parsed.isna()).any() or (parsed > cutoff).any():
        raise ValueError('ratings: data inválida/futura; usar AAAA-MM-DD ou deixar ausente.')
    for genres in b.genres.dropna():
        if any(not token.strip() for token in genres.split('|')):
            raise ValueError('books: gêneros contêm elemento vazio; revisar separador |.')
    r = r.sort_values(['user_id', 'book_id']).reset_index(drop=True)
    b = b.sort_values('book_id').reset_index(drop=True)
    return r, b, removed


def summarize(ratings, books):
    """Esparsidade por pares únicos, sem materializar uma matriz densa."""
    users = ratings.user_id.nunique()
    catalog = books.book_id.nunique()
    observed_books = ratings.book_id.nunique()
    pairs = len(ratings[['user_id', 'book_id']].drop_duplicates())
    activity = ratings.groupby('book_id').size().sort_values(ascending=False)
    return pd.Series({
        'registros_avaliacoes': len(ratings),
        'usuarios_observados': users,
        'livros_catalogo': catalog,
        'livros_avaliados': observed_books,
        'pares_observados': pairs,
        'cobertura_catalogo': observed_books / catalog,
        'esparsidade_catalogo': 1 - pairs / (users * catalog),
        'esparsidade_livros_avaliados': 1 - pairs / (users * observed_books),
        'fracao_avaliacoes_top_10_livros': activity.head(10).sum() / len(ratings),
    }, name='valor')
