// Leitner: caixas 0..5; intervalo em nº de questões até reaparecer
const GAP=[3,8,20,50,120,300];const K='cnh_prog_v1';
let Q=[],P={},PL={},cur=null,answered=false;const $=id=>document.getElementById(id);
const load=()=>{try{P=JSON.parse(localStorage[K]||'{}')}catch(e){P={}}P.t=P.t||0;P.c=P.c||{}};const save=()=>localStorage[K]=JSON.stringify(P);
const mod=()=>+$('mod').value;const pool=()=>Q.filter(q=>!mod()||q.modulo==mod());
function pick(){const ps=pool(),t=P.t;const due=ps.filter(q=>P.c[q.id]&&P.c[q.id].due<=t).sort((a,b)=>P.c[a.id].box-P.c[b.id].box||P.c[a.id].due-P.c[b.id].due);
 $('due').textContent=due.length+' p/ revisar';if(due.length)return due[0];const nw=ps.filter(q=>!P.c[q.id]);
 if(nw.length)return nw[Math.floor(Math.random()*nw.length)];return ps.slice().sort((a,b)=>P.c[a.id].due-P.c[b.id].due)[0]}
function placaSrc(q){if(q.placa_img&&PL[q.placa_img])return PL[q.placa_img];const n=s=>s.trim().replace(/\s+/,'-');return (q.codigo_placa||'').split(/,| e /).map(n).filter(Boolean).map(c=>PL[c]).find(Boolean)}
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function show(){cur=pick();answered=false;const q=cur;$('meta').textContent=`Módulo ${q.modulo} · ${q.modulo_nome} · ${q.nivel}`+(P.c[q.id]?` · caixa ${P.c[q.id].box}`:' · nova');
 $('enun').textContent=q.enunciado;const src=placaSrc(q);
 const im=$('placa');if(src){im.src=src;im.hidden=false;im.alt='Placa '+q.codigo_placa}else im.hidden=true;
 $('alts').innerHTML='';shuf([q.correta,...q.erradas]).forEach(t=>{const b=document.createElement('button');b.className='alt';b.textContent=t;b.dataset.ok=t===q.correta?1:0;b.onclick=()=>answer(b);$('alts').append(b)});
 $('fb').hidden=true;$('naosei').hidden=false;scrollTo(0,0)}
let marc='';function answer(b){if(answered)return;answered=true;marc=b?b.textContent:'não sei';$('iamsg').hidden=true;const ok=b&&b.dataset.ok=='1';const c=P.c[cur.id]||{box:0,n:0,ok:0};
 c.n++;if(ok){c.ok++;c.box=Math.min(c.box+1,5)}else{c.box=0;c.e=(c.e||0)+1;c.le=P.t};P.t++;c.due=P.t+GAP[c.box]-(ok?0:1);c.last=ok;P.c[cur.id]=c;save();
 document.querySelectorAll('.alt').forEach(x=>{x.disabled=true;if(x.dataset.ok=='1')x.classList.add('ok')});if(b&&!ok)b.classList.add('bad');
 $('res').textContent=ok?'✅ Certa!':(b?'❌ Errada':'📖 Resposta');$('res').style.color=ok?'#1a9a4a':'#c62828';
 $('com').textContent=(ok?'':'Correta: '+cur.correta+'\n\n')+cur.comentario;$('com').style.whiteSpace='pre-line';$('fb').hidden=false;$('naosei').hidden=true;$('fb').scrollIntoView({behavior:'smooth'})}
function stats(){const cs=Object.values(P.c),n=cs.reduce((s,c)=>s+c.n,0),ok=cs.reduce((s,c)=>s+c.ok,0),dom=cs.filter(c=>c.box>=3).length;
 const H=(P.sim||[]).slice(-10).reverse().map(s=>`<div class=st><span>${new Date(s.d).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})} · ${s.t=='dif'?'Dificuldades':'Igual à prova'}</span><b style="color:${s.n>=20?'#1a9a4a':'#c62828'}">${s.n}/30</b></div>`).join('')||'<p class=src>Nenhum simulado ainda.</p>';
 const per=[1,2,3,4].map(m=>{const ids=Q.filter(q=>q.modulo==m);const d=ids.filter(q=>P.c[q.id]&&P.c[q.id].box>=3).length;return `<div class=st><span>Módulo ${m}</span><b>${d}/${ids.length}</b></div>`}).join('');
 $('sbox').innerHTML=`<div class=st><span>Respostas dadas</span><b>${n}</b></div><div class=st><span>Questões vistas</span><b>${cs.length}/${Q.length}</b></div><div class=st><span>% de acerto</span><b>${n?Math.round(ok*100/n):0}%</b></div><div class=st><span>Dominadas (caixa ≥3)</span><b>${dom}</b></div>`+per+'<h3>Simulados</h3>'+H}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['quiz','sim','stats'].forEach(v=>$(v).hidden=b.dataset.v!=v);if(b.dataset.v=='stats'){stats();$('sName').value=nome()}if(b.dataset.v=='sim'&&!S){simInfo();$('simStart').hidden=false}});
