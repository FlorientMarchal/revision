<script>
  // Labo de TP : l'énoncé avec les extraits de code fournis par l'enseignant (copiés tels quels),
  // un éditeur qui part de ses fichiers de départ, et un aperçu qui exécute la page avec ses données.
  import { onMount, tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { lens } from '../lib/motion-components.js';
  import { codeEditor, historyStep } from '../lib/editor.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  const labs = data.labs;
  const allExos = labs.flatMap(l => l.exos.map(x => ({ ...x, lab: l })));

  let labId = $state(labs.find(l => l.id === ui.get('lab')) ? ui.get('lab') : labs[0].id);
  const lab = $derived(labs.find(l => l.id === labId));
  let exoId = $state(null);
  $effect(() => {
    const saved = ui.get('labExo:' + labId);
    if (!lab.exos.find(x => x.id === exoId)) exoId = lab.exos.find(x => x.id === saved) ? saved : lab.exos[0].id;
  });
  const exo = $derived(lab.exos.find(x => x.id === exoId) || lab.exos[0]);

  // Sur le site public, l'aperçu est isolé (origine opaque). En local, le navigateur interdit à une origine opaque
  // de lire localhost : on lève alors l'isolation, sans risque puisque c'est ton propre code sur ta machine.
  const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const SANDBOX = 'allow-scripts allow-modals' + (LOCAL ? ' allow-same-origin' : '');
  const base = sub => new URL(import.meta.env.BASE_URL + 'courses/' + course.id + '/' + sub, location.href).href;
  const CODE = id => 'labCode:' + id;

  /** Code de départ d'un exercice : fichier de l'enseignant, ou ton code d'un exercice précédent. */
  function starter(x) {
    if (x.start.html !== undefined) return x.start.html;
    const from = allExos.find(e => e.id === x.start.from);
    return ui.get(CODE(from.id)) ?? starter(from);
  }

  let code = $state('');
  let editor = $state(null);
  let frame = $state(null);
  let logs = $state([]);
  let srcdoc = $state('');
  let copied = $state('');
  let ran = $state(false);
  let wide = $state(false);
  let runSt = $state('');   // '' | 'run' | 'done' : le bouton passe de ▶ à la roue puis à la coche
  let runT = null;
  function runDone() {
    if (runSt !== 'run') return;
    runSt = 'done'; clearTimeout(runT); runT = setTimeout(() => (runSt = ''), 1400);
  }

  $effect(() => {
    const x = exo;
    code = ui.get(CODE(x.id)) ?? starter(x);
    logs = []; ran = false; srcdoc = '';
  });

  function save() { ui.set(CODE(exo.id), code); }
  function chooseLab(id) { labId = id; ui.set('lab', id); }
  function chooseExo(id) { exoId = id; ui.set('labExo:' + labId, id); }

  // ---------- exécution ----------
  let token = '';
  function shim(tok) {
    // capture console.* et les erreurs de la page testée pour les afficher sous l'aperçu
    return `<script>(function(){var P=parent,T=${JSON.stringify(tok)};function s(v,top){try{if(v===undefined)return'undefined';if(v===null)return'null';if(typeof v==='string')return top?v:JSON.stringify(v);if(typeof v==='function')return'ƒ '+(v.name||'()');if(typeof v!=='object')return String(v);if(v.nodeType===1)return v.outerHTML.length>240?v.outerHTML.slice(0,240)+'…':v.outerHTML;if(v.jquery)return'jQuery('+v.length+')'+(v[0]&&v[0].outerHTML?' '+s(v[0]):'');var seen=[];var j=JSON.stringify(v,function(k,x){if(x&&typeof x==='object'){if(x.nodeType)return'<'+(x.tagName||'#').toLowerCase()+'>';if(seen.indexOf(x)>=0)return'[…]';seen.push(x)}if(typeof x==='function')return'ƒ';return x});return j&&j.length>4000?j.slice(0,4000)+' …':j}catch(e){return String(v)}}['log','info','warn','error','debug'].forEach(function(k){var o=console[k];console[k]=function(){var a=[].map.call(arguments,function(x){return s(x,1)});try{P.postMessage({__lab:T,level:k,text:a.join(' ')},'*')}catch(e){}if(o)o.apply(console,arguments)}});addEventListener('error',function(e){P.postMessage({__lab:T,level:'error',text:(e.message||'Erreur')+(e.lineno?' (ligne '+e.lineno+')':'')},'*')});addEventListener('unhandledrejection',function(e){var r=e.reason;P.postMessage({__lab:T,level:'error',text:'Promesse rejetée : '+(r&&r.message?r.message:String(r))},'*')})})();<\/script>`;
  }
  function build(html) {
    token = Math.random().toString(36).slice(2);
    const head = `<base href="${base('tp/' + lab.folder + '/')}">` + shim(token);
    // inséré sur la même ligne que <head> : les numéros de ligne des erreurs restent ceux de ton fichier
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + head);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + '<head>' + head + '</head>');
    return head + html;
  }
  async function run() {
    save();
    logs = [];
    srcdoc = '';
    await tick();
    runSt = 'run'; clearTimeout(runT); runT = setTimeout(runDone, 2500);
    srcdoc = build(code);
    ran = true;
  }
  onMount(() => {
    const onMsg = e => {
      if (!frame || e.source !== frame.contentWindow || !e.data || e.data.__lab !== token) return;
      logs = [...logs.slice(-199), { level: e.data.level, text: e.data.text }];
    };
    addEventListener('message', onMsg);
    const mq = matchMedia('(min-width: 1100px)');
    const upd = () => (wide = mq.matches);
    upd(); mq.addEventListener('change', upd);
    return () => { removeEventListener('message', onMsg); mq.removeEventListener('change', upd); };
  });

  // ---------- éditeur ----------
  function onKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); return; }
  }
  let saveTimer = null;
  function onInput(e) { code = e.currentTarget.value; clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }

  // insère l'extrait sur sa propre ligne, aligné sur l'indentation de la ligne du curseur
  async function insert(snippet) {
    if (!editor) return;
    const v = editor.value;
    const a = editor.selectionStart ?? v.length, b = editor.selectionEnd ?? a;
    const lineStart = v.lastIndexOf('\n', a - 1) + 1;
    const before = v.slice(lineStart, a);
    // curseur en début de ligne : on reprend l'indentation de la ligne précédente
    const prev = v.slice(v.lastIndexOf('\n', lineStart - 2) + 1, Math.max(lineStart - 1, 0));
    const indent = (before || prev).match(/^[ \t]*/)[0];
    let text = snippet.split('\n').map((l, i) => (i && l ? indent + l : l)).join('\n');
    if (before.trim()) text = '\n' + indent + text;
    const eol = v.indexOf('\n', b);
    if (v.slice(b, eol === -1 ? v.length : eol).trim()) text += '\n' + indent;
    editor.focus();
    editor.setRangeText(text, a, b, 'end');
    code = editor.value; save();
  }
  async function copy(snippet, key) {
    try { await navigator.clipboard.writeText(snippet); copied = key; setTimeout(() => { if (copied === key) copied = ''; }, 1500); }
    catch (e) { insert(snippet); }
  }
  function reset() {
    if (!confirm(exo.start.html !== undefined ? 'Remettre le fichier de départ de l\'enseignant ? Ton code actuel sera effacé.' : 'Repartir de ton code de l\'exercice précédent ? Ton code actuel sera effacé.')) return;
    code = starter(exo); save(); logs = []; srcdoc = ''; ran = false;
  }
  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([code], { type: 'text/html' }));
    a.download = exo.save || 'exercice.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const done = id => ($prog['tp:' + id] || {}).v === 1;
  const nDone = l => l.exos.filter(x => done(x.id)).length;
