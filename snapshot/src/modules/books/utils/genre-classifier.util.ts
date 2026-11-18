/*
 * [Cópia acadêmica — Projeto N2 de Inteligência Artificial — BookLog]
 * Universidade Presbiteriana Mackenzie — FCI — Inteligência Artificial 7ºK — 2026/2
 * Prof. Dr. Leandro Zerbinatti
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: Taxonomia heurística de gêneros (palavras-chave, não aprendida).
 * Origem: backend BookLog, commit 063583bbcf1d7a9718bd53867c714757e1950283, arquivo src/modules/books/utils/genre-classifier.util.ts.
 * O corpo abaixo deste cabeçalho é idêntico ao original (verificado por SHA-256
 * em snapshot/copied-files.json). Não é o código em produção: é uma cópia
 * isolada, executada apenas com a base acadêmica.
 * Histórico:
 * 18/11/2026 - Grupo - cópia do arquivo para a avaliação offline da N2.
 */
/* [fim do cabecalho academico] */
import { foldText } from '../../imports/utils/title-match.util';

/**
 * Turns the messy category lists the catalog providers hand back (Amazon's
 * browse nodes, Google's BISAC categories, Open Library's subjects) into
 * BookLog's own taxonomy: one genre, the subgenres and themes it recognizes,
 * and the intended audience. The providers' raw lists stay in `subjects`
 * for transparency; this is what turns them into something a reader-facing
 * screen can show.
 *
 * This is a keyword heuristic, not a real classifier: it looks for one of
 * BookLog's own terms (in Portuguese, plus a few English synonyms since Open
 * Library and Google often answer in English) inside each raw term. It will
 * never be perfect, and the dictionaries below are a starting point, not an
 * exhaustive list: add to them as real catalog data turns up gaps.
 */

export const UNCATEGORIZED_GENRE = 'Uncategorized';

/**
 * Raise this whenever the keyword lists below change: the nightly catalog sync
 * re-classifies every booklog_catalog row stored with a lower version.
 */
export const CLASSIFIER_VERSION = 7;

/**
 * BookLog's own genres, most specific first: when one raw term names more
 * than one of these (e.g. "Fantasia Histórica" names both Fantasia and
 * Ficção Histórica), it is credited to whichever comes first here. Keep
 * genuinely ambiguous pairs (Fantasia vs. Ficção Histórica, Suspense vs.
 * Romance) in the order a human would read the term.
 */
export const CANONICAL_GENRES = [
  // Fiction
  'Romance',
  'Fantasia',
  'Ficção Científica',
  'Distopia',
  'Ficção Contemporânea',
  'Suspense / Thriller',
  'Mistério',
  'Policial / Crime',
  'Terror / Horror',
  'Ficção Histórica',
  'Ficção Psicológica / Filosófica',
  'Aventura',
  'Humor / Comédia',
  // After every specific fiction genre: a "classic fantasy" is Fantasia.
  'Clássicos',
  // Non-fiction
  'Biografia / Memórias',
  'História',
  'Política e Sociedade',
  'Autoajuda / Desenvolvimento Pessoal',
  'Negócios e Finanças',
  'Ciência',
  'Tecnologia',
  'Saúde e Medicina',
  'Psicologia',
  'Filosofia',
  'Religião e Espiritualidade',
  'Artes e Cultura',
  'Educação',
  'Jornalismo / Reportagem',
  'Guias e Manuais',
  // Literary forms that are neither fiction nor non-fiction
  'Poesia',
  'Contos',
  'Crônicas',
  'Teatro',
  'Ensaios',
] as const;

export type CanonicalGenre = (typeof CANONICAL_GENRES)[number];

const NON_FICTION_GENRES = new Set<CanonicalGenre>(
  CANONICAL_GENRES.slice(
    CANONICAL_GENRES.indexOf('Biografia / Memórias'),
    CANONICAL_GENRES.indexOf('Poesia'),
  ),
);

/** Who a book is written for. At most one is picked; "Adulto" is never guessed. */
export const AUDIENCES = [
  'Infantil',
  'Middle Grade / Infantojuvenil',
  'Jovem Adulto',
  'New Adult',
] as const;

export type Audience = (typeof AUDIENCES)[number];

