/* Trenches League · renderers (part 2), onboarding, boot */
function renderTasks(){
  const today=S.streak-(S.tasks.login?1:0);let wd;try{wd=new Intl.DateTimeFormat(LOC(),{weekday:'short'})}catch(e){wd=null}
  const days=Array.from({length:7},(_,i)=>{const d=new Date(2024,0,1+i);return wd?wd.format(d):['Mo','Tu','We','Th','Fr','Sa','Su'][i]});
  $('#streak').innerHTML=days.map((d,i)=>`<div class="${i===today?'today':i<S.streak?'done':''}"><b>${i+1}</b>${d}</div>`).join('');
  const TK=[{k:'login',n:t('tkLogin'),d:t('tkLoginD'),rw:5},{k:'collect',n:t('o1'),d:t('tkCollectD'),rw:10},{k:'upgrade',n:t('tkUpg'),d:t('tkUpgD'),rw:10},{k:'attack',n:t('o2'),d:t('o2p',{x:Math.min(3,S.attacks)}),rw:10},{k:'share',n:t('o3'),d:t('o3p'),rw:10,act:'share'},{k:'invite',n:t('tkInv'),d:S.refJoined?t('invCame',{n:S.refJoined}):S.pend.length?t('invPend',{n:S.pend.length}):t('tkInvD'),rw:50,act:'invite'}];
  const ic={login:'M5 12l5 5L20 7',collect:'M12 19V5M5 12l7-7 7 7',upgrade:'M3 21h18M6 21V10l6-5 6 5v11',attack:'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2',share:'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',invite:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6'};
  $('#tasks').innerHTML=`<div class="row" style="border-bottom:2px solid rgba(43,36,22,.6);padding:6px 0 10px"><b style="font:400 24px/1 var(--f-stencil)">${t('orderBook')}</b><span class="sp"></span><span style="font-size:13px">${esc(S.name)}</span></div>`+TK.map(x=>{const done=S.tasks[x.k];
    const btn=done?`<span class="stamp">${t('stampDone')}</span>`:x.k==='login'?`<button class="btn sm primary" data-task="login">${t('btnTake')}</button>`:x.act?`<button class="btn sm primary" data-task="${x.act}">${x.act==='share'?t('btnShare'):t('btnLink')}</button>`:`<button class="btn sm" data-go="${x.k==='attack'?'hucum':'arsa'}">${t('btnGo')}</button>`;
    return `<div class="task"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ic[x.k]}"/></svg></div><div style="min-width:0"><h4>${x.n}</h4><p>${x.d} · <span class="rw">+${x.rw} ${t('medal')}</span></p></div>${btn}</div>`}).join('');
  $('#dot-gorev').classList.toggle('on',Object.values(S.tasks).some(v=>!v));
}
function renderMob(){
  const el=$('#mob');
  if(now()<S.mobUntil){el.innerHTML=`<span class="label" style="color:#f3e4bd">${t('mobWord')}</span><h2 class="h2">${t('mobOnT',{c:esc(cname(S.country))})}</h2><p>${t('mobOnP',{x:fmtDur((S.mobUntil-now())/1000)})}</p>`;return}
  el.innerHTML=`<span class="label" style="color:#f3e4bd">${t('mobDecl')}</span><h2 class="h2">${t('mobGoal',{t:S.mobTarget})}</h2><div class="row"><div class="bar" style="flex:1"><i style="width:${Math.min(100,S.mobShares/S.mobTarget*100)}%"></i></div><b class="sten num" style="font-size:24px">${fmt(S.mobShares)}/${S.mobTarget}</b></div><div><button class="btn" data-task="share">${t('btnShare')}</button></div>`;
}
let viewLg=null;
function renderLeague(){
  const my=C[S.country].lg;if(viewLg==null)viewLg=my;
  $('#lgtabs').innerHTML=[0,1,2,3,4].map(i=>`<button class="btn sm ${i===viewLg?'brass':''}" data-lg="${i}">${lgName(i)}${i===my?' ★':''}</button>`).join('');
  const r=ranked(viewLg),me=S.country,prize=[500,300,200],n=r.length;
  $('#rep-lg').textContent=`${lgName(viewLg)} · ${t('weekW',{w:weekNo()})}${viewLg===my?' · '+t('yourLeague'):''}`;
  let html=`<div class="st hd"><span>#</span><span></span><span>${t('hdCountry')}</span><span class="c hide">${t('hdSoldiers')}</span><span class="c">${t('hdPoints')}</span><span class="c">${t('hdReward')}</span></div>`;
  r.forEach((c,i)=>{
    if(i===0)html+=`<div class="zone up">${viewLg===0?t('zTop'):t('zUp')}</div>`;
    if(i===3)html+=`<div class="zone mid">${t('zMid')}</div>`;
    if(viewLg<4&&i===n-3)html+=`<div class="zone dn">${t('zDn')}</div>`;
    const cls=(i<3?'promo':viewLg<4&&i>=n-3?'releg':'')+(c===me?' me':'');
    html+=`<div class="st ${cls}"><span class="pos">${i+1}</span><span class="fl">${flagEl(c,36)}</span><span class="nm">${C[c].k3}<small>${esc(cname(c))}</small>${S.duel&&c===S.duel.opp?`<span class="tag">${t('rival')}</span>`:''}</span><span class="c hide num">${fmtK(C[c].pl+(c===me?S.refJoined:0))}</span><span class="c num">${fmt(score(c))}</span><span class="c">${i<3?prize[i]+' '+t('medal'):'-'}</span></div>`;
  });
  $('#league').innerHTML=html;
}
function chevron(i){
  if(i<3)return `<svg viewBox="0 0 24 24">${Array.from({length:i+1},(_,k)=>`<path d="M5 ${8+k*5}l7-4 7 4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>`).join('')}</svg>`;
  const n=i<6?i-2:i<8?i-5:i-7,col=i<6?'currentColor':'#c99a3b';
  return `<svg viewBox="0 0 24 24">${i>=8?`<circle cx="12" cy="12" r="10.5" fill="none" stroke="${col}" stroke-width="1.3"/>`:''}${i>=6&&i<8?`<path d="M3 19h18" stroke="${col}" stroke-width="2"/>`:''}${Array.from({length:n},(_,k)=>`<polygon points="${star(12+(k-(n-1)/2)*7,12,3.4,-90)}" fill="${col}"/>`).join('')}</svg>`;
}
function renderRewards(){
  $('#m-total').textContent=fmt(S.medals);
  $('#m-share').textContent=t('mShare',{p:(S.medals/9.8e6*100).toLocaleString(LOC(),{maximumFractionDigits:4})});
  $('#wallet2').textContent=S.wallet?t('walletOn',{a:'7xKp…3fQa'}):t('walletAir');
  const ci=rankIdx(S.contrib),rn=L().ranks;
  $('#ranks').innerHTML=rn.map((r,i)=>`<div class="rk ${i===ci?'cur':i>ci?'lock':''}">${chevron(i)}<b>${r}</b><span>${fmtK(RANK_PTS[i])}</span></div>`).join('');
  $('#rk-next').textContent=ci<9?t('rankNext',{r:rn[ci+1],x:fmt(RANK_PTS[ci+1]-S.contrib)}):'';
  $('#mvp-line').textContent=t('mvpLine',{r:fmt(myCountryRank())});
  const tr=[[S.wallet,t('tWallet'),t('connect'),'wallet'],[S.wallet,t('tAge')],[S.trust.x,t('tX'),t('verify'),'x'],[S.trust.tg,t('tTg'),t('connect'),'tg'],[(S.day.h||0)<=60,t('tLim')]];
  const sc=Math.round(tr.filter(x=>x[0]).length/tr.length*100);
  $('#trust').innerHTML=`<div class="row" style="border-bottom:2px solid rgba(43,36,22,.6);padding-bottom:6px"><b style="font:400 22px var(--f-stencil)">${t('trustT',{p:sc})}</b><span class="sp"></span><span class="stamp" style="font-size:13px">${sc>=60?t('trustOk'):t('trustNo')}</span></div>`+tr.map(x=>`<div class="trow"><span class="${x[0]?'ok':'no'}">${x[0]?'✓':'✗'}</span><span>${x[1]}</span>${!x[0]&&x[2]?`<button class="btn sm" data-trust="${x[3]}">${x[2]}</button>`:'<span></span>'}</div>`).join('')+`<p style="font-size:14px;margin:10px 0 0;line-height:1.45">${t('trustP',{e:fmt(eff(S.weekRaw)),r:fmt(S.weekRaw)})}</p>`;
}
function renderCountdown(){const d=new Date(),end=new Date(d);end.setDate(d.getDate()+((7-d.getDay())%7));end.setHours(23,59,59,0);let s=Math.max(0,(end-d)/1000|0);$('#countdown').textContent=t('leftTime',{d:s/86400|0,h:(s%86400)/3600|0,m:(s%3600)/60|0})}
function renderBell(){const n=$('#bell-n');n.hidden=!S.unread;n.textContent=S.unread>9?'9+':S.unread}
function renderInbox(){$('#inbox-list').innerHTML=S.inbox.length?S.inbox.map(i=>{const d=new Date(i.t);return `<div class="it"><time>${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</time><span>${i.x}</span></div>`}).join(''):`<p style="margin:10px 0 0;font-size:14px">${t('noNotifs')}</p>`}

/* telegraph, toasts, fx */
function feed(){
  const lg=ranked(),own=Math.random()<.55,c=own?S.country:lg[Math.random()*lg.length|0];
  const pool=L().names,who=pool[Math.random()*pool.length|0]+'_'+(10+(Math.random()*89|0));
  const H=hexData(c),cs=CITIES[c],city=cs?cs[Math.random()*cs.length|0][0]:L().dirs[Math.random()*5|0];
  const acts=L().acts,a=Math.random()*acts.length|0,base=[180,60,240,120,900,400,320][a],pts=Math.round(base*(.6+Math.random()*.9)),lvl=[0,1,6].includes(a)?(Math.random()*8+2|0):'';
  pushFeed(c,`${esc(up(city))}. ${esc(up(who))} ${acts[a]}${lvl} STOP`,pts);
}
function pushFeed(c,txt,pts){const ol=$('#feed'),li=document.createElement('li');li.innerHTML=`${flagEl(c,24)}<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${txt}</span><span class="pts num">${pts?'+'+fmt(pts):''}</span>`;ol.prepend(li);while(ol.children.length>8)ol.lastChild.remove()}
function toast(msg,kind,code){const el=document.createElement('div');el.className='toast paper '+(kind||'');el.innerHTML=(code?flagEl(code,30):'<span></span>')+`<div>${msg}</div>`;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),4200)}
function flyTo(fromEl,toEl,n){
  if(REDUCE||!fromEl||!toEl)return;const a=fromEl.getBoundingClientRect(),b=toEl.getBoundingClientRect();
  for(let i=0;i<(n||10);i++){const d=document.createElement('div');d.className='fly';document.body.appendChild(d);
    const sx=a.left+a.width/2+(Math.random()-.5)*a.width*.6,sy=a.top+a.height/2,ex=b.left+b.width*.3+Math.random()*b.width*.4,ey=b.top+b.height/2,mx=(sx+ex)/2+(Math.random()-.5)*200,my=Math.min(sy,ey)-80-Math.random()*120;
    d.animate([{transform:`translate(${sx}px,${sy}px) scale(1)`},{transform:`translate(${mx}px,${my}px) scale(1.4)`,offset:.5},{transform:`translate(${ex}px,${ey}px) scale(.4)`,opacity:.3}],{duration:700+i*45,easing:'cubic-bezier(.5,0,.3,1)'}).onfinish=()=>d.remove()}
}

