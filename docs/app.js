/* Trenches League · pre-registration site */
let S={lang:'en'};
const CFG=window.TL_CONFIG||{};
const KEY='tl-prereg-v1';
let SB=null,ME=null,COUNTS={},TOTAL=0,heroStop=null,showAll=false;
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const _dn={};
function cname(c,lang){lang=lang||S.lang;try{_dn[lang]=_dn[lang]||new Intl.DisplayNames([lang],{type:'region'});return _dn[lang].of(c)||C[c].geo}catch(e){return C[c]?C[c].geo:c}}
const flagEmoji=c=>String.fromCodePoint(...[...c].map(ch=>0x1F1E6+ch.charCodeAt(0)-65));
const params=new URLSearchParams(location.search);
const REF=(params.get('ref')||'').replace(/[^a-z0-9]/gi,'').slice(0,12);
const REFC=(params.get('c')||'').toUpperCase();
function store(){try{localStorage.setItem(KEY,JSON.stringify({lang:S.lang,me:ME,local:LOCAL}))}catch(e){}}
let LOCAL=[];

/* counts: real from Supabase, otherwise a demo baseline */
const IS_LOCAL=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
function demoCounts(){
  const o={};
  if(!IS_LOCAL){LOCAL.forEach(r=>{o[r.country]=(o[r.country]||0)+1});return o}
  CODES.forEach(c=>{const R=rng(c.charCodeAt(0)*97+c.charCodeAt(1)*13),base=[900,520,180,60,9][C[c].lg];o[c]=Math.round(base*(.5+R()))});
  o.TR=Math.max(o.TR,640);o.PL=Math.max(o.PL,655);LOCAL.forEach(r=>{o[r.country]=(o[r.country]||0)+1});return o;
}
async function loadCounts(){
  if(SB){try{const {data,error}=await SB.rpc('country_counts');if(error)throw error;const o={};(data||[]).forEach(r=>{if(C[r.country])o[r.country]=+r.n});COUNTS=o}catch(e){COUNTS={}}}
  else COUNTS=demoCounts();
  TOTAL=Object.values(COUNTS).reduce((a,b)=>a+b,0);
}
const boardOrder=()=>CODES.slice().sort((a,b)=>(COUNTS[b]||0)-(COUNTS[a]||0)||C[b].pl-C[a].pl);
const boardRank=c=>boardOrder().indexOf(c)+1;

/* rendering */
function applyI18n(){
  _LI=Math.max(0,LANGS.indexOf(S.lang));document.documentElement.lang=S.lang;
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t(el.dataset.t)});
  document.querySelectorAll('[data-tp]').forEach(el=>{el.placeholder=t(el.dataset.tp)});
  $('#langsel').value=S.lang;
}
function pickHeroCountry(){
  if(ME)return ME.country;const sel=$('#f-country').value;if(sel&&C[sel])return sel;if(C[REFC])return REFC;
  let reg='';try{reg=(navigator.language||'').split('-')[1]||''}catch(e){}return C[reg]?reg:'TR';
}
function renderHero(){
  const c=pickHeroCountry();document.documentElement.style.setProperty('--nation',C[c].c1);
  $('#total').textContent=t('s_total',{n:TOTAL.toLocaleString(S.lang)});
  $('#hero-country').textContent=cname(c);$('#hero-rank').textContent=boardRank(c)+'.';
  const inv=$('#invited');inv.hidden=!(REF&&C[REFC]&&!ME);if(!inv.hidden)inv.textContent=t('s_invitedBy',{c:cname(REFC)});
}
function renderBoard(){
  const q=($('#b-search').value||'').trim().toLocaleLowerCase(S.lang),order=boardOrder(),mine=ME?ME.country:$('#f-country').value;
  let list=q?order.filter(c=>cname(c).toLocaleLowerCase(S.lang).includes(q)||C[c].geo.toLowerCase().includes(q)):order.slice(0,showAll?order.length:15);
  if(!q&&mine&&C[mine]&&!list.includes(mine))list=list.concat([mine]);
  const max=Math.max(1,COUNTS[order[0]]||1);
  $('#board').innerHTML=list.map(c=>{const r=order.indexOf(c)+1,n=COUNTS[c]||0;return `<div class="brow ${c===mine?'me':''}" data-c="${c}"><span class="pos">${r}</span><span class="flag" style="width:36px;height:24px">${flagSVG(c,36,24)}</span><span class="nm">${esc(cname(c))}</span><span class="barw"><i style="width:${Math.max(2,n/max*100)}%;background:${C[c].c1}"></i></span><span class="num">${n.toLocaleString(S.lang)}</span></div>`}).join('');
  $('#b-more').hidden=!!q;$('#b-more').textContent=showAll?'−':t('s_showAll');
}
function renderCountrySelect(){
  const sel=$('#f-country'),cur=sel.value||(C[REFC]?REFC:'');
  const opts=CODES.slice().sort((a,b)=>cname(a).localeCompare(cname(b),S.lang));
  sel.innerHTML=`<option value="">—</option>`+opts.map(c=>`<option value="${c}">${flagEmoji(c)} ${esc(cname(c))}</option>`).join('');
  sel.value=cur||(()=>{let reg='';try{reg=(navigator.language||'').split('-')[1]||''}catch(e){}return C[reg]?reg:''})();
}
function renderDone(){
  const box=$('#done');if(!ME){box.hidden=true;$('#form').hidden=false;return}
  $('#form').hidden=true;box.hidden=false;
  const link=location.origin+location.pathname+'?ref='+ME.code+'&c='+ME.country;
  $('#d-title').textContent=t('s_done',{n:ME.handle});$('#d-link').value=link;
  $('#d-flag').innerHTML=flagSVG(ME.country,96,64);
  const txt=t('s_shareTxt',{f:flagEmoji(ME.country),c:cname(ME.country),r:boardRank(ME.country),link});
  $('#d-x').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(txt);
  refreshRecruits();
}
async function refreshRecruits(){
  let n=0;if(SB&&ME){try{const {data}=await SB.rpc('ref_count',{p_code:ME.code});n=+data||0}catch(e){}}
  $('#d-recruits').textContent=t('s_recruits',{n});
}
function renderAll(){applyI18n();renderCountrySelect();renderHero();renderBoard();renderDone();$('#demo').hidden=!!SB;
  const x=$('#follow');if(CFG.xHandle){x.hidden=false;x.href='https://x.com/'+encodeURIComponent(CFG.xHandle)}}

