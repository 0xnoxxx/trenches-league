/* Trenches League · state and game logic */
const ART_URL='https://claude.ai/artifact/H1EHxVyQupo9QRPWd52gtT';
const KEY='trenches-league-v6';
const MAXLV=10,BT=[300,900,2700,7200,14400,28800,43200,86400,129600,172800],TAARRUZ=[[13,14],[21,22]],PROJ_GOAL=50000;
const ICON={
 tarla:'M12 21V9M12 9c-3 0-4-2-4-4 2 0 4 1 4 4zM12 9c3 0 4-2 4-4-2 0-4 1-4 4zM12 14c-3 0-4-2-4-4 2 0 4 1 4 4zM12 14c3 0 4-2 4-4-2 0-4 1-4 4z',
 fabrika:'M3 21V11l5 3V11l5 3V7h3l1-4h2l1 4v14zM3 21h18',okul:'M3 9l9-5 9 5-9 5zM7 11v5c0 1 2 3 5 3s5-2 5-3v-5M21 9v6',
 kisla:'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM9 12l2 2 4-4',santral:'M13 2 4 14h7l-1 8 9-12h-7z',liman:'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 7v14M5 13a7 7 0 0 0 14 0M8 11h8'};
const BUILD=[{k:'tarla',base:20,cost:80,sx:0,sy:0},{k:'okul',base:25,cost:120,sx:3,sy:0},{k:'santral',base:15,cost:140,sx:6,sy:0},{k:'fabrika',base:45,cost:160,sx:0,sy:3},{k:'kisla',base:30,cost:220,sx:3,sy:3},{k:'liman',base:60,cost:380,sx:6,sy:3}];
const BK=Object.fromEntries(BUILD.map(b=>[b.k,b]));
const bname=k=>t('b_'+k);
const RANK_PTS=[0,500,1500,4000,8000,15000,30000,60000,120000,250000];
const SECT=()=>[t('secL'),t('secC'),t('secR')];

function fresh(){
  const scores={};CODES.forEach(c=>scores[c]=C[c].s);
  return {lang:'en',country:null,name:'',hex:null,gold:260,energy:90,medals:35,contrib:0,collects:0,attacks:0,
    lv:{tarla:2,fabrika:1,okul:1,kisla:0,santral:1,liman:0},pending:140,scores,build:null,speed:60,
    boostUntil:0,mobUntil:0,mobShares:412,mobTarget:500,mobDone:false,tzDemo:0,
    tasks:{login:false,collect:false,upgrade:false,attack:false,share:false,invite:false},streak:4,
    duel:null,wins:0,bestRank:99,prevRank:0,wallet:false,refJoined:0,tut:false,sel:'fabrika',projects:{},
    boluk:null,sector:1,day:{k:'',h:0},weekRaw:0,wk:'',pend:[],trust:{x:false,tg:false},sound:false,inbox:[],unread:0,myMsgs:[],lastTz:false,storeFullNoted:false,bolukSwitch:''};
}
let S=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const now=()=>Date.now();
function setLangIndex(){_LI=Math.max(0,LANGS.indexOf(S.lang))}

