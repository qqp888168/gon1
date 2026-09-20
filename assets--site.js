/* Editable front-end behavior for the static Timely Class site. No production API calls. */
(() => {
  const config=window.TIMELY_CONFIG, catalog=config.catalog;
  const base=new URL('./',document.currentScript.src), route=document.documentElement.dataset.staticRoute;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const page=(r,q='')=>new URL((window.TIMELY_ROUTES[r]||'index.html')+(q?'?'+q:''),base).href;
  const go=(r,q='')=>location.assign(page(r,q));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const image=x=>window.timelyAsset?window.timelyAsset(x):new URL(x,base).href;
  let toastTimer;
  function toast(text){let node=$('#static-toast');if(!node){node=document.createElement('div');node.id='static-toast';node.setAttribute('role','status');document.body.append(node);}node.textContent=text;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),4500);}

  // Carousel containers retain the captured layout, with touch and button navigation.
  $$('.course-cards-container,.star-cards-container').forEach(e=>{e.style.transform='none';});
  const contentGrid=$('.content-grid');let category='全部',keyword='',pageNumber=Number(new URLSearchParams(location.search).get('page'))||1;
  const pageSize=route==='/articles'?9:route==='/courses'?15:12;
  const contentCards=contentGrid?$$(':scope > .content-card',contentGrid):[];
  const typeNames={RECORDED:'錄播課程',LIVE:'直播課程',OFFLINE:'實體課程'};
  function filterCards(){if(!contentCards.length)return;const filtered=contentCards.filter(c=>{const text=c.textContent;const tags=$$('.tag',c).map(x=>x.textContent.trim());return (!keyword||text.toLowerCase().includes(keyword.toLowerCase()))&&(category==='全部'||tags.includes(category)||typeNames[c.dataset.courseType]===category);});const total=Math.max(1,Math.ceil(filtered.length/pageSize));pageNumber=Math.min(pageNumber,total);contentCards.forEach(c=>c.hidden=true);filtered.slice((pageNumber-1)*pageSize,pageNumber*pageSize).forEach(c=>c.hidden=false);$$('.pagination-number').forEach(b=>{const n=Number(b.textContent.trim());b.hidden=n>total;b.classList.toggle('active',n===pageNumber);});let empty=$('#static-list-empty');if(!empty){empty=document.createElement('p');empty.id='static-list-empty';empty.className='static-empty';contentGrid.after(empty);}empty.textContent='沒有符合條件的內容，請試試其他分類或關鍵字。';empty.hidden=filtered.length>0;}
  if(contentCards.length){const params=new URLSearchParams(location.search);keyword=params.get('keyword')||params.get('q')||'';if(params.get('type')==='physical')category='實體課程';const input=$('.content-section input');if(input)input.value=keyword;filterCards();}

  function search(){const input=$('.search-section input')||$('.search-container input')||$('input[type=search]')||$('input[placeholder]');const term=input?.value.trim()||'';if(route!=='/search'){go('/search','q='+encodeURIComponent(term));return;}let results=$('#static-search-results');if(!results){results=document.createElement('div');results.id='static-search-results';$('.search-section').append(results);}$$('.empty-state,.search-empty,.empty-results').forEach(e=>e.hidden=true);const matched=catalog.filter(x=>term&&[x.title,x.summary,x.category].join(' ').toLowerCase().includes(term.toLowerCase()));results.innerHTML=`<p class="static-result-count">${term?'找到 '+matched.length+' 筆「'+esc(term)+'」相關內容':'請輸入關鍵字開始搜尋'}</p><div class="static-results-grid">`+matched.map(x=>`<a class="static-result-card" href="${page(x.route)}"><img src="${esc(image(x.image))}" alt=""><h3>${esc(x.title)}</h3><p>${x.price?'NT$ '+Number(x.price).toLocaleString():'閱讀文章'}</p></a>`).join('')+'</div>';}
  if(route==='/search'){const term=new URLSearchParams(location.search).get('q')||'';const input=$('.search-section input');if(input)input.value=term;if(term)search();}

  let slide=0,heroTimer;
  const heroSection=$('.hero-section');
  function renderHero(i){
    if(!heroSection)return;
    slide=(i+config.hero.length)%config.hero.length;
    const x=config.hero[slide],img=$('.cover-image--base',heroSection);
    img.src=image(x.image);img.alt=x.title;
    $$('.course-title',heroSection).forEach(e=>e.textContent=x.title);
    $$('.course-description',heroSection).forEach(e=>e.textContent=x.description||'');
    $$('.course-tags',heroSection).forEach(e=>e.textContent=x.tag||'');
    $$('.progress-text',heroSection).forEach(e=>e.textContent=`${slide+1}/${config.hero.length}`);
    $$('.progress-bar-horizontal',heroSection).forEach(bar=>$$('[role=tab]',bar).forEach((e,n)=>{
      e.classList.toggle('is-active',n===slide);
      e.setAttribute('aria-selected',String(n===slide));
      e.setAttribute('tabindex',n===slide?'0':'-1');
    }));
    scheduleHero();
  }
  function scheduleHero(){
    clearTimeout(heroTimer);
    if(!heroSection)return;
    heroTimer=setTimeout(()=>{
      if(!document.hidden&&!heroSection.matches(':hover,:focus-within'))renderHero(slide+1);
      else scheduleHero();
    },12000);
  }
  if(heroSection){
    renderHero(0);
    heroSection.addEventListener('mouseleave',scheduleHero);
    heroSection.addEventListener('focusout',scheduleHero);
    heroSection.addEventListener('keydown',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey||!event.target.matches('[role=tab]'))return;
      const next=event.key==='ArrowRight'?slide+1:event.key==='ArrowLeft'?slide-1:event.key==='Home'?0:event.key==='End'?config.hero.length-1:null;
      if(next===null)return;
      event.preventDefault();renderHero(next);
      const tabs=$$('[role=tab]',event.target.parentElement);tabs[slide]?.focus();
    });
  }


  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const tab=target.closest('.hero-section [role=tab]');if(tab){event.preventDefault();event.stopPropagation();renderHero($$('[role=tab]',tab.parentElement).indexOf(tab));return;}
    if(target.closest('.hero-section .course-cover')){if(config.hero[slide].route)go(config.hero[slide].route);return;}
    const b=target.closest('button');
    if(b){const label=(b.getAttribute('aria-label')||b.textContent).trim();
      if(label==='選單'){let m=$('#static-mobile-menu');if(!m){m=document.createElement('nav');m.id='static-mobile-menu';m.innerHTML=[['課程','/courses'],['選品','/products'],['最新文章','/articles']].map(([t,r])=>`<a href="${page(r)}">${t}</a>`).join('');$('header').append(m);}m.classList.toggle('is-open');return;}
      if(label==='搜尋'&&b.closest('header')){go('/search');return;}
      if(b.classList.contains('faq-question')){const item=b.closest('.faq-item')||b.parentElement;item.classList.toggle('active');item.classList.toggle('open');const answer=$('.faq-answer',item);if(answer){answer.hidden=!item.classList.contains('open');answer.style.display=answer.hidden?'none':'block';}return;}
      if(label.startsWith('查看所有')){go(label.includes('選品')?'/products':'/courses');return;}
      if(b.classList.contains('search-button')){if(contentGrid){keyword=$('input',b.closest('.search-container')||b.parentElement)?.value||'';pageNumber=1;filterCards();}else search();return;}
      if(b.classList.contains('tab-button')&&contentGrid){category=label;pageNumber=1;$$('.content-section .tab-button').forEach(x=>x.classList.toggle('active',x===b));filterCards();return;}
      if(b.classList.contains('tab-button')&&b.closest('.course-detail-content')){const heading=$$('h2').find(x=>x.textContent.includes(label));heading?.scrollIntoView({behavior:'smooth',block:'start'});return;}
      if(b.classList.contains('pagination-number')){pageNumber=Number(label)||1;filterCards();$('.content-section')?.scrollIntoView({behavior:'smooth'});return;}
      if(b.classList.contains('pagination-button')){const arrows=$$('.pagination-button');pageNumber=Math.max(1,pageNumber+(arrows.indexOf(b)===0?-1:1));filterCards();return;}
      if(b.classList.contains('nav-button')||b.classList.contains('nav-arrow')){const section=b.closest('section')||b.parentElement.parentElement;const wrap=$('.course-cards-wrapper,.star-cards-wrapper,.reviews-container',section);wrap?.scrollBy({left:(b.classList.contains('prev')?-1:1)*wrap.clientWidth*.85,behavior:'smooth'});return;}
      if(label==='分享'){navigator.clipboard?.writeText(location.href).then(()=>toast('已複製文章連結')).catch(()=>toast(location.href));return;}
      if(b.classList.contains('article-back-to-top')){window.scrollTo({top:0,behavior:'smooth'});return;}
    }
    const link=target.closest('[data-route]');if(link&&!target.closest('input,select,textarea')){event.preventDefault();go(link.dataset.route,link.dataset.query||'');}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('[data-route]'))go(event.target.dataset.route);if(event.key==='Enter'&&event.target.matches('.content-section input')){event.preventDefault();keyword=event.target.value;pageNumber=1;filterCards();}});
  document.addEventListener('input',event=>{if(event.target.matches('.content-section input')){keyword=event.target.value;pageNumber=1;filterCards();}});
  document.addEventListener('submit',event=>{if(event.target.closest('.search-section')){event.preventDefault();search();}});
})();