/* register */
const B58=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,HANDLE=/^[\p{L}\p{N}_.]{2,24}$/u;
async function submit(e){
  e.preventDefault();const country=$('#f-country').value,handle=$('#f-handle').value.trim().replace(/^@/,''),wallet=$('#f-wallet').value.trim(),msg=$('#f-msg');
  msg.textContent='';
  if(!C[country]){$('#f-country').focus();return}
  if(!HANDLE.test(handle)){msg.textContent=t('s_handleBad');$('#f-handle').focus();return}
  if(wallet&&!B58.test(wallet)){msg.textContent=t('s_walletBad');$('#f-wallet').focus();return}
  const btn=$('#f-submit');btn.disabled=true;
  try{
    let code;
    if(SB){const {data,error}=await SB.rpc('register',{p_country:country,p_handle:handle,p_wallet:wallet||null,p_ref:REF||null,p_lang:S.lang});
      if(error){msg.textContent=/duplicate|unique/i.test(error.message||'')?t('s_taken'):t('s_err');btn.disabled=false;return}code=data}
    else{code=Math.random().toString(36).slice(2,10);LOCAL.push({country,handle})}
    ME={code,country,handle};store();await loadCounts();renderAll();
    heroStop&&heroStop();startHero();
    $('#done').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(err){msg.textContent=t('s_err')}
  btn.disabled=false;
}
function startHero(){const cv=$("#hero-flag"),iw=innerWidth||document.documentElement.clientWidth||1200;cv.width=Math.min(1400,iw*1.2);cv.height=Math.round(cv.width*.62);heroStop=battleScene(cv,pickHeroCountry)}

/* boot */
(async function(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(saved){S.lang=LANG_NAMES[saved.lang]?saved.lang:'en';ME=saved.me||null;LOCAL=saved.local||[]}
  $('#langsel').innerHTML=LANGS.map(l=>`<option value="${l}">${LANG_NAMES[l]}</option>`).join('');
  if(CFG.supabaseUrl&&CFG.supabaseAnonKey&&window.supabase){try{SB=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey)}catch(e){SB=null}}
  await loadFlagLib();buildCountries(null);CODES.forEach(c=>flagImg(c));
  await loadCounts();renderAll();startHero();
  $('#langsel').addEventListener('change',e=>{S.lang=e.target.value;store();renderAll()});
  $('#f-country').addEventListener('change',()=>{renderHero();renderBoard()});
  $('#b-search').addEventListener('input',renderBoard);
  $('#b-more').addEventListener('click',()=>{showAll=!showAll;renderBoard()});
  $('#board').addEventListener('click',e=>{const r=e.target.closest('[data-c]');if(!r||ME)return;$('#f-country').value=r.dataset.c;renderHero();renderBoard();$('#form').scrollIntoView({behavior:'smooth',block:'center'})});
  $('#form').addEventListener('submit',submit);
  $('#cta').addEventListener('click',()=>$('#join').scrollIntoView({behavior:'smooth',block:'start'}));
  $('#d-copy').addEventListener('click',e=>{const b=e.currentTarget,i=$('#d-link');const ok=()=>{const o=b.textContent;b.textContent='✓';setTimeout(()=>b.textContent=o,1200)};try{navigator.clipboard.writeText(i.value).then(ok,()=>{i.select();ok()})}catch(err){i.select();ok()}});
  setInterval(async()=>{await loadCounts();renderHero();renderBoard()},60000);
})();
