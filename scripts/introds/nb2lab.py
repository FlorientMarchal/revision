"""Convertit les notebooks corrigés du cours (dossier nb/) en labos Python pour le site (src/courses/introds/pylabs.json).

Chaque cellule de texte ouvre un bloc ; la cellule de code qui suit lui est rattachée. Quand le texte pose une
question ou un exercice, le code du notebook devient le corrigé et le bloc part d'un code de départ (signature et
docstring des fonctions à compléter, ou les lignes de données et de vérification). Sinon le code est donné tel quel.
Usage : python3 scripts/introds/nb2lab.py
"""
import json, re, subprocess, html, pathlib

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent.parent / 'src' / 'courses' / 'introds' / 'pylabs.json'
DATA = HERE.parent.parent / 'public' / 'courses' / 'introds' / 'data'

LABS = [
    # id, fichier, libellé court, titre, partie
    ('py01', '01_demarrer_Python_avec_un_notebook', '01 · Notebook', 'Démarrer Python avec un notebook', 'base'),
    ('py02', '02_structures_de_controle', '02 · Contrôle', 'Structures de contrôle', 'base'),
    ('py03', '03_correction_Monte_Carlo', '03 · Monte-Carlo', 'Estimer π par la méthode de Monte-Carlo', 'base'),
    ('py04', '04_correction_listes1', '04 · Listes 1', 'Listes 1 : définition et parcours', 'base'),
    ('py05', '05_correction_fonctions', '05 · Fonctions', 'Fonctions', 'base'),
    ('py06', '06_correction_modules', '06 · Modules', 'Modules', 'base'),
    ('py07', '07_correction_listes2', '07 · Listes 2', 'Listes 2 : constructions et compréhensions', 'base'),
    ('py08', '08_correction_temps_execution', '08 · Temps', "Mesurer le temps d'exécution", 'base'),
    ('py09', '09_correction_ensembles_listes3_String', '09 · Ensembles', 'Ensembles, listes 3 (tranches, copies) et chaînes', 'base'),
    ('py10', '10_correction_listes_de_listes', '10 · Listes 2D', 'Listes de listes : le Sudoku', 'base'),
    ('py11', '11_correction_dictionnaires', '11 · Dictionnaires', 'Dictionnaires : compter les mots', 'base'),
    ('py12', '12_correction_dictionnaire_autour_codage_par_substitution', '12 · Codage', 'Dictionnaires : codage par substitution', 'base'),
    ('py13', '13_correction_definir_de_nouveaux_types', '13 · Types', 'Définir de nouveaux types (Enum, classes)', 'base'),
    ('py20', '20_correction_complements', '20 · Compléments', 'Exercices supplémentaires', 'base'),
    ('numpy', 'numpy_meteo_correction', 'NumPy', 'NumPy : analyse de données météo', 'data'),
    ('pandas', 'pandas_velos_correction', 'Pandas', 'Pandas : manipuler et explorer des données (vélos)', 'data'),
    ('pandas2', 'pandas_avance_energie_correction', 'Pandas avancé', 'Pandas avancé : jointures et agrégations (énergie)', 'data'),
    ('mpl', 'matplotlib_correction', 'Matplotlib', 'Matplotlib : tracer des graphiques', 'data'),
    ('sns', 'seaborn_mobilite_correction', 'Seaborn', 'Seaborn : visualisation statistique (mobilité)', 'data'),
]

ASK = re.compile(r'QUESTION|Exercice|Compl[ée]t|Écri|Ecri|Réécri|Recopi|Constru|Calculez|Trouvez|Que fait|'
                 r'Dans la cellule suivante|Supprimez|À vous|A vous|Modifi|Utilisez cette possibilité|Réponse', re.I)
# consigne écrite en commentaire au début de la cellule de code (notebooks de G. Richomme)
CODE_ASK = re.compile(r'^\s*#\s*(Affiche|Ici vot|Testez ici|Compl[ée]t|Écri|Ecri|Réécri|Reproduis|Faites|Sur la ligne suivante|'
                      r'Ajout|Recopi|Constru|Calcul|Définis|Trouv|Modifi|Vérifiez ci-dessous)', re.I)
NOTE = re.compile(r'emarque|orrection|pédagogique|solution', re.I)


def md2html(md):
    # pandoc veut une ligne vide avant une liste
    lines, prev = [], ''
    for l in md.split('\n'):
        if re.match(r'\s*([*-]|\d+\.)\s', l) and prev.strip() and not re.match(r'\s*([*-]|\d+\.)\s', prev):
            lines.append('')
        lines.append(l); prev = l
    md = '\n'.join(lines)
    md = re.sub(r'<div>\s*<img[^>]*>\s*</div>', '', md)
    md = re.sub(r'<img[^>]*>', '', md)
    out = subprocess.run(['pandoc', '-f', 'markdown+tex_math_dollars', '-t', 'html', '--mathjax', '--wrap=none'],
                         input=md, capture_output=True, text=True, check=True).stdout
    out = re.sub(r'<a [^>]*>(.*?)</a>', r'\1', out, flags=re.S)          # pas de liens vers d'autres sites
    out = re.sub(r'<span style="color:\s*\w+">(.*?)</span>', r'\1', out, flags=re.S)
    out = re.sub(r'<span class="math (?:inline|display)">(.*?)</span>', r'\1', out, flags=re.S)
    out = re.sub(r'\s(id|class)="[^"]*"', '', out)
    out = re.sub(r'https?://\S+', '', out)                                 # URL écrites en clair
    return out.strip()


def split_correction(md):
    """Sépare « QUESTION … » et « CORRECTION … » dans une même cellule de texte."""
    m = re.search(r'(<span[^>]*>)?\s*\*\*\s*CORRECTION\s*:?\s*\*\*\s*:?', md)
    if not m:
        return md, ''
    return md[:m.start()], md[m.end():].replace('</span>', '', 1)


