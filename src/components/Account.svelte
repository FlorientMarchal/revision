<script>
  import { configured, session, syncState, lastSync, syncError, signIn, signOut, syncAll } from '../lib/sync.js';
  import { allLocal, merge, replaceAll, progress } from '../lib/progress.js';
  import { get } from 'svelte/store';
  import { link } from '../lib/router.js';

  let email = $state('');
  let busy = $state(false);
  let msg = $state('');
  let fileInput = $state(null);

  async function login(e) {
    e.preventDefault();
    busy = true; msg = '';
    try { await signIn(email); }
    catch (err) { msg = 'Connexion impossible : ' + (err.message || err); }
    busy = false;
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'revision', version: 1, date: new Date().toISOString(), progress: allLocal() }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `progression-revisions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function importData(e) {
    const f = e.currentTarget.files[0];
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const p = j.progress || {};
      for (const [course, map] of Object.entries(p)) replaceAll(course, merge(get(progress(course)), map));
      msg = `Sauvegarde importée (${Object.keys(p).length} cours), fusionnée avec la progression actuelle.`;
      syncAll();
    } catch (err) { msg = 'Fichier illisible : ' + (err.message || err); }
    e.currentTarget.value = '';
  }

  const fmtDate = d => d ? d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
</script>

<main class="panel account">
  <a class="back-link" href={link()}>← Retour aux cours</a>
  <section class="card">
    <h2>Synchronisation de la progression</h2>
    {#if !configured}
      <p class="lead">La synchronisation entre appareils n'est pas encore activée sur ce site. Ta progression est enregistrée dans ce navigateur, et tu peux la sauvegarder ci-dessous.</p>
    {:else if $session}
      <p class="lead">Progression liée à <b>{$session.email}</b>. Elle est enregistrée sur cet appareil et synchronisée automatiquement.</p>
      <dl class="sync-info">
        <div><dt>État</dt><dd class="st-{$syncState} sync-st"><span class="sync-ic" aria-hidden="true"><svg viewBox="0 0 20 20"><circle class="s-ring" cx="10" cy="10" r="7" pathLength="1" /><path class="s-ok" d="M6.2 10.4l2.6 2.6 5-5.6" pathLength="1" /><path class="s-err" d="M10 5.8v5M10 13.6v.4" pathLength="1" /></svg></span>{({ idle: 'en attente', syncing: 'synchronisation…', ok: 'à jour', error: 'erreur' })[$syncState] || $syncState}</dd></div>
        <div><dt>Dernière synchronisation</dt><dd>{fmtDate($lastSync)}</dd></div>
      </dl>
      {#if $syncError}<p class="err-msg">{$syncError}</p>{/if}
      <div class="row"><button class="btn primary" onclick={syncAll}>Synchroniser maintenant</button><button class="btn" onclick={signOut}>Changer d'adresse</button></div>
    {:else}
      <p class="lead">Entre ton adresse e-mail pour retrouver ta progression sur tous tes appareils : utilise la même partout. Aucun e-mail n'est envoyé, pas de mot de passe.</p>
      <form class="login" onsubmit={login}>
        <div class="row"><div class="fl-field"><input id="email" type="email" required autocomplete="email" bind:value={email} placeholder="prenom.nom@exemple.fr" /><label for="email">Adresse e-mail</label><i class="fl-line" aria-hidden="true"></i></div><button class="btn primary mc-run" class:is-run={busy} disabled={busy}><span class="mc-run-ic" aria-hidden="true"><svg viewBox="0 0 16 16"><path class="i-play i-line" d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" /><circle class="i-spin" cx="8" cy="8" r="5.6" pathLength="1" /></svg></span>{busy ? 'Connexion…' : 'Continuer'}</button></div>
        <small class="muted">L'adresse sert seulement d'identifiant : elle reste dans ton navigateur, le serveur n'en reçoit qu'une empreinte chiffrée.</small>
      </form>
    {/if}
    {#if msg}<p class="lead" role="status">{msg}</p>{/if}
  </section>

  <section class="card">
    <h3>Sauvegarde manuelle</h3>
    <p class="lead">Exporte ta progression dans un fichier, ou importe un fichier exporté depuis un autre appareil. L'import fusionne : rien n'est perdu.</p>
    <div class="row">
      <button class="btn" onclick={exportData}>Exporter ma progression</button>
      <button class="btn" onclick={() => fileInput.click()}>Importer un fichier</button>
      <input type="file" accept="application/json,.json" hidden bind:this={fileInput} onchange={importData} />
    </div>
  </section>
  <p><a href={link()}>← Retour aux cours</a></p>
</main>
