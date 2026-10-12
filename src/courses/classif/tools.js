import { $, fmt, esc, rng } from '../../lib/common.js';
import { kv } from '../../lib/progress.js';
import { CAH_PRESETS } from './data.js';
const store = kv('classif');
/* =====================================================================
   OUTILS INTERACTIFS
   ===================================================================== */
function renderOutils(p){
  p.innerHTML = `
  <p class="lead">Refais les calculs des annales et vérifie tes réponses. Chaque outil est prérempli avec un exemple tiré des examens ou des TP.</p>
  <div class="chips" id="tool-chips">
    <button class="chip" data-t="cah">CAH + dendrogramme</button>
    <button class="chip" data-t="conf">Matrice de confusion</button>
    <button class="chip" data-t="multi">Macro / micro-average</button>
    <button class="chip" data-t="imp">Gini / entropie</button>
    <button class="chip" data-t="roc">Courbe ROC</button>
    <button class="chip" data-t="km">K-means pas à pas</button>
  </div>
  <div id="tool"></div>`;
  const tools = {cah:toolCAH, conf:toolConf, multi:toolMulti, imp:toolImp, roc:toolROC, km:toolKM};
  const show = t => { store.set('tool', t); p.querySelectorAll('#tool-chips .chip').forEach(b=>b.setAttribute('aria-pressed', b.dataset.t===t)); $('#tool').innerHTML=''; tools[t]($('#tool')); };
  $('#tool-chips').onclick = e=>{ const b=e.target.closest('.chip'); if(b) show(b.dataset.t); };
  show(store.get('tool','cah'));
}

