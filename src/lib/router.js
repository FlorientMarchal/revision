// Navigation par l'ancre de l'adresse : #/ (accueil), #/c/<cours>/<onglet>, #/compte.
import { readable } from 'svelte/store';

function parse() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  // anciens liens du site mono-cours (#fiches, #annales…)
  if (/^(fiches|flash|quiz|outils|annales|tp)$/.test(h)) return { name: 'course', course: 'classif', tab: h };
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'c' && parts[1]) return { name: 'course', course: parts[1], tab: parts[2] || '' };
  if (parts[0] === 'compte') return { name: 'account' };
  return { name: 'home' };
}

export const route = readable(parse(), set => {
  const on = () => { set(parse()); window.scrollTo({ top: 0 }); };
  window.addEventListener('hashchange', on);
  return () => window.removeEventListener('hashchange', on);
});

export const link = (...parts) => '#/' + parts.filter(Boolean).join('/');
