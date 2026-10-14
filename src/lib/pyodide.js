// Python dans le navigateur avec Pyodide (CPython compilé en WebAssembly) : une seule session Python partagée
// par tout le site, chargée à la demande (≈ 10 Mo la première fois, plus NumPy, Pandas, Matplotlib… si le code
// les importe). Mêmes principes que webr.js : file d'attente, sortie capturée, graphiques renvoyés en images.
import { writable } from 'svelte/store';

const VERSION = 'v0.26.4';
const BASE = `https://cdn.jsdelivr.net/pyodide/${VERSION}/full/`;

/** 'off' | 'loading' | 'ready' | 'busy' | 'error' */
export const pyState = writable('off');
export const pyMessage = writable('');

let py = null;
let booting = null;
let queue = Promise.resolve();
let files = {};          // nom de fichier → URL (données des TP), copiés dans le système de fichiers à la demande
const written = new Set();

/** Déclare les fichiers (CSV, modules .py) que le code peut ouvrir par leur nom. */
export function provideFiles(map) { files = { ...files, ...map }; }

// Exécution façon notebook : la dernière expression est affichée, les commandes « magiques » courantes
// (%matplotlib, %timeit, display) sont prises en charge, les figures Matplotlib sont récupérées en PNG.
const BOOT = `
import sys, io, ast, traceback, base64, time, types
_mod = types.ModuleType("__main__")   # module __main__ propre au labo (pour « from __main__ import … »)
_ns = _mod.__dict__

def _display(*objs):
    for o in objs:
        print(o if isinstance(o, str) else repr(o))
_ns["display"] = _display

def _input(msg=""):
    import js
    print(msg, end="")
    r = js.window.prompt(str(msg) or "Saisie (input)")
    if r is None:
        raise KeyboardInterrupt("saisie annulée")
    print(r)
    return r
import builtins
builtins.input = _input   # aussi dans les modules importés

def _writefile(code):
    head, _, body = code.partition("\\n")
    args = head.split()[1:]
    append = "-a" in args
    name = [a for a in args if a != "-a"][-1]
    with open(name, "a" if append else "w", encoding="utf-8") as f:
        f.write(body + "\\n")
    mod = name[:-3] if name.endswith(".py") else None
    if mod:
        _user_modules.add(mod)
        sys.modules.pop(mod, None)
    print(("Appending to " if append else "Writing ") + name)

def _timeit(stmt, ns):
    t0 = time.perf_counter(); n = 0
    while True:
        exec(stmt, ns); n += 1
        if time.perf_counter() - t0 > 0.2 or n >= 100000: break
    d = (time.perf_counter() - t0) / n
    u = [(1, "s"), (1e-3, "ms"), (1e-6, "µs"), (1e-9, "ns")]
    f, s = next(((f, s) for f, s in u if d >= f), u[-1])
    print(f"{d / f:.3g} {s} par exécution (moyenne sur {n} exécutions)")

def _magics(code):
    out = []
    for line in code.split("\\n"):
        st = line.strip()
        ind = line[: len(line) - len(line.lstrip())]
        if st.startswith("%timeit"):
            out.append(ind + "_timeit(" + repr(st[len("%timeit"):].strip()) + ", globals())")
        elif st.startswith("%run "):
            out.append(ind + "exec(open(" + repr(st[5:].strip()) + ", encoding='utf-8').read(), globals())")
        elif st.startswith("%") or st.startswith("!"):
            out.append(ind + "pass  # " + st)
        else:
            out.append(line)
    return "\\n".join(out)
_ns["_timeit"] = _timeit

def _figures():
    if "matplotlib.pyplot" not in sys.modules: return []
    plt = sys.modules["matplotlib.pyplot"]
    imgs = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=90, bbox_inches="tight")
        imgs.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return imgs

def _run(code):
    out, err = io.StringIO(), io.StringIO()
    so, se, main = sys.stdout, sys.stderr, sys.modules.get("__main__")
    sys.stdout, sys.stderr = out, err
    sys.modules["__main__"] = _mod
    error = ""
    try:
        if code.lstrip().startswith("%%writefile"):
            _writefile(code.lstrip())
            code = ""
        tree = ast.parse(_magics(code), "<cellule>", "exec")
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, "<cellule>", "exec"), _ns)
        if last is not None:
            v = eval(compile(last, "<cellule>", "eval"), _ns)
            if v is not None:
                print(v if type(v).__name__ in ("DataFrame", "Series") else repr(v))
    except BaseException as e:
        tb = traceback.extract_tb(e.__traceback__)
        tb = [f for f in tb if f.filename == "<cellule>"]
        lines = ["  ligne %d" % f.lineno + (" : " + f.line if f.line else "") for f in tb[-3:]]
        error = "\\n".join(lines + [type(e).__name__ + ": " + str(e)])
    finally:
        sys.stdout, sys.stderr = so, se
        sys.modules["__main__"] = main
    try:
        imgs = _figures()
    except Exception as e:
        imgs = []; error = error or ("Graphique : " + str(e))
    return [out.getvalue(), err.getvalue(), error, imgs]

def _reset():
    keep = {k: _ns[k] for k in ("__name__", "display", "_timeit") if k in _ns}
    _ns.clear(); _ns.update(keep)
    for m in [m for m in sys.modules if m in _user_modules]: del sys.modules[m]
_user_modules = set()
`;

