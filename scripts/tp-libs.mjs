// Copie D3 et jQuery à côté des fichiers de chaque TP, pour que les balises du prof
// <script src="d3.min.js"> et <script src="jquery.min.js"> marchent telles quelles dans le labo.
import { copyFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const libs = { 'd3.min.js': 'node_modules/d3/dist/d3.min.js', 'jquery.min.js': 'node_modules/jquery/dist/jquery.min.js' };
for (const course of readdirSync('public/courses')) {
  const tp = join('public/courses', course, 'tp');
  try { if (!statSync(tp).isDirectory()) continue; } catch { continue; }
  for (const dir of readdirSync(tp)) {
    const d = join(tp, dir);
    if (!statSync(d).isDirectory()) continue;
    for (const [name, from] of Object.entries(libs)) copyFileSync(from, join(d, name));
  }
}
