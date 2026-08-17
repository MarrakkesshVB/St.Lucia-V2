/* === HOLO — insignias: tilt 3D + foil holográfico que barre con el cursor === */
(function(){
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM)return;
  document.querySelectorAll('.holo').forEach(el=>{
    const foil=el.querySelector('.holo-foil');
    let rx=0,ry=0,tx=0,ty=0,running=false;

    function loop(){
      rx+=(tx-rx)*0.12; ry+=(ty-ry)*0.12;
      el.style.transform='perspective(600px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg)';
      if(foil) foil.style.backgroundPosition=(50+ry*4)+'% '+(50-rx*4)+'%';
      if(Math.abs(tx-rx)>0.01||Math.abs(ty-ry)>0.01||Math.abs(rx)>0.01||Math.abs(ry)>0.01){
        requestAnimationFrame(loop);
      }else{
        running=false;el.style.transform='';
        if(foil)foil.style.backgroundPosition='50% 50%';
      }
    }
    function kick(){if(!running){running=true;requestAnimationFrame(loop);}}

    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width*2-1;
      const py=(e.clientY-r.top)/r.height*2-1;
      ty=px*10; tx=-py*8;
      el.style.setProperty('--gx',(px*50+50)+'%');
      el.style.setProperty('--gy',(py*50+50)+'%');
      kick();
    });
    el.addEventListener('pointerleave',()=>{tx=0;ty=0;kick();});
  });
})();