/* ---- CAH ---- */
function toolCAH(root){
  root.innerHTML = `<div class="card" style="display:grid;gap:16px">
    <div><h2>Classification ascendante hiérarchique</h2><p class="lead" style="margin-top:4px">Saisis la partie basse de la matrice des distances. Les étapes montrent la matrice entre clusters à chaque itération ; la plus petite valeur est surlignée.</p></div>
    <div class="row">
      <label class="l" style="margin:0">Exemple</label>
      <select id="cah-preset" style="width:auto">${Object.entries(CAH_PRESETS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select>
      <label class="l" style="margin:0">n</label><input type="number" id="cah-n" min="3" max="8" value="5" style="width:70px">
      <label class="l" style="margin:0">Lien</label>
      <select id="cah-link" style="width:auto"><option value="single">simple (saut minimum)</option><option value="complete">complet (saut maximum)</option><option value="average">moyen</option></select>
    </div>
    <div class="scroll" id="cah-mat"></div>
    <div class="grid2"><div class="steps" id="cah-steps"></div><div><h3 style="margin-bottom:8px">Dendrogramme</h3><div class="scroll" id="cah-dendro"></div></div></div>
  </div>`;
  let M = [];
  function loadPreset(k){ const m = CAH_PRESETS[k].m; $('#cah-n').value = m.length; M = m.map(r=>r.slice()); drawMat(); run(); }
  function drawMat(){
    const n = +$('#cah-n').value;
    let h = '<table class="t"><tr><th></th>' + Array.from({length:n},(_,j)=>`<th>x${j+1}</th>`).join('') + '</tr>';
    for(let i=0;i<n;i++){ h += `<tr><th>x${i+1}</th>`; for(let j=0;j<n;j++){
      if(j<i) h += `<td><input class="cell" type="number" data-i="${i}" data-j="${j}" value="${(M[i]&&M[i][j]!==undefined)?M[i][j]:''}"></td>`;
      else h += `<td style="color:var(--muted)">${j===i?0:''}</td>`; } h+='</tr>'; }
    $('#cah-mat').innerHTML = h + '</table>';
    $('#cah-mat').querySelectorAll('input').forEach(inp=>inp.oninput=()=>{ const i=+inp.dataset.i, j=+inp.dataset.j; M[i]=M[i]||[]; M[i][j]=parseFloat(inp.value); run(); });
  }
  function run(){
    const n = +$('#cah-n').value, link = $('#cah-link').value;
    const d = (a,b)=>{ const i=Math.max(a,b), j=Math.min(a,b); return i===j?0:(M[i]?M[i][j]:NaN); };
    for(let i=1;i<n;i++) for(let j=0;j<i;j++) if(!isFinite(d(i,j))){ $('#cah-steps').innerHTML='<p class="lead">Complète toutes les distances.</p>'; $('#cah-dendro').innerHTML=''; return; }
    let cl = Array.from({length:n},(_,i)=>({m:[i], node:{leaf:i, h:0}}));
    const lk = (A,B)=>{ const ds=[]; A.m.forEach(a=>B.m.forEach(b=>ds.push(d(a,b)))); return link==='single'?Math.min(...ds):link==='complete'?Math.max(...ds):ds.reduce((s,x)=>s+x,0)/ds.length; };
    const name = C => '{' + C.m.map(i=>'x'+(i+1)).join(',') + '}';
    let html = '', step = 1;
    while(cl.length > 1){
      let best = [0,1,Infinity];
      const D = cl.map((A,a)=>cl.map((B,b)=>{ if(b>=a) return null; const v = lk(A,B); if(v<best[2]) best=[b,a,v]; return v; }));
      let t = '<table class="t"><tr><th></th>' + cl.map(C=>`<th>${name(C)}</th>`).join('') + '</tr>';
      cl.forEach((A,a)=>{ t += `<tr><th>${name(A)}</th>` + cl.map((B,b)=> b<a ? `<td class="${(a===best[1]&&b===best[0])?'min':''}">${fmt(D[a][b],2)}</td>` : `<td></td>`).join('') + '</tr>'; });
      t += '</table>';
      const A = cl[best[0]], B = cl[best[1]];
      html += `<div class="step"><h4>Étape ${step} : on fusionne ${name(A)} et ${name(B)} à la hauteur ${fmt(best[2],2)}</h4><div class="scroll">${t}</div></div>`;
      const merged = {m:A.m.concat(B.m), node:{l:A.node, r:B.node, h:best[2]}};
      cl = cl.filter((_,k)=>k!==best[0]&&k!==best[1]); cl.push(merged); step++;
    }
    $('#cah-steps').innerHTML = html;
    drawDendro(cl[0].node, n);
  }
  function drawDendro(root, n){
    const order=[]; (function walk(nd){ if(nd.leaf!==undefined) order.push(nd); else { walk(nd.l); walk(nd.r); } })(root);
    const W = Math.max(320, n*64+60), H = 280, top = 20, bot = 40, left = 46;
    const maxH = root.h || 1;
    const Y = h => top + (H-top-bot) * (1 - h/maxH);
    const sp = (W-left-20)/(n);
    order.forEach((nd,k)=>{ nd.x = left + sp*(k+0.5); });
    const segs=[], heights=new Set();
    (function pos(nd){ if(nd.leaf!==undefined) return nd.x; const a=pos(nd.l), b=pos(nd.r); nd.x=(a+b)/2; heights.add(nd.h);
      segs.push(`M${a},${Y(nd.l.h)}V${Y(nd.h)}H${b}V${Y(nd.r.h)}`); return nd.x; })(root);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;height:auto" role="img" aria-label="Dendrogramme">`;
    s += `<line x1="${left}" y1="${top}" x2="${left}" y2="${H-bot}" stroke="var(--line)"/>`;
    [...heights].sort((a,b)=>a-b).forEach(h=>{ s += `<line x1="${left-4}" x2="${W-10}" y1="${Y(h)}" y2="${Y(h)}" stroke="var(--line)" stroke-dasharray="3 3"/><text x="${left-8}" y="${Y(h)+4}" text-anchor="end">${fmt(h,1)}</text>`; });
    s += `<path d="${segs.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
    order.forEach(nd=>{ s += `<text x="${nd.x}" y="${H-bot+20}" text-anchor="middle">x${nd.leaf+1}</text>`; });
    $('#cah-dendro').innerHTML = s + '</svg>';
  }
  $('#cah-preset').onchange = e=>loadPreset(e.target.value);
  $('#cah-link').onchange = run;
  $('#cah-n').onchange = ()=>{ drawMat(); run(); };
  loadPreset('exam2024');
}

/* ---- Matrice de confusion ---- */
function toolConf(root){
  root.innerHTML = `<div class="card" style="display:grid;gap:14px">
    <div><h2>Matrice de confusion et métriques binaires</h2><p class="lead" style="margin-top:4px">Prérempli avec le tableau 1 de l'examen 2024 S1 (15 observations). Change de modèle ou saisis tes propres 0/1.</p></div>
    <div class="row"><button class="btn small" data-m="1">Modèle 1 (K=1)</button><button class="btn small" data-m="2">Modèle 2 (K=10)</button><button class="btn small" data-m="3">K=100 (toujours 0)</button></div>
    <div class="grid2"><div><label class="l" for="cf-y">Étiquettes réelles y</label><textarea id="cf-y"></textarea></div>
    <div><label class="l" for="cf-p">Prédictions ŷ</label><textarea id="cf-p"></textarea></div></div>
    <div class="grid2"><div class="scroll" id="cf-mat"></div><div class="metrics" id="cf-met"></div></div>
  </div>`;
  const y = '0 0 0 0 0 0 0 1 0 0 0 0 0 1 0';
  const P = {1:'0 0 1 0 0 0 0 1 0 0 1 0 0 1 0', 2:'0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', 3:'0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'};
  const parse = s => s.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  function calc(){
    const a = parse($('#cf-y').value), b = parse($('#cf-p').value);
    if(a.length!==b.length || !a.length){ $('#cf-mat').innerHTML = '<p class="lead">Les deux listes doivent avoir la même longueur.</p>'; $('#cf-met').innerHTML=''; return; }
    let TP=0,TN=0,FP=0,FN=0; a.forEach((v,i)=>{ const q=b[i]; if(v===1&&q===1)TP++; else if(v===0&&q===0)TN++; else if(v===0&&q===1)FP++; else if(v===1&&q===0)FN++; });
    const n=a.length;
    $('#cf-mat').innerHTML = `<table class="t"><tr><th></th><th>réel 0</th><th>réel 1</th></tr><tr><th>prédit 0</th><td>TN = ${TN}</td><td>FN = ${FN}</td></tr><tr><th>prédit 1</th><td>FP = ${FP}</td><td>TP = ${TP}</td></tr></table>`;
    const m = [['Accuracy',(TP+TN)/n,`(${TP}+${TN})/${n}`],['Sensibilité',TP/(TP+FN),`${TP}/(${TP}+${FN})`],['Spécificité',TN/(TN+FP),`${TN}/(${TN}+${FP})`],['Précision',TP/(TP+FP),`${TP}/(${TP}+${FP})`],['F1',2*TP/(2*TP+FP+FN),`2·${TP}/(2·${TP}+${FP}+${FN})`],['Taux FP',FP/(FP+TN),`${FP}/(${FP}+${TN})`]];
    $('#cf-met').innerHTML = m.map(([k,v,f])=>`<div class="metric"><span>${k}</span><b>${fmt(v)}</b><span class="mono">${f}</span></div>`).join('');
  }
  root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ $('#cf-y').value=y; $('#cf-p').value=P[b.dataset.m]; calc(); });
  $('#cf-y').oninput = calc; $('#cf-p').oninput = calc;
  $('#cf-y').value=y; $('#cf-p').value=P[1]; calc();
}

/* ---- Macro / micro ---- */
function toolMulti(root){
  root.innerHTML = `<div class="card" style="display:grid;gap:14px">
    <div><h2>Précision multiclasse : macro vs micro</h2><p class="lead" style="margin-top:4px">Exercice de la diapo 47 du cours. Modifie les TP / FP de chaque classe (one-versus-all).</p></div>
    <div class="row"><button class="btn small" data-s="1">Situation 1</button><button class="btn small" data-s="2">Situation 2</button></div>
    <div class="grid2"><div class="scroll" id="mc-tab"></div><div class="metrics" id="mc-met"></div></div>
  </div>`;
  const S = {1:[['A',1,1],['B',10,90],['C',1,1],['D',1,1]], 2:[['A',0,2],['B',90,10],['C',0,2],['D',0,2]]};
  let rows = S[1].map(r=>r.slice());
  function draw(){
    $('#mc-tab').innerHTML = `<table class="t"><tr><th>Classe</th><th>TP</th><th>FP</th><th>Précision</th></tr>${rows.map((r,i)=>`<tr><th>${r[0]}</th><td><input class="cell" type="number" min="0" data-i="${i}" data-k="1" value="${r[1]}"></td><td><input class="cell" type="number" min="0" data-i="${i}" data-k="2" value="${r[2]}"></td><td id="mc-p${i}"></td></tr>`).join('')}</table>`;
    $('#mc-tab').querySelectorAll('input').forEach(inp=>inp.oninput=()=>{ rows[+inp.dataset.i][+inp.dataset.k]=+inp.value||0; calc(); });
    calc();
  }
  function calc(){
    const pr = rows.map(r=> (r[1]+r[2]) ? r[1]/(r[1]+r[2]) : 0);
    pr.forEach((v,i)=>$('#mc-p'+i).textContent = fmt(v));
    const macro = pr.reduce((s,x)=>s+x,0)/pr.length;
    const sTP = rows.reduce((s,r)=>s+r[1],0), sFP = rows.reduce((s,r)=>s+r[2],0);
    $('#mc-met').innerHTML = `<div class="metric"><span>Macro-average</span><b>${fmt(macro)}</b><span class="mono">moyenne des ${rows.length}</span></div>
      <div class="metric"><span>Micro-average</span><b>${fmt(sTP/(sTP+sFP))}</b><span class="mono">${sTP}/(${sTP}+${sFP})</span></div>
      <p class="stat" style="grid-column:1/-1">Le weighted-average du cours pondère chaque classe par son support (nombre d'observations réelles = TP+FN) : il faut les FN, absents de cet exercice.</p>`;
  }
  root.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ rows=S[b.dataset.s].map(r=>r.slice()); draw(); });
  draw();
}

