"use strict";
const $=s=>document.querySelector(s);
const LOC=()=>(typeof S!=='undefined'&&S&&S.lang)||'en';
const L=()=>LX[LOC()]||LX.en;
const fmt=n=>Math.round(n).toLocaleString(LOC());
const fmtK=n=>{n=Math.round(n);if(Math.abs(n)<1e4)return fmt(n);try{return new Intl.NumberFormat(LOC(),{notation:'compact',maximumFractionDigits:1}).format(n)}catch(e){return fmt(n)}};
const up=s=>String(s).toLocaleUpperCase(LOC());
const lastV=n=>{const m=n.toLowerCase().match(/[aeıioöuü](?=[^aeıioöuü]*$)/);return m?m[0]:'a'};
const endsV=n=>/[aeıioöuü]$/i.test(n);
const dat=n=>n+"'"+(endsV(n)?'y':'')+('aıou'.includes(lastV(n))?'a':'e');
const acc=n=>{const h={a:'ı',ı:'ı',e:'i',i:'i',o:'u',u:'u',ö:'ü',ü:'ü'}[lastV(n)]||'ı';return n+"'"+(endsV(n)?'y':'')+h};
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rgb(hex){const c=parseInt(hex.slice(1),16);return [c>>16,c>>8&255,c&255]}
function shade(hex,f){let [r,g,b]=rgb(hex);if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}return `rgb(${r|0},${g|0},${b|0})`}
function rgba(hex,a){const [r,g,b]=rgb(hex);return `rgba(${r},${g},${b},${a})`}
const fmtDur=s=>{s=Math.max(0,Math.ceil(s));const u=L().dur,h=s/3600|0,m=(s%3600)/60|0,x=s%60;return h?`${h} ${u[0]} ${String(m).padStart(2,'0')} ${u[1]}`:m?`${m} ${u[1]} ${String(x).padStart(2,'0')} ${u[2]}`:`${x} ${u[2]}`};

/* ================= flags ================= */
function star(cx,cy,r,rot){const p=[];for(let i=0;i<10;i++){const a=(rot+i*36)*Math.PI/180,rr=i%2?r*.382:r;p.push((cx+Math.cos(a)*rr).toFixed(2)+','+(cy+Math.sin(a)*rr).toFixed(2))}return p.join(' ')}
const FLAG={
  TR:`<rect width="30" height="20" fill="#E30A17"/><circle cx="11.2" cy="10" r="5" fill="#fff"/><circle cx="12.45" cy="10" r="4" fill="#E30A17"/><polygon points="${star(17.3,10,2.05,180)}" fill="#fff"/>`,
  PL:`<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#DC143C"/>`,
  BR:`<rect width="30" height="20" fill="#009C3B"/><polygon points="3,10 15,1.8 27,10 15,18.2" fill="#FFDF00"/><circle cx="15" cy="10" r="4.7" fill="#002776"/><path d="M10.5 9.1Q15 7.6 19.6 11.2" stroke="#fff" stroke-width=".7" fill="none"/>`,
  AR:`<rect width="30" height="20" fill="#74ACDF"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="1.9" fill="#F6B40E"/>`,
  ID:`<rect width="30" height="10" fill="#CE1126"/><rect y="10" width="30" height="10" fill="#fff"/>`,
  NG:`<rect width="30" height="20" fill="#008751"/><rect x="10" width="10" height="20" fill="#fff"/>`,
  VN:`<rect width="30" height="20" fill="#DA251D"/><polygon points="${star(15,10.4,5.6,-90)}" fill="#FFFF00"/>`,
  UA:`<rect width="30" height="10" fill="#0057B7"/><rect y="10" width="30" height="10" fill="#FFD700"/>`,
  FR:`<rect width="30" height="20" fill="#EF4135"/><rect width="20" height="20" fill="#fff"/><rect width="10" height="20" fill="#0055A4"/>`,
  DE:`<rect width="30" height="20" fill="#FFCE00"/><rect width="30" height="13.34" fill="#DD0000"/><rect width="30" height="6.67" fill="#000"/>`,
  IT:`<rect width="30" height="20" fill="#CE2B37"/><rect width="20" height="20" fill="#fff"/><rect width="10" height="20" fill="#009246"/>`,
  JP:`<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>`
};
const flagSVG=(c,w,h)=>{const lib=FLAG_LIB&&FLAG_LIB[c];if(lib)return lib.replace('<svg ',`<svg width="${w||30}" height="${h||20}" preserveAspectRatio="none" `);return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="${w||30}" height="${h||20}" preserveAspectRatio="none">${FLAG[c]||'<rect width="30" height="20" fill="#6b6a55"/>'}</svg>`};
const flagEl=(c,w)=>`<span class="flag" style="width:${w}px;height:${Math.round(w*2/3)}px">${flagSVG(c)}</span>`;
const flagImgCache={},flagBmpCache={};
function flagImg(c){if(flagImgCache[c])return flagImgCache[c];const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(flagSVG(c,900,600));flagImgCache[c]=im;return im}
function flagBmp(c){if(flagBmpCache[c])return flagBmpCache[c];const im=flagImg(c);if(!(im.complete&&im.naturalWidth))return null;const cv=document.createElement('canvas');cv.width=900;cv.height=600;cv.getContext('2d').drawImage(im,0,0,900,600);return flagBmpCache[c]=cv}
function drawFlagWave(ctx,code,x,y,w,h,t,amp){
  const im=flagBmp(code);if(!im)return;
  const step=Math.max(1.5,w/60);
  for(let i=0;i<w;i+=step){const k=i/w,ph=k*7-t*3,off=Math.sin(ph)*amp*k;
    ctx.drawImage(im,k*im.width,0,step/w*im.width+1,im.height,x+i,y+off,step+.6,h);
    const sh=Math.cos(ph)*k;ctx.fillStyle=sh>0?`rgba(255,255,255,${sh*.14})`:`rgba(0,0,0,${-sh*.38})`;ctx.fillRect(x+i,y+off,step+.6,h)}
}
/* battle-worn fabric: travelling waves, slope lighting, weave, grime, soot, bullet holes and a torn fly end */
let weave=null,grime=null;
function weavePat(ctx){if(!weave){const c=document.createElement('canvas');c.width=c.height=6;const x=c.getContext('2d');
  x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,0,6,1);x.fillRect(0,3,6,1);x.fillStyle='rgba(0,0,0,.07)';x.fillRect(0,1,6,1);x.fillRect(0,4,6,1);x.fillStyle='rgba(0,0,0,.05)';x.fillRect(2,0,1,6);x.fillRect(5,0,1,6);weave=c}return ctx.createPattern(weave,'repeat')}
function grimePat(ctx){if(!grime){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),R=rng(99);
  for(let i=0;i<70;i++){const px=R()*256,py=R()*256,r=10+R()*46,g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(45,32,15,${.12+R()*.2})`);g.addColorStop(1,'rgba(45,32,15,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}
  for(let i=0;i<2600;i++){x.fillStyle=`rgba(${R()<.5?'30,22,10':'255,240,210'},${R()*.12})`;x.fillRect(R()*256,R()*256,1,1)}grime=c}return ctx.createPattern(grime,'repeat')}
