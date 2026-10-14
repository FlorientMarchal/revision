// Connexion (lien envoyé par e-mail) et synchronisation de la progression avec Supabase.
import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { allLocal, merge, replaceAll, onChange, progress } from './progress.js';

export const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = configured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } })
  : null;

export const session = writable(null);
/** État affiché : 'off' (non configuré), 'out' (déconnecté), 'idle', 'syncing', 'ok', 'error'. */
export const syncState = writable(configured ? 'out' : 'off');
export const lastSync = writable(null);
export const syncError = writable('');

const pending = new Set();
let timer = null;

async function pullPush(courses) {
  const s = get(session);
  if (!supabase || !s) return;
  syncState.set('syncing');
  try {
    const { data, error } = await supabase.from('progress').select('course, data').in('course', courses);
    if (error) throw error;
    const remote = Object.fromEntries((data || []).map(r => [r.course, r.data]));
    const rows = courses.map(c => {
      const merged = merge(get(progress(c)), remote[c] || {});
      replaceAll(c, merged);
      return { user_id: s.user.id, course: c, data: merged, updated_at: new Date().toISOString() };
    });
    const { error: e2 } = await supabase.from('progress').upsert(rows, { onConflict: 'user_id,course' });
    if (e2) throw e2;
    lastSync.set(new Date());
    syncError.set('');
    syncState.set('ok');
  } catch (e) {
    syncError.set(e.message || String(e));
    syncState.set('error');
  }
}

/** Synchronise tous les cours connus localement (et ceux déjà présents sur le serveur). */
export async function syncAll() {
  if (!supabase || !get(session)) return;
  const local = Object.keys(allLocal());
  let remote = [];
  try {
    const { data } = await supabase.from('progress').select('course');
    remote = (data || []).map(r => r.course);
  } catch (e) { /* on synchronise au moins le local */ }
  const all = [...new Set([...local, ...remote])];
  if (all.length) await pullPush(all);
  else syncState.set('ok');
}

function schedule(course) {
  if (!supabase || !get(session)) return;
  pending.add(course);
  clearTimeout(timer);
  timer = setTimeout(() => { const list = [...pending]; pending.clear(); pullPush(list); }, 1500);
}

/** Envoie l'e-mail de connexion : il contient un code à taper sur le site (et un lien de secours). */
export async function sendCode(email) {
  const redirect = location.origin + location.pathname;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
  if (error) throw error;
}

/** Vérifie le code reçu par e-mail : marche quel que soit l'appareil où l'e-mail a été ouvert. */
export async function verifyCode(email, token) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}

/** Messages d'erreur Supabase les plus courants, en français. */
export function authMessage(err) {
  const m = (err && (err.message || String(err))) || '';
  if (/rate limit|too many|security purposes/i.test(m)) return "Trop d'envois rapprochés : attends quelques minutes avant de redemander un code.";
  if (/expired|invalid|otp/i.test(m)) return 'Code incorrect ou expiré. Vérifie les chiffres, ou demande un nouveau code.';
  if (/fetch|network/i.test(m)) return 'Pas de connexion au serveur. Vérifie ta connexion internet.';
  return m;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export function initSync() {
  if (!supabase) return;
  onChange(schedule);
  supabase.auth.getSession().then(({ data }) => {
    session.set(data.session);
    syncState.set(data.session ? 'idle' : 'out');
    if (data.session) syncAll();
  });
  supabase.auth.onAuthStateChange((event, s) => {
    session.set(s);
    if (!s) { syncState.set('out'); return; }
    if (event === 'SIGNED_IN') syncAll();
  });
  // nettoie l'adresse après le retour du lien de connexion (?code=…)
  if (new URLSearchParams(location.search).has('code')) {
    setTimeout(() => history.replaceState(null, '', location.pathname + location.hash), 1500);
  }
  window.addEventListener('focus', () => { if (get(session)) syncAll(); });
}