const GENRE_KEYWORDS: Record<CanonicalGenre, string[]> = {
  Romance: [
    'romance',
    'romântico',
    'romantic',
    'erótico',
    'erotic',
    '^love',
    'courtship',
  ],
  Fantasia: [
    'fantasia',
    'fantasy',
    'magic',
    'magia',
    'magie',
    'wizard',
    'vampire',
    'vampiro',
    'dragon',
    'dragão',
    'fadas',
    'fairies',
  ],
  'Ficção Científica': [
    'ficção científica',
    'sci-fi',
    'scifi',
    'science fiction',
    'space opera',
    'cyberpunk',
    'space warfare',
    'life on other planets',
    'extraterrestrial',
    'interplanetary',
    'star wars',
    'star trek',
  ],
  Distopia: ['distopia', 'dystopia', 'utópic', 'utopia'],
  // Not "drama" alone: it is a substring of "dramaturgia" (Teatro). Not the
  // generic "ficção"/"literatura" either: those are the last-resort fallback
  // below, checked only once no genre (including this one) has matched.
  'Ficção Contemporânea': [
    'contemporâne',
    'contemporary fiction',
    'relações humanas',
  ],
  'Suspense / Thriller': ['suspense', 'thriller', 'espionage', 'espionagem'],
  Mistério: ['mistério', 'mystery'],
  'Policial / Crime': [
    // stem, not "policial": the plural "policiais" does not contain it.
    'polici',
    'crime',
    'detetive',
    'detective',
    'noir',
    'investiga',
    'assassin',
    'murder',
    'assassinato',
    'kidnap',
    'sequestro',
  ],
  'Terror / Horror': [
    'terror',
    'horror',
    'gótico',
    'gothic',
    'haunted',
    'assombrad',
    'ghost',
    'fantasma',
    'zombie',
  ],
  'Ficção Histórica': ['ficção histórica', 'historical fiction'],
  'Ficção Psicológica / Filosófica': [
    'ficção psicológica',
    'ficção filosófica',
    'psychological fiction',
    'philosophical fiction',
  ],
  Aventura: ['aventura', 'adventure'],
  Clássicos: [
    'clássico',
    'clássicos',
    'classics',
    'classic literature',
    'classic fiction',
    'literatura clássica',
  ],
  'Humor / Comédia': [
    'humor',
    'comédia',
    'comedy',
    'cartoon',
    'satire',
    'sátira',
  ],

  'Biografia / Memórias': [
    'biografia',
    'biography',
    'memóri',
    'memoir',
    'autobiografia',
    'autobiography',
    'biograph',
    'biografi',
    'autobiograph',
  ],
  História: [
    'história',
    'history',
    'world war',
    'guerra mundial',
    'archaeolog',
    'arqueolog',
    'antiquities',
    'histórico',
  ],
  'Política e Sociedade': [
    'política',
    'politics',
    'sociedade',
    'social science',
    'sociolog',
    'segregation',
    'segregação',
    'race relations',
    'direito',
    'legislat',
    'government',
    'governo',
    'constitution',
    'constituição',
    'social conditions',
    'social life and customs',
    '^law',
    '^laws',
    '^lei',
    '^leis',
    '^courts',
    '^decretos',
  ],
  'Autoajuda / Desenvolvimento Pessoal': [
    'autoajuda',
    'self-help',
    'desenvolvimento pessoal',
    'self improvement',
    'conduct of life',
    'conduta de vida',
  ],
  'Negócios e Finanças': [
    'negócio',
    'finanç',
    'finance',
    'empreendedorismo',
    'empreendimento',
    'administração',
    'gestão',
    'liderança',
    'carreira',
    'marketing',
    'business',
    'entrepreneur',
  ],
  Ciência: [
    'ciência',
    'science',
    'genetic',
    'genética',
    'biology',
    'biologia',
    'dinosaur',
    'paleontolog',
    'physics',
    'física',
  ],
  Tecnologia: [
    'tecnologia',
    'technology',
    'computação',
    'computing',
    'programação',
  ],
  'Saúde e Medicina': [
    'saúde',
    'medicina',
    'medical',
    'health',
    'veterinár',
    'medicine',
    'nursing',
    'enfermagem',
    'care of the sick',
    'cuidado',
    '^disease',
    '^diseases',
    'doença',
  ],
  Psicologia: ['psicologia', 'psychology', 'grief', 'luto', 'psychiatr'],
  Filosofia: ['filosofia', 'philosophy'],
  'Religião e Espiritualidade': [
    'religião',
    'religion',
    'spirituality',
    'cristian',
    'devocional',
    'devotional',
    // stem, not "espiritual": the plural "espirituais" does not contain it.
    'espiritu',
    'cristã',
    'cristão',
    'teologia',
    'theology',
    'bíblia',
    'bible',
    'christian',
    'pentecostal',
    'igreja',
    '^church',
    'jesus',
    '^deus',
    'sermon',
    'sermões',
  ],
  'Artes e Cultura': [
    '^arte',
    '^artes',
    '^art',
    '^arts',
    'cultura',
    'culture',
    'architecture',
    'arquitetura',
    'exhibitions',
    'exposições',
    'motion pictures',
    'cinema',
    'music',
    'música',
    'photography',
    'fotografia',
    'comics',
    'comic books',
    'graphic novel',
    'quadrinhos',
    'mangá',
    'manga',
  ],
  Educação: [
    'educação',
    'education',
    'didático',
    'escolar',
    'dictionar',
    'dicionário',
    'grammar',
    'gramática',
    'language',
    'idioma',
    'teaching',
    'ensino',
  ],
  'Jornalismo / Reportagem': ['jornalismo', 'journalism', 'reportagem'],
  'Guias e Manuais': [
    'guia de ',
    'guia do ',
    'guia para',
    'manual',
    'guide',
    'cooking',
    'cookbook',
    'culinária',
    'receitas',
    'handicraft',
    'artesanato',
    'beadwork',
    'jiu-jitsu',
    'martial arts',
    'artes marciais',
  ],

  Poesia: ['poesia', 'poetry'],
  Contos: ['contos', 'conto', 'short stories'],
  Crônicas: ['crônica'],
  Teatro: ['teatro', 'dramaturgia', 'playwriting'],
  Ensaios: ['ensaio', 'essay', 'criticism', 'crítica literária'],
};