/* share: recruitment poster */
function shareLead(){const r=ranked(),i=r.indexOf(S.country);if(i<1)return t('leadTop');const a=cname(r[i-1]);return t('leadGap',{a,a_dat:LOC()==='tr'?dat(a):a,g:fmt(score(r[i-1])-score(S.country))})}
function shareText(){const c=S.country;return t('shareText',{f:flagEmoji(c),c:cname(c),r:rankOf(c),lead:shareLead(),link:bolukLink(),tag:ctag(c)})}
function shareCard(){
  const cv=document.createElement('canvas');cv.width=1200;cv.height=630;const x=cv.getContext('2d'),me=S.country,k=rankOf(me);
  const pg=x.createRadialGradient(400,250,50,600,315,800);pg.addColorStop(0,'#ebdfbf');pg.addColorStop(1,'#bfa978');x.fillStyle=pg;x.fillRect(0,0,1200,630);
  x.fillStyle='#2b2416';x.fillRect(80,40,8,560);x.fillStyle='#c99a3b';x.beginPath();x.arc(84,36,10,0,7);x.fill();
  drawCloth(x,me,88,70,540,360,.8,{amp:.08,hoist:.1});
  x.fillStyle=grimePat(x);x.globalAlpha=.6;x.fillRect(0,0,1200,630);x.globalAlpha=1;
  x.strokeStyle='#2b2416';x.lineWidth=6;x.strokeRect(20,20,1160,590);x.lineWidth=2;x.strokeRect(32,32,1136,566);
  const st='"Saira Stencil One","Russo One",sans-serif';x.fillStyle='#2b2416';x.textAlign='left';
  x.font='30px '+st;x.fillText('TRENCHES LEAGUE · '+up(lgName(C[me].lg)),670,110);
  const nm=up(cname(me));x.font=(nm.length>9?Math.max(56,118*9/nm.length):118)+'px '+st;x.fillText(nm,660,230);
  x.fillStyle='#a52a1c';x.font='200px '+st;x.fillText(k+'.',660,420);
  x.save();x.translate(980,360);x.rotate(-.14);x.strokeStyle='#a52a1c';x.lineWidth=5;x.strokeRect(-140,-46,280,80);x.fillStyle='#a52a1c';x.font='40px '+st;x.textAlign='center';x.fillText(t('joinStamp'),0,8);x.restore();
  x.fillStyle='#2b2416';x.font='bold 28px "Courier Prime","Courier New",monospace';x.textAlign='left';x.fillText(up(shareLead()).slice(0,60),90,500);x.fillText('TRENCHES LEAGUE · #'+up(S.boluk||''),90,550);
  return cv.toDataURL('image/png');
}
function openShare(){const txt=shareText();$('#share-text').value=txt;$('#share-tw').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(txt);(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{$('#share-img').src=shareCard()});$('#share').hidden=false}
function markShared(){if(!S.tasks.share){S.tasks.share=true;addContrib(150);const m=addMedals(10,'task');toast(t('nShared',{m,M:t('medal')}),'medal',S.country)}if(now()>=S.mobUntil)S.mobShares+=1;save();renderAll()}

