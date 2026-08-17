/* === HERO DOTS v7 — canvas fixed al viewport, recorte vivo al borde del hero === */
(function(){
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dup=document.querySelectorAll('#heroDots');
  dup.forEach((c,i)=>{if(i>0)c.remove();});
  const canvas=document.getElementById('heroDots');
  if(!canvas)return;
  const heroEl=document.getElementById('hero')||canvas.closest('section');
  if(!heroEl)return;

  /* por decreto: el canvas ES el viewport */
  canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none';

  const ctx=canvas.getContext('2d');
  const dpr=Math.min(window.devicePixelRatio||1,2);
  let VW=0,VH=0;

  let nodes=[],gap=36;
  function rebuild(){
    VW=innerWidth;VH=innerHeight;
    canvas.width=Math.round(VW*dpr);canvas.height=Math.round(VH*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    gap=VW<1024?48:36;
    nodes=[];
    const cols=Math.ceil(VW/gap)+1,rows=Math.ceil(VH/gap)+1;
    for(let ry=0;ry<rows;ry++)for(let cx=0;cx<cols;cx++){
      nodes.push({bx:cx*gap,by:ry*gap,ox:0,oy:0,vx:0,vy:0,e:0,ph:Math.random()*6.283});
    }
  }
  rebuild();
  let rto;window.addEventListener('resize',()=>{clearTimeout(rto);rto=setTimeout(rebuild,150);});

  const mouse={x:-9999,y:-9999,px:-9999,py:-9999,sp:0};
  window.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;},{passive:true});

  const waves=[];let waveCd=0;

  function draw(t,dt){
    ctx.clearRect(0,0,VW,VH);
    const hb=heroEl.getBoundingClientRect().bottom;
    const clip=Math.max(0,Math.min(VH,hb));
    if(clip<=0)return;
    ctx.save();
    ctx.beginPath();ctx.rect(0,0,VW,clip);ctx.clip();

    const time=t*0.001;
    const off=scrollY*0.25;
    const span=VH+40;

    const dxm=mouse.x-mouse.px,dym=mouse.y-mouse.py;
    const sp=Math.sqrt(dxm*dxm+dym*dym)/Math.max(dt,0.001);
    mouse.sp+=(Math.min(sp,3000)-mouse.sp)*0.2;
    mouse.px=mouse.x;mouse.py=mouse.y;

    waveCd-=dt;
    if(mouse.sp>1400&&waveCd<=0){waves.push({x:mouse.x,y:mouse.y,r:10,v:900});waveCd=0.25;}
    for(let i=waves.length-1;i>=0;i--){const w=waves[i];w.r+=w.v*dt;if(w.r>Math.max(VW,VH))waves.splice(i,1);}

    const R=120;
    for(const n of nodes){
      const sx=n.bx+n.ox;
      const sy=(((n.by-off)%span)+span)%span-20+n.oy;

      const dx=sx-mouse.x,dy=sy-mouse.y;
      const d=Math.sqrt(dx*dx+dy*dy)||1;
      if(d<R){
        const f=1-d/R;
        n.e=Math.min(1,n.e+f*(0.25+mouse.sp/2500));
        const push=f*(30+mouse.sp*0.02);
        n.vx+=dx/d*push*dt*10;n.vy+=dy/d*push*dt*10;
      }
      for(const w of waves){
        const wx=sx-w.x,wy=sy-w.y;
        const wd=Math.sqrt(wx*wx+wy*wy)||1;
        if(Math.abs(wd-w.r)<40){n.e=Math.min(1,n.e+0.35);n.vx+=wx/wd*700*dt;n.vy+=wy/wd*700*dt;}
      }
      n.vx+=(0-n.ox)*14*dt;n.vy+=(0-n.oy)*14*dt;
      n.ox+=n.vx*dt;n.oy+=n.vy*dt;
      n.vx*=Math.pow(0.0025,dt);n.vy*=Math.pow(0.0025,dt);
      n.e=Math.max(0,n.e-dt*0.7);

      const breathe=0.5+0.5*Math.sin(time*1.4+n.ph);
      const fadeClip=Math.max(0,Math.min(1,(clip-sy)/60));
      const fadeTop=Math.max(0,Math.min(1,sy/80));
      const e=n.e;
      const a=(0.18+0.45*breathe*(1-e)+0.9*e)*fadeClip*fadeTop;
      if(a<=0.02)continue;
      const s=1.4+1.4*breathe*(1-e)+2.6*e;
      ctx.fillStyle=e>0.25
        ?'rgba(58,168,224,'+Math.min(1,a).toFixed(3)+')'
        :'rgba(224,232,240,'+Math.min(1,a).toFixed(3)+')';
      ctx.beginPath();ctx.arc(sx,sy,s/2,0,6.2832);ctx.fill();
    }
    ctx.restore();
  }

  if(RM){draw(1200,0.016);return;}

  let last=performance.now();
  function loop(t){
    requestAnimationFrame(loop);
    const dt=Math.min((t-last)/1000,0.05);last=t;
    draw(t,dt);
  }
  requestAnimationFrame(loop);
})();