/**
 * Only for genres with bullets in BookLog's taxonomy. Checked after the
 * primary genre, over every term, so a book can carry more than one.
 */
const SUBGENRE_KEYWORDS: Partial<
  Record<CanonicalGenre, Record<string, string[]>>
> = {
  Romance: {
    'Romance contemporâneo': ['contemporâneo', 'contemporary romance'],
    'Comédia romântica': ['comédia romântica', 'romantic comedy'],
    'Romance histórico': ['romance histórico', 'historical romance'],
    'Romance paranormal': ['paranormal romance', 'romance paranormal'],
    'Romance erótico': ['erótico', 'erotic romance'],
    'Dark romance': ['dark romance'],
  },
  Fantasia: {
    'Alta fantasia': ['alta fantasia', 'high fantasy'],
    'Fantasia urbana': ['fantasia urbana', 'urban fantasy'],
    'Fantasia histórica': ['fantasia histórica', 'historical fantasy'],
    'Fantasia paranormal': ['fantasia paranormal', 'paranormal fantasy'],
    'Dark fantasy': ['dark fantasy'],
    Gaslamp: ['gaslamp'],
  },
  'Ficção Científica': {
    'Space opera': ['space opera'],
    Cyberpunk: ['cyberpunk'],
    'Ficção científica militar': [
      'ficção científica militar',
      'military science fiction',
    ],
    'Viagem no tempo': ['viagem no tempo', 'time travel'],
  },
  'Suspense / Thriller': {
    'Thriller psicológico': ['thriller psicológico', 'psychological thriller'],
    'Thriller político': ['thriller político', 'political thriller'],
    'Thriller de espionagem': ['espionagem', 'spy thriller', 'espionage'],
  },
  'Policial / Crime': {
    Noir: ['noir'],
    Detetive: ['detetive', 'detective'],
    'Crime organizado': ['crime organizado', 'organized crime'],
  },
  'Terror / Horror': {
    'Horror psicológico': ['horror psicológico', 'psychological horror'],
    'Horror sobrenatural': ['horror sobrenatural', 'supernatural horror'],
    Gótico: ['gótico', 'gothic'],
  },
};

const AUDIENCE_KEYWORDS: Record<Audience, string[]> = {
  // Stems, not "infantil"/"juvenil": the Portuguese plurals ("infantis",
  // "juvenis") do not contain the singular -il form as a substring.
  Infantil: ['infanti', 'children', 'kids'],
  'Middle Grade / Infantojuvenil': ['infantojuveni', 'middle grade'],
  'Jovem Adulto': [
    'juveni',
    'jovem adulto',
    'jovens adultos',
    'young adult',
    'adolescente',
    'teen',
  ],
  'New Adult': ['new adult'],
};

/**
 * A starting point, not a closed list: unlike genres, themes are meant to
 * grow freely as real catalog data surfaces more of them.
 */
