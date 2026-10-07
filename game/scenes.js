/* ================= world data ================= */
let WORLD=null,FEAT={};
function decodeWorld(){
  const W=window.__WORLD;if(!W)return null;
  if(W.UTF8Encoding){
    const s=W.UTF8Scale||1024;
    const dp=(c,o)=>{const r=[];let px=o[0],py=o[1];for(let i=0;i<c.length;i+=2){let x=c.charCodeAt(i)-64,y=c.charCodeAt(i+1)-64;x=(x>>1)^(-(x&1));y=(y>>1)^(-(y&1));x+=px;y+=py;px=x;py=y;r.push([x/s,y/s])}return r};
    W.features.forEach(f=>{const g=f.geometry;if(g.type==='Polygon')g.coordinates=g.coordinates.map((c,i)=>dp(c,g.encodeOffsets[i]));else if(g.type==='MultiPolygon')g.coordinates=g.coordinates.map((p,i)=>p.map((c,j)=>dp(c,g.encodeOffsets[i][j])))});
    W.UTF8Encoding=false;
  }
  const fixPoly=poly=>poly.forEach((ring,i)=>{const a=d3.geoArea({type:'Polygon',coordinates:[ring]});if((i===0&&a>2*Math.PI)||(i>0&&a<2*Math.PI))ring.reverse()});
  W.features=W.features.filter(f=>f.properties.name!=='Antarctica'&&f.geometry);
  W.features.forEach(f=>{f.type='Feature';const g=f.geometry;if(g.type==='Polygon')fixPoly(g.coordinates);else g.coordinates.forEach(fixPoly)});
  return W;
}
const mlCache={};
function mainland(f){
  if(!f)return null;const k=f.properties.name;if(mlCache[k])return mlCache[k];
  if(f.geometry.type!=='MultiPolygon')return mlCache[k]=f;
  const polys=f.geometry.coordinates.map(p=>({p,a:d3.geoArea({type:'Polygon',coordinates:p}),c:d3.geoCentroid({type:'Polygon',coordinates:p})}));
  const big=polys.reduce((m,x)=>x.a>m.a?x:m);
  const keep=polys.filter(x=>d3.geoDistance(x.c,big.c)<0.62&&x.a>big.a*0.0005).map(x=>x.p);
  return mlCache[k]={type:'Feature',properties:f.properties,geometry:{type:'MultiPolygon',coordinates:keep}};
}

