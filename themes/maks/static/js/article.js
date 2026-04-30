/* Reading progress bar */
(function(){
  const bar=document.createElement('div');
  bar.id='readingBar';
  document.body.appendChild(bar);
  window.addEventListener('scroll',()=>{
    const h=document.body.scrollHeight-window.innerHeight;
    bar.style.width=(h>0?Math.round(window.scrollY/h*100):0)+'%';
  });
})();

/* Desktop & mobile ToC */
(function(){
  const heads=document.querySelectorAll('#articleBody h2,#articleBody h3');
  if(heads.length<=2)return;
  const aside=document.getElementById('tocAside');
  const page=document.getElementById('prosePage');

  aside.innerHTML='<div class="toc-inner"><div class="toc-title">Contents</div><div class="toc-links">'+
    [...heads].map(h=>`<a href="#${h.id}" class="toc-item toc-${h.tagName.toLowerCase()}">${h.innerHTML.replace(/<[^>]*>/g,'')}</a>`).join('')+
  '</div></div>';

  if(window.innerWidth>=860)page.classList.add('has-toc');
  window.addEventListener('resize',()=>{
    page.classList.toggle('has-toc',window.innerWidth>=860);
  });

  let active=null;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      const link=aside.querySelector(`a[href="#${e.target.id}"]`);
      if(!link)return;
      if(e.isIntersecting){
        if(active)active.classList.remove('cur');
        active=link;
        link.classList.add('cur');
        link.scrollIntoView({block:'nearest'});
      }
    });
  },{rootMargin:'-10% 0px -80% 0px'});
  heads.forEach(h=>{if(h.id)observer.observe(h);});

  const mobToc=document.createElement('details');
  mobToc.className='mob-toc';
  mobToc.innerHTML='<summary>Contents</summary><div class="mob-toc-links">'+
    [...heads].map(h=>`<a href="#${h.id}" class="toc-item toc-${h.tagName.toLowerCase()}">${h.innerHTML.replace(/<[^>]*>/g,'')}</a>`).join('')+
  '</div>';
  const ab=document.getElementById('articleBody');
  ab.insertBefore(mobToc,ab.firstChild);
  mobToc.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobToc.removeAttribute('open')));

  const tocInner=aside.querySelector('.toc-inner');
  const footer=document.querySelector('footer');
  if(tocInner&&footer){
    const clampToc=()=>{
      const footerTop=footer.getBoundingClientRect().top;
      const maxNatural=window.innerHeight-96;
      const maxAllowed=footerTop-72-8;
      tocInner.style.maxHeight=Math.min(maxNatural,Math.max(maxAllowed,80))+'px';
    };
    window.addEventListener('scroll',clampToc,{passive:true});
    clampToc();
  }
})();

/* Copy buttons on code blocks */
document.querySelectorAll('pre:not(.chroma)').forEach(pre=>{
  if(pre.closest('.code-block'))return;
  const wrap=document.createElement('div');
  wrap.className='code-block';
  const lbl=document.createElement('div');
  lbl.className='code-label';
  lbl.innerHTML='<span>code</span><button class="copy-btn" onclick="cpPre(this)">copy</button>';
  pre.parentNode.insertBefore(wrap,pre);
  wrap.appendChild(lbl);
  wrap.appendChild(pre);
});
document.querySelectorAll('.highlight').forEach(hl=>{
  if(hl.closest('.code-block'))return;
  const pre=hl.querySelector('pre');
  const lang=pre&&pre.querySelector('code[data-lang]')?pre.querySelector('code[data-lang]').dataset.lang:'code';
  const wrap=document.createElement('div');
  wrap.className='code-block';
  const lbl=document.createElement('div');
  lbl.className='code-label';
  lbl.innerHTML='<span>'+lang+'</span><button class="copy-btn" onclick="cpPre(this)">copy</button>';
  hl.parentNode.insertBefore(wrap,hl);
  wrap.appendChild(lbl);
  wrap.appendChild(hl);
});
function cpPre(btn){
  const pre=btn.closest('.code-block').querySelector('pre');
  navigator.clipboard.writeText(pre.innerText).then(()=>{
    btn.textContent='ok!';btn.classList.add('copied');
    setTimeout(()=>{btn.textContent='copy';btn.classList.remove('copied');},1500);
  });
}