/* names and helpers */
const _dn={};
function cname(c,lang){lang=lang||LOC();try{_dn[lang]=_dn[lang]||new Intl.DisplayNames([lang],{type:'region'});return _dn[lang].of(c)||(C[c]&&C[c].geo)||c}catch(e){return (C[c]&&C[c].geo)||c}}
const flagEmoji=c=>String.fromCodePoint(...[...c].map(ch=>0x1F1E6+ch.charCodeAt(0)-65));
const ctag=c=>cname(c,LANG_OF[c]||'en').replace(/[\s'’.\-()]/g,'');
const lgName=i=>LG[LOC()][i];
const nv=c=>{const n=cname(c);return {n,n_dat:LOC()==='tr'?dat(n):n,n_acc:LOC()==='tr'?acc(n):n}};

/* REAL = live players through the artifact runtime (db + room) */
const REAL={db:null,room:null,user:null,uid:null,others:{},players:[],chat:[],peers:[],dirty:false};
const score=c=>S.scores[c]+(REAL.others[c]||0);
const ranked=lg=>{if(lg==null)lg=C[S.country].lg;return CODES.filter(c=>C[c].lg===lg).sort((a,b)=>score(b)-score(a))};
const rankOf=c=>ranked(C[c].lg).indexOf(c)+1;
const BONUS=[0,.05,.10,.20];
const bonusTxt=i=>i?t('bonusX',{x:[0,5,10,20][i]}):t('bonusNone');
const myHex=()=>{const H=hexData(S.country);return H&&S.hex!=null?H.hexes[S.hex]:null};
const projKey=()=>S.country+':'+S.hex;
const projVal=()=>{const h=myHex();if(!h)return 0;return Math.min(PROJ_GOAL,Math.round(PROJ_GOAL*(.18+(h.i*37%50)/100))+(S.projects[projKey()]||0))};
const projDone=()=>projVal()>=PROJ_GOAL;
const regionBonus=()=>{const h=myHex();return h?BONUS[h.lvl]+(projDone()?.05:0):0};
const prodPerHour=()=>BUILD.reduce((s,b)=>s+b.base*S.lv[b.k],0)*(1+regionBonus());
const storeCap=()=>Math.round(prodPerHour()*8*(1+0.5*S.lv.liman));
const energyCap=()=>100+20*S.lv.santral;
const hitPower=()=>40+15*S.lv.kisla;
const mult=()=>(now()<S.boostUntil?2:1);
const countryMult=()=>(now()<S.mobUntil?1.6:1);
const rankIdx=v=>{let r=0;RANK_PTS.forEach((p,i)=>{if(v>=p)r=i});return r};
const rankName=v=>L().ranks[rankIdx(v)];
const myCountryRank=()=>Math.max(1,Math.round(C[S.country].pl*Math.exp(-S.contrib/1800)));
const upCost=b=>Math.round(b.cost*Math.pow(1.55,S.lv[b.k]));
const buildSecs=b=>BT[Math.min(S.lv[b.k],BT.length-1)];
const eff=x=>x<=3000?x:3000+Math.sqrt((x-3000)*3000);
function addMedals(n,why){const m=Math.round(n*(why==='task'?1+0.05*S.lv.okul:1));S.medals+=m;return m}
function addContrib(n,silent){const b=eff(S.weekRaw);S.weekRaw+=n;S.contrib+=n;S.scores[S.country]+=eff(S.weekRaw)-b;REAL.dirty=true;if(!silent)pushFeed(S.country,t('fSent',{N:esc(up(S.name))}),n)}
function applyNation(){const c=C[S.country||'TR']||{c1:'#a8442a',c2:'#fff'};document.documentElement.style.setProperty('--nation',c.c1);document.documentElement.style.setProperty('--nation-2',c.c2)}
function esc(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

/* time */
const hourNow=()=>{const d=new Date();return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600};
const inTaarruz=()=>now()<S.tzDemo||TAARRUZ.some(([a,b])=>hourNow()>=a&&hourNow()<b);
function taarruzLeft(){if(now()<S.tzDemo)return (S.tzDemo-now())/1000;const h=hourNow();for(const [a,b] of TAARRUZ)if(h>=a&&h<b)return (b-h)*3600;return 0}
function nextTaarruz(){const h=hourNow();for(const [a] of TAARRUZ)if(h<a)return {h:a,secs:(a-h)*3600};return {h:TAARRUZ[0][0],secs:(24-h+TAARRUZ[0][0])*3600}}
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()};
const secsToMidnight=()=>(24-hourNow())*3600;
function weekKey(){const d=new Date(),day=(d.getDay()+6)%7,m=new Date(d);m.setHours(0,0,0,0);m.setDate(d.getDate()-day);return m.getFullYear()+'-'+(m.getMonth()+1)+'-'+m.getDate()}
function weekNo(){const d=new Date(),j=new Date(d.getFullYear(),0,1);return Math.ceil(((d-j)/864e5+j.getDay()+1)/7)}

/* duel: 24h front, three sectors, result at midnight */
const sensitive=(a,b)=>SENSITIVE.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
function pickOpp(){const r=ranked(),i=r.indexOf(S.country),order=[];for(let d=1;d<r.length;d++){if(r[i-d])order.push(r[i-d]);if(r[i+d])order.push(r[i+d])}return order.find(c=>!sensitive(S.country,c))||order[0]}
function newDuel(){
  const opp=pickOpp(),el=86400-secsToMidnight();
  const me=C[S.country].r*.02*el*(.97+Math.random()*.03),op=C[opp].r*.02*el*(1+Math.random()*.03);
  const w=[.3+Math.random()*.1,.32+Math.random()*.1,.3+Math.random()*.1],ow=[.36+Math.random()*.12,.3+Math.random()*.08,.26+Math.random()*.08],sw=w[0]+w[1]+w[2],so=ow[0]+ow[1]+ow[2];
  S.duel={opp,day:dayKey(),me,op,hit:0,mine:0,sec:w.map((x,i)=>({me:me*x/sw,op:op*ow[i]/so})),focus:Math.random()*3|0};
}
const gedik=()=>{if(!S.duel||!S.duel.sec)return -1;let bi=0,bv=9;S.duel.sec.forEach((s,i)=>{const v=s.op/(s.me+s.op);if(v<bv){bv=v;bi=i}});return bi};
function attack(times,e){
  if(S.day.k!==dayKey())S.day={k:dayKey(),h:0};
  if(S.day.h+times>60){toast(t('nCap'),'warn');return}
  const cost=10*times;if(S.energy<cost){toast(t('nEnergy'),'warn');return}
  S.energy-=cost;S.day.h+=times;const tz=inTaarruz()?2:1,sec=S.sector,gb=sec===gedik()?1.5:1,pts=Math.round(hitPower()*times*tz*gb);
  S.duel.me+=pts;if(S.duel.sec)S.duel.sec[sec].me+=pts;S.duel.hit+=times;S.duel.mine+=pts;S.attacks+=times;addContrib(pts,true);
  spawn(1,Math.min(16,3+times*2),sec);sVolley(Math.min(12,2+times*2));
  if(REAL.room)REAL.room.emit('hucum',{c:S.country,s:sec,n:times,nm:String(S.name).slice(0,18)}).catch(()=>{});
  if(S.attacks>=3&&!S.tasks.attack){S.tasks.attack=true;const m=addMedals(10,'task');toast(t('n3att',{m,M:t('medal')}),'medal',S.country)}
  if(times>1)pushFeed(S.country,t('fTopy',{N:esc(up(S.name)),x:tz>1?' 2X':''}),pts);
  flyTo(e.currentTarget,$('#b-lpts'),Math.min(14,4+times*2));
  save();renderDuel();renderOrders();renderHUD();
}
function endDuel(){
  const d=S.duel,won=d.me>d.op,o=nv(d.opp);
  if(won){S.wins++;if(d.hit>0){const m=addMedals(20);toast(t('nWon',{o:o.n,o_acc:o.n_acc,m,M:t('medal')}),'medal',S.country)}else toast(t('nWonNo',{c:cname(S.country)}),'',S.country)}
  else toast(t('nLost',{o:o.n}),'warn',d.opp);
  const swn=d.sec?d.sec.filter(x=>x.me>x.op).length:0;if(swn>=2&&d.hit>0){const m=addMedals(10);notify(t('nSectors',{n:swn,m,M:t('medal')}),'medal',S.country)}
  newDuel();
}

/* sound, synthesized; starts only after a click */
const SND={ctx:null,master:null,noise:null,amb:null};
function au(){if(!SND.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{SND.ctx=new A()}catch(e){return null}SND.master=SND.ctx.createGain();SND.master.gain.value=.55;SND.master.connect(SND.ctx.destination);const c=SND.ctx,b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.noise=b}return SND.ctx}
function nz(t0,dur,type,f0,f1,gain){const c=SND.ctx,s=c.createBufferSource();s.buffer=SND.noise;const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(f1,t0+dur);const g=c.createGain();g.gain.setValueAtTime(gain,t0);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);s.connect(f);f.connect(g);g.connect(SND.master);s.start(t0,Math.random());s.stop(t0+dur+.05)}
function sBoom(far){if(!S.sound||!au())return;const c=SND.ctx,t0=c.currentTime;nz(t0,far?1.6:1.1,'lowpass',far?380:900,50,far?.3:.8);const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(far?70:95,t0);o.frequency.exponentialRampToValueAtTime(28,t0+.6);g.gain.setValueAtTime(far?.2:.55,t0);g.gain.exponentialRampToValueAtTime(.0008,t0+.7);o.connect(g);g.connect(SND.master);o.start(t0);o.stop(t0+.75)}
function sVolley(n){if(!S.sound||!au())return;const t0=SND.ctx.currentTime;for(let i=0;i<n;i++)nz(t0+i*.06+Math.random()*.05,.09,'highpass',1400,900,.32)}
function sBugle(){if(!S.sound||!au())return;const c=SND.ctx;let t0=c.currentTime+.05;[[392,.18],[523,.18],[659,.18],[784,.42],[659,.18],[784,.7]].forEach(([f,d])=>{const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain(),v=c.createOscillator(),vg=c.createGain();o.type='sawtooth';o.frequency.value=f;v.frequency.value=5.5;vg.gain.value=f*.006;v.connect(vg);vg.connect(o.frequency);lp.type='lowpass';lp.frequency.value=1800;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.2,t0+.04);g.gain.setValueAtTime(.2,t0+d*.75);g.gain.exponentialRampToValueAtTime(.0008,t0+d);o.connect(lp);lp.connect(g);g.connect(SND.master);o.start(t0);v.start(t0);o.stop(t0+d+.02);v.stop(t0+d+.02);t0+=d+.03})}
function ambient(on){if(!au())return;if(on&&!SND.amb){const c=SND.ctx,s=c.createBufferSource();s.buffer=SND.noise;s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=140;const g=c.createGain();g.gain.value=.07;s.connect(f);f.connect(g);g.connect(SND.master);s.start();SND.amb={s,g}}else if(!on&&SND.amb){SND.amb.s.stop();SND.amb=null}}
function setSound(on){S.sound=on;$('#snd').setAttribute('aria-pressed',on);if(on){if(au()){SND.ctx.resume();ambient(true);sBugle()}}else ambient(false);save()}