const THEME_KEYWORDS: Record<string, string[]> = {
  'LGBTQ+': ['lgbt', 'gay', 'lésbic', 'lesbian', 'queer', 'trans'],
  Família: ['família', 'family'],
  Amizade: ['amizade', 'friendship'],
  Diversidade: ['diversidade', 'diversity'],
  'Saúde mental': ['saúde mental', 'mental health'],
  Guerra: ['guerra', 'war'],
  Mitologia: ['mitologia', 'mythology', 'mitológic'],
  'Escola / Universidade': [
    'escola',
    'universidade',
    'school',
    'college',
    'university',
  ],
  'Coming of age': ['coming of age', 'amadurecimento'],
  Feminismo: ['feminismo', 'feminism'],
  'Questões sociais': [
    'questões sociais',
    'problemas sociais',
    'social issues',
  ],
  Natal: ['natal', 'christmas'],
  'Viagem no tempo': ['viagem no tempo', 'time travel'],
  Vampiros: ['vampiro', 'vampire'],
  Bruxas: ['bruxa', 'witch'],
  Dragões: ['dragão', 'dragões', 'dragon'],
  Isekai: ['isekai'],
  Shounen: ['shounen', 'shonen'],
  Shoujo: ['shoujo', 'shojo'],
  Seinen: ['seinen'],
  Josei: ['josei'],
  'Slice of life': ['slice of life'],
  'Super-heróis': ['super-heró', 'super-hero', 'superhero', 'super heroes'],
  Esportes: ['esporte', 'sports'],
  Sobrenatural: ['sobrenatural', 'supernatural'],
  Ação: ['ação', 'action'],
};

/**
 * "Ficção"/"literatura" alone, checked only once nothing more specific has
 * matched (a term about "Ficção Científica" or "Ficção Histórica" is caught
 * by its own genre first). Kept apart from Ficção Contemporânea's
 * own keywords above so this generic fallback cannot pre-empt every other
 * fiction genre just because their names also contain the word "ficção".
 */
const GENERIC_FICTION_FALLBACK = [
  'ficção',
  'fiction',
  'literatura',
  'literature',
  'novels',
  'romans',
  'stories',
];

/**
 * How a work is published, not what it is about. A closed, small list on
 * purpose (it drives UI labels and filters); most-specific first, because a
 * "Webtoon" or "Light Novel" term must not be read as the broader "HQ".
 */
export const PUBLICATION_TYPES = [
  'light_novel',
  'webtoon',
  'manhwa',
  'manga',
  'graphic_novel',
  'comic',
] as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[number];

const PUBLICATION_TYPE_KEYWORDS: Record<PublicationType, string[]> = {
  light_novel: ['light novel', 'light novels'],
  webtoon: ['webtoon'],
  manhwa: ['manhwa', 'manhua'],
  manga: ['mangá', 'manga', 'mangas'],
  graphic_novel: ['graphic novel', 'graphic novels', 'romance gráfico'],
  comic: [
    'quadrinho',
    'quadrinhos',
    'história em quadrinhos',
    'histórias em quadrinhos',
    'comic book',
    'comics',
    'hq',
    'hqs',
  ],
};

/**
 * Amazon's department node that lists all three words at once says nothing
 * about the book it is attached to.
 */
const GENERIC_PUBLICATION_NODES = [
  'hqs, mangás e graphic novels',
  'hqs mangas e graphic novels',
  'comics & graphic novels',
  'comics, manga & graphic novels',
].map(fold);

const MAX_SUBGENRES = 3;
const MAX_THEMES = 6;

/**
 * Amazon merchandising/shopping-guide nodes that happen to contain a genre
 * word without meaning it: "Guia de Compras de Livros Infantis" is a buying
 * guide, not a children's book, and "Feriados e Festivais..." is a seasonal
 * gift-guide category attached to all sorts of unrelated titles.
 */
const NOISE_PHRASES = ['guia de compras', 'feriados e festivais'].map(fold);

/**
 * Amazon's store navigation nodes, compared whole: they sit on every book and
 * say nothing about it.
 */
const NAVIGATION_NODES = [
  'departamentos',
  'departments',
  'livros',
  'books',
  'ebooks',
  'ebooks kindle',
  'kindle ebooks',
  'kindle store',
  'loja kindle',
  'lojas especiais',
  'special stores',
  'mais vendidos',
  'best sellers',
  'bestsellers',
].map(fold);

/**
 * Words that say a term is about fiction: "World War, 1939-1945 -- Fiction"
 * is a novel set in the war, not a history book.
 */
const FICTION_MARKERS = ['fiction', 'ficção', 'ficcao', 'novel', 'romance'];
const NON_FICTION_MARKERS = [
  'não ficção',
  'nao ficcao',
  'non fiction',
  'nonfiction',
];

