// Registre des emblèmes animés : un module par cours (hero() et card() renvoient le contenu SVG).
import { paper, VB } from './kit.js';
import * as classif from './classif.js';
import * as generic from './generic.js';
import * as visu from './visu.js';
import * as nosql from './nosql.js';
import * as acp from './acp.js';
import * as optreg from './optreg.js';
import * as reglin from './reglin.js';
import * as introds from './introds.js';

const REG = { classif, visu, nosql, acp, optreg, reglin, introds, generic };

/** Balisage SVG complet de l'emblème `id` à la taille 'hero' ou 'card' (emblème générique si l'id est inconnu). */
export function emblemSVG(id, size = 'card') {
  const s = size === 'hero' ? 'hero' : 'card';
  const m = REG[id] || REG.generic;
  const [w, h] = VB[s];
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${paper(w, h, s)}${m[s]()}</svg>`;
}
export const EMBLEM_IDS = Object.keys(REG);
