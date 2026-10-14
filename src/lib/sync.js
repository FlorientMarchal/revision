// Synchronisation de la progression avec Supabase, identifiée par l'adresse e-mail (sans compte ni mot de passe).
// L'adresse ne quitte pas le navigateur : on n'envoie que son empreinte SHA-256.
import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { allLocal, merge, replaceAll, onChange, progress } from './progress.js';

export const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = configured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  : null;

const ID_KEY = 'rev:identity';

/** Identité courante : { email, key } ou null. */
export const session = writable(null);
/** État affiché : 'off' (non configuré), 'out' (pas d'adresse), 'idle', 'syncing', 'ok', 'error'. */
export const syncState = writable(configured ? 'out' : 'off');
export const lastSync = writable(null);
export const syncError = writable('');

const pending = new Set();
let timer = null;

async function hashEmail(email) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('revision:' + email));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchRemote(key) {
  const { data, error } = await supabase.rpc('get_progress', { p_key: key });
  if (error) throw error;
  return Object.fromEntries((data || []).map(r => [r.course, r.data]));
}

async function pullPush(courses) {
  const s = get(session);
  if (!supabase || !s) return;
  syncState.set('syncing');
  try {
    const remote = await fetchRemote(s.key);
    const list = courses || [...new Set([...Object.keys(allLocal()), ...Object.keys(remote)])];
    for (const c of list) {
      const merged = merge(get(progress(c)), remote[c] || {});
      replaceAll(c, merged);
      const { error } = await supabase.rpc('save_progress', { p_key: s.key, p_course: c, p_data: merged });
      if (error) throw error;
    }
    lastSync.set(new Date());
    syncError.set('');
    syncState.set('ok');
  } catch (e) {
    syncError.set(/fetch|network/i.test(e.message || '') ? 'Pas de connexion au serveur : la progression reste enregistrée sur cet appareil.' : (e.message || String(e)));
    syncState.set('error');
  }
}

/** Synchronise tous les cours (locaux et déjà enregistrés en ligne). */
export const syncAll = () => pullPush(null);

function schedule(course) {
  if (!supabase || !get(session)) return;
  pending.add(course);
  clearTimeout(timer);
  timer = setTimeout(() => { const list = [...pending]; pending.clear(); pullPush(list); }, 1500);
}

export async function signIn(email) {
  email = email.trim().toLowerCase();
  const id = { email, key: await hashEmail(email) };
  try { localStorage.setItem(ID_KEY, JSON.stringify(id)); } catch (e) { /* session seulement */ }
  session.set(id);
  syncState.set('idle');
  await syncAll();
}

export function signOut() {
  try { localStorage.removeItem(ID_KEY); } catch (e) { /* rien */ }
  session.set(null);
  syncState.set(configured ? 'out' : 'off');
}

export function initSync() {
  if (!supabase) return;
  onChange(schedule);
  let id = null;
  try { id = JSON.parse(localStorage.getItem(ID_KEY)); } catch (e) { /* rien */ }
  if (id && id.key) { session.set(id); syncState.set('idle'); syncAll(); }
  window.addEventListener('focus', () => { if (get(session)) syncAll(); });
}