/* celebration + weekly report */
let celStop=null,confStop=null;
function celebrate(k,passed){
  $('#cel-k').textContent=k<=3?t('celPrize'):t('celAdv');$('#cel-title').textContent=t('celTitle',{c:cname(S.country),k});
  $('#cel-sub').textContent=t('celSub',{P:up(cname(passed))})+(k<=3&&C[S.country].lg>0?t('celSub2'):'');
  const cv=$('#celflag');cv.width=Math.min(1600,innerWidth*1.4);cv.height=Math.min(1000,innerHeight*1.4);
  $('#celebrate').hidden=false;celStop=battleScene(cv,()=>S.country);sBugle();confStop=confetti([C[S.country].c1,C[S.country].c2,'#c99a3b','#e3d5b0']);
}
function closeCel(){$('#celebrate').hidden=true;celStop&&celStop();confStop&&confStop()}
function confetti(cols){const cv=$('#confetti'),x=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;if(REDUCE)return ()=>{};
  const Pt=Array.from({length:160},()=>({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.7,vx:(Math.random()-.5)*1.6,vy:1.5+Math.random()*2.5,r:Math.random()*6.3,s:5+Math.random()*8,c:cols[Math.random()*cols.length|0]}));
  let raf;(function f(){x.clearRect(0,0,cv.width,cv.height);Pt.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.07;if(p.y>cv.height+20){p.y=-20;p.x=Math.random()*cv.width}x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);x.restore()});raf=requestAnimationFrame(f)})();
  return ()=>{cancelAnimationFrame(raf);x.clearRect(0,0,cv.width,cv.height)}}