/* notifications */
function notify(x,kind,code){S.inbox.unshift({t:Date.now(),x});S.inbox=S.inbox.slice(0,25);S.unread++;renderBell();toast(x,kind,code)}

/* company (bölük) */
const coName=id=>{const n=+String(id).split('-')[1]||1;return `${n}. ${t('coWord')} · ${L().co[(n-1)%6]}`};
const memCache={},T0=Date.now();
function simMembers(id){const key=id+'|'+LOC();if(memCache[key])return memCache[key];const R=rng([...id].reduce((a,ch)=>a*33+ch.charCodeAt(0)|0,5)),pool=L().names,list=[],n=26+(R()*12|0);for(let i=0;i<n;i++)list.push({nm:pool[R()*pool.length|0]+'_'+(10+(R()*89|0)),base:Math.round(Math.pow(R(),2.2)*9000+150),rate:.3+R()*2.5,on:R()<.25});return memCache[key]=list}
const onlineIds=()=>new Set(REAL.peers.filter(p=>p.by&&!p.isMe).map(p=>p.by));
function members(){const id=S.boluk,el=(Date.now()-T0)/1000,on=onlineIds();
  const sim=simMembers(id).map(m=>({nm:m.nm,w:Math.round(m.base+m.rate*el),on:m.on}));
  const real=REAL.players.filter(p=>p.b===id&&p.wk===weekKey()).map(p=>({nm:p.nm.slice(0,18),w:Math.min(50000,p.w),on:on.has(p.id),real:true}));
  return [...sim,...real,{nm:S.name,w:Math.round(S.weekRaw),on:true,me:true}].sort((a,b)=>b.w-a.w)}