export function startPy() {
  if (booting) return booting;
  pyState.set('loading');
  pyMessage.set('Chargement de Python… (la première fois, environ 10 Mo à télécharger)');
  booting = (async () => {
    const { loadPyodide } = await import(/* @vite-ignore */ BASE + 'pyodide.mjs');
    py = await loadPyodide({ indexURL: BASE });
    await py.runPythonAsync(BOOT);
    pyState.set('ready');
    pyMessage.set('');
    return py;
  })().catch(e => {
    booting = null;
    pyState.set('error');
    pyMessage.set('Impossible de lancer Python : ' + (e.message || e));
    throw e;
  });
  return booting;
}

const PKG = { numpy: 'NumPy', pandas: 'Pandas', matplotlib: 'Matplotlib', seaborn: 'Seaborn', scipy: 'SciPy' };

async function prepare(p, code) {
  // paquets importés par le code (numpy, pandas, matplotlib, seaborn…)
  const imports = new Set();
  for (const m of code.matchAll(/^\s*(?:import|from)\s+([A-Za-z_]\w*)/gm)) imports.add(m[1]);
  const need = [...imports].filter(m => PKG[m] && !p.loadedPackages[m]);
  if (need.length) {
    pyMessage.set('Chargement de ' + need.map(m => PKG[m]).join(', ') + '…');
    if (need.includes('seaborn')) {
      await p.loadPackage(['micropip', 'numpy', 'pandas', 'matplotlib', 'scipy']);
      const micropip = p.pyimport('micropip');
      await micropip.install('seaborn');
    } else {
      await p.loadPackagesFromImports(code);
    }
    if (imports.has('matplotlib') || imports.has('seaborn')) await p.runPythonAsync('import matplotlib; matplotlib.use("AGG")');
    pyMessage.set('');
  }
  // fichiers de données et modules cités dans le code (ou importés)
  for (const [name, url] of Object.entries(files)) {
    if (written.has(name)) continue;
    const mod = name.endsWith('.py') ? name.slice(0, -3) : null;
    if (!code.includes(name) && !(mod && imports.has(mod))) continue;
    const res = await fetch(url);
    if (!res.ok) continue;
    p.FS.writeFile(name, new Uint8Array(await res.arrayBuffer()));
    written.add(name);
    if (mod) await p.runPythonAsync(`_user_modules.add(${JSON.stringify(mod)})`);
  }
}

async function toBitmap(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return createImageBitmap(new Blob([bytes], { type: 'image/png' }));
}

/** Même interface que runR : { out: [{type, text}], images: [ImageBitmap], error }. */
export function runPy(code) {
  const job = queue.then(async () => {
    const p = await startPy();
    pyState.set('busy');
    const out = [];
    let images = [], error = '';
    try {
      await prepare(p, code);
      const res = p.globals.get('_run')(code);
      const [so, se, err, imgs] = res.toJs();
      res.destroy();
      if (so) out.push({ type: 'stdout', text: so.replace(/\n$/, '') });
      if (se) out.push({ type: 'stderr', text: se.replace(/\n$/, '') });
      error = err;
      images = await Promise.all(imgs.map(toBitmap));
    } catch (e) {
      error = e && e.message ? e.message : String(e);
      pyMessage.set('');
    } finally {
      pyState.set('ready');
    }
    return { out, images, error };
  });
  queue = job.catch(() => {});
  return job;
}

export async function resetPy() {
  const p = await startPy();
  p.globals.get('_reset')();
}