function weeklyReport(final){
  const lg=C[S.country].lg,r=ranked(),me=S.country,k=r.indexOf(me)+1,prize=[500,300,200],ms=S.boluk?members():[],mi=ms.findIndex(m=>m.me);
  const up3=k<=3&&lg>0,down=lg<4&&k>r.length-3,myNis=(k<=3?prize[k-1]:0)+(mi>=0&&mi<10?400:0);
  $('#weekly-box').innerHTML=`<div class="row" style="border-bottom:3px double rgba(43,36,22,.7);padding-bottom:10px"><b style="font:400 32px/1 var(--f-stencil)">${t('wkTitle')}</b><span class="sp"></span><span class="stamp">${final?t('wkFinal'):t('wkPrev')}</span></div>
   <div class="podium">${[1,0,2].map(i=>`<div class="p">${flagEl(r[i],80)}<b class="sten" style="font-size:18px">${esc(cname(r[i]))}</b><div class="blk" style="height:${[110,80,60][i]}px">${i+1}</div><span style="font-size:13px">${t('perSoldier',{x:prize[i]})}</span></div>`).join('')}</div>
   <div class="wres">${flagEl(me,60)}<div><b style="font:400 26px/1.1 var(--f-stencil)">${t('celTitle',{c:esc(cname(me)),k})}</b><div style="font-size:14px">${fmt(score(me))} · ${up3?t('stPromo'):down?t('stDown'):t('stStay',{l:lgName(lg)})}</div></div><span class="stamp" style="font-size:22px">${up3?t('stmpPromo'):down?t('stmpDown'):t('stmpHold')}</span></div>
   <div><b style="font:400 20px var(--f-stencil)">${t('mvpCo',{n:esc(coName(S.boluk))})}</b>${ms.slice(0,3).map((m,i)=>`<div class="rrow"><span>${i+1}.</span><span class="nm">${esc(m.nm)}${m.me?` (${t('you')})`:''}</span><span></span><span class="num" style="text-align:right">${fmt(m.w)}</span></div>`).join('')}</div>
   <div class="row" style="font-size:16px"><span>${t('yourPart',{x:fmt(S.weekRaw)})}</span><span class="sp"></span><span>${t(final?'earned':'willEarn',{x:myNis,m:t('medal')})}</span></div>
   <div class="row"><button class="btn primary" id="wk-share">${t('btnShare')}</button><button class="btn" id="wk-close">${final?t('newWeek'):t('close')}</button></div>`;
  $('#weekly').hidden=false;if(final)addMedals(myNis);sBugle();
  $('#wk-close').onclick=()=>{$('#weekly').hidden=true};$('#wk-share').onclick=()=>{$('#weekly').hidden=true;openShare()};
}

