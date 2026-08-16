/* === HERO DOTS v3 — campo cinético puro (sin malla, sin HUD) === */
(function(){
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas=document.getElementById('heroDots');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const dpr=Math.min(window.devicePixelRatio||1,2);
  let W=0,H=0,visible=true;

  /* ---------- malla de nodos ---------- */
  let nodes=[],cols=0,rows=0,gap=36;
  function build(){
    const r=canvas.getBoundingClientRect();
    W=r.width;H=r.height;
    canvas.width=W*dpr;canvas.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    gap=W<1024?48:36;
    cols=Math.ceil(W/gap)+1;rows=Math.ceil(H/gap)+1;
    nodes=[];
    for(let ry=0;ry<rows;ry++)for(let cx=0;cx<cols;cx++){
      nodes.push({
        bx:cx*gap,by:ry*gap,x:cx*gap,y:ry*gap,vx:0,vy:0,e:0,
        ph:Math.random()*6.283
      });
    }
  }
  build();
  let rto;window.addEventListener('resize',()=>{clearTimeout(rto);rto=setTimeout(build,180);});

  new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:0}).observe(canvas);

  /* ---------- mouse + velocidad ---------- */
  const mouse={x:-9999,y:-9999,px:-9999,py:-9999,sp:0};
  window.addEventListener('pointermove',e=>{
    const r=canvas.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  },{passive:true});

  /* ---------- shockwaves + crosshairs ---------- */
  const waves=[];
  let waveCd=0;

  function draw(t,dt){
    ctx.clearRect(0,0,W,H);
    const time=t*0.001;

    /* velocidad del cursor */
    const dxm=mouse.x-mouse.px,dym=mouse.y-mouse.py;
    const sp=Math.sqrt(dxm*dxm+dym*dym)/Math.max(dt,0.001);
    mouse.sp+=(Math.min(sp,3000)-mouse.sp)*0.2;
    mouse.px=mouse.x;mouse.py=mouse.y;

    /* sweep rápido => shockwave */
    waveCd-=dt;
    if(mouse.sp>1400&&waveCd<=0){
      waves.push({x:mouse.x,y:mouse.y,r:10,v:900});
      waveCd=0.25;
    }
    for(let i=waves.length-1;i>=0;i--){
      const w=waves[i];w.r+=w.v*dt;
      if(w.r>Math.max(W,H))waves.splice(i,1);
    }

    /* ---------- física de nodos ---------- */
    const R=120;
    for(const n of nodes){
      const dx=n.x-mouse.x,dy=n.y-mouse.y;
      const d=Math.sqrt(dx*dx+dy*dy)||1;
      if(d<R){
        const f=1-d/R;
        n.e=Math.min(1,n.e+f*(0.25+mouse.sp/2500));
        const push=f*(30+mouse.sp*0.02);
        n.vx+=dx/d*push*dt*10;
        n.vy+=dy/d*push*dt*10;
      }
      for(const w of waves){
        const wx=n.x-w.x,wy=n.y-w.y;
        const wd=Math.sqrt(wx*wx+wy*wy)||1;
        if(Math.abs(wd-w.r)<40){
          n.e=Math.min(1,n.e+0.35);
          n.vx+=wx/wd*700*dt;
          n.vy+=wy/wd*700*dt;
        }
      }
      /* resorte a la base + damping */
      n.vx+=(n.bx-n.x)*14*dt;
      n.vy+=(n.by-n.y)*14*dt;
      n.vx*=Math.pow(0.0025,dt);
      n.vy*=Math.pow(0.0025,dt);
      n.x+=n.vx*dt;n.y+=n.vy*dt;
      n.e=Math.max(0,n.e-dt*0.7);
    }

    /* ---------- nodos: blancos respirando → azules energizados ---------- */
    for(const n of nodes){
      const breathe=0.5+0.5*Math.sin(time*1.4+n.ph);
      const fadeV=Math.min(1,n.y/(H*0.15),(H-n.y)/(H*0.2)+0.3);
      const e=n.e;
      const a=(0.18+0.45*breathe*(1-e)+0.9*e)*fadeV;
      if(a<=0.02)continue;
      const s=1.4+1.4*breathe*(1-e)+2.6*e;
      ctx.fillStyle=e>0.25
        ?'rgba(58,168,224,'+Math.min(1,a).toFixed(3)+')'
        :'rgba(224,232,240,'+Math.min(1,a).toFixed(3)+')';
      ctx.beginPath();ctx.arc(n.x,n.y,s/2,0,6.2832);ctx.fill();
    }
  }

  if(RM){draw(1200,0.016);return;}   /* reduced-motion: campo estático */

  let last=performance.now();
  function loop(t){
    requestAnimationFrame(loop);
    if(!visible)return;
    const dt=Math.min((t-last)/1000,0.05);last=t;
    draw(t,dt);
  }
  requestAnimationFrame(loop);
})();