function bolukScores(){const c=S.country,el=(Date.now()-T0)/1000;return Array.from({length:6},(_,i)=>{const id=`${c}-${i+1}`;return {id,v:id===S.boluk?members().reduce((s,m)=>s+m.w,0):Math.round(simMembers(id).reduce((s,m)=>s+m.base+m.rate*el,0))}}).sort((a,b)=>b.v-a.v)}
function switchBoluk(){if(S.bolukSwitch===weekKey()){toast(t('coOnce'),'warn');return}const n=(+S.boluk.split('-')[1])%6+1;S.boluk=`${S.country}-${n}`;S.bolukSwitch=weekKey();S.myMsgs=[];simChat=[];REAL.dirty=true;subscribeChat();setPresence();notify(t('switchedCo',{n:coName(S.boluk)}));save();renderBoluk()}
let simChat=[];
function simChatTick(){if(!S.boluk)return;const ms=simMembers(S.boluk),m=ms[Math.random()*ms.length|0],ch=L().chat;let x=ch[Math.random()*ch.length|0];if(S.duel&&Math.random()<.3)x=t('weakChat',{c:cname(S.duel.opp),s:SECT()[Math.max(0,gedik())].toLocaleLowerCase(LOC())});simChat.push({t:Date.now(),nm:m.nm,x});simChat=simChat.slice(-14);if(tab==='boluk')renderChat()}
const BAD=['amk','aq','orospu','siktir','piç','pic','fuck','shit','bitch','puta','merde','scheisse','блять','сука'];
const clean=s=>String(s).replace(/[\u0000-\u001f]/g,'').slice(0,140).split(/(\s+)/).map(w=>BAD.includes(w.toLocaleLowerCase().replace(/[^\p{L}]/gu,''))?'***':w).join('');