/* i18n */
function applyI18n(){
  document.documentElement.lang=S.lang;document.querySelectorAll('[lang]').forEach(el=>{if(el!==document.documentElement)el.lang=S.lang});
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t(el.dataset.t)});
  document.querySelectorAll('[data-th]').forEach(el=>{el.innerHTML=t(el.dataset.th,{m:t('medal')})});
  document.querySelectorAll('[data-tp]').forEach(el=>{el.placeholder=t(el.dataset.tp)});
  document.querySelectorAll('[data-ta]').forEach(el=>{el.title=t(el.dataset.ta);el.setAttribute('aria-label',t(el.dataset.ta))});
  ['#langsel','#ob-langsel'].forEach(s=>{const el=$(s);if(el)el.value=S.lang});
}
function setLang(l,silent){if(!LANG_NAMES[l])l='en';S.lang=l;setLangIndex();applyI18n();save();
  if(!$('#onboard').hidden){renderPicker();if(!$('#ob2wrap').hidden&&S.country){fillOb2()}}
  if(started){renderAll(true);if(tab==='lig')drawWorld();renderInbox()}
  if(!silent)toast(t('langSwitched',{l:LANG_NAMES[l]}))}

/* tabs */
function setTab(x){tab=x;document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===x));document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!=='v-'+x);if(x==='lig'){viewLg=C[S.country].lg;drawWorld()}renderAll(true);window.scrollTo({top:0})}
function renderAll(full){
  renderHUD();renderNation();
  if(tab==='cephe'){renderOrders();renderDuel();renderTargets();renderSectors()}
  if(tab==='arsa'){renderPending();renderSel();renderChips();if(full){renderPlotHead();renderRegion()}}
  if(tab==='boluk')renderBoluk();
  if(tab==='gorev'){renderMob();renderTasks()}
  if(tab==='lig'){renderLeague();renderCountdown();if(full)updateWorld()}
  if(tab==='odul')renderRewards();
}