const offs={},wear={};
function wearOf(code){if(wear[code])return wear[code];const R=rng(code.charCodeAt(0)*131+code.charCodeAt(1)*7);
  const holes=Array.from({length:2+(R()*2|0)},()=>({k:.7+R()*.22,v:.12+R()*.76,r:.0035+R()*.004}));
  const tear=Array.from({length:24},()=>R());return wear[code]={holes,tear}}
function drawCloth(ctx,code,x,y,w,h,t,o){
  o=o||{};const im=flagBmp(code);if(!im||!(w>2&&h>2))return;
  const pad=Math.ceil(h*.35),key=(w|0)+'x'+(h|0);
  let oc=offs[key];if(!oc){oc=document.createElement('canvas');oc.width=Math.ceil(w)+4;oc.height=Math.ceil(h)+pad*2;offs[key]=oc}
  const c=oc.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,oc.width,oc.height);
  const amp=(o.amp==null?.07:o.amp)*h,step=Math.max(1.5,w/180),base=o.hoist==null?.15:o.hoist;
  const L=[];let px=0;
  for(let i=0;i<w;i+=step){
    const k=i/w,f=base+(1-base)*k;
    const p1=k*6.2-t*2.4,p2=k*12.5-t*3.7+1.3,p3=k*3-t*1.1;
    const off=(Math.sin(p1)*.62+Math.sin(p2)*.22+Math.sin(p3)*.16)*amp*f;
    const slope=(Math.cos(p1)*.62*6.2+Math.cos(p2)*.22*12.5+Math.cos(p3)*.16*3)*f;
    const comp=1-Math.abs(Math.sin(p1))*.05*k,hh=h*comp,yy=pad+off+(h-hh)/2;
    const dw=step*(1-Math.min(.35,Math.abs(slope)*.018));
    c.drawImage(im,k*im.width,0,step/w*im.width+1,im.height,px,yy,dw+.8,hh);
    L.push([px,yy,dw+.8,hh,slope,k]);px+=dw;
  }
  c.globalCompositeOperation='source-atop';
  L.forEach(([lx,ly,lw,lh,s])=>{const v=Math.max(-1,Math.min(1,s*.11));c.fillStyle=v>0?`rgba(255,245,220,${v*.3})`:`rgba(10,6,0,${-v*.5})`;c.fillRect(lx,ly,lw,lh)});
  c.fillStyle=weavePat(c);c.fillRect(0,0,oc.width,oc.height);
  if(o.worn!==false){
    c.fillStyle='rgba(120,88,40,.13)';c.fillRect(0,0,oc.width,oc.height);
    c.globalAlpha=.9;c.fillStyle=grimePat(c);c.fillRect(0,0,oc.width,oc.height);c.globalAlpha=1;
    const sg=c.createLinearGradient(0,pad+h*.55,0,pad+h*1.05);sg.addColorStop(0,'rgba(20,14,6,0)');sg.addColorStop(1,'rgba(20,14,6,.45)');c.fillStyle=sg;c.fillRect(0,0,oc.width,oc.height);
    const W=wearOf(code);
    W.holes.forEach(hl=>{const s=L[Math.min(L.length-1,hl.k*L.length|0)];const cx=s[0],cy=s[1]+hl.v*s[3],r=Math.max(1.2,hl.r*w);
      c.globalCompositeOperation='source-atop';c.fillStyle='rgba(25,15,5,.55)';c.beginPath();c.arc(cx,cy,r*1.6,0,7);c.fill();
      c.globalCompositeOperation='destination-out';c.beginPath();c.arc(cx,cy,r,0,7);c.fill()});
    c.globalCompositeOperation='destination-out';
    const n=W.tear.length,depth=w*.07;c.beginPath();c.moveTo(oc.width,0);
    for(let i=0;i<=n;i++){const yy=i/n*oc.height,d=W.tear[i%n]*depth*(.4+.6*Math.abs(Math.sin(i*1.7)));c.lineTo(px-d,yy)}
    c.lineTo(oc.width,oc.height);c.closePath();c.fill();
  }else{
    const vg=c.createLinearGradient(0,pad,0,pad+h);vg.addColorStop(0,'rgba(255,255,255,.05)');vg.addColorStop(1,'rgba(0,0,0,.22)');c.fillStyle=vg;c.fillRect(0,0,oc.width,oc.height);
  }
  c.globalCompositeOperation='source-over';
  ctx.save();if(o.shadow!==false){ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=h*.1;ctx.shadowOffsetY=h*.05}
  ctx.drawImage(oc,x,y-pad);ctx.restore();
}
/* flag on a pole over a smoky battlefield sky */
function battleScene(canvas,getCode){
  const ctx=canvas.getContext('2d');let t=0,raf;
  const R=rng(5),puffs=Array.from({length:14},()=>({x:R(),y:.25+R()*.6,r:.12+R()*.2,s:.004+R()*.008,a:.15+R()*.25}));
  const ruins=Array.from({length:26},(_,i)=>[i/25,.04+R()*.1*(i%3?1:2.2)]);
  function frame(){
    const W=canvas.width,H=canvas.height,code=getCode();
    let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d1b14');g.addColorStop(.55,'#4a3a26');g.addColorStop(.82,'#8a5a2c');g.addColorStop(1,'#2a2014');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const sg=ctx.createRadialGradient(W*.72,H*.78,10,W*.72,H*.78,W*.6);sg.addColorStop(0,'rgba(255,170,80,.55)');sg.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#17140d';ctx.beginPath();ctx.moveTo(0,H);ruins.forEach(([rx,rh],i)=>{const xx=rx*W,yy=H*(.86-rh);ctx.lineTo(xx,yy);ctx.lineTo(xx+W*.02,yy)});ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    puffs.forEach(p=>{const xx=((p.x+t*p.s)%1.3-.15)*W,yy=p.y*H,r=p.r*Math.max(W,H);const pg=ctx.createRadialGradient(xx,yy,0,xx,yy,r);pg.addColorStop(0,`rgba(70,60,48,${p.a})`);pg.addColorStop(1,'rgba(70,60,48,0)');ctx.fillStyle=pg;ctx.fillRect(xx-r,yy-r,r*2,r*2)});
    const fh=Math.min(H*.5,W*.55/1.5),fw=fh*1.5,x0=W*.1,y0=H*.12;
    ctx.fillStyle='#2a2418';ctx.fillRect(x0-6,y0-12,7,H);ctx.fillStyle='#8d7a4e';ctx.fillRect(x0-5,y0-12,2,H);
    ctx.fillStyle='#c99a3b';ctx.beginPath();ctx.arc(x0-2.5,y0-16,Math.max(5,W*.008),0,7);ctx.fill();
    drawCloth(ctx,code,x0,y0,fw,fh,t,{amp:.09,hoist:.08});
    ctx.fillStyle=ctx.createPattern(grime||(grimePat(ctx),grime),'repeat');ctx.globalAlpha=.35;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
    const vg=ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    if(!REDUCE)t+=.016;raf=requestAnimationFrame(frame);
  }
  frame();return ()=>cancelAnimationFrame(raf);
}

