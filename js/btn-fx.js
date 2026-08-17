/* === BTN FX v3 — hover negro + dot-matrix azul/blanco, brillo total === */
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* hover negro + borde azul (pisa Tailwind) */
  const st=document.createElement('style');
  st.textContent='[data-fx-btn]:hover{background:#050507!important;color:#E0D8D0!important;border-color:rgba(197,160,89,.75)!important;box-shadow:0 0 26px -6px rgba(197,160,89,.5)!important}';
  document.head.appendChild(st);

  const ctas=[...document.querySelectorAll('a,button')].filter(el=>
    !el.closest('footer') &&
    /call now|request.*quote|send quote|submit request|explore services/i.test(el.textContent||''));

  ctas.forEach((btn)=>{
    btn.setAttribute('data-fx-btn','');
    if(getComputedStyle(btn).position==='static') btn.style.position='relative';
    btn.style.overflow='hidden';

    const canvas=document.createElement('canvas');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    btn.prepend(canvas);
    const ctx=canvas.getContext('2d');

    let W=0,H=0;const dpr=Math.min(window.devicePixelRatio||1,2);
    let hover=0,hoverT=0,running=false;
    const mouse={x:-999,y:-999};

    function resize(){
      W=btn.offsetWidth;H=btn.offsetHeight;
      canvas.width=W*dpr;canvas.height=H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();
    window.addEventListener('resize',resize);

    function draw(t){
      ctx.clearRect(0,0,W,H);
      const gap=9,R=70;
      for(let y=gap/2;y<H;y+=gap){
        for(let x=gap/2;x<W;x+=gap){
          const dx=x-mouse.x,dy=y-mouse.y;
          const d=Math.sqrt(dx*dx+dy*dy);
          const boost=Math.max(0,1-d/R);
          const tw=.35+.65*Math.abs(Math.sin(t*.002+x*.35+y*.21));
          /* brillo TOTAL en toda la grilla + extra cerca del cursor */
          const a=Math.min(1,hover*(.28+.72*tw)+hover*.25*boost);
          if(a<=.01)continue;
          const white=((x*7+y*13)%10)<3;   /* 30% blancos, 70% oro brillante, estable */
          const col=white?'224,232,240':'255,217,143';
          ctx.beginPath();
          ctx.arc(x,y,1.0+1.2*boost,0,6.2832);
          ctx.fillStyle='rgba('+col+','+a.toFixed(3)+')';
          ctx.fill();
        }
      }
    }
    function loop(t){
      hover+=(hoverT-hover)*.12;
      draw(t);
      if(hover>.01||hoverT===1)requestAnimationFrame(loop);
      else{running=false;ctx.clearRect(0,0,W,H);}
    }
    function kick(){if(!running){running=true;requestAnimationFrame(loop);}}

    btn.addEventListener('mouseenter',()=>{hoverT=1;kick();});
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
    });
    btn.addEventListener('mouseleave',()=>{hoverT=0;mouse.x=-999;mouse.y=-999;kick();});
  });
})();