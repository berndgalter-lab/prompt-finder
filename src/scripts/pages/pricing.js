// Pricing page interactivity: billing toggle, Lemon Squeezy checkout wiring, and return URL capture
(function(){
  const cfgEl = document.getElementById('pf-pricing-config');
  let CFG = { currency:'EUR', plans:{}, user:{ id:0, email:'', name:''}, returnUrl: location.href };
  try { if (cfgEl) CFG = JSON.parse(cfgEl.textContent || '{}'); } catch(e){}

  const root = document.querySelector('.pf-pricing-page');
  if (!root) return;

  // Load Lemon script once if not present
  if (!window.LemonSqueezy) {
    const s = document.createElement('script');
    s.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    s.async = true; document.head.appendChild(s);
  }

  // Persist and restore billing mode
  const toggle = document.querySelector('.pf-billing-toggle');
  const btns   = toggle ? toggle.querySelectorAll('.pf-toggle-btn') : [];
  const setMode = (mode) => {
    if (!toggle) return;
    toggle.setAttribute('data-billing', mode);
    btns.forEach(b => {
      const active = b.dataset.billing === mode;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
      b.setAttribute('aria-pressed', String(active));
      b.setAttribute('tabindex', active ? '0' : '-1');
    });
    // Prices visibility
    document.querySelectorAll('[data-monthly],[data-annual],[data-per]').forEach(el => {
      if (el.hasAttribute('data-monthly')) el.style.display = (mode === 'monthly') ? '' : 'none';
      if (el.hasAttribute('data-annual')) el.style.display = (mode === 'annual') ? '' : 'none';
      if (el.hasAttribute('data-per')) el.textContent = (mode === 'annual') ? '/ year' : '/ month';
    });
    try { localStorage.setItem('pf_billing', mode); } catch(e){}
  };

  const saved = (()=>{ try { return localStorage.getItem('pf_billing'); } catch(e){ return null; }})();
  setMode(saved || 'monthly');
  btns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.billing)));
  toggle && toggle.addEventListener('keydown', (e) => {
    if (!['ArrowLeft','ArrowRight','Enter',' '].includes(e.key)) return;
    const arr = Array.from(btns);
    const idx = arr.findIndex(b => b.classList.contains('is-active'));
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % arr.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + arr.length) % arr.length;
    if (e.key === 'Enter' || e.key === ' ') arr[idx].click(); else arr[next].focus();
  });

  // Capture last visited workflow as potential return URL (optional)
  try {
    const cookie = document.cookie.split('; ').find(r => r.startsWith('pf_return_url='));
    if (!cookie && document.referrer && /\/workflows\//.test(document.referrer)) {
      document.cookie = 'pf_return_url=' + encodeURIComponent(document.referrer) + '; path=/; max-age=' + (60*60*24*7);
    }
  } catch(e){}

  // Checkout wiring
  function openCheckout(plan, interval){
    const p = CFG.plans[plan];
    if (!p) return;
    const variant = interval === 'annual' ? (p.variant_annual || p.variant_month) : p.variant_month;
    const params = new URLSearchParams();
    if (CFG.user && CFG.user.email) params.set('checkout[email]', CFG.user.email);
    if (CFG.user && CFG.user.name)  params.set('checkout[name]', CFG.user.name);
    if (CFG.user && CFG.user.id)    params.set('checkout[custom][user_id]', String(CFG.user.id));
    params.set('checkout[custom][plan]', plan);
    if (CFG.returnUrl) params.set('checkout[success_url]', CFG.returnUrl);
    const url = `https://app.lemonsqueezy.com/checkout/buy/${variant}?` + params.toString();
    try { window.LemonSqueezy && window.LemonSqueezy.Url.Open(url); }
    catch(e){ window.open(url, '_blank'); }
  }

  root.querySelectorAll('.js-checkout').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      const mode = (localStorage.getItem('pf_billing') || 'monthly');
      // Update analytics attribute to reflect interval
      const analyticsBase = `cta-${plan}-${mode === 'annual' ? 'yearly' : 'monthly'}`;
      btn.setAttribute('data-analytics', analyticsBase);
      openCheckout(plan, mode === 'annual' ? 'annual' : 'monthly');
    });
  });
})();


