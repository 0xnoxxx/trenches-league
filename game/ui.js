/* Trenches League · renderers (part 1) */
function renderHUD(){
  $('#r-gold').textContent=fmt(S.gold);$('#r-energy').textContent=Math.floor(S.energy)+'/'+energyCap();$('#r-medal').textContent=fmt(S.medals);
  $('#wallet span').textContent=S.wallet?'7xKp…3fQa':t('wallet');
  $('#sp-demo').setAttribute('aria-pressed',S.speed>1);$('#sp-real').setAttribute('aria-pressed',S.speed===1);
}
function renderNation(){
  const c=S.country,k=rankOf(c);
  $('#n-name').textContent=cname(c);
  const rb=$('#n-rank');rb.textContent=k+'.';rb.classList.toggle('prize',k<=3);
  $('#n-lg').textContent=lgName(C[c].lg);
  $('#n-score').textContent=fmt(score(c));$('#n-players').textContent=fmtK(C[c].pl+S.refJoined);
  $('#n-rk').textContent=rankName(S.contrib);$('#n-mine').textContent=fmtK(S.contrib);$('#n-myrank').textContent=fmtK(myCountryRank())+'.';
  const parts=[];if(now()<S.mobUntil)parts.push(t('mobWord')+' 1,6x');if(now()<S.boostUntil)parts.push(t('bugle')+' 2x');if(inTaarruz())parts.push(t('btnAttack')+' 2x');
  const m=$('#n-mult');m.textContent=parts.join(' · ');m.classList.toggle('on',parts.length>0);
}
function renderOrders(){
  const d=new Date();
  const o=[{done:S.tasks.collect,n:t('o1'),p:t('o1p',{x:fmt(S.pending)}),go:'arsa',b:t('tabHQ')},{done:S.tasks.attack,n:t('o2'),p:t('o2p',{x:Math.min(3,S.attacks)}),go:'hucum',b:t('btnAttack')},{done:S.tasks.share,n:t('o3'),p:t('o3p'),task:'share',b:t('btnShare')}];
  $('#orders').innerHTML=`<div class="hd"><b>${t('dailyOrder')}</b><span>${t('orderNo',{d:String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'),c:esc(cname(S.country)),n:esc(S.name)})}</span></div>`+
    o.map((x,i)=>`<div class="order"><span class="n">${i+1}.</span><div style="min-width:0"><b>${x.n}</b> <span>${x.done?'':'· '+x.p} · <span class="rw">+10 ${t('medal')}</span></span></div>${x.done?`<span class="stamp">${t('stampDone')}</span>`:`<button class="btn sm primary" ${x.go?`data-go="${x.go}"`:`data-task="${x.task}"`}>${x.b}</button>`}</div>`).join('');
  $('#dot-cephe').classList.toggle('on',!S.tasks.attack);
}
function renderDuel(){
  const d=S.duel;if(!d)return;const me=S.country,tz=inTaarruz();
  $('#bug-l').style.background=shade(C[me].c1,-.25);$('#bug-r').style.background=shade(C[d.opp].c1,-.25);
  $('#bug-l').innerHTML=`${flagEl(me,30)}<span>${C[me].k3}</span>`;$('#bug-r').innerHTML=`<span>${C[d.opp].k3}</span>${flagEl(d.opp,30)}`;
  $('#b-lpts').textContent=fmt(d.me);$('#b-rpts').textContent=fmt(d.op);
  const dd=new Date();$('#b-clock').textContent=`${String(dd.getHours()).padStart(2,'0')}:${String(dd.getMinutes()).padStart(2,'0')}`;
  $('#b-left').textContent=t('endsIn',{x:fmtDur(secsToMidnight())});
  const p=Math.round(d.me/(d.me+d.op)*1000)/10;
  $('#mb-l').style.cssText=`width:${p}%;background:${C[me].c1}`;$('#mb-r').style.cssText=`width:${100-p}%;background:${C[d.opp].c1}`;
  $('#m-l').textContent=p.toLocaleString(LOC())+'%';$('#m-r').textContent=(Math.round((100-p)*10)/10).toLocaleString(LOC())+'%';
  const tb=$('#tzbanner');tb.hidden=!tz;if(tz)tb.innerHTML=`<span>${t('tzBanner',{x:fmtDur(taarruzLeft())})}</span>`;
  $('#duel-title').textContent=`${cname(me)} - ${cname(d.opp)}`;
  $('#duel-sub').textContent=t('duelSub',{o:cname(d.opp),r:rankOf(d.opp)});
  $('#hucum').disabled=S.energy<10;$('#topyekun').disabled=S.energy<50;
  const gb=S.sector===gedik()?1.5:1;$('#hucum-sub').textContent=`10 ${t('energy')} · +${Math.round(hitPower()*(tz?2:1)*gb)} · ${SECT()[S.sector]}`;
  $('#topy-sub').textContent=`50 ${t('energy')} · 5 ${t('attacksW')}`;
  const nt=nextTaarruz(),live=REAL.room?t('infoLive',{n:REAL.peers.filter(x=>!x.isMe&&x.presence&&x.presence.c===S.country).length}):'';
  $('#duel-info').innerHTML=`<div>${t('info1',{h:S.day.k===dayKey()?S.day.h:0,p:fmt(d.mine)})}${live}</div><div>${tz?t('infoTzOn'):t('infoTzNext',{h:String(nt.h).padStart(2,'0'),x:fmtDur(nt.secs)})+` <button class="link" id="tz-demo" style="color:#7a4f12">${t('tryNow')}</button>`}</div><div>${t('info3',{m:t('medal')})}</div>`;
  const tzb=$('#tz-demo');if(tzb)tzb.onclick=()=>{S.tzDemo=now()+180000;toast(t('nTzDemo'),'medal',S.country);renderDuel()};
}
function renderSectors(){
  const d=S.duel;if(!d||!d.sec)return;const g=gedik(),mc=C[S.country].c1,oc=C[d.opp].c1,sn=SECT();
  $('#sectors').innerHTML=d.sec.map((s,i)=>{const p=Math.round(s.me/(s.me+s.op)*100);return `<button class="sector" data-sec="${i}" aria-pressed="${S.sector===i}">${i===g?`<span class="gedik">${t('gedik')}</span>`:''}<b>${i+1}. ${sn[i]}</b><div class="sb"><i style="width:${p}%;background:${mc}"></i><i style="width:${100-p}%;background:${oc}"></i></div><small>${t('secUs')} %${p} · ${s.me>s.op?t('secAhead'):t('secBehind')}</small></button>`}).join('');
}
function renderTargets(){
  const r=ranked(),me=S.country,i=r.indexOf(me),ahead=i>0?r[i-1]:null,behind=i<r.length-1?r[i+1]:null;
  $('#t-ahead').innerHTML=ahead?`${flagEl(ahead,58)}<div style="min-width:0"><div class="label">${t('gapAhead',{r:i})}</div><div class="nm">${esc(cname(ahead))}</div></div><div style="text-align:right"><div class="label">${t('dist')}</div><div class="v num" style="color:var(--brass)">${fmt(score(ahead)-score(me))}</div></div>`:`<div></div><div class="nm">${t('weLead')}</div><div></div>`;
  $('#t-behind').innerHTML=behind?(()=>{const gap=score(me)-score(behind);return `${flagEl(behind,58)}<div style="min-width:0"><div class="label">${t('gapBehind',{r:i+2})}</div><div class="nm">${esc(cname(behind))}</div></div><div style="text-align:right"><div class="label">${gap<1500?t('closing'):t('dist')}</div><div class="v num" style="color:${gap<1500?'var(--down)':'var(--khaki)'}">${fmt(gap)}</div></div>`})():`<div></div><div class="nm">${t('lastPlace')}</div><div></div>`;
}
function renderPlotHead(){const h=myHex();if(!h)return;$('#plot-sub').textContent=`${cname(S.country)} · ${regionName(S.country,h)} · ${lvlName(h.lvl)}`;$('#plot-title').textContent=t('plotTitle',{n:S.name})}
function renderPending(){
  $('#pending').textContent=fmt(S.pending);const cap=storeCap();
  $('#storebar').style.width=Math.min(100,S.pending/cap*100)+'%';
  const full=Math.max(0,(cap-S.pending)/(prodPerHour()*mult()/3600*S.speed));
  $('#prodline').textContent=t('prodLine',{p:fmt(prodPerHour()*mult()),c:fmt(cap),s:S.pending>=cap?t('full'):t('fullIn',{x:fmtDur(full)}),g:fmt(S.pending*.5)});
  $('#dot-arsa').classList.toggle('on',S.pending>=cap*.5||(!S.build&&BUILD.some(b=>S.lv[b.k]<MAXLV&&S.gold>=upCost(b))));
  $('#collect').disabled=S.pending<1;
}
function renderSel(){
  const b=BK[S.sel],lv=S.lv[b.k],cost=upCost(b),max=lv>=MAXLV,busy=S.build&&S.build.k!==b.k,mine=S.build&&S.build.k===b.k,can=!max&&!S.build&&S.gold>=cost;
  const pips=Array.from({length:MAXLV},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('');
  const ex={okul:t('x_okul',{a:5*lv,b:5*(lv+1)}),santral:t('x_santral',{a:100+20*lv,b:120+20*lv}),kisla:t('x_kisla',{a:40+15*lv,b:55+15*lv}),liman:t('x_liman',{a:(1+.5*lv).toFixed(1),b:(1.5+.5*lv).toFixed(1)})}[b.k];
  let action;
  if(mine){const left=(S.build.until-now())/1000,pct=100-left/S.build.total*100;action=`<div class="build"><b>${t('underCon')}</b><div class="bar brass"><i style="width:${pct}%"></i></div><span style="font:14px var(--f-type)">${t('leftLv',{x:fmtDur(left),l:lv+1})}</span></div>`}
  else if(max)action=`<div class="build"><b>${t('maxLv')}</b><span style="font:14px/1.4 var(--f-type)">${t('maxTxt')}</span><button class="btn brass sm" data-go="region">${t('regionProject')}</button></div>`;
  else action=`<button class="btn ${can?'primary':''} xl" id="upgrade" ${can?'':'disabled'}>${lv?t('upgrade'):t('build')} · ${fmt(cost)} ${t('gold')}</button>
    <div style="font:14px/1.4 var(--f-type);color:var(--khaki-2)">${t('buildTime',{x:fmtDur(buildSecs(b)/S.speed)})}${S.speed>1?t('realTime',{x:fmtDur(buildSecs(b))}):''}${busy?t('busy',{b:bname(S.build.k)}):!can?t('goldShort',{x:fmt(Math.max(0,cost-S.gold))}):''}</div>`;
  $('#selpanel').innerHTML=`<div class="top"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="${ICON[b.k]}"/></svg></div><div><div class="lv">${lv?t('level',{l:lv,m:MAXLV}):t('notBuilt')}</div><h3>${bname(b.k)}</h3></div></div>
    <div class="pips">${pips}</div>
    <div class="cmp"><div>${t('now')}<b class="num">${fmt(b.base*lv)}</b>${t('perH')}</div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--up)" stroke-width="2.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg><div class="to">${max?t('maxS'):t('next')}<b class="num">${max?'-':fmt(b.base*(lv+1))}</b>${t('perH')}</div></div>
    <div style="font-size:16px;color:var(--khaki-2)">${t('d_'+b.k)}${ex?` <span class="rw">${ex}</span>`:''}</div>
    ${action}
    <div class="row" style="border-top:1px solid #0c0d08;padding-top:12px"><div style="flex:1;min-width:0"><b class="sten" style="font-size:18px">${t('bugle')}</b><div style="font-size:14px;color:var(--khaki-2)">${t('bugleSub',{x:fmtDur(10800/S.speed)})}</div></div><button class="btn sm" id="boost" ${S.gold>=300&&now()>=S.boostUntil?'':'disabled'}>${now()<S.boostUntil?t('playing'):'300 '+t('gold')}</button></div>
    <div style="font:13px/1.4 var(--f-type);color:var(--dim)">${t('oneBuilder')}</div>`;
  const ub=$('#upgrade');if(ub)ub.onclick=()=>upgrade(b.k);
  $('#boost').onclick=()=>{if(S.gold<300)return;S.gold-=300;S.boostUntil=now()+10800000/S.speed;toast(t('nBugle'),'',S.country);save();renderAll()};
}
function renderChips(){
  $('#bchips').innerHTML=BUILD.map(b=>{const lv=S.lv[b.k],can=!S.build&&lv<MAXLV&&S.gold>=upCost(b),bl=S.build&&S.build.k===b.k;return `<button class="bchip" data-b="${b.k}" aria-pressed="${S.sel===b.k}"><i class="can ${can?'on':''}"></i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="${ICON[b.k]}"/></svg><b>${bname(b.k)}</b><span>${bl?t('chipBuilding'):lv?t('lvA')+' '+lv:t('chipBuild')}</span></button>`}).join('');
}
let regionSel=null;
function renderRegion(){
  const H=drawHexMap('#hexmap',S.country,regionSel,S.hex,d=>{regionSel=d.i;renderRegion()});if(!H)return;
  const h=H.hexes[regionSel!=null?regionSel:S.hex]||H.hexes[0],mine=h.i===S.hex,pv=projVal();
  $('#regioninfo').innerHTML=`<div><div class="label">${mine?t('yourRegion'):t('selRegion')}</div><h3 class="h3" style="font-size:32px">${esc(regionName(S.country,h))}</h3></div>
    <div style="font-size:16px;color:var(--khaki-2)"><b class="sten num" style="color:var(--khaki);font-size:26px">${fmt(h.pop)}</b> ${t('soldiersW')}${h.lvl<3?t('moreNeeded',{n:fmt(LVL[h.lvl+1]-h.pop),l:lvlName(h.lvl+1)}):''}</div>
    <div class="lvls">${LVL.map((l,i)=>`<div class="${i===h.lvl?'cur':''}"><i style="background:${lvlColor(i)}"></i><span>${lvlName(i)} · ${l}+</span><span>${bonusTxt(i)}</span></div>`).join('')}</div>
    ${mine?`<div class="project" id="project"><b class="sten" style="font-size:19px">${t('projTitle')}</b><div class="bar brass"><i style="width:${pv/PROJ_GOAL*100}%"></i></div><div style="font:14px/1.4 var(--f-type);color:var(--khaki-2)">${t('projTxt',{v:fmt(pv),g:fmt(PROJ_GOAL)})}${projDone()?` · <b style="color:var(--up)">${t('completed')}</b>`:''}</div>${projDone()?'':`<button class="btn brass sm" id="donate" ${S.gold>=250?'':'disabled'}>${t('donate250')}</button>`}</div>`:''}
    <div style="font:14px/1.4 var(--f-type);color:var(--dim)">${t('inactiveRule')}</div>`;
  const dn=$('#donate');if(dn)dn.onclick=()=>{if(S.gold<250)return;S.gold-=250;S.projects[projKey()]=(S.projects[projKey()]||0)+250;toast(t('nDonate'),'',S.country);save();renderAll(true)};
}
function insignia(){return `<svg class="insignia" viewBox="0 0 64 72" aria-hidden="true"><path d="M32 2 60 12v24c0 18-12 28-28 34C16 64 4 54 4 36V12z" fill="${C[S.country].c1}" stroke="#0c0d08" stroke-width="2"/><path d="M32 8 54 16v20c0 14-9 22-22 27C19 58 10 50 10 36V16z" fill="none" stroke="#f3e4bd" stroke-width="1.6"/><text x="32" y="45" text-anchor="middle" font-family="Saira Stencil One, Russo One, sans-serif" font-size="26" fill="#f3e4bd">${String(S.boluk).split('-')[1]}</text></svg>`}
function renderBoluk(){
  if(!S.boluk)return;const ms=members(),cmd=ms[0],tot=ms.reduce((s,m)=>s+m.w,0),bs=bolukScores(),br=bs.findIndex(b=>b.id===S.boluk)+1,onl=ms.filter(m=>m.on).length;
  $('#bhead').innerHTML=`${insignia()}<div style="min-width:0"><div class="label">${esc(cname(S.country))} · ${S.boluk}</div><div class="nm">${esc(coName(S.boluk))}</div><div class="stats"><span><b class="num">${ms.length}</b>${t('soldiersW')}</span><span><b class="num">${onl}</b>${t('onFront')}</span><span><b class="num">${fmtK(tot)}</b>${t('thisWeek')}</span><span><b>${br}.</b>${t('inCountry')}</span></div></div><div style="text-align:right"><div class="label">${t('commander')}</div><div class="sten" style="font-size:20px">${esc(cmd.nm)}</div>${cmd.me?`<span class="stamp" style="font-size:13px;color:var(--brass);border-color:var(--brass);mix-blend-mode:normal">${t('itsYou')}</span>`:''}</div>`;
  const g=gedik(),nt=nextTaarruz();
  $('#border').innerHTML=`<div class="row" style="border-bottom:1px solid rgba(43,36,22,.5);padding-bottom:6px"><b style="font:400 20px var(--f-stencil)">${t('coOrder')}</b><span class="sp"></span><span class="from">${t('from',{n:esc(cmd.nm)})}</span></div><p>${g>=0?t('coBreach',{S:up(SECT()[g])}):t('hold')} ${inTaarruz()?t('tzNowC'):t('tzAtC',{h:String(nt.h).padStart(2,'0')})} STOP</p>`;
  $('#roster').innerHTML=`<div class="row" style="border-bottom:2px solid rgba(43,36,22,.6);padding-bottom:6px"><b style="font:400 22px var(--f-stencil)">${t('roster')}</b><span class="sp"></span><span style="font-size:13px">${t('thisWeek')}</span></div>`+ms.slice(0,14).map((m,i)=>`<div class="rrow ${m.me?'me':''}"><span>${i+1}.</span><span class="nm"><i class="${m.on?'on':'off'}"></i>${esc(m.nm)}${m.real?`<span class="real">${t('real')}</span>`:''}${m.me?` (${t('you')})`:''}</span><span>${rankName(m.me?S.contrib:m.w*3)}</span><span style="text-align:right" class="num">${fmt(m.w)}</span></div>`).join('')+(ms.length>14?`<div style="font-size:13px;padding-top:8px;opacity:.7">${t('andMore',{n:ms.length-14})}</div>`:'');
  $('#blist').innerHTML=`<div class="row" style="border-bottom:2px solid rgba(43,36,22,.6);padding-bottom:6px"><b style="font:400 22px var(--f-stencil)">${t('coList',{c:esc(cname(S.country))})}</b></div>`+bs.map((b,i)=>`<div class="brow ${b.id===S.boluk?'me':''}"><span>${i+1}.</span><span>${esc(coName(b.id))}</span><span class="num">${fmtK(b.v)}</span></div>`).join('')+`<div style="font-size:13px;padding-top:8px">${t('coBonus')} <button class="link" id="bswitch" style="color:#7a4f12">${t('switchCo')}</button></div>`;
  $('#bswitch').onclick=switchBoluk;
  $('#real-note').textContent=REAL.db?t('realOn',{p:REAL.players.length,o:REAL.peers.filter(p=>!p.isMe).length}):t('realOff');
  renderChat();
}
function renderChat(){const box=$('#msgs');if(!box)return;const all=[...simChat,...REAL.chat,...S.myMsgs.map(m=>({...m,nm:S.name,me:true}))].sort((a,b)=>a.t-b.t).slice(-30);
  const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<40;
  box.innerHTML=all.length?all.map(m=>`<div class="msg ${m.me?'me':''}"><b>${esc(m.nm)}${m.real?' · '+t('real'):''}</b>${esc(clean(m.x))}</div>`).join(''):`<div class="msg sys"><b>${t('radio')}</b>${t('silent')}</div>`;
  if(atBottom)box.scrollTop=box.scrollHeight}
