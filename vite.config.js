import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Le site est servi par GitHub Pages sous /revision/.
export default defineConfig({
  base: '/revision/',
  plugins: [svelte({
    // les composants sont recréés pour chaque cours ({#key}) : lire la valeur initiale des props est voulu
    onwarn: (w, h) => { if (w.code !== 'state_referenced_locally') h(w); },
  })],
  build: { chunkSizeWarningLimit: 900 },
  // l'aperçu des TP tourne dans une iframe isolée (origine « null ») qui charge les fichiers JSON des TP
  server: { cors: true },
  preview: { cors: true },
});
