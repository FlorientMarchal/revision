import 'katex/dist/katex.min.css';
import './app.css';
import './shell.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { initSync } from './lib/sync.js';

initSync();
mount(App, { target: document.getElementById('app') });