/* Image lightbox with zoom & pan */
(function(){
  const overlay=document.createElement('div');
  overlay.className='lb-overlay';
  overlay.innerHTML=
    '<img class="lb-img" id="lbImg">'+
    '<button class="lb-close" id="lbClose">&#x2715;</button>'+
    '<div class="lb-hint">scroll to zoom &nbsp;·&nbsp; drag to pan &nbsp;·&nbsp; esc to close</div>';
  document.body.appendChild(overlay);

  const img=overlay.querySelector('#lbImg');
  const closeBtn=overlay.querySelector('#lbClose');
  let scale=1,tx=0,ty=0;
  let dragging=false,startX,startY,startTx,startTy;

  function applyTransform(animate){
    img.style.transition=animate?'transform .15s ease':'none';
    img.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
  }
  function reset(){scale=1;tx=0;ty=0;applyTransform(true);}
  function open(src){img.src=src;reset();overlay.classList.add('lb-open');document.body.style.overflow='hidden';}
  function close(){
    overlay.classList.remove('lb-open');
    document.body.style.overflow='';
    setTimeout(()=>{img.src='';},200);
  }

  document.querySelectorAll('.prose img').forEach(el=>{
    const wrap=document.createElement('div');
    wrap.className='img-wrap';
    el.parentNode.insertBefore(wrap,el);
    wrap.appendChild(el);
    const hint=document.createElement('div');
    hint.className='img-zoom-hint';
    hint.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    wrap.appendChild(hint);
    el.addEventListener('click',e=>{e.stopPropagation();open(el.src);});
  });

  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  closeBtn.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});

  img.addEventListener('wheel',e=>{
    e.preventDefault();
    const rect=img.getBoundingClientRect();
    const cx=e.clientX-(rect.left+rect.width/2);
    const cy=e.clientY-(rect.top+rect.height/2);
    const delta=e.deltaY<0?1.12:1/1.12;
    const newScale=Math.min(Math.max(scale*delta,0.5),8);
    tx+=cx*(1-newScale/scale);
    ty+=cy*(1-newScale/scale);
    scale=newScale;
    applyTransform(false);
  },{passive:false});

  img.addEventListener('dblclick',e=>{e.stopPropagation();reset();});

  img.addEventListener('mousedown',e=>{
    if(scale<=1)return;
    dragging=true;startX=e.clientX;startY=e.clientY;startTx=tx;startTy=ty;
    img.classList.add('lb-dragging');
    e.preventDefault();
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging)return;
    tx=startTx+(e.clientX-startX);
    ty=startTy+(e.clientY-startY);
    applyTransform(false);
  });
  document.addEventListener('mouseup',()=>{dragging=false;img.classList.remove('lb-dragging');});

  let lastDist=null;
  overlay.addEventListener('touchstart',e=>{
    if(e.touches.length===2)lastDist=Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX,
      e.touches[0].clientY-e.touches[1].clientY);
  },{passive:true});
  overlay.addEventListener('touchmove',e=>{
    if(e.touches.length===2&&lastDist){
      const d=Math.hypot(
        e.touches[0].clientX-e.touches[1].clientX,
        e.touches[0].clientY-e.touches[1].clientY);
      scale=Math.min(Math.max(scale*(d/lastDist),0.5),8);
      lastDist=d;
      applyTransform(false);
      e.preventDefault();
    }
  },{passive:false});
  overlay.addEventListener('touchend',()=>{lastDist=null;});
})();

/* Code block toggles — enabled via data-code-toggle="true" on <body> */
if(document.body.dataset.codeToggle==='true'){
  document.querySelectorAll('.code-block').forEach(block=>{
    const lbl=block.querySelector('.code-label');
    if(!lbl)return;
    if(block.closest('.no-toggle'))return;
    const body=document.createElement('div');
    body.className='code-body collapsed';
    while(block.children.length>1){body.appendChild(block.children[1]);}
    block.appendChild(body);
    const chevron=document.createElement('button');
    chevron.className='code-toggle-btn';
    chevron.setAttribute('aria-label','Toggle code');
    chevron.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
    lbl.insertBefore(chevron,lbl.firstChild);
    const cbPre=body.querySelector('pre');
    if(cbPre&&cbPre.innerText.trim().split('\n').filter(l=>l.trim()).length<=10){
      body.classList.remove('collapsed');
      chevron.classList.add('open');
    }
    chevron.addEventListener('click',()=>{
      const collapsed=body.classList.toggle('collapsed');
      chevron.classList.toggle('open',!collapsed);
    });
    lbl.style.cursor='pointer';
    lbl.addEventListener('click',e=>{
      if(e.target.closest('.copy-btn'))return;
      chevron.click();
    });
  });
}