/* ---- Impuretés ---- */
function toolImp(root){
  root.innerHTML = `<div class="card" style="display:grid;gap:14px">
    <div><h2>Impureté et gain d'une coupure</h2><p class="lead" style="margin-top:4px">Effectifs par classe, séparés par des virgules. Prérempli avec la racine de l'arbre du cours (Informatique ≤ 8,063).</p></div>
    <div class="grid2"><div><label class="l" for="im-l">Enfant gauche</label><input type="text" id="im-l" value="19, 0"></div><div><label class="l" for="im-r">Enfant droit</label><input type="text" id="im-r" value="8, 18"></div></div>
    <div class="scroll" id="im-out"></div>
  </div>`;
  const parse = s => s.split(/[\s,;]+/).filter(Boolean).map(Number);
  const gini = c => { const n=c.reduce((a,b)=>a+b,0); return n? 1-c.reduce((s,x)=>s+(x/n)**2,0) : 0; };
  const ent = c => { const n=c.reduce((a,b)=>a+b,0); return n? -c.reduce((s,x)=>s+(x? (x/n)*Math.log2(x/n):0),0) : 0; };
  const err = c => { const n=c.reduce((a,b)=>a+b,0); return n? 1-Math.max(...c)/n : 0; };
  function calc(){
    const L=parse($('#im-l').value), R=parse($('#im-r').value), k=Math.max(L.length,R.length);
    while(L.length<k) L.push(0); while(R.length<k) R.push(0);
    const P=L.map((x,i)=>x+R[i]), nL=L.reduce((a,b)=>a+b,0), nR=R.reduce((a,b)=>a+b,0), n=nL+nR;
    if(!n){ $('#im-out').innerHTML=''; return; }
    const row=(f)=>[f(P),f(L),f(R), f(P)-nL/n*f(L)-nR/n*f(R)];
    const G=row(gini), E=row(ent), Er=row(err);
    $('#im-out').innerHTML = `<table class="t"><tr><th></th><th>Parent [${P.join(', ')}]</th><th>Gauche [${L.join(', ')}]</th><th>Droit [${R.join(', ')}]</th><th>Gain</th></tr>
      ${[['Gini',G],['Entropie',E],['Erreur',Er]].map(([k,v])=>`<tr><th>${k}</th>${v.map(x=>`<td>${fmt(x)}</td>`).join('')}</tr>`).join('')}</table>
      <p class="stat" style="margin-top:8px">Gain = I(parent) − ${nL}/${n}·I(gauche) − ${nR}/${n}·I(droit). CART choisit la coupure (variable, seuil) qui maximise ce gain.</p>`;
  }
  $('#im-l').oninput=calc; $('#im-r').oninput=calc; calc();
}

