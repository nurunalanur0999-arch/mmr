(() => {
  'use strict';
  const carousel = document.querySelector('[data-review-carousel]');
  const track = document.querySelector('[data-review-track]');
  if (!carousel || !track) return;
  const previous = document.querySelector('[data-review-prev]');
  const next = document.querySelector('[data-review-next]');
  const count = document.querySelector('[data-review-count]');
  const prefReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let data = [], active = 0, locked = false, automatic = null, paused = false, expanded = false, signature = '';
  let motionCleanup = null;

  const safeUrl = (url) => {
    try {
      const parsed = new URL(String(url || ''), document.baseURI);
      if (parsed.protocol !== 'https:') return '';
      if (!/(^|\.)(facebook\.com|google\.com|maps\.app\.goo\.gl)$/i.test(parsed.hostname)) return '';
      return parsed.href;
    } catch { return ''; }
  };
  const make = (type, className, content) => {
    const el = document.createElement(type);
    if (className) el.className = className;
    if (content != null) el.textContent = String(content);
    return el;
  };
  function createCard(review) {
    const card = make('article', 'home-review-card');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', 'Review by ' + review.name);
    const head = make('div','review-card-top');
    const avatar = make('div','review-avatar');
    avatar.appendChild(make('span','review-avatar-fallback', review.initials || review.name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase()));
    const avatarSrc = safeUrl(review.avatar);
    if (avatarSrc) {
      const image = make('img');
      image.src = avatarSrc; image.alt=''; image.loading='lazy'; image.referrerPolicy='no-referrer';
      image.addEventListener('error',()=>{image.hidden=true;}); avatar.appendChild(image);
    }
    const author=make('div','review-author');
    author.append(make('h3',null,review.name),make('span',null, (review.source || 'Customer') + ' customer review'));
    head.append(avatar,author);
    const fb=safeUrl(review.sourceUrl || review.profile);
    if (fb) {
      const link=make('a','review-source-link','↗');
      link.href=fb;link.target='_blank';link.rel='noopener noreferrer';
      link.setAttribute('aria-label', 'See review source for ' + review.name);head.appendChild(link);
    }
    card.appendChild(head);
    const mark=make('div','review-quote-mark','“'); mark.setAttribute('aria-hidden','true');card.appendChild(mark);
    card.appendChild(make('blockquote',null,review.quote));
    const readMore=make('button','review-read-more','Read full review ↗'); readMore.type='button';readMore.setAttribute('data-review-full','');readMore.setAttribute('aria-label','Read full review by '+review.name);card.appendChild(readMore);
    const foot=make(fb?'a':'span','review-profile-text',fb?(review.source==='Facebook'?'View Facebook profile ↗':'View Google reviews ↗'):'Customer review');
    if(fb){foot.href=fb;foot.target='_blank';foot.rel='noopener noreferrer';}
    card.appendChild(foot);
    return card;
  }
  const visible = () => window.matchMedia('(max-width:700px)').matches ? 1 : window.matchMedia('(max-width:960px)').matches ? 2 : 3;
  const displayed = () => Math.min(visible(), Math.max(data.length,1));
  const wrap = index => (index % data.length + data.length) % data.length;
  function renderWindow(start, includeExtra = true) {
    if (!data.length) { track.replaceChildren();return; }
    const count = displayed();
    if(expanded){
      track.replaceChildren(...data.map(createCard));
      track.style.transition='none';track.style.transform='none';
      return;
    }
    const viewport = carousel.querySelector('.review-carousel-viewport');
    if (viewport) viewport.style.setProperty('--review-visible',count);
    const cardCount = data.length < 2 ? 1 : count + (includeExtra ? 1 : 0);
    track.replaceChildren(...Array.from({length:cardCount},(_,i)=>createCard(data[wrap(start+i)])));
    track.style.transition='none';track.style.transform='translate3d(0,0,0)';
  }
  function updateCounter() {
    if(count)count.textContent = String(active+1).padStart(2,'0')+' / '+String(data.length).padStart(2,'0');
    const viewAll=document.querySelector('[data-review-toggle]');if(viewAll && !expanded)viewAll.textContent=`View all ${data.length} reviews ↓`;
    carousel.setAttribute('aria-label','Customer testimonials, review '+(active+1)+' of '+data.length);
  }
  function rebuild(records) {
    if(motionCleanup)motionCleanup();
    data=records; active=0; locked=false;
    renderWindow(active);updateCounter();
    if(previous)previous.disabled=data.length<2;
    if(next)next.disabled=data.length<2;
  }
  function distance() {
    const first=track.firstElementChild;
    if(!first)return 0;
    const s=window.getComputedStyle(track);
    return first.getBoundingClientRect().width+(parseFloat(s.columnGap||s.gap)||20);
  }
  function move(direction) {
    if(locked||expanded||data.length<2||document.hidden)return;
    const step=distance();if(!step)return;
    if(prefReduced.matches){active=wrap(active+direction);renderWindow(active);updateCounter();return;}
    locked=true;
    if(direction<0){
      renderWindow(wrap(active-1));
      track.style.transform=`translate3d(-${step}px,0,0)`;
      void track.offsetWidth;
      track.style.transition='transform 520ms cubic-bezier(.22,.61,.36,1)';
      track.style.transform='translate3d(0,0,0)';
    }else{
      track.style.transition='transform 520ms cubic-bezier(.22,.61,.36,1)';
      track.style.transform=`translate3d(-${step}px,0,0)`;
    }
    let finished=false;
    const onFinish=()=>{
      if(finished)return;finished=true;
      track.removeEventListener('transitionend',onEnd);
      window.clearTimeout(timeout);
      active=wrap(active+direction);renderWindow(active);updateCounter();locked=false;
      motionCleanup=null;
    };
    const onEnd=e=>{if(e.target===track&&e.propertyName==='transform')onFinish();};
    track.addEventListener('transitionend',onEnd);
    const timeout=window.setTimeout(onFinish,800);
    motionCleanup=()=>{if(finished)return;finished=true;track.removeEventListener('transitionend',onEnd);window.clearTimeout(timeout);locked=false;motionCleanup=null;};
  }
  const stop=()=>{if(automatic!=null){clearInterval(automatic);automatic=null;}};
  const start=()=>{stop();if(!expanded&&!prefReduced.matches&&!paused&&!document.hidden&&data.length>1){automatic=setInterval(()=>move(1),5500);}};
  if(next)next.addEventListener('click',()=>{move(1);start();});
  if(previous)previous.addEventListener('click',()=>{move(-1);start();});
  carousel.addEventListener('mouseenter',()=>{paused=true;stop();});
  carousel.addEventListener('mouseleave',()=>{paused=false;start();});
  carousel.addEventListener('focusin',()=>{paused=true;stop();});
  carousel.addEventListener('focusout',e=>{if(!carousel.contains(e.relatedTarget)){paused=false;start();}});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  if(prefReduced.addEventListener)prefReduced.addEventListener('change',start);
  let resized=0;
  window.addEventListener('resize',()=>{const now=visible();if(resized!==now){resized=now;if(motionCleanup)motionCleanup();if(data.length){renderWindow(active);updateCounter();} start();}}, {passive:true});

  async function refresh() {
    try {
      const response=await fetch('assets/approved-reviews.json?updated='+Date.now(),{cache:'no-store'});
      if(!response.ok)return;
      const records=await response.json();if(!Array.isArray(records))return;
      const clean=records.filter(x=>x&&typeof x.name==='string'&&typeof x.quote==='string')
        .map(x=>({name:x.name.slice(0,120),quote:x.quote.slice(0,1800),initials:String(x.initials||'').slice(0,4),service:String(x.service||'').slice(0,80),profile:String(x.profile||''),avatar:String(x.avatar||''),source:String(x.source||''),sourceUrl:String(x.sourceUrl||'')}))
        .filter(x=>x.name.trim()&&x.quote.trim()).slice(0,80);
      if(!clean.length)return;
      const sig=JSON.stringify(clean);
      if(sig!==signature){signature=sig;rebuild(clean);start();}
    }catch{/* Keep the original review cards if the JSON cannot be loaded. */}
  }
  const initial=Array.from(track.querySelectorAll('.home-review-card')).map(c=>({
    name:c.querySelector('.review-author h3')?.textContent?.trim()||'',
    initials:c.querySelector('.review-avatar-fallback')?.textContent?.trim()||'',
    quote:c.querySelector('blockquote')?.textContent?.trim()||'',
    profile:c.querySelector('.review-source-link')?.getAttribute('href')||'',
    avatar:c.querySelector('.review-avatar img')?.getAttribute('src')||'',
    source:c.querySelector('.review-author span')?.textContent?.includes('Google')?'Google Maps':'Facebook',
    sourceUrl:c.querySelector('.review-profile-text')?.getAttribute('href')||''
  })).filter(x=>x.name&&x.quote);
  if(initial.length){rebuild(initial);start();}


  const toggleAll=document.querySelector('[data-review-toggle]');
  if(toggleAll)toggleAll.addEventListener('click',()=>{
    if(motionCleanup)motionCleanup();
    expanded=!expanded;
    carousel.classList.toggle('is-expanded',expanded);
    toggleAll.setAttribute('aria-expanded', String(expanded));
    toggleAll.textContent=expanded?'Back to automatic slider ↑':`View all ${data.length} reviews ↓`;
    if(expanded){stop();}else{start();}
    renderWindow(active);updateCounter();
    if(!expanded)carousel.scrollIntoView({behavior:prefReduced.matches?'instant':'smooth',block:'start'});
  });

  const detailDialog=document.getElementById('reviewDetailDialog');
  let savedFocus=null;
  if(detailDialog){
    carousel.addEventListener('click',event=>{
      const button=event.target.closest('[data-review-full]');
      if(!button)return;
      const card=button.closest('.home-review-card');
      if(!card)return;
      savedFocus=button;
      detailDialog.querySelector('#reviewDialogTitle').textContent=card.querySelector('.review-author h3')?.textContent||'Customer review';
      detailDialog.querySelector('#reviewDialogSource').textContent=card.querySelector('.review-author span')?.textContent||'';
      detailDialog.querySelector('#reviewDialogBody').textContent=card.querySelector('blockquote')?.textContent||'';
      paused=true;stop();
      if(typeof detailDialog.showModal==='function')detailDialog.showModal();
      else detailDialog.setAttribute('open','');
    });
    detailDialog.querySelector('[data-review-dialog-close]')?.addEventListener('click',()=>detailDialog.close());
    detailDialog.addEventListener('click',event=>{if(event.target===detailDialog)detailDialog.close();});
    detailDialog.addEventListener('close',()=>{paused=false;start();savedFocus?.focus();});
  }

  refresh();window.setInterval(refresh,120000);
})();
