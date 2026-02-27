const PRODUCTS = [
  {id:1,name:'Monalisa Canvas Art',price:129.00,desc:'High-quality canvas print of the Monalisa-inspired piece.',img:'https://picsum.photos/seed/1/600/400',cat:'NEW ARRIVALS'},
  {id:2,name:'Monalisa Mug',price:14.50,desc:'Ceramic mug with a subtle Monalisa motif.',img:'https://picsum.photos/seed/2/600/400',cat:'ACCESSORIES'},
  {id:3,name:'Monalisa Tote Bag',price:24.00,desc:'Durable cotton tote for everyday use.',img:'https://picsum.photos/seed/3/600/400',cat:'CLOTHING'},
  {id:4,name:'Sketch Notebook',price:9.99,desc:'A5 sketchbook, great for artists and doodlers.',img:'https://picsum.photos/seed/4/600/400',cat:'ACCESSORIES'},
  {id:5,name:'Art Prints Set (3)',price:39.00,desc:'Set of three premium art prints.',img:'https://picsum.photos/seed/5/600/400',cat:'EMPORIUM'},
  {id:6,name:'Gallery Poster',price:49.99,desc:'Large gallery-quality poster.',img:'https://picsum.photos/seed/6/600/400',cat:'BRANDS'}
];

const cartKey = 'monalisa_cart_v1';
let cart = loadCart();

function saveCart(){localStorage.setItem(cartKey,JSON.stringify(cart));updateCartCount();}
function loadCart(){try{return JSON.parse(localStorage.getItem(cartKey))||{items:{}}}catch(e){return {items:{}}}}

function updateCartCount(){const count = Object.values(cart.items).reduce((s,i)=>s+i.qty,0);document.getElementById('cart-count').textContent = count}

function $(sel,root=document){return root.querySelector(sel)}
function renderHome(filter='',category=''){const el = $('#home');el.innerHTML='';
  const grid = document.createElement('div');grid.className='grid';
  const list = PRODUCTS.filter(p=>{
    const matchesFilter = p.name.toLowerCase().includes(filter.toLowerCase())||p.desc.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = category===''||p.cat===category;
    return matchesFilter && matchesCategory;
  });
  list.forEach(p=>{
    const c = document.createElement('div');c.className='card';
    c.innerHTML = `<img src="${p.img}" alt="${p.name}"><div class="card-body"><h3 class="card-title">${p.name}</h3><div class="card-desc">${p.desc}</div><div class="price">$${p.price.toFixed(2)}</div><div class="actions"><button data-id="${p.id}" class="view-btn">View</button><button data-id="${p.id}" class="add-btn">Add</button></div></div>`;
    grid.appendChild(c);
  });
  el.appendChild(grid);
  el.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click',e=>showProduct(e.target.dataset.id)));
  el.querySelectorAll('.add-btn').forEach(b=>b.addEventListener('click',e=>{addToCart(+e.target.dataset.id);flash('Added to cart')}));
}

function showProduct(id){const p = PRODUCTS.find(x=>x.id==id);if(!p) return;showView('product');
  const el = $('#product');el.innerHTML = `<div class="card"><img src="${p.img}"><div class="card-body"><h2>${p.name}</h2><p class="muted">$${p.price.toFixed(2)}</p><p>${p.desc}</p><div style="margin-top:12px"><label>Qty: <input id="prod-qty" type="number" min="1" value="1" class="qty"></label><div style="margin-top:8px"><button id="add-from-product">Add to cart</button> <button id="back-home">Back</button></div></div></div></div>`;
  $('#back-home').addEventListener('click',()=>showView('home'));
  $('#add-from-product').addEventListener('click',()=>{const q = Math.max(1,parseInt($('#prod-qty').value||1));addToCart(p.id,q);flash('Added to cart')});
}

function showView(name){
  ['home','product','cart','checkout','confirmation'].forEach(v=>{
    const el = document.getElementById(v);
    if(el) el.classList.toggle('hidden',v!==name);
  });
  if(name==='home'){
    const searchEl = document.getElementById('search');
    const query = searchEl ? (searchEl.value||'') : '';
    renderHome(query,window.currentCategory||'');
  }
  if(name==='cart') renderCart();
  if(name==='checkout') renderCheckout();
}

function addToCart(id,qty=1){cart.items[id] = cart.items[id] || {id,qty:0};cart.items[id].qty += qty;saveCart();}

