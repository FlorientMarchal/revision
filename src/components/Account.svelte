<script>
  import { configured, session, syncState, lastSync, syncError, sendLink, signOut, syncAll } from '../lib/sync.js';
  import { allLocal, merge, replaceAll, progress } from '../lib/progress.js';
  import { get } from 'svelte/store';
  import { link } from '../lib/router.js';

  let email = $state('');
  let sent = $state(false);
  let busy = $state(false);
  let msg = $state('');
  let fileInput = $state(null);

  async function login(e) {
    e.preventDefault();
    busy = true; msg = '';
    try { await sendLink(email.trim()); sent = true; }
    catch (err) { msg = 'Envoi impossible : ' + (err.message || err); }
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
  <section class="card">
    <h2>Synchronisation de la progression</h2>
    {#if !configured}
      <p class="lead">La synchronisation entre appareils n'est pas encore activée sur ce site. Ta progression est enregistrée dans ce navigateur, et tu peux la sauvegarder ci-dessous.</p>
    {:else if $session}
      <p class="lead">Connecté en tant que <b>{$session.user.email}</b>. Ta progression est enregistrée sur cet appareil et synchronisée automatiquement.</p>
      <dl class="sync-info">
        <div><dt>État</dt><dd class="st-{$syncState}">{({ idle: 'en attente', syncing: 'synchronisation…', ok: 'à jour', error: 'erreur' })[$syncState] || $syncState}</dd></div>
        <div><dt>Dernière synchronisation</dt><dd>{fmtDate($lastSync)}</dd></div>
      </dl>
      {#if $syncError}<p class="err-msg">{$syncError}</p>{/if}
      <div class="row"><button class="btn primary" onclick={syncAll}>Synchroniser maintenant</button><button class="btn" onclick={signOut}>Se déconnecter</button></div>
    {:else if sent}
      <p class="lead">Un lien de connexion a été envoyé à <b>{email}</b>. Ouvre-le <b>sur cet appareil</b> : tu reviendras ici, connecté. Pense à regarder dans les indésirables.</p>
      <button class="btn" onclick={() => (sent = false)}>Utiliser une autre adresse</button>
    {:else}
      <p class="lead">Connecte-toi avec ton adresse e-mail pour retrouver ta progression sur tous tes appareils. Pas de mot de passe : tu reçois un lien de connexion.</p>
      <form class="login" onsubmit={login}>
        <label for="email">Adresse e-mail</label>
        <div class="row"><input id="email" type="email" required autocomplete="email" bind:value={email} placeholder="prenom.nom@exemple.fr" /><button class="btn primary" disabled={busy}>{busy ? 'Envoi…' : 'Recevoir le lien'}</button></div>
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