/* ---- ROC ---- */
function toolROC(root){
  root.innerHTML = `<div class="card" style="display:grid;gap:14px">
    <div><h2>Courbe ROC à partir de scores</h2><p class="lead" style="margin-top:4px">Scores = probabilités prédites (logistique) ou proportion de voisins de classe 1 (KNN). Fais glisser le seuil s pour voir le point correspondant.</p></div>
    <div class="grid2"><div><label class="l" for="roc-s">Scores</label><textarea id="roc-s">0.95 0.85 0.8 0.7 0.65 0.6 0.55 0.45 0.4 0.3 0.25 0.1</textarea></div>
    <div><label class="l" for="roc-y">Étiquettes réelles (0/1)</label><textarea id="roc-y">1 1 0 1 1 0 1 0 0 1 0 0</textarea></div></div>
    <div class="row"><label class="l" for="roc-t" style="margin:0">Seuil s</label><input type="range" id="roc-t" min="0" max="1" step="0.01" value="0.5" style="flex:1;min-width:160px"><b class="mono" id="roc-tv">0,5</b></div>
    <div class="grid2"><div id="roc-svg"></div><div class="metrics" id="roc-met"></div></div>
  </div>`;
  const parse = s => s.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  function calc(){
    const s=parse($('#roc-s').value), y=parse($('#roc-y').value), t=+$('#roc-t').value;
    $('#roc-tv').textContent = fmt(t,2);
    if(s.length!==y.length||!s.length){ $('#roc-svg').innerHTML='<p class="lead">Même nombre de scores et d\'étiquettes.</p>'; return; }
    const P=y.filter(v=>v===1).length, N=y.length-P;
    const ths=[Infinity, ...[...new Set(s)].sort((a,b)=>b-a), -Infinity];
    const pts=ths.map(th=>{ let tp=0,fp=0; s.forEach((v,i)=>{ if(v>=th){ if(y[i]===1)tp++; else fp++; } }); return [N?fp/N:0, P?tp/P:0]; });
    let auc=0; for(let i=1;i<pts.length;i++) auc += (pts[i][0]-pts[i-1][0])*(pts[i][1]+pts[i-1][1])/2;
    let tp=0,fp=0; s.forEach((v,i)=>{ if(v>=t){ if(y[i]===1)tp++; else fp++; } });
    const cur=[N?fp/N:0, P?tp/P:0];
    const W=300, m=40, X=v=>m+v*(W-m-12), Yv=v=>W-m-v*(W-m-12);
    let g=`<svg viewBox="0 0 ${W} ${W}" width="100%" style="max-width:${W}px" role="img" aria-label="Courbe ROC">`;
    for(let k=0;k<=4;k++){ const v=k/4; g+=`<line x1="${X(0)}" x2="${X(1)}" y1="${Yv(v)}" y2="${Yv(v)}" stroke="var(--line)"/><text x="${m-6}" y="${Yv(v)+4}" text-anchor="end">${fmt(v,2)}</text><text x="${X(v)}" y="${W-m+16}" text-anchor="middle">${fmt(v,2)}</text>`; }
    g+=`<line x1="${X(0)}" y1="${Yv(0)}" x2="${X(1)}" y2="${Yv(1)}" stroke="var(--muted)" stroke-dasharray="4 4"/>`;
    g+=`<polyline points="${pts.map(p=>X(p[0])+','+Yv(p[1])).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
    g+=`<circle cx="${X(cur[0])}" cy="${Yv(cur[1])}" r="6" fill="var(--red)"/>`;
    g+=`<text x="${W/2}" y="${W-4}" text-anchor="middle">FPR (1 − spécificité)</text><text x="${X(0)+4}" y="${Yv(1)-2}" text-anchor="start">TPR (sensibilité)</text></svg>`;
    $('#roc-svg').innerHTML=g;
    $('#roc-met').innerHTML = `<div class="metric"><span>AUC</span><b>${fmt(auc)}</b><span>aire sous la courbe</span></div>
      <div class="metric"><span>TPR à s</span><b>${fmt(cur[1])}</b><span class="mono">${tp}/${P}</span></div>
      <div class="metric"><span>FPR à s</span><b>${fmt(cur[0])}</b><span class="mono">${fp}/${N}</span></div>`;
  }
  ['roc-s','roc-y','roc-t'].forEach(id=>$('#'+id).oninput=calc); calc();
}

/* ---- K-means ---- */
function toolKM(root){
  root.innerHTML = `<div class="card" style="display:grid;gap:14px">
    <div><h2>Algorithme de Lloyd pas à pas</h2><p class="lead" style="margin-top:4px">Alterne affectation et recalcul des centroïdes, et regarde I_W diminuer. Essaie les anneaux du TP : le K-means échoue en 2D, mais réussit après la transformation φ(x,y) = (x, y, x²+y²).</p></div>
    <div class="row">
      <label class="l" style="margin:0">Données</label><select id="km-data" style="width:auto"><option value="blobs">3 groupes</option><option value="rings">2 anneaux (TP)</option></select>
      <label class="l" style="margin:0">K</label><input type="number" id="km-k" min="1" max="6" value="3" style="width:64px">
      <label class="row stat" style="gap:6px"><input type="checkbox" id="km-phi"> φ(x,y)=(x,y,x²+y²)</label>
      <label class="row stat" style="gap:6px"><input type="checkbox" id="km-pp"> K-means++</label>
    </div>
    <div class="row"><button class="btn" id="km-init">Initialiser</button><button class="btn primary" id="km-step">Étape suivante</button><button class="btn" id="km-run">Jusqu'à convergence</button><span class="stat" id="km-info"></span></div>
    <canvas id="km-c" width="640" height="420"></canvas>
  </div>`;
  const cv=$('#km-c'), ctx=cv.getContext('2d');
  let pts=[], cent=[], asg=[], phase='assign', seed=7, iter=0;
  const PAL=['--c1','--c2','--c3','--c4','--c5','--c6'];
  const cssv = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const col = i => cssv(PAL[i%PAL.length]);
  function gen(){
    const r=rng(42); const g=()=>{ let u=0; for(let k=0;k<6;k++) u+=r(); return u-3; };
    pts=[];
    if($('#km-data').value==='blobs'){ [[-3,-1.5],[2.5,-2],[0,2.6]].forEach(([cx,cy])=>{ for(let i=0;i<70;i++) pts.push([cx+g()*0.9, cy+g()*0.9]); }); }
    else { for(let i=0;i<200;i++){ const th=r()*2*Math.PI; const rad=i<100? Math.abs(1.5+g()*0.5) : Math.abs(5+g()*0.33); pts.push([rad*Math.cos(th), rad*Math.sin(th)]); } }
  }
  const feat = p => $('#km-phi').checked ? [p[0],p[1],(p[0]*p[0]+p[1]*p[1])] : [p[0],p[1]];
  const d2 = (a,b) => a.reduce((s,x,i)=>s+(x-b[i])**2,0);
  function init(){
    const K=+$('#km-k').value, r=rng(seed++), F=pts.map(feat);
    cent=[F[Math.floor(r()*F.length)].slice()];
    while(cent.length<K){
      if($('#km-pp').checked){ const D=F.map(f=>Math.min(...cent.map(c=>d2(f,c)))); const tot=D.reduce((a,b)=>a+b,0); let u=r()*tot, k=0; while(u>D[k]&&k<D.length-1){u-=D[k];k++;} cent.push(F[k].slice()); }
      else cent.push(F[Math.floor(r()*F.length)].slice());
    }
    asg=pts.map(()=>-1); phase='assign'; iter=0; draw($('#km-pp').checked ? 'Centroïdes initialisés par K-means++.' : 'Centroïdes tirés au hasard parmi les points.');
  }
  function IW(){ const F=pts.map(feat); return F.reduce((s,f,i)=>s+(asg[i]>=0?d2(f,cent[asg[i]]):0),0); }
  function step(){
    const F=pts.map(feat);
    if(phase==='assign'){
      let changed=0; F.forEach((f,i)=>{ let b=0,bd=Infinity; cent.forEach((c,k)=>{ const v=d2(f,c); if(v<bd){bd=v;b=k;} }); if(asg[i]!==b) changed++; asg[i]=b; });
      phase='update'; iter++;
      draw(changed? `Affectation (itération ${iter}) : ${changed} point(s) ont changé de cluster.` : `Convergence : aucune affectation n'a changé.`);
      return changed;
    } else {
      cent = cent.map((c,k)=>{ const m=F.filter((_,i)=>asg[i]===k); if(!m.length) return c; return c.map((_,j)=>m.reduce((s,f)=>s+f[j],0)/m.length); });
      phase='assign'; draw('Recalcul des centroïdes : moyenne de chaque cluster.'); return 1;
    }
  }
  let lastMsg='';
  function draw(msg){
    lastMsg = msg;
    const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
    const k = Math.max(1, cv.width / (cv.clientWidth || cv.width));
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
    const mx=Math.max(...xs.map(Math.abs),...ys.map(Math.abs))*1.1;
    const sx=v=>W/2+v/mx*(Math.min(W,H)/2-10), sy=v=>H/2-v/mx*(Math.min(W,H)/2-10);
    pts.forEach((p,i)=>{ ctx.beginPath(); ctx.arc(sx(p[0]),sy(p[1]),3.6*Math.min(k,2.2),0,7); ctx.fillStyle= asg[i]>=0? col(asg[i]) : cssv('--c0'); ctx.globalAlpha=asg[i]>=0?0.85:0.5; ctx.fill(); });
    ctx.globalAlpha=1;
    if(!$('#km-phi').checked) cent.forEach((c,k)=>{ const x=sx(c[0]), y=sy(c[1]); ctx.lineWidth=3; ctx.strokeStyle=cssv('--ink'); ctx.beginPath(); ctx.moveTo(x-9,y-9); ctx.lineTo(x+9,y+9); ctx.moveTo(x+9,y-9); ctx.lineTo(x-9,y+9); ctx.stroke(); ctx.lineWidth=1.5; ctx.strokeStyle=col(k); ctx.beginPath(); ctx.arc(x,y,12,0,7); ctx.stroke(); });
    $('#km-info').textContent = msg + (asg[0]>=0 ? `  I_W = ${fmt(IW(),1)}` : '') + ($('#km-phi').checked?' (centroïdes en 3D, non dessinés)':'');
  }
  $('#km-init').onclick=init;
  $('#km-step').onclick=()=>{ if(!cent.length) init(); else step(); };
  $('#km-run').onclick=()=>{ if(!cent.length) init(); let g=0; while(g<200){ const c=step(); if(phase==='update' && !c) break; g++; } };
  $('#km-data').onchange=()=>{ gen(); if($('#km-data').value==='rings') $('#km-k').value=2; init(); };
  ['km-k','km-phi','km-pp'].forEach(id=>$('#'+id).onchange=init);
  const onTheme = ()=>{ if(!document.body.contains(cv)){ document.removeEventListener('themechange', onTheme); return; } draw(lastMsg); };
  document.addEventListener('themechange', onTheme);
  gen(); init();
}


export { renderOutils };
