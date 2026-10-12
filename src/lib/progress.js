// Progression : enregistrée d'abord dans le navigateur, puis synchronisée avec Supabase si l'on est connecté.
// Chaque cours a une table « clé → {v: valeur, t: date} ». La fusion entre appareils garde l'entrée la plus récente,
// sauf pour les meilleurs scores (« best:… ») où l'on garde le maximum.
import { writable, get } from 'svelte/store';

const LS = 'rev:progress:';
const listeners = new Set();
const stores = {};

function read(course) {
  try { return JSON.parse(localStorage.getItem(LS + course) || '{}') || {}; } catch (e) { return {}; }
}
function write(course, map) {
  try { localStorage.setItem(LS + course, JSON.stringify(map)); } catch (e) { /* stockage indisponible */ }
}

/** Store Svelte de la progression d'un cours (objet clé → {v, t}). */
export function progress(course) {
  if (!stores[course]) stores[course] = writable(read(course));
  return stores[course];
}

export function getVal(course, key, def) {
  const e = get(progress(course))[key];
  return e && e.v !== null && e.v !== undefined ? e.v : def;
}

export function setVal(course, key, v) {
  const s = progress(course);
  s.update(m => {
    const n = { ...m, [key]: { v, t: Date.now() } };
    write(course, n);
    return n;
  });
  listeners.forEach(fn => fn(course));
}

/** Met à jour un meilleur score : ne baisse jamais. */
export function setBest(course, key, v) {
  if (v > getVal(course, key, -Infinity)) setVal(course, key, v);
}

export function merge(a, b) {
  const out = { ...a };
  for (const [k, e] of Object.entries(b || {})) {
    const cur = out[k];
    if (!cur) { out[k] = e; continue; }
    if (k.startsWith('best:')) out[k] = (e.v > cur.v) ? e : cur;
    else out[k] = (e.t > cur.t) ? e : cur;
  }
  return out;
}

/** Remplace la progression locale d'un cours (après fusion avec le serveur ou un import). */
export function replaceAll(course, map) {
  write(course, map);
  progress(course).set(map);
}

export function allLocal() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS)) out[k.slice(LS.length)] = read(k.slice(LS.length));
    }
  } catch (e) { /* rien */ }
  return out;
}

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Préférences d'affichage (onglet, chapitre…) : locales, jamais synchronisées. */
export function kv(course) {
  const p = 'rev:ui:' + course + ':';
  return {
    get(k, d) { try { const v = localStorage.getItem(p + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(p + k, JSON.stringify(v)); } catch (e) { /* rien */ } },
  };
}

/** Reprend une seule fois la progression de l'ancien site (cartes enregistrées par index). */
export function migrateLegacy(course, legacyPrefix, cardOrder) {
  const flag = 'rev:migrated:' + course;
  try {
    if (localStorage.getItem(flag)) return;
    const known = JSON.parse(localStorage.getItem(legacyPrefix + 'known') || 'null');
    const add = {};
    const t = Date.now();
    if (known && typeof known === 'object') {
      for (const [i, v] of Object.entries(known)) if (v && cardOrder[+i]) add['card:' + cardOrder[+i]] = { v: 1, t };
    }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(legacyPrefix + 'qbest:')) {
        const v = JSON.parse(localStorage.getItem(k));
        if (typeof v === 'number') add['best:quiz:' + k.slice((legacyPrefix + 'qbest:').length)] = { v, t };
      }
    }
    if (Object.keys(add).length) replaceAll(course, merge(read(course), add));
    localStorage.setItem(flag, '1');
  } catch (e) { /* rien */ }
}