/**
 * Open Library subjects that describe a catalog listing, not the book:
 * reading lists, bestseller badges, cataloguing schemes. Checked only when
 * picking a genre, so audience/theme detection still sees them.
 */
const SUBJECT_NOISE = [
  'new york times',
  'staff picks',
  'large type',
  'juvenile literature',
  'open syllabus',
  'ocolc',
  'protected daisy',
  'in library',
  'accessible book',
  'internet archive',
  'overdrive',
  'reading level',
].map(fold);

/** A keyword starting with "^" must match whole words ("law", not "outlaw"). */
function matchesKeyword(folded: string, keyword: string): boolean {
  if (keyword.startsWith('^')) {
    return ` ${folded} `.includes(` ${fold(keyword.slice(1))} `);
  }
  // Otherwise at the start of a word: "art" is not in "Departamentos" or
  // "Heart", "cultura" not in "Agricultura"; a stem ("polici") still finds
  // "policiais".
  return ` ${folded}`.includes(` ${fold(keyword)}`);
}

function fold(text: string): string {
  return foldText(text).join(' ');
}

function isNoise(folded: string): boolean {
  return NOISE_PHRASES.some((phrase) => folded.includes(phrase));
}

function presentTerms(terms: Array<string | null | undefined>): string[] {
  return terms.filter((term): term is string => Boolean(term?.trim()));
}

/** Which canonical genre, if any, this single term is about. */
function classifyTerm(term: string): CanonicalGenre | null {
  const folded = fold(term);
  if (
    isNoise(folded) ||
    SUBJECT_NOISE.some((phrase) => folded.includes(phrase)) ||
    GENERIC_PUBLICATION_NODES.includes(folded) ||
    NAVIGATION_NODES.includes(folded)
  ) {
    return null;
  }

  for (const genre of CANONICAL_GENRES) {
    if (
      GENRE_KEYWORDS[genre].some((keyword) => matchesKeyword(folded, keyword))
    ) {
      // A non-fiction topic named in a fiction term only says it is fiction.
      if (
        NON_FICTION_GENRES.has(genre) &&
        FICTION_MARKERS.some((marker) => matchesKeyword(folded, marker)) &&
        !NON_FICTION_MARKERS.some((marker) => matchesKeyword(folded, marker))
      ) {
        return GENERIC_FALLBACK_GENRE;
      }
      return genre;
    }
  }

  if (
    GENERIC_FICTION_FALLBACK.some((keyword) => folded.includes(fold(keyword)))
  ) {
    return 'Ficção Contemporânea';
  }

  return null;
}

export const GENERIC_FALLBACK_GENRE: CanonicalGenre = 'Ficção Contemporânea';

/**
 * The genre most of the provider's terms agree on (Amazon's browse nodes,
 * Google's split BISAC categories). Each term votes for the first, most
 * specific genre it names; a term that names none, or that is one of
 * Amazon's generic merchandising nodes, does not vote. Ties go to whichever
 * genre is listed first in `CANONICAL_GENRES`.
 *
 * The generic fallback only wins when no specific genre got any vote at all:
 * Amazon repeats boilerplate "Ficção ..." filler terms often enough that,
 * counted like any other genre, they could outvote a real, specific genre
 * whose own terms happen to vary in wording.
 */
export function classifyGenre(terms: Array<string | null | undefined>): string {
  const votes = genreVotes(terms);

  let winner: CanonicalGenre | null = null;
  let best = 0;

  for (const genre of CANONICAL_GENRES) {
    if (genre === GENERIC_FALLBACK_GENRE) continue;

    const count = votes.get(genre) ?? 0;
    if (count > best) {
      best = count;
      winner = genre;
    }
  }

  if (winner) return winner;

  return (votes.get(GENERIC_FALLBACK_GENRE) ?? 0) > 0
    ? GENERIC_FALLBACK_GENRE
    : UNCATEGORIZED_GENRE;
}

function genreVotes(
  terms: Array<string | null | undefined>,
): Map<CanonicalGenre, number> {
  const votes = new Map<CanonicalGenre, number>();
  for (const term of presentTerms(terms)) {
    const genre = classifyTerm(term);
    if (genre) votes.set(genre, (votes.get(genre) ?? 0) + 1);
  }
  return votes;
}

/**
 * Fiction genres a book can carry two of ("Romance e Fantasia"), with the
 * short name each takes inside the combined label.
 */