$('naosei').onclick=()=>answer(null);$('next').onclick=show;$('mod').onchange=()=>{localStorage.cnh_mod=mod();show()};
$('reset').onclick=()=>{if(confirm('Apagar todo o progresso?')){P={t:0,c:{}};save();stats()}};
(async()=>{load();[Q,PL]=await Promise.all([fetch('questions.json').then(r=>r.json()),fetch('placas.json').then(r=>r.json()).catch(()=>({}))]);
 const names={};Q.forEach(q=>names[q.modulo]=q.modulo_nome);Object.keys(names).forEach(m=>$('mod').insertAdjacentHTML('beforeend',`<option value=${m}>Módulo ${m} – ${names[m]}</option>`));
 $('mod').value=localStorage.cnh_mod||0;show()})();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

function iaText(q=cur,alts=[...document.querySelectorAll('#alts .alt')].map(x=>x.textContent),mk=marc){alts=alts.map((x,i)=>`${'ABCD'[i]}) ${x}`).join('\n');const marc_=mk;
 return `Estou estudando para a prova teórica da CNH. Me explique de forma simples esta questão do Banco Nacional de Questões:\n\nPergunta: ${q.enunciado}\n`+(q.codigo_placa?`Código da placa: ${q.codigo_placa}\n`:'')+`\nAlternativas:\n${alts}\n\nMinha resposta: ${marc_}\nResposta correta: ${q.correta}\nComentário oficial: ${q.comentario}`}
async function copy(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity=0;document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();return ok}}
function askIA(t,m){window.open('https://grok.com/?q='+encodeURIComponent(t),'_blank');copy(t);m.textContent='Pergunta copiada — se não aparecer, cole no Grok';m.hidden=false}
$('ia').onclick=()=>{const t=iaText();window.open('https://grok.com/?q='+encodeURIComponent(t),'_blank');copy(t);const m=$('iamsg');m.textContent='Pergunta copiada — se não aparecer, cole no Grok';m.hidden=false};

