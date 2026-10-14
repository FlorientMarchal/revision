// R dans le navigateur avec webR (R compilé en WebAssembly) : une seule session R partagée par tout le site,
// chargée à la demande (≈ 20 Mo la première fois, ensuite en cache).
import { writable } from 'svelte/store';

const VERSION = 'v0.5.4';
const BASE = `https://webr.r-wasm.org/${VERSION}/`;

/** 'off' | 'loading' | 'ready' | 'busy' | 'error' */
export const rState = writable('off');
export const rMessage = writable('');

let webR = null;
let booting = null;
const installed = new Set();
let queue = Promise.resolve();

export function startR() {
  if (booting) return booting;
  rState.set('loading');
  rMessage.set('Chargement de R… (la première fois, environ 20 Mo à télécharger)');
  booting = (async () => {
    const { WebR, ChannelType } = await import(/* @vite-ignore */ BASE + 'webr.mjs');
    webR = new WebR({ baseUrl: BASE, channelType: ChannelType.PostMessage, interactive: false });
    await webR.init();
    await webR.evalRVoid('options(width = 80, digits = 7)');
    rState.set('ready');
    rMessage.set('');
    return webR;
  })().catch(e => {
    booting = null;
    rState.set('error');
    rMessage.set('Impossible de lancer R : ' + (e.message || e));
    throw e;
  });
  return booting;
}

/** Paquets appelés par library(), require(), requireNamespace() ou pkg:: dans le code. */
function packagesIn(code) {
  const out = new Set();
  for (const m of code.matchAll(/\b(?:library|require|requireNamespace)\(\s*["']?([A-Za-z][\w.]*)/g)) out.add(m[1]);
  for (const m of code.matchAll(/\b([A-Za-z][\w.]*)::/g)) out.add(m[1]);
  ['base', 'stats', 'graphics', 'grDevices', 'utils', 'datasets', 'methods', 'webr'].forEach(p => out.delete(p));
  return [...out].filter(p => !installed.has(p));
}

/**
 * Exécute du code R dans la session partagée. Renvoie { out: [{type, text}], images: [ImageBitmap], error }.
 * Les exécutions sont mises en file : jamais deux en même temps.
 */
export function runR(code) {
  const job = queue.then(async () => {
    const r = await startR();
    rState.set('busy');
    const out = [];
    let images = [], error = '';
    const pk = packagesIn(code);
    if (pk.length) {
      rMessage.set('Installation des paquets : ' + pk.join(', ') + '…');
      try { await r.installPackages(pk, { quiet: true }); pk.forEach(p => installed.add(p)); }
      catch (e) { out.push({ type: 'stderr', text: 'Paquet indisponible : ' + pk.join(', ') }); }
      rMessage.set('');
    }
    const shelter = await new r.Shelter();
    try {
      const cap = await shelter.captureR(code, {
        withAutoprint: true, captureStreams: true, captureConditions: false,
        captureGraphics: { width: 720, height: 540, bg: 'white' },
      });
      for (const o of cap.output) out.push({ type: o.type, text: String(o.data) });
      images = cap.images || [];
    } catch (e) {
      error = e && e.message ? e.message : String(e);
    } finally {
      shelter.purge();
      rState.set('ready');
    }
    return { out, images, error };
  });
  queue = job.catch(() => {});
  return job;
}

export async function resetR() {
  const r = await startR();
  await r.evalRVoid('rm(list = ls(envir = globalenv()), envir = globalenv()); grDevices::graphics.off()');
}