function renderCart(){const el = $('#cart');el.innerHTML='';const header = document.createElement('div');header.innerHTML='<h2>Your Cart</h2>';el.appendChild(header);
  const list = document.createElement('div');list.className='cart-list';
  const items = Object.values(cart.items);
  if(items.length===0){list.innerHTML='<p class="muted">Cart is empty.</p>';el.appendChild(list);return}
  items.forEach(ci=>{
    const p = PRODUCTS.find(x=>x.id==ci.id);
    const row = document.createElement('div');row.className='cart-row';
    row.innerHTML = `<img src="${p.img}"><div style="flex:1"><div><strong>${p.name}</strong></div><div class="muted">$${p.price.toFixed(2)} each</div></div><div><input data-id="${p.id}" class="qty" type="number" min="1" value="${ci.qty}"></div><div style="width:120px;text-align:right">$${(p.price*ci.qty).toFixed(2)}</div><div><button data-id="${p.id}" class="remove">Remove</button></div>`;
    list.appendChild(row);
  });
  el.appendChild(list);
  const total = items.reduce((s,i)=>{const p=PRODUCTS.find(x=>x.id==i.id);return s + p.price*i.qty},0);
  const footer = document.createElement('div');footer.style.marginTop='12px';footer.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Total: $${total.toFixed(2)}</strong></div><div><button id="continue">Continue Shopping</button> <button id="to-checkout">Checkout</button></div></div>`;
  el.appendChild(footer);

  el.querySelectorAll('.qty').forEach(inp=>inp.addEventListener('change',e=>{const id=+e.target.dataset.id;const v=Math.max(1,parseInt(e.target.value||1));cart.items[id].qty=v;saveCart();renderCart();}));
  el.querySelectorAll('.remove').forEach(b=>b.addEventListener('click',e=>{const id=+e.target.dataset.id;delete cart.items[id];saveCart();renderCart();}));
  $('#continue').addEventListener('click',()=>showView('home'));
  $('#to-checkout').addEventListener('click',()=>showView('checkout'));
}

function renderCheckout(){const el = $('#checkout');el.innerHTML=`<h2>Checkout</h2><form id="checkout-form"><div style="max-width:500px"><label>Full name<br><input name="name" required></label><br><label>Email<br><input name="email" type="email" required></label><br><label>Address<br><textarea name="address" rows="3" required></textarea></label><br><div style="margin-top:12px"><button type="submit">Place Order</button> <button type="button" id="back-cart">Back to Cart</button></div></div></form>`;
  $('#back-cart').addEventListener('click',()=>showView('cart'));
  $('#checkout-form').addEventListener('submit',e=>{e.preventDefault();placeOrder(new FormData(e.target))});
}

function placeOrder(formData){const items = Object.values(cart.items);if(items.length===0){alert('Cart is empty');showView('home');return}
  const order = {id:Date.now(),customer:Object.fromEntries(formData.entries()),items,amount:items.reduce((s,i)=>{const p=PRODUCTS.find(x=>x.id==i.id);return s + p.price*i.qty},0)};
  const orders = JSON.parse(localStorage.getItem('monalisa_orders')||'[]');orders.push(order);localStorage.setItem('monalisa_orders',JSON.stringify(orders));cart={items:{}};saveCart();showConfirmation(order);
}

function showConfirmation(order){showView('confirmation');const el = $('#confirmation');el.innerHTML = `<h2>Thank you — order placed</h2><p>Order #${order.id}</p><p class="muted">We saved the order locally (demo).</p><div><button id="go-home">Continue Shopping</button></div>`;$('#go-home').addEventListener('click',()=>showView('home'))}

function flash(msg){const el = document.createElement('div');el.textContent=msg;el.style.position='fixed';el.style.right='20px';el.style.bottom='20px';el.style.background='#222';el.style.color='#fff';el.style.padding='8px 12px';el.style.borderRadius='8px';document.body.appendChild(el);setTimeout(()=>el.remove(),1400)}

document.addEventListener('DOMContentLoaded',()=>{
  renderHome();updateCartCount();
  $('#cart-btn').addEventListener('click',()=>showView('cart'));
  const searchEl = $('#search');
  if(searchEl){
    searchEl.addEventListener('input',e=>{window.currentCategory='';renderHome(e.target.value,'')});
  }

  initMegaNav();
  initDesignersPanel();
});

function initMegaNav(){
  const header = document.querySelector('.site-header');
  if(!header) return;

  const triggers = Array.from(document.querySelectorAll('.top-nav .nav-link[data-mega]'));
  const panels = Array.from(document.querySelectorAll('[data-mega-panel]'));
  if(triggers.length===0 || panels.length===0) return;

  const menuToggle = document.getElementById('menu-toggle');
  const mqMobile = window.matchMedia('(max-width: 900px)');

  let closeTimer = null;

  function isMobile(){
    return mqMobile.matches;
  }

  function clearCloseTimer(){
    if(closeTimer){
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function closeAll(){
    clearCloseTimer();
    header.classList.remove('nav-open');
    header.classList.remove('mobile-menu-open');
    panels.forEach(p=>p.classList.remove('is-open'));
    triggers.forEach(t=>{
      t.classList.remove('is-open');
      t.setAttribute('aria-expanded','false');
    });
    if(menuToggle) menuToggle.setAttribute('aria-expanded','false');
  }

  function openPanel(name){
    clearCloseTimer();
    header.classList.add('nav-open');
    panels.forEach(p=>p.classList.toggle('is-open',p.dataset.megaPanel===name));
    triggers.forEach(t=>{
      const isOpen = t.dataset.mega===name;
      t.classList.toggle('is-open',isOpen);
      t.setAttribute('aria-expanded',isOpen?'true':'false');
    });
  }

  function scheduleClose(){
    if(isMobile()) return;
    clearCloseTimer();
    closeTimer = setTimeout(closeAll,120);
  }

  function openMobileMenu(){
    header.classList.add('mobile-menu-open');
    header.classList.add('nav-open');
    if(menuToggle) menuToggle.setAttribute('aria-expanded','true');
  }

  function selectCategory(category){
    window.currentCategory = category || '';
    showView('home');
    const searchEl = document.getElementById('search');
    if(searchEl) searchEl.value = '';
  }

  triggers.forEach(t=>{
    t.setAttribute('aria-haspopup','true');
    t.setAttribute('aria-expanded','false');
    t.addEventListener('mouseenter',()=>{ if(!isMobile()) openPanel(t.dataset.mega); });
    t.addEventListener('focus',()=>{ if(!isMobile()) openPanel(t.dataset.mega); });
    t.addEventListener('click',e=>{
      e.preventDefault();

      const wasOpen = t.classList.contains('is-open');
      const megaName = t.dataset.mega;

      if(isMobile()) openMobileMenu();

      panels.forEach(p=>p.classList.remove('is-open'));
      triggers.forEach(x=>{
        x.classList.remove('is-open');
        x.setAttribute('aria-expanded','false');
      });

      if(wasOpen){
        header.classList.toggle('nav-open', isMobile());
        return;
      }

      openPanel(megaName);
    });
  });

  header.addEventListener('mouseenter',clearCloseTimer);
  header.addEventListener('mouseleave',scheduleClose);

  header.addEventListener('focusin',e=>{
    if(isMobile()) return;
    const t = e.target.closest('.nav-link[data-mega]');
    if(t) openPanel(t.dataset.mega);
  });

  header.addEventListener('focusout',e=>{
    if(!header.contains(e.relatedTarget)) scheduleClose();
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') closeAll();
  });

  document.addEventListener('click',e=>{
    if(!header.contains(e.target)) closeAll();
  });

  if(menuToggle){
    menuToggle.addEventListener('click',e=>{
      e.preventDefault();
      if(header.classList.contains('mobile-menu-open')) closeAll();
      else openMobileMenu();
    });
  }

  mqMobile.addEventListener('change',()=>{
    closeAll();
  });

  header.querySelectorAll('.mega-link[data-category]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      selectCategory(a.dataset.category || '');
      closeAll();
    });
  });
}

function initDesignersPanel(){
  const panel = document.querySelector('[data-mega-panel="designers"]');
  if(!panel) return;

  const groups = Array.from(panel.querySelectorAll('.designer-group[data-designer-group]'));
  const items = Array.from(panel.querySelectorAll('.designer-item[data-designer-group]'));
  if(groups.length===0 || items.length===0) return;

  function setGroup(group){
    groups.forEach(b=>b.classList.toggle('is-active',b.dataset.designerGroup===group));
    items.forEach(i=>i.classList.toggle('is-hidden',i.dataset.designerGroup!==group));
  }

  const initial = (groups.find(b=>b.classList.contains('is-active')) || groups[0]).dataset.designerGroup;
  setGroup(initial);

  groups.forEach(b=>{
    const group = b.dataset.designerGroup;
    b.addEventListener('mouseenter',()=>setGroup(group));
    b.addEventListener('focus',()=>setGroup(group));
    b.addEventListener('click',()=>setGroup(group));
  });
}