const COMBINABLE_GENRES: Partial<Record<CanonicalGenre, string>> = {
  Romance: 'Romance',
  Fantasia: 'Fantasia',
  'Ficção Científica': 'Ficção Científica',
  Distopia: 'Distopia',
  'Suspense / Thriller': 'Suspense',
  Mistério: 'Mistério',
  'Policial / Crime': 'Policial',
  'Terror / Horror': 'Terror',
  'Ficção Histórica': 'Ficção Histórica',
  Aventura: 'Aventura',
};

/**
 * BookLog's genre for the catalog: the classified genre, or two fiction
 * genres in one label ("Romance e Fantasia", taxonomy order) when the terms
 * name a second one at least half as often as the first. `parts` are the
 * canonical genres behind the label (for subgenres). Open Library subjects
 * are ranked, so their first genre leads (`ranked`).
 */
export function classifyBooklogGenre(
  terms: Array<string | null | undefined>,
  options: { ranked?: boolean } = {},
): { label: string; parts: string[] } {
  const primary = options.ranked
    ? classifyGenreOfFirstSubject(terms)
    : classifyGenre(terms);
  if (!(primary in COMBINABLE_GENRES))
    return { label: primary, parts: [primary] };

  const votes = genreVotes(terms);
  const primaryVotes = votes.get(primary as CanonicalGenre) ?? 0;
  let second: CanonicalGenre | null = null;
  for (const genre of CANONICAL_GENRES) {
    const count = votes.get(genre) ?? 0;
    if (
      genre !== primary &&
      genre in COMBINABLE_GENRES &&
      count > 0 &&
      count * 2 >= primaryVotes &&
      count > (second ? votes.get(second)! : 0)
    ) {
      second = genre;
    }
  }
  if (!second) return { label: primary, parts: [primary] };

  const pair = CANONICAL_GENRES.filter(
    (genre) => genre === primary || genre === second,
  );
  return {
    label: pair.map((genre) => COMBINABLE_GENRES[genre]).join(' e '),
    parts: pair,
  };
}

/** Internal candidate retrieval uses the same aliases as catalog classification. */
export function genreSearchTerms(genre: string): string[] {
  const canonical = classifyGenre([genre]);
  return canonical === UNCATEGORIZED_GENRE
    ? [genre]
    : [canonical, ...GENRE_KEYWORDS[canonical as CanonicalGenre]];
}

/**
 * Open Library's subjects are roughly ranked by relevance, so the genre of the first subject that
 * names one wins — unless another genre is named by at least [FIRST_SUBJECT_OVERRIDE] more
 * subjects. A single weak early subject ("Ghosts" on a Harry Potter edition) no longer outweighs
 * five later ones that agree ("Vampires", "Magic and Supernatural", "Wizards", "Magic", "Magia"),
 * while a book whose first subject is its genre keeps it ("Fantasy", "Love", "Romance" stays
 * fantasy). Ties among the challengers go to the one named first. Listing noise and subjects that
 * name nothing are skipped, "Biography" is a form heading that decides on its own, and the generic
 * "Fiction" only wins when no subject is more specific.
 */
export function classifyGenreOfFirstSubject(
  subjects: Array<string | null | undefined>,
): string {
  let generic = false;
  let first: CanonicalGenre | null = null;
  const votes = new Map<CanonicalGenre, number>();

  for (const subject of presentTerms(subjects)) {
    const genre = classifyTerm(subject);
    if (!genre) continue;
    // "Biography" is a form heading, not a topic: "1939-1945 World War" next
    // to it describes what the biography is about.
    if (genre === 'Biografia / Memórias') return genre;
    if (genre === GENERIC_FALLBACK_GENRE) {
      generic = true;
      continue;
    }
    first ??= genre;
    votes.set(genre, (votes.get(genre) ?? 0) + 1);
  }

  if (first) {
    const firstVotes = votes.get(first) ?? 0;
    let challenger: CanonicalGenre | null = null;
    for (const [genre, count] of votes) {
      if (
        genre !== first &&
        count >= firstVotes + FIRST_SUBJECT_OVERRIDE &&
        count > (challenger ? votes.get(challenger)! : 0)
      ) {
        challenger = genre;
      }
    }
    return challenger ?? first;
  }

  return generic ? GENERIC_FALLBACK_GENRE : UNCATEGORIZED_GENRE;
}

/** How many more subjects another genre needs to overrule the first subject's genre. */
const FIRST_SUBJECT_OVERRIDE = 2;

