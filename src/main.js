import 'katex/dist/katex.min.css';
import './app.css';
import './shell.css';
import './motion-shell.css';
import './motion-components.css';
import './emblems.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { initSync } from './lib/sync.js';
import { smoothSliders } from './lib/smooth-sliders.js';

initSync();
smoothSliders();
mount(App, { target: document.getElementById('app') });