/* ================= hex region map ================= */
const LVL=[0,120,350,800];
const lvlName=i=>t('lvl'+i);
function regionName(code,h){const H=hexData(code),cs=H&&H.cs;const base=H&&H.syn?L().dirs[h.ci]:(cs&&cs[h.ci]?cs[h.ci][0]:'');return base+'-'+h.no}
const hexCache={};
function hexData(code){
  if(hexCache[code])return hexCache[code];
  const f=FEAT[code];if(!f)return null;
  const w=700,h=380,m=mainland(f);
  const proj=d3.geoMercator().fitExtent([[14,14],[w-14,h-14]],m);
  const path=d3.geoPath(proj);
  const b=path.bounds(m),area=(b[1][0]-b[0][0])*(b[1][1]-b[0][1]);
  const r=Math.max(5,Math.min(11,Math.sqrt(area/1100)));
  const dx=Math.sqrt(3)*r,dy=1.5*r,hexes=[];
  const R=rng(code.charCodeAt(0)*977+code.charCodeAt(1));
  let cs=CITIES[code],syn=false,scale=0.009;
  if(!cs){syn=true;const gb=d3.geoBounds(m),gc=d3.geoCentroid(m),k=.62;cs=[['',gc[0],gc[1]+(gb[1][1]-gc[1])*k],['',gc[0],gc[1]-(gc[1]-gb[0][1])*k],['',gc[0]+(gb[1][0]-gc[0])*k,gc[1]],['',gc[0]-(gc[0]-gb[0][0])*k,gc[1]],['',gc[0],gc[1]]];scale=Math.max(.004,d3.geoDistance(gb[0],gb[1])*.12)}
  let row=0;
  for(let y=b[0][1];y<=b[1][1]+dy;y+=dy,row++){
    for(let x=b[0][0]+(row%2?dx/2:0);x<=b[1][0]+dx;x+=dx){
      const ll=proj.invert([x,y]);if(!(ll&&d3.geoContains(m,ll)))continue;
      let bd=9,ci=0;cs.forEach((c,j)=>{const d=d3.geoDistance([c[1],c[2]],ll);if(d<bd){bd=d;ci=j}});
      const pop=Math.round(15+1100*Math.exp(-bd/scale)+R()*R()*260);
      let lvl=0;LVL.forEach((l,i)=>{if(pop>=l)lvl=i});
      hexes.push({x,y,ll,i:hexes.length,pop,lvl,ci,no:(hexes.length*7)%60+1});
    }
  }
  if(!hexes.length){const pc=proj(d3.geoCentroid(m))||[w/2,h/2];hexes.push({x:pc[0],y:pc[1],ll:d3.geoCentroid(m),i:0,pop:180,lvl:1,ci:syn?4:0,no:1})}
  return hexCache[code]={m,proj,path,r,hexes,cs,syn};
}
function hexPts(x,y,r){let s='';for(let i=0;i<6;i++){const a=(60*i-90)*Math.PI/180;s+=(x+Math.cos(a)*r).toFixed(1)+','+(y+Math.sin(a)*r).toFixed(1)+' '}return s}
function lvlColor(l){const n=C[S.country||'TR'].c1;return ['#3e4129',rgba(n,.32),rgba(n,.62),n][l]}
function drawHexMap(svgSel,code,selIdx,mineIdx,onPick){
  const svg=d3.select(svgSel);svg.selectAll('*').remove();
  const H=hexData(code);if(!H){svg.append('text').attr('x',350).attr('y',190).attr('text-anchor','middle').attr('fill','#b9ab84').text(t('mapFail'));return null}
  svg.append('path').datum(H.m).attr('d',H.path).attr('fill','#1f2015').attr('stroke','#6a6847').attr('stroke-width',1.2);
  svg.append('g').selectAll('polygon').data(H.hexes).join('polygon')
    .attr('points',d=>hexPts(d.x,d.y,H.r*.93)).attr('class','hex')
    .attr('fill',d=>d.i===mineIdx?'#c99a3b':lvlColor(d.lvl))
    .on('click',(e,d)=>onPick&&onPick(d));
  const cg=svg.append('g').attr('class','city').attr('pointer-events','none');
  (H.syn?[]:H.cs).forEach(c=>{const p=H.proj([c[1],c[2]]);if(!p)return;cg.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',2.2);cg.append('text').attr('x',p[0]+5).attr('y',p[1]-4).text(c[0])});
  if(mineIdx!=null&&H.hexes[mineIdx]){const d=H.hexes[mineIdx];svg.append('polygon').attr('class','hexring').attr('points',hexPts(d.x,d.y,H.r))}
  if(selIdx!=null&&selIdx!==mineIdx&&H.hexes[selIdx]){const d=H.hexes[selIdx];svg.append('polygon').attr('class','hexsel').attr('points',hexPts(d.x,d.y,H.r))}
  return H;
}

/* ================= ISOMETRIC GARRISON ================= */
const IW=640,IH=450,TW=76,TH=38,GX=8,GY=5;
const IO=[GY*TW/2+42,132];
const P=(x,y,z)=>[IO[0]+(x-y)*TW/2,IO[1]+(x+y)*TH/2-(z||0)];
const isoC=$('#isoc'),ix=isoC.getContext('2d');ix.setTransform(2,0,0,2,0,0);
function poly(c,pts,fill,stroke,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||1;c.stroke()}}
function prism(c,x,y,w,d,z,h,base,top){
  poly(c,[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],shade(base,-.3));
  poly(c,[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],shade(base,-.1));
  poly(c,[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],top||shade(base,.15));
}
function faceX(c,x,y0,y1,z0,z1,col){poly(c,[P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],col)}
function faceY(c,y,x0,x1,z0,z1,col){poly(c,[P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],col)}
function windows(c,x,y,w,d,z,h,col,rows,lit){
  const fl=Math.max(1,rows),nw=Math.max(2,Math.round(w*3)),nd=Math.max(2,Math.round(d*3));
  for(let f=0;f<fl;f++){const z0=z+6+f*(h-8)/fl,z1=z0+Math.min(7,(h-8)/fl-3);
    for(let i=0;i<nw;i++){const a=x+.12+i*(w-.24)/nw,b=a+(w-.24)/nw*.6;faceY(c,y+d,a,b,z0,z1,(lit&&((i+f)%3))?'#f0c060':col)}
    for(let i=0;i<nd;i++){const a=y+.12+i*(d-.24)/nd,b=a+(d-.24)/nd*.6;faceX(c,x+w,a,b,z0,z1,(lit&&((i+f+1)%3))?'#f0c060':col)}
  }
}
function gable(c,x,y,w,d,z,rh,roof,wall){
  poly(c,[P(x,y,z),P(x+w,y,z),P(x+w,y+d/2,z+rh),P(x,y+d/2,z+rh)],shade(roof,-.15));
  poly(c,[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d/2,z+rh),P(x,y+d/2,z+rh)],shade(roof,.05));
  poly(c,[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d/2,z+rh)],shade(wall,-.12));
}
function cylinder(c,cx,cy,z,r,h,col,waist){
  const p=P(cx,cy,z),top=p[1]-h,ry=r*.5;
  const g=c.createLinearGradient(p[0]-r,0,p[0]+r,0);g.addColorStop(0,shade(col,-.35));g.addColorStop(.55,shade(col,.1));g.addColorStop(1,shade(col,-.45));
  c.fillStyle=g;c.beginPath();
  if(waist){const wr=r*waist;c.moveTo(p[0]-r,p[1]);c.quadraticCurveTo(p[0]-wr,p[1]-h*.75,p[0]-r*.82,top);c.lineTo(p[0]+r*.82,top);c.quadraticCurveTo(p[0]+wr,p[1]-h*.75,p[0]+r,p[1]);c.ellipse(p[0],p[1],r,ry,0,0,Math.PI)}
  else{c.moveTo(p[0]-r,p[1]);c.lineTo(p[0]-r,top);c.lineTo(p[0]+r,top);c.lineTo(p[0]+r,p[1]);c.ellipse(p[0],p[1],r,ry,0,0,Math.PI)}
  c.fill();
  const tr=waist?r*.82:r;c.fillStyle=shade(col,waist?-.55:.2);c.beginPath();c.ellipse(p[0],top,tr,tr*.5,0,0,7);c.fill();
  return [p[0],top];
}
function tree(c,x,y,s,t){
  const p=P(x,y,0);s=s||1;
  c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(p[0],p[1],11*s,5*s,0,0,7);c.fill();
  c.fillStyle='#3d2b18';c.fillRect(p[0]-1.5*s,p[1]-14*s,3*s,14*s);
  const sw=Math.sin(t*1.3+x*2)*1;
  c.fillStyle='#3b4426';c.beginPath();c.arc(p[0]+sw,p[1]-21*s,10*s,0,7);c.fill();
  c.fillStyle='#4a5530';c.beginPath();c.arc(p[0]-3*s+sw,p[1]-25*s,6.5*s,0,7);c.fill();
}
function sandbags(c,x0,y0,x1,y1,n){
  for(let i=0;i<n;i++){const k=i/(n-1),x=x0+(x1-x0)*k,y=y0+(y1-y0)*k;
    for(let row=0;row<2;row++){const p=P(x,y,row*5);c.fillStyle=row?'#b19d6c':'#9c8a5c';c.beginPath();c.ellipse(p[0]+(row?5:0),p[1]-3,8,4.2,0,0,7);c.fill();c.strokeStyle='rgba(50,38,18,.6)';c.lineWidth=.8;c.stroke()}}
}
function wire(c,x0,y0,x1,y1,t){
  const a=P(x0,y0,0),b=P(x1,y1,0);c.strokeStyle='#3a3426';c.lineWidth=1.4;
  for(let i=0;i<=6;i++){const k=i/6,px=a[0]+(b[0]-a[0])*k,py=a[1]+(b[1]-a[1])*k;c.beginPath();c.moveTo(px,py);c.lineTo(px,py-14);c.stroke()}
  c.strokeStyle='rgba(60,54,40,.9)';c.lineWidth=.8;
  for(let j=0;j<3;j++){c.beginPath();for(let i=0;i<=40;i++){const k=i/40,px=a[0]+(b[0]-a[0])*k,py=a[1]+(b[1]-a[1])*k-7+Math.sin(k*60+j*2)*4;i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
let smoke=[];
function emit(x,y,col,sz){if(smoke.length<220)smoke.push({x,y,vx:(Math.random()-.3)*.25,vy:-.35-Math.random()*.25,r:(sz||3)+Math.random()*2,life:1,col:col||'190,184,170'})}
const isoHit=[];
function drawConstruction(c,b,t){
  const x=b.sx,y=b.sy;
  poly(c,[P(x+.1,y+.1),P(x+1.9,y+.1),P(x+1.9,y+1.9),P(x+.1,y+1.9)],'rgba(90,70,40,.45)');
  c.setLineDash([5,4]);poly(c,[P(x+.1,y+.1),P(x+1.9,y+.1),P(x+1.9,y+1.9),P(x+.1,y+1.9)],null,'rgba(217,169,31,.85)',1.5);c.setLineDash([]);
  prism(c,x+.3,y+.4,.4,.3,0,6,'#7a6440');prism(c,x+.35,y+.45,.3,.2,6,5,'#8a7450');prism(c,x+1.2,y+1.1,.5,.3,0,4,'#6e6a5e');
  const sg=P(x+1,y+1.7,0);c.fillStyle='#d9a91f';c.fillRect(sg[0]-20,sg[1]-26,40,15);c.fillStyle='#14140d';c.font='14px "Saira Stencil One", sans-serif';c.textAlign='center';c.fillText(up(t('chipBuild')),sg[0],sg[1]-14);c.fillStyle='#4a3a1d';c.fillRect(sg[0]-1,sg[1]-11,2,11);
  return 40;
}
function scaffold(c,b,t){
  const x=b.sx+.15,y=b.sy+.25,w=1.7,d=1.5,h=(b._top||50)-6;
  c.strokeStyle='rgba(217,169,31,.9)';c.lineWidth=1.3;
  for(let z=0;z<=h;z+=12){const a=P(x,y+d,z),e=P(x+w,y+d,z),f=P(x+w,y,z);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(e[0],e[1]);c.lineTo(f[0],f[1]);c.stroke()}
  [[x,y+d],[x+w,y+d],[x+w,y]].forEach(([a,e])=>{const p0=P(a,e,0),p1=P(a,e,h);c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.stroke()});
  const cp=P(x+.2,y+.2,0);c.strokeStyle='#d9a91f';c.lineWidth=2.5;c.beginPath();c.moveTo(cp[0],cp[1]);c.lineTo(cp[0],cp[1]-h-34);c.lineTo(cp[0]+46,cp[1]-h-34);c.stroke();
  c.lineWidth=1;c.beginPath();c.moveTo(cp[0]+38,cp[1]-h-34);c.lineTo(cp[0]+38,cp[1]-h-10+Math.sin(t*2)*3);c.stroke();
  if(Math.random()<.2){const p=P(x+Math.random()*w,y+d,Math.random()*h);emit(p[0],p[1],'255,200,110',1.4)}
}
const DRAW={
  tarla(c,b,lv,t,nc){const x=b.sx,y=b.sy;
    poly(c,[P(x+.08,y+.08,1),P(x+1.92,y+.08,1),P(x+1.92,y+1.92,1),P(x+.08,y+1.92,1)],'#5e4528');
    for(let i=0;i<6;i++){const yy=y+.22+i*.28;const a=P(x+.2,yy,2),e=P(x+(lv>=3?1.05:1.8),yy,2);c.strokeStyle=i%2?'#b39a4a':'#7f8a46';c.lineWidth=4.5;c.lineCap='round';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(e[0],e[1]);c.stroke()}
    c.lineCap='butt';let top=10;
    if(lv>=3){prism(c,x+1.2,y+.15,.65,.7,0,18+lv,'#7a4a30');gable(c,x+1.2,y+.15,.65,.7,18+lv,12,'#5a4a36','#7a4a30');faceY(c,y+.85,x+1.4,x+1.65,0,12,'#2e1a10');top=32+lv}
    if(lv>=6){const tp=cylinder(c,x+1.55,y+1.45,0,10,34+lv*2,'#8f8a7a');c.fillStyle=nc;c.beginPath();c.ellipse(tp[0],tp[1],8.2,4.1,0,0,7);c.fill();top=Math.max(top,36+lv*2)}
    return top;},
  okul(c,b,lv,t,nc){const x=b.sx+.2,y=b.sy+.3,w=1.6,d=1.4,h=22+lv*3;
    prism(c,x,y,w,d,0,h,'#b5a582');windows(c,x,y,w,d,0,h,'#2e3a3e',Math.min(3,1+Math.floor(lv/3)),false);
    faceY(c,y+d,x+.62,x+.98,0,12,'#3a2a18');gable(c,x,y,w,d,h,16,'#5b3f2c','#b5a582');
    const fp=P(x+w-.15,y+d/2,h+16);c.strokeStyle='#b9b2a0';c.lineWidth=1.5;c.beginPath();c.moveTo(fp[0],fp[1]);c.lineTo(fp[0],fp[1]-22);c.stroke();
    drawFlagWave(c,S.country,fp[0],fp[1]-22,18,12,t,2);return h+40;},
  santral(c,b,lv,t,nc){const x=b.sx,y=b.sy;
    if(lv>=4){for(let i=0;i<Math.min(4,lv-3);i++){const px=x+.12+i*.42,py=y+1.45;poly(c,[P(px,py,3),P(px+.34,py,3),P(px+.34,py+.4,9),P(px,py+.4,9)],'#2a3236','#5a6468',.8)}}
    prism(c,x+1.15,y+1.05,.65,.6,0,14+lv,'#6e7062');windows(c,x+1.15,y+1.05,.65,.6,0,14+lv,'#f0c060',1,true);
    const r=16+lv*1.1,h=40+lv*3.5;const tp=cylinder(c,x+.7,y+.65,0,r,h,'#a5a292',.72);
    c.fillStyle=rgba(nc,.85);const band=P(x+.7,y+.65,h*.82);c.fillRect(band[0]-r*.78,band[1]-3,r*1.56,4);
    if(Math.random()<.5)emit(tp[0]+(Math.random()-.5)*r,tp[1],'205,200,188',5);return h+16;},
  fabrika(c,b,lv,t,nc){const x=b.sx+.15,y=b.sy+.3,w=1.7,d=1.4,h=20+lv*2.2;
    const n=Math.min(4,1+Math.floor(lv/3));let top=h;
    for(let i=0;i<n;i++){const cx=x+.25+i*.32,cy=y+.22,ch=h+26+lv*2.5;const tp=cylinder(c,cx,cy,h,4.5,ch-h,'#6e4030');
      if(Math.random()<.35*mult())emit(tp[0],tp[1],'70,66,60',3.8);top=Math.max(top,ch)}
    prism(c,x,y,w,d,0,h,'#6b6656');
    for(let i=0;i<4;i++){const a=x+i*w/4,e=a+w/4;poly(c,[P(a,y,h),P(e,y,h),P(e,y,h+9),P(a,y,h+9)],'#55574a');poly(c,[P(a,y,h+9),P(e,y,h+9),P(e,y+d,h),P(a,y+d,h)],i%2?'#5f6152':'#666858')}
    windows(c,x,y,w,d,0,h,'#26281f',1,true);faceX(c,x+w,y+.45,y+.95,0,13,'#2a2620');
    for(let i=0;i<3;i++)prism(c,x+w-.95+i*.3,y+d+.05,.25,.2,0,7,'#5a5a3a','#6a6a46');return top+10;},
  kisla(c,b,lv,t,nc){const x=b.sx+.1,y=b.sy+.1,s=1.8,wh=9+lv*.6,st='#7a7262';
    prism(c,x,y,s,.14,0,wh,st);prism(c,x,y,.14,s,0,wh,st);
    prism(c,x+.45,y+.5,.95,.8,0,13+lv*1.5,'#5b6440');gable(c,x+.45,y+.5,.95,.8,13+lv*1.5,10,'#3f4628','#5b6440');
    for(let i=0;i<3;i++){const p=P(x+.4+i*.35,y+1.48,0);c.fillStyle='#22271a';c.fillRect(p[0]-1.5,p[1]-11,3,8);c.fillStyle='#b59e78';c.beginPath();c.arc(p[0],p[1]-13,2.4,0,7);c.fill();c.fillStyle='#343b22';c.beginPath();c.arc(p[0],p[1]-14,2.8,Math.PI,0);c.fill()}
    prism(c,x,y+s-.14,s,.14,0,wh,st);prism(c,x+s-.14,y,.14,s,0,wh,st);
    const th=22+lv*2.2;[[x-.04,y-.04],[x+s-.26,y-.04],[x-.04,y+s-.26],[x+s-.26,y+s-.26]].forEach(([a,e])=>{prism(c,a,e,.3,.3,0,th,'#857c68');prism(c,a-.02,e-.02,.34,.34,th,4,'#5d5646')});
    const fp=P(x+s-.11,y+s-.11,th+4);c.strokeStyle='#b9b2a0';c.lineWidth=1.6;c.beginPath();c.moveTo(fp[0],fp[1]);c.lineTo(fp[0],fp[1]-30);c.stroke();
    drawFlagWave(c,S.country,fp[0],fp[1]-30,24,16,t,2.5);return th+40;},
  liman(c,b,lv,t,nc){const x=b.sx,y=b.sy;
    prism(c,x+1.2,y+.2,GX-x-1.2+.95,.5,-2,5,'#6b5236');
    for(let i=0;i<4;i++){const p=P(GX+.85,y+.2+i*.17,-8);c.fillStyle='#3e2e1c';c.fillRect(p[0]-1.5,p[1]-9,3,9)}
    const cols=['#5b6440','#6b5236','#7a7262','#4e5a3a',shade(nc,-.25)];
    for(let i=0;i<Math.min(8,lv+1);i++){const cx=x+.2+(i%3)*.38,cy=y+.95+Math.floor(i/3)%2*.32,cz=Math.floor(i/6)*9;prism(c,cx,cy,.34,.26,cz,9,cols[i%5])}
    const cp=P(x+.55,y+.45,0),ch=50+lv*2;c.strokeStyle='#8a7a3a';c.lineWidth=3;c.beginPath();c.moveTo(cp[0],cp[1]);c.lineTo(cp[0],cp[1]-ch);c.stroke();
    const arm=P(GX+.6,y+.45,ch);c.lineWidth=2;c.beginPath();c.moveTo(cp[0]-14,cp[1]-ch);c.lineTo(arm[0],arm[1]);c.stroke();
    const sw=Math.sin(t*1.2)*4;c.lineWidth=1;c.beginPath();c.moveTo(arm[0]-20,arm[1]+4);c.lineTo(arm[0]-20+sw,arm[1]+40);c.stroke();
    c.fillStyle=cols[0];c.fillRect(arm[0]-26+sw,arm[1]+40,12,7);
    const bob=Math.sin(t*1.6)*1.5,sx=GX+.95,sy=y-.2;
    prism(c,sx,sy,.75,2.1,-10+bob,9,'#3c4038','#55594c');prism(c,sx+.1,sy+1.4,.55,.5,-1+bob,12,'#6e7062');
    windows(c,sx+.1,sy+1.4,.55,.5,-1+bob,12,'#222',1,true);
    const gun=P(sx+.4,sy+.45,2+bob);c.strokeStyle='#2a2c26';c.lineWidth=3;c.beginPath();c.moveTo(gun[0],gun[1]);c.lineTo(gun[0]-14,gun[1]-10);c.stroke();
    const fl=P(sx+.4,sy+1.65,11+bob);c.strokeStyle='#999';c.lineWidth=1;c.beginPath();c.moveTo(fl[0],fl[1]);c.lineTo(fl[0],fl[1]-16);c.stroke();drawFlagWave(c,S.country,fl[0],fl[1]-16,12,8,t,1.5);
    return ch+10;}
};
function drawIso(t){
  const c=ix,nc=C[S.country].c1;c.clearRect(0,0,IW,IH);
  const sc=P(GX/2+.6,GY/2+.6,-40);c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(sc[0],sc[1]+18,300,95,0,0,7);c.fill();
  faceY(c,GY,0,GX,-22,0,'#3a2c1a');faceX(c,GX,0,GY,-22,0,'#4e3c24');
  for(let i=0;i<GX;i+=2)poly(c,[P(i,GY,-22),P(i+1,GY,-22),P(i+1,GY,-12),P(i,GY,-12)],'rgba(0,0,0,.12)');
  faceY(c,GY,0,GX,-3,0,'#4f4c2c');faceX(c,GX,0,GY,-3,0,'#5c5934');
  poly(c,[P(GX,-.6,-10),P(GX+2.2,-.6,-10),P(GX+2.2,GY,-10),P(GX,GY,-10)],'#34494a');
  faceY(c,GY,GX,GX+2.2,-22,-10,'#223233');faceX(c,GX+2.2,-.6,GY,-22,-10,'#2a3c3d');
  for(let i=0;i<9;i++){const yy=((i*.61+t*.12)%(GY+.6))-.6,xx=GX+.3+(i*.37)%1.7;const a=P(xx,yy,-10),e=P(xx+.35,yy,-10);c.strokeStyle='rgba(170,190,180,.22)';c.lineWidth=1.4;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(e[0],e[1]);c.stroke()}
  for(let x=0;x<GX;x++)for(let y=0;y<GY;y++){
    const road=y===2;const g=road?'#5b4e3a':((x*7+y*3)%5===0?'#6a6838':(x+y)%2?'#727040':'#6d6b3c');
    poly(c,[P(x,y),P(x+1,y),P(x+1,y+1),P(x,y+1)],g,'rgba(0,0,0,.08)');
    if(road){[2.3,2.7].forEach(ry=>{const a=P(x+.05,ry),e=P(x+.95,ry);c.strokeStyle='rgba(40,30,18,.45)';c.lineWidth=1.6;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(e[0],e[1]);c.stroke()})}
  }
  [[1.2,4.4,14],[4.6,.9,10],[7.3,2.4,9],[2.2,2.6,8]].forEach(([x,y,r])=>{const p=P(x,y,0);c.fillStyle='rgba(30,22,12,.45)';c.beginPath();c.ellipse(p[0],p[1],r,r*.45,0,0,7);c.fill()});
  BUILD.forEach(b=>{if(b.k!=='tarla')poly(c,[P(b.sx,b.sy),P(b.sx+2,b.sy),P(b.sx+2,b.sy+2),P(b.sx,b.sy+2)],'#80765a','rgba(0,0,0,.15)')});
  const items=[];
  BUILD.forEach(b=>items.push({d:b.sx+b.sy+2,f:()=>{const lv=S.lv[b.k];b._top=lv?DRAW[b.k](c,b,lv,t,nc):drawConstruction(c,b,t);if(S.build&&S.build.k===b.k)scaffold(c,b,t)}}));
  [[2.5,.5],[2.5,1.5],[5.5,1.5],[2.5,3.6],[2.5,4.5],[5.5,4.5]].forEach(p=>items.push({d:p[0]+p[1],f:()=>tree(c,p[0],p[1],.8,t)}));
  items.push({d:.2,f:()=>wire(c,.1,.1,7.8,.1,t)});
  items.push({d:6.2,f:()=>{const fp=P(5.5,.5,0);c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(fp[0],fp[1],8,4,0,0,7);c.fill();c.fillStyle='#4a3e2a';c.fillRect(fp[0]-6,fp[1]-4,12,4);c.strokeStyle='#8f8670';c.lineWidth=2.4;c.beginPath();c.moveTo(fp[0],fp[1]-3);c.lineTo(fp[0],fp[1]-96);c.stroke();c.fillStyle='#c99a3b';c.beginPath();c.arc(fp[0],fp[1]-98,3,0,7);c.fill();drawCloth(c,S.country,fp[0]+1,fp[1]-95,54,36,t,{amp:.09,hoist:.1})}});
  const carX=((t*.45)%(GX+1.5))-.8;items.push({d:carX+2.6,f:()=>{if(carX<0||carX>GX-.5)return;prism(c,carX,2.12,.55,.32,1,8,'#4e5a34');prism(c,carX+.05,2.14,.3,.28,9,6,'#5e6a40');const p=P(carX+.4,2.28,15);c.strokeStyle='#2a2c22';c.lineWidth=2;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]+12,p[1]-4);c.stroke()}});
  items.push({d:GX+GY+.5,f:()=>{sandbags(c,.15,GY-.15,5.6,GY-.15,16);sandbags(c,GX-.15,.2,GX-.15,2.6,8)}});
  items.sort((a,b)=>a.d-b.d).forEach(i=>i.f());
  smoke.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.06;p.life-=.007;c.fillStyle=`rgba(${p.col},${Math.max(0,p.life)*.5})`;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill()});
  smoke=smoke.filter(p=>p.life>0);
  isoHit.length=0;
  BUILD.forEach(b=>{const lv=S.lv[b.k],x=b.sx,y=b.sy;
    const corners=[P(x,y),P(x+2,y),P(x+2,y+2),P(x,y+2)];
    const minX=Math.min(...corners.map(p=>p[0])),maxX=Math.max(...corners.map(p=>p[0])),maxY=Math.max(...corners.map(p=>p[1]));
    const topY=P(x+1,y+1,b._top||40)[1];
    isoHit.push({k:b.k,minX,maxX,minY:topY-10,maxY});
    if(S.sel===b.k){c.save();c.globalAlpha=.6+.4*Math.sin(t*4);c.setLineDash([6,4]);poly(c,corners,'rgba(201,154,59,.12)','#e3c070',2.2);c.setLineDash([]);c.restore()}
    const bp=P(x+1,y+1,(b._top||40)+6);const building=S.build&&S.build.k===b.k;
    const can=!S.build&&lv<MAXLV&&S.gold>=upCost(b);
    const label=building?fmtDur((S.build.until-now())/1000):lv?up(t('lvA'))+' '+lv:up(t('labelNew'));
    c.font='13px "Saira Stencil One", sans-serif';const tw=c.measureText(label).width+16;
    c.fillStyle=building?'#d9a91f':S.sel===b.k?'#dccda3':'rgba(20,20,12,.9)';
    c.fillRect(bp[0]-tw/2,bp[1]-19,tw,19);c.strokeStyle='#0c0d08';c.lineWidth=1;c.strokeRect(bp[0]-tw/2,bp[1]-19,tw,19);
    c.fillStyle=building||S.sel===b.k?'#14140d':'#e2d5b2';c.textAlign='center';c.fillText(label,bp[0],bp[1]-5);
    if(can){c.fillStyle='#8fc35a';c.beginPath();c.arc(bp[0]+tw/2+4,bp[1]-18,5.5,0,7);c.fill();c.fillStyle='#14140d';c.beginPath();c.moveTo(bp[0]+tw/2+4,bp[1]-21.5);c.lineTo(bp[0]+tw/2+7.2,bp[1]-16.5);c.lineTo(bp[0]+tw/2+.8,bp[1]-16.5);c.closePath();c.fill()}
  });
  c.fillStyle=grimePat(c);c.globalAlpha=.18;c.fillRect(0,0,IW,IH);c.globalAlpha=1;
}
isoC.addEventListener('click',e=>{
  const r=isoC.getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*IW,my=(e.clientY-r.top)/r.height*IH;
  const hit=isoHit.slice().reverse().find(h=>mx>=h.minX&&mx<=h.maxX&&my>=h.minY&&my<=h.maxY);
  if(hit){S.sel=hit.k;renderSel();renderChips();save()}
});

