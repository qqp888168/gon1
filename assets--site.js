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
  function getCart(){try{return JSON.parse(localStorage.getItem('timely-static-cart')||'[]')}catch{return []}}
  function setCart(items){localStorage.setItem('timely-static-cart',JSON.stringify(items))}
  function addCart(){const item=catalog.find(x=>x.route===route);if(!item)return;const qty=Number($('input[type=number]')?.value)||1;const items=getCart();const found=items.find(x=>x.route===route);if(found)found.quantity+=qty;else items.push({...item,quantity:qty});setCart(items);toast('已加入購物車');}
  function renderCart(){const target=$('#cart-items');if(!target)return;const items=getCart();target.innerHTML=items.length?items.map((x,i)=>`<article class="static-cart-row"><img src="${esc(image(x.image))}" alt=""><div><a href="${esc(page(x.route))}">${esc(x.title)}</a><p>NT$ ${Number(x.price||0).toLocaleString()}</p></div><input aria-label="${esc(x.title)}數量" type="number" min="1" value="${x.quantity}" data-cart-qty="${i}"><button data-remove="${i}">移除</button></article>`).join(''):'<div class="static-empty"><h2>購物車目前沒有商品</h2><p>挑一堂喜歡的課，開始新的學習。</p></div>';$('.cart-total').textContent=items.length?'合計 NT$ '+items.reduce((a,x)=>a+x.price*x.quantity,0).toLocaleString():'';}
  renderCart();

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

  let slide=0;
  function renderHero(i){const h=$('.hero-section');if(!h)return;slide=(i+config.hero.length)%config.hero.length;const x=config.hero[slide],img=$('.cover-image--base',h);img.src=image(x.image);img.alt=x.title;$$('.course-title',h).forEach(e=>e.textContent=x.title);$$('.course-tags',h).forEach(e=>e.textContent=x.tag);$$('.progress-text',h).forEach(e=>e.textContent=`${slide+1}/${config.hero.length}`);$$('.progress-bar-horizontal',h).forEach(bar=>$$('[role=tab]',bar).forEach((e,n)=>{e.classList.toggle('is-active',n<=slide);e.setAttribute('aria-selected',String(n===slide));}));}
  renderHero(0);if($('.hero-section'))setInterval(()=>{if(!document.hidden)renderHero(slide+1)},7000);

  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const tab=target.closest('.hero-section [role=tab]');if(tab){event.preventDefault();event.stopPropagation();renderHero($$('[role=tab]',tab.parentElement).indexOf(tab));return;}
    if(target.closest('.hero-section .course-cover')){go(config.hero[slide].route);return;}
    const b=target.closest('button');
    if(b){const label=(b.getAttribute('aria-label')||b.textContent).trim();
      if(label==='選單'){let m=$('#static-mobile-menu');if(!m){m=document.createElement('nav');m.id='static-mobile-menu';m.innerHTML=[['課程','/courses'],['選品','/products'],['最新文章','/articles'],['登入 / 註冊','/login']].map(([t,r])=>`<a href="${page(r)}">${t}</a>`).join('');$('header').append(m);}m.classList.toggle('is-open');return;}
      if(label==='購物車'){go('/cart');return;}
      if(label==='登入 / 註冊'){go('/login');return;}
      if(label==='搜尋'&&b.closest('header')){go('/search');return;}
      if(b.classList.contains('password-toggle')){const input=$('input',b.parentElement);if(input)input.type=input.type==='password'?'text':'password';return;}
      if(b.classList.contains('btn-line')){toast('此版本為前端展示，尚未連接 LINE 會員服務。');return;}
      if((route==='/login'||route==='/register')&&b.classList.contains('tab-button')){go(label==='註冊'?'/register':'/login');return;}
      if(label==='立即購買'||label==='加入購物車'||b.classList.contains('btn-secondary-mobile')){addCart();if(label==='立即購買')go('/cart');return;}
      if(b.id==='checkout-demo'){toast('此版本為前端展示，尚未連接金流，不會收款。');return;}
      if(b.hasAttribute('data-remove')){const items=getCart();items.splice(Number(b.dataset.remove),1);setCart(items);renderCart();return;}
      if(b.classList.contains('quantity-btn')){const area=b.parentElement,input=$('input',area);if(input){const buttons=$$('button',area);input.value=Math.max(1,(Number(input.value)||1)+(buttons.indexOf(b)===0?-1:1));buttons[0].disabled=Number(input.value)<=1;}return;}
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
    if(target.closest('.forgot-password')){go('/login/forgot-password');return;}
    const link=target.closest('[data-route]');if(link&&!target.closest('input,select,textarea')){event.preventDefault();go(link.dataset.route,link.dataset.query||'');}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('[data-route]'))go(event.target.dataset.route);if(event.key==='Enter'&&event.target.matches('.content-section input')){event.preventDefault();keyword=event.target.value;pageNumber=1;filterCards();}});
  document.addEventListener('input',event=>{if(event.target.matches('.content-section input')){keyword=event.target.value;pageNumber=1;filterCards();}if(event.target.matches('[data-cart-qty]')){const items=getCart();items[Number(event.target.dataset.cartQty)].quantity=Math.max(1,Number(event.target.value)||1);setCart(items);$('.cart-total').textContent='合計 NT$ '+items.reduce((a,x)=>a+x.price*x.quantity,0).toLocaleString();}});
  document.addEventListener('submit',event=>{event.preventDefault();if(event.target.closest('.search-section'))search();else toast('此版本為前端展示，尚未連接帳號服務，不會傳送表單資料。');});
  $$('.btn-submit').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();toast('此版本為前端展示，尚未連接帳號服務，不會傳送表單資料。');}));
})();