/** Subgenres of `genre` that any of the terms name, in the taxonomy's own order. */
export function classifySubgenres(
  terms: Array<string | null | undefined>,
  genre: string,
): string[] {
  const dictionary = SUBGENRE_KEYWORDS[genre as CanonicalGenre];
  if (!dictionary) return [];

  const folded = presentTerms(terms)
    .map(fold)
    .filter((term) => !isNoise(term));
  const found: string[] = [];

  for (const [subgenre, keywords] of Object.entries(dictionary)) {
    const matches = keywords.some((keyword) =>
      folded.some((term) => term.includes(fold(keyword))),
    );
    if (matches) found.push(subgenre);
    if (found.length >= MAX_SUBGENRES) break;
  }

  return found;
}

/**
 * The intended audience, if the terms say so (0 or 1 result: age bands are
 * not combined). Absence of a children's/YA signal is not read as "Adulto" -
 * that would be a guess the data does not support.
 */
export function classifyAudience(
  terms: Array<string | null | undefined>,
): string[] {
  const votes = new Map<Audience, number>();

  for (const term of presentTerms(terms)) {
    const folded = fold(term);
    if (isNoise(folded)) continue;

    for (const audience of AUDIENCES) {
      if (
        AUDIENCE_KEYWORDS[audience].some((keyword) =>
          folded.includes(fold(keyword)),
        )
      ) {
        votes.set(audience, (votes.get(audience) ?? 0) + 1);
        break;
      }
    }
  }

  let winner: Audience | null = null;
  let best = 0;

  for (const audience of AUDIENCES) {
    const count = votes.get(audience) ?? 0;
    if (count > best) {
      best = count;
      winner = audience;
    }
  }

  return winner ? [winner] : [];
}

/**
 * The publication type a term list names, or null when it names none (never
 * guessed: a book without a signal is not assumed to be a plain "book").
 * Matches whole words, so "hq" is not found inside another word.
 */
export function classifyPublicationType(
  terms: Array<string | null | undefined>,
): PublicationType | null {
  const folded = presentTerms(terms)
    .map(fold)
    .filter(
      (term) => !isNoise(term) && !GENERIC_PUBLICATION_NODES.includes(term),
    );
  if (folded.length === 0) return null;
  const words = folded.map((term) => ` ${term} `);

  for (const type of PUBLICATION_TYPES) {
    const matches = PUBLICATION_TYPE_KEYWORDS[type].some((keyword) =>
      words.some((term) => term.includes(` ${fold(keyword)} `)),
    );
    if (matches) return type;
  }
  return null;
}

/** Every theme any of the terms name (not a vote: themes are tags, not a single pick). */
export function classifyThemes(
  terms: Array<string | null | undefined>,
): string[] {
  const folded = presentTerms(terms)
    .map(fold)
    .filter((term) => !isNoise(term));
  const found: string[] = [];

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    const matches = keywords.some((keyword) =>
      folded.some((term) => term.includes(fold(keyword))),
    );
    if (matches) found.push(theme);
    if (found.length >= MAX_THEMES) break;
  }

  return found;
}

/**
 * Names the catalog and the providers use for a genre, mapped to BookLog's
 * own (lower-case keys). `null` means "not a genre" (a shelf name such as
 * "Favoritos") and drops the value.
 */
const GENRE_ALIASES: Record<string, string | null> = {
  'drama / ficção contemporânea': 'Ficção Contemporânea',
  drama: 'Ficção Contemporânea',
  ficção: 'Ficção Contemporânea',
  fiction: 'Ficção Contemporânea',
  'brazilian literature': 'Ficção Contemporânea',
  fantasy: 'Fantasia',
  suspense: 'Suspense / Thriller',
  thriller: 'Suspense / Thriller',
  biografia: 'Biografia / Memórias',
  biography: 'Biografia / Memórias',
  'fé e espiritualidade': 'Religião e Espiritualidade',
  'personal development': 'Autoajuda / Desenvolvimento Pessoal',
  productivity: 'Autoajuda / Desenvolvimento Pessoal',
  'self-help': 'Autoajuda / Desenvolvimento Pessoal',
  autoajuda: 'Autoajuda / Desenvolvimento Pessoal',
  product: 'Negócios e Finanças',
  technology: 'Tecnologia',
  'software architecture': 'Tecnologia',
  'software engineering': 'Tecnologia',
  javascript: 'Tecnologia',
  design: 'Artes e Cultura',
  classics: 'Clássicos',
  clássico: 'Clássicos',
  uncategorized: UNCATEGORIZED_GENRE,
  favoritos: null,
};