/* ================= DUEL SCENE ================= */
const DW=960,DH=360;
const dC=$('#duelc'),dx=dC.getContext('2d');dx.setTransform(2,0,0,2,0,0);
const HR=rng(7);
const hills=[0,1].map(l=>{const pts=[];for(let x=0;x<=DW;x+=24)pts.push([x,(l?196:182)-HR()*(l?18:34)-Math.sin(x/(l?90:140))*10]);return pts});
const specks=Array.from({length:180},()=>[HR()*DW,226+HR()*(DH-226),HR()]);
const craters=Array.from({length:9},()=>[220+HR()*520,262+HR()*80,8+HR()*16]);
const stumps=Array.from({length:7},()=>[HR()*DW,200+HR()*14,10+HR()*24]);
let front=.5,lf=[.5,.5,.5],units=[],booms=[],debris=[],nextArt=0;
const LANES=[254,288,320];
function soldier(c,x,y,dir,ph,band,run){
  c.save();c.translate(x,y);c.scale(dir,1);
  const s=Math.sin(ph)*(run?6:0);
  c.strokeStyle='#1d2017';c.lineWidth=3;c.lineCap='round';
  c.beginPath();c.moveTo(0,-13);c.lineTo(-3+s,0);c.moveTo(0,-13);c.lineTo(3-s,0);c.stroke();
  c.fillStyle='#3a4029';roundRect(c,-4.5,-27,9,15,3);c.fill();
  c.fillStyle=band;c.fillRect(-4.5,-23,9,3);
  c.strokeStyle='#14160f';c.lineWidth=2;c.beginPath();c.moveTo(1,-22);c.lineTo(15,-27);c.stroke();
  c.fillStyle='#b59a78';c.beginPath();c.arc(1,-31,3.6,0,7);c.fill();
  c.fillStyle='#2e3421';c.beginPath();c.ellipse(1,-33,5.6,3.4,0,Math.PI,0);c.fill();
  c.restore();c.lineCap='butt';
}
function trench(c,x0,x1,y){
  c.fillStyle='#5b5236';c.beginPath();c.moveTo(x0,y-4);for(let x=x0;x<=x1;x+=22)c.lineTo(x,y-4-((x/22|0)%2?5:0));c.lineTo(x1,y+16);c.lineTo(x0,y+16);c.closePath();c.fill();
  c.fillStyle='#16140e';c.beginPath();c.moveTo(x0,y);for(let x=x0;x<=x1;x+=22)c.lineTo(x,y+((x/22|0)%2?6:0));c.lineTo(x1,y+13);c.lineTo(x0,y+13);c.closePath();c.fill();
  for(let x=x0;x<x1;x+=13){c.fillStyle=(x/13|0)%2?'#8b7c55':'#7d6f4b';c.beginPath();c.ellipse(x,y-6,7,4,0,0,7);c.fill()}
}
function boom(x,y,big){booms.push({x,y,t:0,big});for(let i=0;i<(big?18:10);i++)debris.push({x,y,vx:(Math.random()-.5)*5,vy:-Math.random()*5-1,life:1})}
function duelTarget(){if(!S.duel)return .5;const a=S.duel.me,b=S.duel.op;return Math.max(.1,Math.min(.9,.5+(a-b)/Math.max(1,a+b)*5))}
function drawDuel(t){
  const c=dx,me=S.country,op=S.duel?S.duel.opp:ranked()[1],tz=inTaarruz();
  c.clearRect(0,0,DW,DH);
  let g=c.createLinearGradient(0,0,0,226);g.addColorStop(0,'#141510');g.addColorStop(.55,'#3a3024');g.addColorStop(1,tz?'#a05a28':'#7a4c2a');c.fillStyle=g;c.fillRect(0,0,DW,226);
  front+=(duelTarget()-front)*.03;const fx=DW*front;
  let rg=c.createRadialGradient(fx,220,10,fx,220,300);rg.addColorStop(0,`rgba(255,150,70,${tz?.55:.34})`);rg.addColorStop(1,'rgba(255,150,70,0)');c.fillStyle=rg;c.fillRect(0,0,DW,DH);
  for(let i=0;i<6;i++){const sx=(i*181+t*6)%DW,sh=60+i*14;g=c.createLinearGradient(0,226-sh,0,226);g.addColorStop(0,'rgba(50,46,40,0)');g.addColorStop(1,'rgba(50,46,40,.5)');c.fillStyle=g;c.beginPath();c.ellipse(sx,226-sh/2,18+i*3,sh/2,0,0,7);c.fill()}
  hills.forEach((pts,l)=>{c.fillStyle=l?'#1a1913':'#221f17';c.beginPath();c.moveTo(0,226);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(DW,226);c.closePath();c.fill()});
  stumps.forEach(([sx,sy,sh])=>{c.strokeStyle='#14120c';c.lineWidth=3;c.beginPath();c.moveTo(sx,sy+sh*.2);c.lineTo(sx+2,sy-sh);c.stroke();c.lineWidth=1.5;c.beginPath();c.moveTo(sx+1,sy-sh*.6);c.lineTo(sx+8,sy-sh*.8);c.stroke()});
  g=c.createLinearGradient(0,214,0,DH);g.addColorStop(0,'#4a4230');g.addColorStop(1,'#1e1b13');c.fillStyle=g;c.fillRect(0,220,DW,DH-220);
  g=c.createLinearGradient(0,0,fx,0);g.addColorStop(0,rgba(C[me].c1,.26));g.addColorStop(1,rgba(C[me].c1,.04));c.fillStyle=g;c.fillRect(0,220,fx,DH-220);
  g=c.createLinearGradient(fx,0,DW,0);g.addColorStop(0,rgba(C[op].c1,.04));g.addColorStop(1,rgba(C[op].c1,.26));c.fillStyle=g;c.fillRect(fx,220,DW-fx,DH-220);
  specks.forEach(s=>{c.fillStyle=`rgba(0,0,0,${.12+s[2]*.15})`;c.fillRect(s[0],s[1],2,1.5)});
  craters.forEach(k=>{c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(k[0],k[1],k[2],k[2]*.32,0,0,7);c.fill()});
  c.strokeStyle='rgba(30,28,22,.9)';c.lineWidth=1;for(let x=330;x<630;x+=16){c.beginPath();c.moveTo(x,250);c.lineTo(x+10,260);c.moveTo(x+10,250);c.lineTo(x,260);c.stroke()}c.beginPath();c.moveTo(330,255);c.lineTo(630,255);c.stroke();
  trench(c,40,300,276);trench(c,660,920,276);
  for(let i=0;i<7;i++)soldier(c,70+i*34,284+Math.sin(t*2+i)*1.5,1,0,C[me].c1,false);
  for(let i=0;i<7;i++)soldier(c,690+i*34,284+Math.sin(t*2.2+i*1.3)*1.5,-1,0,C[op].c1,false);
  for(let i=0;i<6;i++){c.fillStyle=`rgba(70,64,58,${.24-i*.03})`;c.beginPath();c.ellipse(fx+Math.sin(t+i)*6,214-i*22-((t*14)%22),22+i*6,14+i*3,0,0,7);c.fill()}
  const sec=S.duel&&S.duel.sec;LANES.forEach((ly,i)=>{const s=sec?sec[i]:null,tg=s?Math.max(.1,Math.min(.9,.5+(s.me-s.op)/Math.max(1,s.me+s.op)*5)):front;lf[i]+=(tg-lf[i])*.03;const lx=DW*lf[i],on=i===S.sector;
    for(let k=0;k<3;k++){c.fillStyle=k%2?'#8b7c55':'#9a8a60';c.beginPath();c.ellipse(lx,ly+10-k*7,14,4.6,0,0,7);c.fill()}
    c.strokeStyle=on?'rgba(255,215,120,1)':'rgba(255,200,110,.55)';c.lineWidth=on?2.6:1.6;c.setLineDash([6,5]);c.beginPath();c.moveTo(lx,ly-18);c.lineTo(lx,ly+18);c.stroke();c.setLineDash([]);
    c.font='13px "Saira Stencil One", sans-serif';c.textAlign='center';c.fillStyle=on?'#ffd780':'rgba(227,213,178,.55)';c.fillText(String(i+1),lx,ly-22)});
  [[48,me,1],[DW-48-150,op,0]].forEach(([px,code,left])=>{const pole=left?px:px+150;c.fillStyle='#2a2418';c.fillRect(pole-3,86,6,200);c.fillStyle='#8d7a4e';c.fillRect(pole-2,86,1.5,200);c.fillStyle='#c99a3b';c.beginPath();c.arc(pole,84,5,0,7);c.fill();
    drawCloth(c,code,left?pole+2:px,90,148,99,t+(left?0:1.3),{amp:.08,hoist:.1})});
  units.forEach(u=>{u.x+=u.sp*u.dir;u.ph+=.35;const ux=DW*lf[u.lane==null?1:u.lane];
    if((u.dir>0&&u.x>=ux-10)||(u.dir<0&&u.x<=ux+10)){u.dead=true;boom(ux+(u.dir>0?-6:6),u.y-8,false)}
    else soldier(c,u.x,u.y,u.dir,u.ph,u.band,true)});
  units=units.filter(u=>!u.dead);
  if(t>nextArt){nextArt=t+(tz?.8:1.6)+Math.random()*2;boom(fx+(Math.random()-.5)*220,254+Math.random()*60,true);if(Math.random()<.6)sBoom(true)}
  booms.forEach(b=>{b.t+=.03;const r=(b.big?34:18)*Math.min(1,b.t*3);c.fillStyle=`rgba(255,${180-b.t*120|0},80,${Math.max(0,.9-b.t*1.4)})`;c.beginPath();c.arc(b.x,b.y,r,0,7);c.fill();c.fillStyle=`rgba(60,54,48,${Math.max(0,.65-b.t*.5)})`;c.beginPath();c.arc(b.x,b.y-b.t*30,r*.9+b.t*20,0,7);c.fill()});
  booms=booms.filter(b=>b.t<1.2);
  debris.forEach(d=>{d.x+=d.vx;d.y+=d.vy;d.vy+=.25;d.life-=.03;c.fillStyle=`rgba(40,34,24,${Math.max(0,d.life)})`;c.fillRect(d.x,d.y,3,3)});
  debris=debris.filter(d=>d.life>0);
  c.fillStyle=grimePat(c);c.globalAlpha=.3;c.fillRect(0,0,DW,DH);c.globalAlpha=1;
  const vg=c.createRadialGradient(DW/2,DH/2,DH*.4,DW/2,DH/2,DW*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=vg;c.fillRect(0,0,DW,DH);
}
function spawn(side,n,lane){if(!S.duel)return;for(let i=0;i<n;i++){const l=lane==null?Math.random()*3|0:lane;units.push({dir:side,lane:l,x:side>0?260+Math.random()*40:700-Math.random()*40,y:LANES[l]+(Math.random()-.5)*14,sp:1.8+Math.random()*1.2,ph:Math.random()*6,band:C[side>0?S.country:S.duel.opp].c1})}}

/* ================= world map: field map on paper ================= */
let worldPath,worldProj,arcSel;
function drawWorld(){
  const svg=d3.select('#world');svg.selectAll('*').remove();
  if(!WORLD){svg.append('text').attr('x',480).attr('y',235).attr('text-anchor','middle').attr('fill','#2b2416').text(t('mapFail'));return}
  worldProj=d3.geoEqualEarth().fitExtent([[6,6],[954,464]],{type:'Sphere'});worldPath=d3.geoPath(worldProj);
  const defs=svg.append('defs');
  const ml=C[S.country].lg;CODES.filter(c=>C[c].lg===ml).forEach(c=>{defs.append('pattern').attr('id','fp-'+c).attr('patternUnits','objectBoundingBox').attr('width',1).attr('height',1).attr('patternContentUnits','objectBoundingBox').html(flagSVG(c,1,1))});
  defs.append('pattern').attr('id','hatch').attr('patternUnits','userSpaceOnUse').attr('width',5).attr('height',5).attr('patternTransform','rotate(45)').html('<rect width="5" height="5" fill="#a7966a"/><line x1="0" y1="0" x2="0" y2="5" stroke="#5d4f31" stroke-width="1.4"/>');
  svg.append('path').datum({type:'Sphere'}).attr('d',worldPath).attr('fill','none').attr('stroke','#5d4f31').attr('stroke-width',1.2);
  svg.append('path').datum(d3.geoGraticule10()).attr('class','grat').attr('d',worldPath);
  const g2c=GEO2C;
  svg.append('g').selectAll('path').data(WORLD.features).join('path').attr('d',worldPath)
    .attr('class',d=>{const c=g2c[d.properties.name];return 'land'+(c&&C[c].lg===ml?' league':'')})
    .attr('data-code',d=>g2c[d.properties.name]||null)
    .on('mousemove',(e,d)=>showTip(e,g2c[d.properties.name])).on('mouseleave',()=>{$('#tip').hidden=true});
  arcSel=svg.append('path').attr('class','arc');svg.append('g').attr('id','labels');
  updateWorld();
}
function showTip(e,c){
  const tip=$('#tip'),wrap=$('#worldwrap').getBoundingClientRect();if(!c){tip.hidden=true;return}
  tip.innerHTML=`<div class="row" style="gap:8px">${flagEl(c,26)}<b>${esc(cname(c))}</b></div><div style="margin-top:4px">${LG[LOC()][C[c].lg]} · ${t('tipLine',{r:rankOf(c),p:fmt(score(c))})}</div>`;
  tip.hidden=false;let x=e.clientX-wrap.left+14,y=e.clientY-wrap.top+14;if(x>wrap.width-190)x-=200;tip.style.left=x+'px';tip.style.top=y+'px';
}
function updateWorld(){
  if(!WORLD||!worldPath||!arcSel)return;
  const r=ranked(),me=S.country,tgt=S.duel?S.duel.opp:r[1];
  d3.selectAll('#world .land.league').attr('fill',function(){const c=this.getAttribute('data-code');return c===me||c===tgt?`url(#fp-${c})`:'url(#hatch)'}).attr('opacity',function(){const c=this.getAttribute('data-code');return c===me||c===tgt?.9:1});
  const a=d3.geoCentroid(mainland(FEAT[me])),b=d3.geoCentroid(mainland(FEAT[tgt]));
  arcSel.datum({type:'LineString',coordinates:[a,b]}).attr('d',worldPath);
  const L=d3.select('#labels');L.selectAll('*').remove();
  r.forEach((c,k)=>{if(!FEAT[c]||(k>13&&c!==me&&c!==tgt))return;const p=worldProj(d3.geoCentroid(mainland(FEAT[c])));if(!p||isNaN(p[0]))return;
    const g=L.append('g').attr('transform',`translate(${p[0]},${p[1]})`).attr('pointer-events','none'),big=c===me;
    g.append('line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',-16).attr('stroke','#2b2416').attr('stroke-width',1.2);
    g.append('rect').attr('x',-17).attr('y',-30).attr('width',34).attr('height',15).attr('fill',big?'#a52a1c':k<3?'#c99a3b':'#e3d5b0').attr('stroke','#2b2416');
    g.append('text').attr('x',0).attr('y',-19).attr('text-anchor','middle').attr('font-family','Courier Prime, monospace').attr('font-weight',700).attr('font-size',10).attr('fill',big?'#fff':'#2b2416').text(`${k+1}.${C[c].k3}`);
    g.append('circle').attr('r',3.2).attr('fill',big?'#a52a1c':'#2b2416')});
}