/* real players */
let chatUnsub=null,realStarted=false;
function subscribeChat(){if(!REAL.db||!S.boluk)return;chatUnsub&&chatUnsub();REAL.chat=[];chatUnsub=REAL.db.collection('chat').where('b','==',S.boluk).onSnapshot(snap=>{const out=[];snap.docs.forEach(d=>{if(d.id===REAL.uid)return;const v=d.data()||{};(Array.isArray(v.m)?v.m:[]).slice(-10).forEach(x=>out.push({t:+x.t||0,x:String(x.x||''),nm:String(v.nm||'?').slice(0,18),real:true}))});REAL.chat=out;if(tab==='boluk')renderChat()},()=>{})}
function setPresence(){if(REAL.room&&S.country)REAL.room.presence({c:S.country,b:S.boluk||'',nm:String(S.name).slice(0,18),s:S.sector}).catch(()=>{})}
async function pushMine(){if(!REAL.dirty||!REAL.db||!REAL.uid||!S.country||!S.tut)return;REAL.dirty=false;try{await REAL.db.doc('players/'+REAL.uid).set({c:S.country,b:S.boluk||'',nm:String(S.name).slice(0,18),wk:weekKey(),w:Math.round(eff(S.weekRaw)),t:Math.round(S.contrib),at:Date.now()})}catch(e){REAL.dirty=true}}
async function initReal(){
  if(realStarted)return;realStarted=true;
  if(!window.claude||typeof window.claude.use!=='function')return;
  try{
    const [db,user,room]=await Promise.all([window.claude.use('db'),window.claude.use('user'),window.claude.use('room')]);
    REAL.db=db;REAL.room=room;REAL.user=user;
    if(user){try{REAL.uid=await user.id()}catch(e){}}
    if(db){db.collection('players').onSnapshot(snap=>{const wk=weekKey(),o={},list=[];snap.docs.forEach(d=>{if(d.id===REAL.uid)return;const v=d.data();if(!v||!C[v.c])return;const w=Math.max(0,Math.min(50000,+v.w||0));list.push({id:d.id,c:v.c,b:String(v.b||''),nm:String(v.nm||'?'),wk:v.wk,w});if(v.wk===wk)o[v.c]=(o[v.c]||0)+w});REAL.others=o;REAL.players=list},()=>{});subscribeChat();REAL.dirty=true}
    if(room){room.onPeers(ch=>{REAL.peers=ch.peers},()=>{});
      room.on('hucum',m=>{if(m.sameTab)return;const d=m.data||{};if(!C[d.c])return;const s=Math.max(0,Math.min(2,d.s|0)),n=Math.max(1,Math.min(5,d.n|0)),nm=String(d.nm||'?').slice(0,18);
        if(S.duel&&(d.c===S.country||d.c===S.duel.opp)&&tab==='cephe'){spawn(d.c===S.country?1:-1,Math.min(10,2+n*2),s);sVolley(3)}
        pushFeed(d.c,t('fLive',{N:esc(up(nm)),S:up(SECT()[s])}),0)},()=>{});
      setPresence()}
  }catch(e){}
}
setInterval(()=>{if(S)pushMine()},8000);