// ===== Simulado =====
const SIM_PROP={1:8,2:4,3:13,4:5};let S=null;
function difList(){return Q.filter(q=>P.c[q.id]&&(P.c[q.id].e||0)>0).map(q=>{const c=P.c[q.id];return[q,c.e*3+(5-c.box)*2+(c.le||0)/Math.max(P.t,1)*3]}).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
function simInfo(){const n=difList().length,r=$('rDif');r.disabled=!n;$('lblDif').classList.toggle('dis',!n);$('difInfo').textContent=n?`30 questões priorizando as que você mais errou (${Math.min(n,30)} das suas dificuldades${n<30?' + '+(30-n)+' novas/aleatórias':''})`:'Indisponível: você ainda não errou nenhuma questão. Estude ou faça um simulado primeiro.';if(!n&&r.checked)document.querySelector('input[value=prova]').checked=true}
function simStart(){const mode=(document.querySelector('input[name=simMode]:checked')||{}).value||'prova';let qs=[],nd=0;
 if(mode=='dif'){const d=difList().slice(0,30);nd=d.length;qs=d.slice();const ids=new Set(qs.map(q=>q.id));const nw=shuf(Q.filter(q=>!P.c[q.id]&&!ids.has(q.id)));const rest=shuf(Q.filter(q=>P.c[q.id]&&!ids.has(q.id)));while(qs.length<30)qs.push((nw.length?nw:rest).shift())}
 else for(const m in SIM_PROP){qs.push(...shuf(Q.filter(q=>q.modulo==m)).slice(0,SIM_PROP[m]))}
 S={qs:shuf(qs).map(q=>({q,alts:shuf([q.correta,...q.erradas]),r:null})),i:0,mode,nd};$('simStart').hidden=true;$('simRes').hidden=true;$('simRun').hidden=false;simShow()}
function simShow(){const it=S.qs[S.i],q=it.q;$('simMeta').textContent=`Questão ${S.i+1}/30 · Módulo ${q.modulo} · ${q.nivel}`+(S.mode=='dif'?` · Minhas dificuldades (${S.nd} de 30 vieram dos seus erros)`:'');$('simEnun').textContent=q.enunciado;
 const src=placaSrc(q),im=$('simPlaca');if(src){im.src=src;im.hidden=false}else im.hidden=true;
 $('simAlts').innerHTML='';it.alts.forEach((t,k)=>{const b=document.createElement('button');b.className='alt'+(it.r===k?' sel':'');b.textContent=t;b.onclick=()=>{it.r=k;simShow()};$('simAlts').append(b)});
 $('simPrev').disabled=S.i==0;$('simNext').disabled=S.i==29;
 $('simDots').innerHTML=S.qs.map((x,k)=>`<span class="dot${x.r!==null?' f':''}${k==S.i?' c':''}" data-k=${k}>${k+1}</span>`).join('');
 $('simDots').querySelectorAll('.dot').forEach(d=>d.onclick=()=>{S.i=+d.dataset.k;simShow()});scrollTo(0,0)}
function simEnd(){const nr=S.qs.filter(x=>x.r===null).length;if(!confirm(nr?`Faltam ${nr} sem resposta. Finalizar mesmo assim?`:'Finalizar o simulado?'))return;
 let n=0;const pm={1:[0,0],2:[0,0],3:[0,0],4:[0,0]},err=[];
 S.qs.forEach(x=>{const ok=x.r!==null&&x.alts[x.r]===x.q.correta;pm[x.q.modulo][1]++;if(ok){n++;pm[x.q.modulo][0]++}else{err.push(x);const c=P.c[x.q.id]||{box:0,n:0,ok:0};c.n++;c.box=0;c.e=(c.e||0)+1;c.le=P.t;c.due=P.t+1;c.last=false;P.c[x.q.id]=c}});
 P.sim=P.sim||[];P.sim.push({d:Date.now(),n,t:S.mode});save();
 const ap=n>=20,nm={1:'Placas, Cores e Caminhos',2:'Escolhas e Consequências',3:'Na Direção da Segurança',4:'Cuidar, Agir e Preservar'};
 let h=`<div class="card2 big ${ap?'ap':'rp'}"><div class=nota>${n}/30</div><div class=sit>${nome()?esc(nome())+', você foi ':''}${ap?'✅ APROVADA':'❌ REPROVADA'}</div><div class=src>${S.mode=='dif'?'Minhas dificuldades — '+S.nd+' de 30 vieram dos seus erros':'Igual à prova (8/4/13/5)'}</div><div class=src>Mínimo: 20 acertos</div></div><div class=card2><h3>Acertos por módulo</h3>`+
  [1,2,3,4].map(m=>`<div class=st><span>${m}. ${nm[m]}</span><b>${pm[m][0]}/${pm[m][1]}</b></div>`).join('')+`</div><h3>Revisão das erradas (${err.length})</h3>`;
 h+=err.map((x,k)=>`<div class=card2><div class=meta>Módulo ${x.q.modulo} · ${x.q.nivel}${x.q.codigo_placa?' · placa '+x.q.codigo_placa:''}</div>${placaSrc(x.q)?`<img class=pl alt="placa" src="${placaSrc(x.q)}">`:''}<p class=en>${esc(x.q.enunciado)}</p><p class=bad2>Sua resposta: ${x.r===null?'(em branco)':esc(x.alts[x.r])}</p><p class=ok2>Correta: ${esc(x.q.correta)}</p><p id=com>${esc(x.q.comentario)}</p><button class="ghost simia" data-k=${k}>🤖 Perguntar à IA</button><div class=iam hidden style="font-size:14px;color:#1a9a4a;text-align:center"></div></div>`).join('');
 h+=`<button id="simAgain" class="primary">Novo simulado</button><p class=src>Erradas voltam para o nível 0 da revisão no modo Estudar.</p>`;
 $('simRun').hidden=true;const R=$('simRes');R.innerHTML=h;R.hidden=false;scrollTo(0,0);
 R.querySelectorAll('.simia').forEach(b=>b.onclick=()=>{const x=err[+b.dataset.k];askIA(iaText(x.q,x.alts,x.r===null?'não respondi':x.alts[x.r]),b.nextElementSibling)});
 $('simAgain').onclick=simStart;S=null}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('simGo').onclick=simStart;$('simPrev').onclick=()=>{S.i--;simShow()};$('simNext').onclick=()=>{S.i++;simShow()};$('simFim').onclick=simEnd;

// ===== Nome =====
const nome=()=>localStorage.cnh_nome||'';
function applyName(){const n=nome();document.title='Estudo CNH'+(n?' '+n:'');$('ttl').textContent='🚗 Estudo CNH'+(n?' '+n:'')}
function setName(v){v=(v||'').trim().slice(0,30);if(!v)return false;localStorage.cnh_nome=v;applyName();return true}
if(!nome())setTimeout(()=>$('wName').focus(),50);else $('welcome').hidden=true;applyName();
$('wGo').onclick=()=>{if(setName($('wName').value))$('welcome').hidden=true;else $('wName').focus()};
$('wName').onkeydown=e=>{if(e.key=='Enter')$('wGo').click()};
$('sNameSave').onclick=()=>{if(setName($('sName').value))$('sNameSave').textContent='Salvo ✓'};