</script>

<div class="chips" role="tablist" aria-label="TP" use:lens>
  {#each labs as l (l.id)}
    <button class="chip" aria-pressed={l.id === labId} onclick={() => chooseLab(l.id)}>{l.short}{#if nDone(l)}<span class="chip-count">{nDone(l)}/{l.exos.length}</span>{/if}</button>
  {/each}
</div>

<section class="card lab-intro">
  <h2>{lab.t}</h2>
  {@html lab.d}
  <div class="chips lab-exos" role="tablist" aria-label="Exercices" use:lens>
    {#each lab.exos as x (x.id)}
      <button class="chip" aria-pressed={x.id === exo.id} onclick={() => chooseExo(x.id)}>{#if done(x.id)}<span class="chip-ok" aria-label="terminé">✓</span>{/if}{x.short}</button>
    {/each}
  </div>
</section>

<div class="lab" class:lab-wide={wide}>
  {#key exo.id}<article class="card lab-steps">
    <header>
      <h2>{exo.t}</h2>
      {#if exo.goal}<p class="lead">{@html exo.goal}</p>{/if}
    </header>
    {#if exo.files && exo.files.length}
      <p class="lab-files">Fichiers disponibles dans l'aperçu :
        {#each exo.files as f, i}{#if i}, {/if}<a href={base('tp/' + lab.folder + '/' + f)} target="_blank" rel="noopener"><code>{f}</code></a>{/each}
        {#if exo.libs}{#each exo.libs as f}, <code>{f}</code>{/each}{/if}
      </p>
    {/if}
    <ol class="lab-list">
      {#each exo.steps as s, si}
        <li>
          {#if s.html}<div class="lab-text">{@html s.html}</div>{/if}
          {#if s.code}
            <div class="snippet">
              <div class="snippet-bar">
                <span>Code fourni{#if s.src} · {s.src}{/if}</span>
                <span class="snippet-btns">
                  <button class="btn small mc-copy" class:is-copied={copied === exo.id + si} onclick={() => copy(s.code, exo.id + si)}>{copied === exo.id + si ? 'Copié ✓' : 'Copier'}</button>
                  <button class="btn small" onclick={() => insert(s.code)} title="Insère le code à l'endroit du curseur dans l'éditeur">Insérer</button>
                </span>
              </div>
              <pre><code>{s.code}</code></pre>
            </div>
          {/if}
          {#if s.note}<p class="lab-note">{@html s.note}</p>{/if}
          {#if s.figs}
            <div class="lab-figs">
              {#each s.figs as f}<figure><img src={base('img/' + f.src)} alt={f.cap} loading="lazy" /><figcaption>{f.cap}</figcaption></figure>{/each}
            </div>
          {/if}
        </li>
      {/each}
    </ol>
    <label class="read-toggle">
      <input type="checkbox" checked={done(exo.id)} onchange={e => setVal(course.id, 'tp:' + exo.id, e.currentTarget.checked ? 1 : 0)} />
      J'ai réussi cet exercice
    </label>
  </article>{/key}

  <section class="card lab-run" aria-label="Éditeur et aperçu" data-editor>
    <div class="lab-bar">
      <b class="lab-file">{exo.save || 'exercice.html'}</b>
      <span class="lab-btns">
        <button class="btn primary mc-run" class:is-run={runSt === 'run'} class:is-done={runSt === 'done'} onclick={run} title="Ctrl/⌘ + Entrée"><span class="mc-run-ic" aria-hidden="true"><svg viewBox="0 0 16 16"><path class="i-play" d="M5 3.2v9.6L12.6 8z" /><circle class="i-spin" cx="8" cy="8" r="5.6" pathLength="1" /><path class="i-ok" d="M3.6 8.4l3 3 5.8-6.6" pathLength="1" /></svg></span>{runSt === 'done' ? 'Exécuté' : 'Exécuter'}</button>
        <button class="btn small ed-hist" onclick={e => historyStep(e.currentTarget, -1)} title="Annuler (Ctrl/⌘ + Z)" aria-label="Annuler">↶</button><button class="btn small ed-hist" onclick={e => historyStep(e.currentTarget, 1)} title="Rétablir (Ctrl/⌘ + Maj + Z)" aria-label="Rétablir">↷</button>
        <button class="btn small" onclick={reset}>{exo.start.html !== undefined ? 'Fichier de départ' : 'Repartir de l\'exo précédent'}</button>
        <button class="btn small" onclick={download}>Télécharger</button>
      </span>
    </div>
    <textarea class="lab-editor" bind:this={editor} value={code} oninput={onInput} onkeydown={onKey} use:codeEditor={{ unit: '\t', onChange: v => { code = v; save(); } }}
      spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code de l'exercice"></textarea>
    <p class="lab-hint">Ton code est enregistré sur cet appareil. <kbd>Tab</kbd> / <kbd>Maj</kbd> + <kbd>Tab</kbd> indentent ou désindentent les lignes sélectionnées, <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> annule, <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Entrée</kbd> exécute.</p>
    <div class="lab-out">
      {#if ran}
        <iframe bind:this={frame} title="Aperçu de la page" sandbox={SANDBOX} {srcdoc} onload={runDone}></iframe>
      {:else}
        <div class="lab-empty">Clique sur <b>▶ Exécuter</b> pour voir ta page.</div>
      {/if}
    </div>
    <div class="lab-console" aria-live="polite">
      <div class="lab-console-bar"><b>Console</b>{#if logs.length}<button class="btn small" onclick={() => (logs = [])}>Effacer</button>{/if}</div>
      {#if logs.length}
        {#each logs as l}<pre class="log log-{l.level}">{l.text}</pre>{/each}
      {:else}
        <p class="lab-empty-log">Les <code>console.log</code> et les erreurs de ta page s'affichent ici.</p>
      {/if}
    </div>
  </section>
</div>