/* economy actions */
function upgrade(k){const b=BK[k],cost=upCost(b);if(S.build||S.gold<cost||S.lv[k]>=MAXLV)return;S.gold-=cost;const total=buildSecs(b)/S.speed;S.build={k,until:now()+total*1000,total};toast(t('nBuildStart',{b:bname(k),x:fmtDur(total)}),'',S.country);save();renderAll()}
function finishBuild(){
  const k=S.build.k,b=BK[k];S.lv[k]++;S.build=null;
  for(let i=0;i<24;i++){const p=P(b.sx+1,b.sy+1,20);emit(p[0]+(Math.random()-.5)*70,p[1]-Math.random()*40,'255,210,120',2.5)}
  if(!S.tasks.upgrade){S.tasks.upgrade=true;const m=addMedals(10,'task');toast(t('nUpgTask',{m,M:t('medal')}),'medal',S.country)}
  notify(t('nBuilt',{b:bname(k),l:S.lv[k],p:fmt(prodPerHour())}),'',S.country);save();renderAll();
}
function collect(e){
  const n=Math.floor(S.pending);if(n<1)return;
  S.pending-=n;S.storeFullNoted=false;addContrib(n);S.gold+=Math.round(n*.5);S.collects++;
  if(!S.tasks.collect){S.tasks.collect=true;const m=addMedals(10,'task');toast(t('nCollectTask',{m,M:t('medal')}),'medal',S.country)}
  flyTo(e.currentTarget,$('#n-score'),12);const c=nv(S.country);toast(t('nSent',{n:fmt(n),c:c.n,c_dat:c.n_dat,g:fmt(n*.5)}),'',S.country);
  save();renderAll();
}
function setSpeed(v){if(S.speed===v)return;if(S.build){const left=(S.build.until-now())/1000*S.speed/v;S.build.until=now()+left*1000;S.build.total=S.build.total*S.speed/v}S.speed=v;toast(t(v>1?'nSpeedDemo':'nSpeedReal'));save();renderAll()}
function connectWallet(){S.wallet=!S.wallet;toast(t(S.wallet?'nWallet':'nWalletOff'));save();renderAll()}

/* invites */
const bolukLink=()=>ART_URL+'#'+(S.boluk||S.country+'-1');
let refTimer=null;
function copyRef(btn){
  copy(bolukLink(),btn);toast(t('nInvCopied'),'',S.country);
  if(refTimer)return;
  refTimer=setTimeout(()=>{refTimer=null;const pool=L().names,who=pool[Math.random()*pool.length|0]+'_'+(10+(Math.random()*89|0));
    S.pend.push({who,until:Date.now()+30000});notify(t('nInvCame',{w:esc(who)}),'',S.country);save();renderAll()},5000);
}
function copy(text,btn,fb){const done=()=>{const o=btn.textContent;btn.textContent=t('copied');setTimeout(()=>btn.textContent=o,1400)};try{navigator.clipboard.writeText(text).then(done,()=>{if(fb)fb.select();done()})}catch(err){if(fb)fb.select();done()}}

/* weekly reset: only league points reset */
function weekRoll(){weeklyReport(true);CODES.forEach(c=>S.scores[c]=Math.round(C[c].s*.12*(.9+Math.random()*.2)));S.weekRaw=0;S.wk=weekKey();S.bestRank=99;S.prevRank=0;REAL.dirty=true;newDuel();save()}