LITERAL = re.compile(r'^\s*[A-Za-z_]\w*(\s*,\s*[A-Za-z_]\w*)*\s*=\s*(\[|\(|\{|"|\'|-?\d|np\.array|pd\.DataFrame|True|False|None)')


def starter(code):
    lines = code.split('\n')
    if re.search(r'^\s*(def|class) ', code, re.M):
        out, i = [], 0
        while i < len(lines):
            l = lines[i]
            if re.match(r'^\s*(def|class) ', l):
                ind = len(l) - len(l.lstrip()) + 4
                out.append(l); i += 1
                # docstring
                if i < len(lines) and lines[i].strip()[:3] in ('"""', "'''"):
                    q = lines[i].strip()[:3]
                    out.append(lines[i])
                    if not (lines[i].strip().count(q) >= 2 and len(lines[i].strip()) > 3):
                        i += 1
                        while i < len(lines) and q not in lines[i]:
                            out.append(lines[i]); i += 1
                        if i < len(lines): out.append(lines[i])
                    i += 1
                out.append(' ' * ind + 'pass  # à compléter')
                # saute le corps
                while i < len(lines) and (not lines[i].strip() or len(lines[i]) - len(lines[i].lstrip()) >= ind):
                    i += 1
            elif (l.strip().startswith('#') and not NOTE.search(l)) or LITERAL.match(l) or l.strip().startswith(('import ', 'from ')):
                out.append(l); i += 1
            else:
                i += 1
        return '\n'.join(out).rstrip() + '\n'
    keep = [l for l in lines if (l.strip().startswith('#') and not NOTE.search(l)) or LITERAL.match(l) or l.strip().startswith(('import ', 'from '))]
    s = '\n'.join(keep).rstrip()
    if not s.strip() or s.strip() == code.strip():
        return '# À toi de jouer\n'
    return s + '\n# À toi de jouer\n'


def esc(s):
    return html.escape(s, quote=False)


def convert(lab):
    id_, fname, short, title, part = lab
    nb = json.load(open(HERE / 'nb' / (fname + '.ipynb')))
    chunks, cur, n = [], None, 0
    intro = None
    for c in nb['cells']:
        src = ''.join(c['source']).strip()
        if not src:
            continue
        if c['cell_type'] == 'markdown' and re.match(r'(def|class|import|from) ', src):
            c = {**c, 'cell_type': 'code'}          # code collé par erreur dans une cellule de texte
        m = re.match(r'# %load (\w+\.py)\n', src)
        if c['cell_type'] == 'code' and m and m.group(1) != 'coucou.py':
            # module affiché avec %load : on le fournit aussi comme fichier importable
            (DATA / m.group(1)).write_text(src[m.end():].lstrip('\n') + '\n', encoding='utf-8')
        if c['cell_type'] == 'markdown':
            q, corr = split_correction(src)
            # premier titre du notebook : sert d'introduction
            if intro is None and not chunks and re.match(r'\s*(<div>.*?</div>\s*)?#\s', q, re.S):
                q = re.sub(r'^\s*(<div>.*?</div>\s*)?#\s[^\n]*\n?', '', q, flags=re.S)
                intro = md2html(q) if q.strip() else ''
                continue
            n += 1
            h = re.match(r'\s*#{2,4}\s+(.*)', q)
            t = None
            if h and '\n' not in q.strip():
                t = re.sub(r'\*\*|`', '', h.group(1)).strip()
                q = ''
            elif h:
                t = re.sub(r'\*\*|`', '', h.group(1)).strip()
                q = q[h.end():]
            cur = {'id': f'c{n}'}
            if t: cur['t'] = t
            if q.strip(): cur['html'] = md2html(q)
            cur['_ask'] = bool(ASK.search(q)) or bool(corr)
            if corr.strip(): cur['_corr'] = md2html(corr)
            chunks.append(cur)
        elif c['cell_type'] == 'code':
            code = src
            if cur is None or 'code' in cur or 'sol' in cur:
                n += 1
                cur = {'id': f'c{n}', '_ask': False}
                chunks.append(cur)
            first = next((l for l in code.split('\n') if l.strip()), '')
            if cur['_ask'] or CODE_ASK.match(first):
                cur['sol'] = code
                cur['code'] = starter(code)
                cur['src'] = 'À toi'
                if cur.get('_corr'):
                    cur['solHtml'] = cur['_corr'] + '<pre class="r-solcode"><code>' + esc(code) + '</code></pre>'
            else:
                cur['code'] = code
    for ch in chunks:
        if ch.get('_corr') and 'sol' not in ch:      # question sans code : la correction s'affiche après
            ch['after'] = '<p><b>Correction.</b></p>' + ch['_corr']
        ch.pop('_ask', None); ch.pop('_corr', None)
    # fusionne les titres seuls avec le bloc suivant
    merged = []
    for ch in chunks:
        if merged and set(merged[-1]) <= {'id', 't'} and 't' not in ch:
            ch = {**ch, 't': merged[-1]['t'], 'id': merged[-1]['id']}
            merged[-1] = ch
        else:
            merged.append(ch)
    lab = {'id': id_, 'short': short, 't': title, 'part': part, 'solLabel': 'Corrigé du notebook', 'chunks': merged}
    if intro: lab['d'] = intro
    return lab


labs = [convert(l) for l in LABS]
OUT.parent.mkdir(parents=True, exist_ok=True)
json.dump(labs, open(OUT, 'w'), ensure_ascii=False, indent=1)
for l in labs:
    print(l['id'], len(l['chunks']), 'blocs', sum('sol' in c for c in l['chunks']), 'exercices')