const CANONICAL_BY_KEY = new Map<string, string>(
  CANONICAL_GENRES.map((genre) => [genre.toLocaleLowerCase('pt-BR'), genre]),
);

/**
 * A stored genre list in BookLog's own names: aliases and other casings
 * become the official genre, values that are not genres are dropped, and
 * repeats collapse (first position wins). An unknown value is kept as it is.
 * A list that ends up empty after dropping becomes Uncategorized.
 */
export function normalizeGenreList(
  values: ReadonlyArray<string | null | undefined> | null | undefined,
): string[] {
  const out: string[] = [];
  let dropped = false;

  for (const value of values ?? []) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase('pt-BR');
    const mapped =
      CANONICAL_BY_KEY.get(key) ??
      (key in GENRE_ALIASES ? GENRE_ALIASES[key] : trimmed);
    if (mapped === null) {
      dropped = true;
      continue;
    }
    if (!out.includes(mapped)) out.push(mapped);
  }

  if (out.length === 0 && dropped) return [UNCATEGORIZED_GENRE];
  // A real genre makes "Uncategorized" next to it meaningless.
  return out.length > 1 ? out.filter((g) => g !== UNCATEGORIZED_GENRE) : out;
}

/**
 * Words a synopsis uses when it is about one genre. Stricter than the
 * category keywords: a synopsis is prose, so a single word ("reino",
 * "amor") proves nothing. Only used when the providers' categories named no
 * genre at all.
 */
const SYNOPSIS_KEYWORDS: Partial<Record<CanonicalGenre, string[]>> = {
  Fantasia: [
    'magia',
    'mágic',
    'feiticeir',
    'bruxa',
    'dragão',
    'dragões',
    'feéric',
    'fadas',
    'elfo',
    'reino',
    'profecia',
    'magic',
    'wizard',
    'sorcer',
    'witch',
    'dragon',
    'faerie',
    'kingdom',
    'prophecy',
  ],
  Romance: [
    'apaixon',
    'romance',
    'namorad',
    'casamento',
    'beijo',
    'amor da sua vida',
    'falls in love',
    'fall in love',
    'love story',
    'romantic',
    'boyfriend',
  ],
  Distopia: [
    'distópic',
    'distopia',
    'totalitári',
    'regime',
    'rebelião',
    'dystopi',
    'totalitarian',
    'rebellion',
  ],
  'Ficção Científica': [
    'nave espacial',
    'espaçonave',
    'planeta',
    'galáxia',
    'alienígena',
    'inteligência artificial',
    'spaceship',
    'starship',
    'planet',
    'galaxy',
    'alien',
    'artificial intelligence',
  ],
  'Suspense / Thriller': [
    'assassinato',
    'assassino',
    'desaparec',
    'sequestr',
    'thriller',
    'murder',
    'killer',
    'disappear',
    'kidnap',
  ],
  'Terror / Horror': [
    'assombr',
    'demônio',
    'fantasma',
    'possessão',
    'haunted',
    'demon',
    'ghost',
    'possession',
  ],
  Mistério: ['mistério', 'detetive', 'investigação', 'mystery', 'detective'],
  'Biografia / Memórias': [
    'biografia',
    'memórias',
    'autobiografia',
    'biography',
    'memoir',
  ],
  'Autoajuda / Desenvolvimento Pessoal': [
    'hábitos',
    'autoconhecimento',
    'produtividade',
    'habits',
    'self-help',
    'mindset',
  ],
};

/** Hits a genre needs, and how far ahead of the next one, to be trusted. */
const SYNOPSIS_MIN_HITS = 2;

/**
 * The genre a synopsis is clearly about, or null. Each keyword counts once;
 * the winner needs at least two different keywords and strictly more than
 * any other genre, so an ambiguous text stays unclassified.
 */
export function classifyGenreFromSynopsis(
  synopsis: string | null | undefined,
): CanonicalGenre | null {
  const folded = ` ${fold(synopsis ?? '')} `;
  if (folded.trim().length === 0) return null;

  let winner: CanonicalGenre | null = null;
  let best = 0;
  let tie = false;

  for (const genre of CANONICAL_GENRES) {
    const keywords = SYNOPSIS_KEYWORDS[genre];
    if (!keywords) continue;
    const hits = keywords.filter((keyword) =>
      folded.includes(fold(keyword)),
    ).length;
    if (hits > best) {
      best = hits;
      winner = genre;
      tie = false;
    } else if (hits === best && hits > 0) {
      tie = true;
    }
  }

  return best >= SYNOPSIS_MIN_HITS && !tie ? winner : null;
}