/* onboarding */
let obStop=null,obPick=null;
const inviteHash=()=>{const m=(location.hash||'').match(/^#([A-Z]{2})-([1-6])$/);return m&&C[m[1]]?m:null};
function renderPicker(){
  const q=($('#ob-search').value||'').trim().toLocaleLowerCase(LOC()),hm=inviteHash();
  let reg='';try{reg=(navigator.language||'').split('-')[1]||''}catch(e){}
  const sug=[hm&&hm[1],C[reg]?reg:null].filter(Boolean);
  const list=CODES.slice().sort((a,b)=>(sug.includes(b)-sug.includes(a))||C[a].lg-C[b].lg||C[b].pl-C[a].pl)
    .filter(c=>!q||cname(c).toLocaleLowerCase(LOC()).includes(q)||C[c].geo.toLowerCase().includes(q)||c.toLowerCase()===q).slice(0,q?60:48);
  $('#pickgrid').innerHTML=list.map((c,i)=>`<button class="poster paper" data-c="${c}" style="--r:${[-1.2,.8,-.5,1.1,-.9,.4][i%6]}deg${sug.includes(c)?';outline:4px solid var(--brass)':''}">${flagEl(c,150)}<b>${esc(cname(c))}</b><span>${t('posterLine',{l:lgName(C[c].lg),r:rankOf(c),p:fmtK(C[c].pl)})}</span>${sug.includes(c)?`<span class="stamp" style="justify-self:start;font-size:13px">${hm&&hm[1]===c?t('invite'):t('suggested')}</span>`:''}</button>`).join('');
}
function fillOb2(){
  const code=S.country;$('#ob-title').textContent=cname(code);$('#ob-calls').textContent=t('calls');
  $('#ob-count').textContent=t('onFrontN',{n:fmt(C[code].pl)});$('#ob-rank').textContent=t('rankLine',{l:lgName(C[code].lg),r:rankOf(code)});
  const hm=inviteHash(),inv=hm&&hm[1]===code;$('#ob-boluk').innerHTML=t('unit',{n:esc(coName(S.boluk))})+(inv?t('invitedBy'):'');drawOb();
}
function chooseCountry(code){
  S.country=code;applyNation();
  const l=LANG_OF[code]||'en',changed=l!==S.lang;S.lang=l;setLangIndex();applyI18n();
  $('#ob1').hidden=true;$('#ob2wrap').hidden=false;
  if(!$('#cmdname').value){const pool=L().names;$('#cmdname').value=pool[Math.random()*pool.length|0]+(Math.random()*90+10|0)}
  const fc=$('#obflag');fc.width=Math.min(1600,innerWidth*1.4);fc.height=Math.min(1000,innerHeight*1.4);
  obStop&&obStop();obStop=battleScene(fc,()=>S.country);
  const H=hexData(code);obPick=H?(H.hexes.filter(h=>h.lvl===2).sort((a,b)=>b.pop-a.pop)[0]||H.hexes.slice().sort((a,b)=>b.pop-a.pop)[0]):null;
  const hm=inviteHash();S.boluk=hm&&hm[1]===code?`${code}-${hm[2]}`:`${code}-${1+(Math.random()*6|0)}`;
  fillOb2();$('#onboard').scrollTo(0,0);
  if(changed)toast(t('langSwitched',{l:LANG_NAMES[l]}));
}
function drawOb(){const H=drawHexMap('#obhex',S.country,null,obPick?obPick.i:null,d=>{obPick=d;drawOb()});if(H&&obPick)$('#ob-plot').innerHTML=`<b style="color:var(--khaki)">${esc(regionName(S.country,obPick))}</b> · ${lvlName(obPick.lvl)} · ${fmt(obPick.pop)} ${t('soldiersW')} · ${bonusTxt(obPick.lvl)}`}

function startGame(){
  applyNation();if(!S.boluk)S.boluk=S.country+'-1';if(!S.duel||S.duel.day!==dayKey()||!S.duel.sec||!C[S.duel.opp]||C[S.duel.opp].lg!==C[S.country].lg)newDuel();
  if(!S.wk)S.wk=weekKey();renderBell();initReal();if(!simChat.length)for(let i=0;i<4;i++)simChatTick();
  if(!started){started=true;battleScene($('#flagwave'),()=>S.country);setInterval(tick,250);setInterval(simChatTick,11000);requestAnimationFrame(frame)}
  for(let i=0;i<5;i++)feed();setTab('cephe');
}

/* events */
function wire(){
  $('#hucum').addEventListener('click',e=>attack(1,e));$('#topyekun').addEventListener('click',e=>attack(5,e));
  $('#collect').addEventListener('click',collect);
  $('#sectors').addEventListener('click',e=>{const b=e.target.closest('[data-sec]');if(!b)return;S.sector=+b.dataset.sec;renderSectors();renderDuel();setPresence();save()});
  $('#bchips').addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b)return;S.sel=b.dataset.b;renderSel();renderChips()});
  $('#lgtabs').addEventListener('click',e=>{const b=e.target.closest('[data-lg]');if(!b)return;viewLg=+b.dataset.lg;renderLeague()});
  document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
  $('#snd').addEventListener('click',()=>setSound(!S.sound));
  $('#bell').addEventListener('click',()=>{const p=$('#inbox');p.hidden=!p.hidden;if(!p.hidden){S.unread=0;renderBell();renderInbox()}});
  document.addEventListener('click',e=>{const p=$('#inbox');if(!p.hidden&&!e.target.closest('#inbox')&&!e.target.closest('#bell'))p.hidden=true});
  const openTg=()=>{$('#inbox').hidden=true;$('#tg-code').textContent='TL-'+(Math.abs([...S.name].reduce((a,ch)=>a*31+ch.charCodeAt(0)|0,7))%9000+1000);$('#tg').hidden=false};
  $('#tg-open').addEventListener('click',openTg);$('#tg-x').addEventListener('click',()=>$('#tg').hidden=true);
  $('#tg-done').addEventListener('click',()=>{S.trust.tg=true;$('#tg').hidden=true;notify(t('nTgOn'));save();renderAll()});
  $('#wallet').addEventListener('click',connectWallet);$('#wallet2').addEventListener('click',connectWallet);
  $('#sp-demo').addEventListener('click',()=>setSpeed(60));$('#sp-real').addEventListener('click',()=>setSpeed(1));
  $('#share-open').addEventListener('click',openShare);$('#share-tw').addEventListener('click',markShared);
  $('#share-copy').addEventListener('click',e=>{copy($('#share-text').value,e.currentTarget,$('#share-text'));markShared()});
  $('#ref-copy').addEventListener('click',e=>copyRef(e.currentTarget));$('#binvite').addEventListener('click',e=>copyRef(e.currentTarget));
  $('#share-x').addEventListener('click',()=>$('#share').hidden=true);$('#share').addEventListener('click',e=>{if(e.target.id==='share')$('#share').hidden=true});
  $('#cel-close').addEventListener('click',closeCel);$('#cel-share').addEventListener('click',()=>{closeCel();openShare()});
  $('#week-preview').addEventListener('click',()=>weeklyReport(false));
  let lastSend=0;
  $('#chatf').addEventListener('submit',async e=>{e.preventDefault();const inp=$('#chat-in'),x=clean(inp.value.trim());if(!x)return;if(Date.now()-lastSend<3000){toast(t('radioBusy'),'warn');return}lastSend=Date.now();inp.value='';S.myMsgs.push({t:Date.now(),x});S.myMsgs=S.myMsgs.slice(-10);save();renderChat();
    if(REAL.db&&REAL.uid){try{await REAL.db.doc('chat/'+REAL.uid).set({b:S.boluk,nm:String(S.name).slice(0,18),m:S.myMsgs})}catch(err){}}});
  document.addEventListener('click',e=>{
    const tr=e.target.closest('[data-trust]');if(tr){const k=tr.dataset.trust;if(k==='wallet')connectWallet();else if(k==='x'){S.trust.x=true;notify(t('nXOn'));save();renderAll()}else openTg();return}
    const g=e.target.closest('[data-go]');
    if(g){const to=g.dataset.go;if(to==='hucum'){setTab('cephe');setTimeout(()=>$('#hucum').scrollIntoView({behavior:'smooth',block:'center'}),50)}else if(to==='region'){setTab('arsa');setTimeout(()=>$('#regioninfo').scrollIntoView({behavior:'smooth',block:'center'}),50)}else setTab(to);return}
    const k=e.target.closest('[data-task]');if(!k)return;const v=k.dataset.task;
    if(v==='login'&&!S.tasks.login){S.tasks.login=true;S.streak=Math.min(7,S.streak+1);const m=addMedals(5);toast(t('nLogin',{s:S.streak,m,M:t('medal')}),'medal',S.country);save();renderAll()}
    if(v==='share')openShare();if(v==='invite')copyRef(k);
  });
  ['#langsel','#ob-langsel'].forEach(s=>$(s).addEventListener('change',e=>setLang(e.target.value)));
  $('#ob-search').addEventListener('input',renderPicker);
  $('#pickgrid').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b)chooseCountry(b.dataset.c)});
  $('#ob-back').addEventListener('click',()=>{$('#ob2wrap').hidden=true;$('#ob1').hidden=false;obStop&&obStop();renderPicker()});
  $('#oath').addEventListener('click',()=>{S.name=($('#cmdname').value||'soldier').trim().replace(/\s+/g,'_').slice(0,18);S.hex=obPick?obPick.i:0;S.prevRank=rankOf(S.country);S.bestRank=S.prevRank;obStop&&obStop();$('#ob2wrap').hidden=true;$('#ob3').hidden=false;$('#onboard').scrollTo(0,0);save()});
  $('#tut-go').addEventListener('click',()=>{S.tut=true;save();$('#onboard').hidden=true;startGame()});
  $('#reset').addEventListener('click',()=>{try{localStorage.removeItem(KEY)}catch(e){}location.reload()});
}

/* boot */
(async function boot(){
  await loadFlagLib();
  WORLD=decodeWorld();buildCountries(WORLD);
  if(WORLD)WORLD.features.forEach(f=>{const c=GEO2C[f.properties.name];if(c)FEAT[c]=f});
  let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  S=Object.assign(fresh(),saved||{});CODES.forEach(c=>{if(S.scores[c]==null)S.scores[c]=C[c].s});S.sound=false;
  setLangIndex();
  const opts=LANGS.map(l=>`<option value="${l}">${LANG_NAMES[l]}</option>`).join('');$('#langsel').innerHTML=opts;$('#ob-langsel').innerHTML=opts;
  wire();applyI18n();
  CODES.forEach(c=>flagImg(c));
  if(S.country&&C[S.country]&&S.hex!=null&&S.tut){$('#onboard').hidden=true;startGame()}
  else{const lang=S.lang;S=fresh();S.lang=lang;setLangIndex();applyNation();renderPicker()}
})();