/* main loop */
let tab='cephe',last=now(),lastRank=0,lastFeed=0,lastSave=0,lastSlow=0,started=false;
function tick(){
  const tm=now(),dt=Math.min(5,(tm-last)/1000);last=tm;
  CODES.forEach(c=>{let r=C[c].r*(.85+Math.random()*.3);if(c===S.country)r*=countryMult();S.scores[c]+=r*dt});
  S.pending=Math.min(storeCap(),S.pending+prodPerHour()/3600*S.speed*mult()*dt);
  S.energy=Math.min(energyCap(),S.energy+dt*S.speed/360);
  if(S.build&&tm>=S.build.until)finishBuild();
  if(S.duel){const d=S.duel,tz=inTaarruz()?1.8:1;
    if(d.day!==dayKey())endDuel();
    else{const dm=C[S.country].r*.02*countryMult()*tz*(.7+Math.random()*.6)*dt,dop=C[d.opp].r*.02*tz*(.7+Math.random()*.6)*dt;d.me+=dm;d.op+=dop;
      if(d.sec){if(Math.random()<dt/90)d.focus=Math.random()*3|0;d.sec.forEach((x,i)=>{x.me+=dm/3;x.op+=dop*(i===d.focus?.5:.25)})}
      if(tab==='cephe'){if(Math.random()<dt*.6*tz)spawn(1,1);if(Math.random()<dt*.75*tz)spawn(-1,1+(Math.random()<.3?2:0),d.focus)}}}
  if(tm>=S.mobUntil){if(S.mobDone){S.mobDone=false;S.mobShares=Math.round(S.mobTarget*.55);S.mobTarget=Math.round(S.mobTarget*1.4/50)*50}
    if(Math.random()<.5*dt)S.mobShares++;
    if(S.mobShares>=S.mobTarget){S.mobUntil=tm+180000;S.mobDone=true;toast(t('nMob',{c:cname(S.country)}),'medal',S.country)}}
  if(tm-lastFeed>2600){lastFeed=tm;feed()}
  const tzNow=inTaarruz();if(tzNow&&!S.lastTz){notify(t('nTz'),'medal',S.country);sBugle()}S.lastTz=tzNow;
  if(S.pending>=storeCap()&&!S.storeFullNoted){S.storeFullNoted=true;notify(t('nFull'),'warn')}
  if(S.pend.length)S.pend=S.pend.filter(p=>{if(tm<p.until)return true;S.refJoined++;addContrib(300,true);const m=addMedals(50);S.tasks.invite=true;notify(t('nInvOk',{w:esc(p.who),m,M:t('medal')}),'medal',S.country);pushFeed(S.country,t('fJoined',{W:esc(up(p.who))}),300);return false});
  if(S.wk&&S.wk!==weekKey())weekRoll();
  if(tm-lastRank>1000){lastRank=tm;const r=ranked(),k=r.indexOf(S.country)+1;
    if(S.prevRank&&k<S.prevRank){const passed=r[k];if(k<S.bestRank){S.bestRank=k;celebrate(k,passed)}else{const o=nv(passed);notify(t('nPassed',{c:cname(S.country),o:o.n,o_acc:o.n_acc,k}),'',S.country)}}
    if(S.prevRank&&k>S.prevRank)notify(t('nPassedBy',{o:cname(r[k-2]),k}),'warn',r[k-2]);
    S.prevRank=k}
  const slow=tm-lastSlow>1000;if(slow)lastSlow=tm;
  renderHUD();renderNation();
  if(tab==='cephe'){renderDuel();if(slow){renderTargets();renderOrders();renderSectors()}}
  if(tab==='arsa'){renderPending();if(slow){renderChips();renderSel()}}
  if(tab==='boluk'&&slow)renderBoluk();
  if(tab==='gorev')renderMob();
  if(tab==='lig'&&slow){renderLeague();renderCountdown()}
  if(tm-lastSave>3000){lastSave=tm;save()}
}
function frame(ts){const tt=ts/1000;if(started){if(tab==='cephe')drawDuel(tt);if(tab==='arsa')drawIso(REDUCE?0:tt)}requestAnimationFrame(frame)}
