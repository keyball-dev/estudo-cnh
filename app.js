// Leitner: caixas 0..5; intervalo em nº de questões até reaparecer
const GAP=[3,8,20,50,120,300];const K='cnh_prog_v1';
let Q=[],P={},PL={},cur=null,answered=false;const $=id=>document.getElementById(id);
const load=()=>{try{P=JSON.parse(localStorage[K]||'{}')}catch(e){P={}}P.t=P.t||0;P.c=P.c||{}};const save=()=>localStorage[K]=JSON.stringify(P);
const mod=()=>+$('mod').value;const pool=()=>Q.filter(q=>!mod()||q.modulo==mod());
function pick(){const ps=pool(),t=P.t;const due=ps.filter(q=>P.c[q.id]&&P.c[q.id].due<=t).sort((a,b)=>P.c[a.id].box-P.c[b.id].box||P.c[a.id].due-P.c[b.id].due);
 $('due').textContent=due.length+' p/ revisar';if(due.length)return due[0];const nw=ps.filter(q=>!P.c[q.id]);
 if(nw.length)return nw[Math.floor(Math.random()*nw.length)];return ps.slice().sort((a,b)=>P.c[a.id].due-P.c[b.id].due)[0]}
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function show(){cur=pick();answered=false;const q=cur;$('meta').textContent=`Módulo ${q.modulo} · ${q.modulo_nome} · ${q.nivel}`+(P.c[q.id]?` · caixa ${P.c[q.id].box}`:' · nova');
 $('enun').textContent=q.enunciado;const codes=(q.codigo_placa||'').split(/,| e /).map(s=>s.trim()).filter(Boolean);const src=codes.map(c=>PL[c]).find(Boolean);
 const im=$('placa');if(src){im.src=src;im.hidden=false;im.alt='Placa '+q.codigo_placa}else im.hidden=true;
 $('alts').innerHTML='';shuf([q.correta,...q.erradas]).forEach(t=>{const b=document.createElement('button');b.className='alt';b.textContent=t;b.dataset.ok=t===q.correta?1:0;b.onclick=()=>answer(b);$('alts').append(b)});
 $('fb').hidden=true;$('naosei').hidden=false;scrollTo(0,0)}
let marc='';function answer(b){if(answered)return;answered=true;marc=b?b.textContent:'não sei';$('iamsg').hidden=true;const ok=b&&b.dataset.ok=='1';const c=P.c[cur.id]||{box:0,n:0,ok:0};
 c.n++;if(ok){c.ok++;c.box=Math.min(c.box+1,5)}else c.box=0;P.t++;c.due=P.t+GAP[c.box]-(ok?0:1);c.last=ok;P.c[cur.id]=c;save();
 document.querySelectorAll('.alt').forEach(x=>{x.disabled=true;if(x.dataset.ok=='1')x.classList.add('ok')});if(b&&!ok)b.classList.add('bad');
 $('res').textContent=ok?'✅ Certa!':(b?'❌ Errada':'📖 Resposta');$('res').style.color=ok?'#1a9a4a':'#c62828';
 $('com').textContent=(ok?'':'Correta: '+cur.correta+'\n\n')+cur.comentario;$('com').style.whiteSpace='pre-line';$('fb').hidden=false;$('naosei').hidden=true;$('fb').scrollIntoView({behavior:'smooth'})}
function stats(){const cs=Object.values(P.c),n=cs.reduce((s,c)=>s+c.n,0),ok=cs.reduce((s,c)=>s+c.ok,0),dom=cs.filter(c=>c.box>=3).length;
 const per=[1,2,3,4].map(m=>{const ids=Q.filter(q=>q.modulo==m);const d=ids.filter(q=>P.c[q.id]&&P.c[q.id].box>=3).length;return `<div class=st><span>Módulo ${m}</span><b>${d}/${ids.length}</b></div>`}).join('');
 $('sbox').innerHTML=`<div class=st><span>Respostas dadas</span><b>${n}</b></div><div class=st><span>Questões vistas</span><b>${cs.length}/${Q.length}</b></div><div class=st><span>% de acerto</span><b>${n?Math.round(ok*100/n):0}%</b></div><div class=st><span>Dominadas (caixa ≥3)</span><b>${dom}</b></div>`+per}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));$('quiz').hidden=b.dataset.v!='quiz';$('stats').hidden=b.dataset.v!='stats';if(b.dataset.v=='stats')stats()});
$('naosei').onclick=()=>answer(null);$('next').onclick=show;$('mod').onchange=()=>{localStorage.cnh_mod=mod();show()};
$('reset').onclick=()=>{if(confirm('Apagar todo o progresso?')){P={t:0,c:{}};save();stats()}};
(async()=>{load();[Q,PL]=await Promise.all([fetch('questions.json').then(r=>r.json()),fetch('placas.json').then(r=>r.json()).catch(()=>({}))]);
 const names={};Q.forEach(q=>names[q.modulo]=q.modulo_nome);Object.keys(names).forEach(m=>$('mod').insertAdjacentHTML('beforeend',`<option value=${m}>Módulo ${m} – ${names[m]}</option>`));
 $('mod').value=localStorage.cnh_mod||0;show()})();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

function iaText(){const q=cur,alts=[...document.querySelectorAll('.alt')].map((x,i)=>`${'ABCD'[i]}) ${x.textContent}`).join('\n');
 return `Estou estudando para a prova teórica da CNH. Me explique de forma simples esta questão do Banco Nacional de Questões:\n\nPergunta: ${q.enunciado}\n`+(q.codigo_placa?`Código da placa: ${q.codigo_placa}\n`:'')+`\nAlternativas:\n${alts}\n\nMinha resposta: ${marc}\nResposta correta: ${q.correta}\nComentário oficial: ${q.comentario}`}
async function copy(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity=0;document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();return ok}}
$('ia').onclick=()=>{const t=iaText();window.open('https://grok.com/?q='+encodeURIComponent(t),'_blank');copy(t);const m=$('iamsg');m.textContent='Pergunta copiada — se não aparecer, cole no Grok';m.hidden=false};
