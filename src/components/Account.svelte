<script>
  import { configured, session, syncState, lastSync, syncError, sendCode, verifyCode, authMessage, signOut, syncAll } from '../lib/sync.js';
  import { allLocal, merge, replaceAll, progress } from '../lib/progress.js';
  import { get } from 'svelte/store';
  import { link } from '../lib/router.js';

  let email = $state('');
  let sent = $state(false);
  let busy = $state(false);
  let msg = $state('');
  let fileInput = $state(null);

  let code = $state('');
  let wait = $state(0);
  let codeInput = $state(null);
  let ticker = null;

  function cooldown() {
    wait = 60; clearInterval(ticker);
    ticker = setInterval(() => { if (--wait <= 0) clearInterval(ticker); }, 1000);
  }

  async function login(e) {
    e?.preventDefault();
    busy = true; msg = '';
    try { await sendCode(email.trim()); sent = true; code = ''; cooldown(); setTimeout(() => codeInput?.focus(), 50); }
    catch (err) { msg = authMessage(err); }
    busy = false;
  }

  async function check(e) {
    e?.preventDefault();
    const t = code.replace(/\D/g, '');
    if (t.length < 6) return;
    busy = true; msg = '';
    try { await verifyCode(email.trim(), t); sent = false; code = ''; }
    catch (err) { msg = authMessage(err); }
    busy = false;
  }

  // ne garde que les chiffres (6, ou jusqu'à 8 selon le réglage Supabase)
  function onCode(e) {
    code = e.currentTarget.value.replace(/\D/g, '').slice(0, 8);
    e.currentTarget.value = code;
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
      <p class="lead">Code envoyé à <b>{email}</b>. Recopie-le ici (l'e-mail peut arriver dans les indésirables).</p>
      <form class="login code-form" onsubmit={check}>
        <label for="code">Code de connexion</label>
        <div class="row">
          <input id="code" class="code-input" bind:this={codeInput} value={code} oninput={onCode}
            inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="8" placeholder="123456" aria-describedby="code-help" />
          <button class="btn primary" disabled={busy || code.length < 6}>{busy ? 'Vérification…' : 'Se connecter'}</button>
        </div>
        <small id="code-help" class="muted">Valable une heure. Tu peux aussi cliquer sur le bouton de l'e-mail, à condition de l'ouvrir sur cet appareil.</small>
      </form>
      <div class="row">
        <button class="btn" disabled={busy || wait > 0} onclick={login}>{wait > 0 ? `Renvoyer un code (${wait} s)` : 'Renvoyer un code'}</button>
        <button class="btn" onclick={() => { sent = false; msg = ''; }}>Changer d'adresse</button>
      </div>
    {:else}
      <p class="lead">Connecte-toi avec ton adresse e-mail pour retrouver ta progression sur tous tes appareils. Pas de mot de passe : tu reçois un code à 6 chiffres.</p>
      <form class="login" onsubmit={login}>
        <label for="email">Adresse e-mail</label>
        <div class="row"><input id="email" type="email" required autocomplete="email" bind:value={email} placeholder="prenom.nom@exemple.fr" /><button class="btn primary" disabled={busy}>{busy ? 'Envoi…' : 'Recevoir un code'}</button></div>
      </form>
    {/if}
    {#if msg}<p class="lead {sent ? 'err-msg' : ''}" role="status">{msg}</p>{/if}
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
