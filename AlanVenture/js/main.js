/* AlanVenture — interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const isHome = document.body.dataset.page === 'home';
  const store = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} }
  };
  const mouse = { x: 0, y: 0, nx: 0, ny: 0 };

  /* ---------- split text into animated characters ---------- */
  function splitChars() {
    $$('[data-split]').forEach(el => {
      const txt = el.textContent;
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      let i = 0;
      [...txt].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i++);
        s.textContent = c === ' ' ? ' ' : c;
        el.appendChild(s);
      });
    });
  }

  /* ---------- loader ---------- */
  function runLoader(loader, duration) {
    return new Promise(res => {
      const pct = $('#pct', loader), ring = $('.ring-fg', loader), msg = $('#lmsg', loader);
      const C = 2 * Math.PI * 92;
      ring.style.strokeDasharray = C;
      ring.style.strokeDashoffset = C;
      const msgs = ['Packing gear', 'Reading the map', 'Checking the compass', 'Lighting the camp', 'Summit in sight'];
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min(1, (t - t0) / duration);
        const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const v = Math.round(e * 100);
        pct.textContent = v;
        ring.style.strokeDashoffset = C * (1 - e);
        msg.textContent = msgs[Math.min(msgs.length - 1, Math.floor(e * msgs.length))] + '…';
        if (p < 1) requestAnimationFrame(tick); else setTimeout(res, 350);
      })(t0);
    });
  }

  function showIntro() {
    const intro = $('#intro');
    if (!intro) return ready();
    intro.classList.add('show');
    let gone = false;
    const begin = () => {
      if (gone) return; gone = true;
      store.set('av_intro', '1');
      intro.classList.add('leave');
      setTimeout(() => { intro.remove(); document.body.classList.remove('is-loading'); ready(); }, 1500);
    };
    $('#beginBtn').addEventListener('click', begin);
    addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(); } });
    // intro parallax
    const layers = $$('.intro .layer');
    const move = e => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      layers.forEach(l => { const d = +l.dataset.d; l.style.transform = `translate3d(${-x * d}px,${-y * d * .5}px,0)`; });
    };
    addEventListener('pointermove', move);
  }

  function boot() {
    const loader = $('#loader');
    if (!loader) return ready();
    if (store.get('av_loaded')) { loader.remove(); const i = $('#intro'); if (i) i.remove(); return ready(); }
    document.body.classList.add('is-loading');
    runLoader(loader, reduce ? 300 : (isHome ? 3000 : 1800)).then(() => {
      store.set('av_loaded', '1');
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 1300);
      if (isHome && !store.get('av_intro')) showIntro();
      else { const i = $('#intro'); if (i) i.remove(); document.body.classList.remove('is-loading'); ready(); }
    });
  }

  /* ---------- after loader/intro ---------- */
  let isReady = false;
  function ready() {
    if (isReady) return; isReady = true;
    document.body.classList.add('is-ready');
    reveal(); counters(); typed(); scrambleHeads();
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
    $$('.tl').forEach(el => io.observe(el));
    $$('.gear').forEach(el => io.observe(el));
    // rings
    const rio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const r = e.target, target = +r.dataset.p, t0 = performance.now();
      (function a(t) {
        const p = Math.min(1, (t - t0) / 1600), v = (1 - Math.pow(1 - p, 3)) * target;
        r.style.setProperty('--p', v);
        $('b', r).textContent = Math.round(v) + '%';
        if (p < 1) requestAnimationFrame(a);
      })(t0);
      rio.unobserve(r);
    }), { threshold: .6 });
    $$('.ring').forEach(r => rio.observe(r));
  }

  /* ---------- counters ---------- */
  function counters() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
      (function a(t) {
        const p = Math.min(1, (t - t0) / 1800);
        el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * end) + suf;
        if (p < 1) requestAnimationFrame(a);
      })(t0);
      io.unobserve(el);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => io.observe(el));
  }

  /* ---------- typed roles ---------- */
  function typed() {
    const el = $('.typed'); if (!el) return;
    const words = JSON.parse(el.dataset.words);
    let w = 0, c = 0, del = false;
    (function loop() {
      const word = words[w];
      el.textContent = word.slice(0, c);
      let wait = del ? 38 : 85;
      if (!del && c === word.length) { del = true; wait = 1600; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
      else c += del ? -1 : 1;
      setTimeout(loop, wait);
    })();
  }

  /* ---------- text scramble ---------- */
  function scramble(el) {
    const txt = el.dataset.text || el.textContent;
    el.dataset.text = txt;
    const chars = '!<>-_\\/[]{}—=+*^?#ABCXYZ01';
    const t0 = performance.now(), dur = 900;
    (function f(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = [...txt].map((c, i) => c === ' ' ? ' ' : (i < p * txt.length ? c : chars[Math.floor(Math.random() * chars.length)])).join('');
      if (p < 1) requestAnimationFrame(f); else el.textContent = txt;
    })(t0);
  }
  function scrambleHeads() {
    if (reduce) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { setTimeout(() => scramble(e.target), 250); io.unobserve(e.target); }
    }), { threshold: .5 });
    $$('.scramble').forEach(el => io.observe(el));
    $$('.menu a').forEach(a => a.addEventListener('mouseenter', () => { if (!a.classList.contains('cta')) scramble(a); }));
  }

  /* ---------- starfield + shooting stars ---------- */
  function sky() {
    const cv = $('#sky'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, dpr, stars = [], shoots = [], embers = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      const n = Math.round((innerWidth * innerHeight) / (innerWidth < 700 ? 9000 : 6500));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1,
        r: (Math.random() * 1.4 + .3) * dpr, tw: Math.random() * Math.PI * 2, sp: Math.random() * .02 + .005
      }));
      embers = Array.from({ length: innerWidth < 700 ? 10 : 22 }, () => ({
        x: Math.random() * W, y: Math.random() * H, v: Math.random() * .4 + .15, r: (Math.random() * 1.6 + .6) * dpr, ph: Math.random() * 6
      }));
    };
    size(); addEventListener('resize', size);
    let sm = { x: 0, y: 0 };
    const frame = t => {
      sm.x += (mouse.nx - sm.x) * .04; sm.y += (mouse.ny - sm.y) * .04;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.tw += s.sp;
        const a = .35 + Math.sin(s.tw) * .35 + s.z * .3;
        const x = (s.x - sm.x * 40 * s.z * dpr + W) % W, y = (s.y - sm.y * 28 * s.z * dpr + H) % H;
        ctx.globalAlpha = Math.max(.05, Math.min(1, a));
        ctx.fillStyle = s.z > .8 ? '#ffe2b0' : '#cfe0ff';
        ctx.beginPath(); ctx.arc(x, y, s.r * s.z + .2, 0, 6.283); ctx.fill();
      }
      // embers rising (campfire sparks)
      for (const e of embers) {
        e.y -= e.v * dpr; e.ph += .02; e.x += Math.sin(e.ph) * .3 * dpr;
        if (e.y < -10) { e.y = H + 10; e.x = Math.random() * W; }
        ctx.globalAlpha = .35;
        ctx.fillStyle = '#ffb347';
        ctx.shadowColor = '#ff7a45'; ctx.shadowBlur = 12 * dpr;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (!reduce && Math.random() < .004 && shoots.length < 2) {
        shoots.push({ x: Math.random() * W * .8, y: Math.random() * H * .4, l: 0, vx: (6 + Math.random() * 4) * dpr, vy: (2.5 + Math.random() * 2) * dpr });
      }
      shoots = shoots.filter(s => s.l < 60);
      for (const s of shoots) {
        s.l++; s.x += s.vx; s.y += s.vy;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,179,71,0)');
        ctx.globalAlpha = 1 - s.l / 60; ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- custom cursor ---------- */
  function cursor() {
    if (!fine) return;
    document.body.classList.add('has-cursor');
    const ring = document.createElement('div'), dot = document.createElement('div');
    ring.className = 'cursor'; dot.className = 'cursor-dot';
    document.body.append(ring, dot);
    let rx = 0, ry = 0;
    addEventListener('pointermove', e => {
      ring.classList.add('on'); dot.classList.add('on');
      dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    (function f() { rx += (mouse.x - rx) * .16; ry += (mouse.y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)${ring.classList.contains('down') ? ' scale(.8)' : ''}`; requestAnimationFrame(f); })();
    document.addEventListener('pointerover', e => { if (e.target.closest('a,button,[data-tilt],.flip,.trait,input,textarea,.sphere')) ring.classList.add('hover'); });
    document.addEventListener('pointerout', e => { if (e.target.closest('a,button,[data-tilt],.flip,.trait,input,textarea,.sphere')) ring.classList.remove('hover'); });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
    document.addEventListener('mouseleave', () => { ring.classList.remove('on'); dot.classList.remove('on'); });
  }

  /* ---------- 3D tilt ---------- */
  function tilt() {
    if (!fine || reduce) return;
    $$('[data-tilt]').forEach(el => {
      const max = +el.dataset.tilt || 10;
      el.classList.add('tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add('moving');
        el.style.setProperty('--ry', ((px - .5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100) + '%');
        el.style.setProperty('--my', (py * 100) + '%');
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('moving');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  function magnetic() {
    if (!fine || reduce) return;
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px,${(e.clientY - r.top - r.height / 2) * .38}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- ripple ---------- */
  function ripple() {
    document.addEventListener('click', e => {
      const b = e.target.closest('.btn'); if (!b) return;
      const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
      const i = document.createElement('span');
      i.className = 'ripple';
      i.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      b.appendChild(i); setTimeout(() => i.remove(), 750);
    });
  }

  /* ---------- parallax layers (mouse) ---------- */
  function parallax() {
    addEventListener('pointermove', e => { mouse.nx = e.clientX / innerWidth - .5; mouse.ny = e.clientY / innerHeight - .5; });
    if (!fine || reduce) return;
    const els = $$('[data-parallax]'); if (!els.length) return;
    let cx = 0, cy = 0;
    (function f() {
      cx += (mouse.nx - cx) * .07; cy += (mouse.ny - cy) * .07;
      els.forEach(el => { const d = +el.dataset.parallax; el.style.translate = `${-cx * d}px ${-cy * d}px`; });
      requestAnimationFrame(f);
    })();
  }

  /* ---------- nav, progress, altimeter, timeline fill ---------- */
  function scrollFx() {
    const nav = $('.nav'), bar = $('.trail b'), alt = $('#altVal'), dot = $('.altimeter .bar i'), fill = $('.line-fill'), tl = $('.timeline');
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      nav.classList.toggle('scrolled', scrollY > 30);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (alt) alt.textContent = Math.round(p * 8848).toLocaleString() + ' m';
      if (dot) dot.style.bottom = `calc(${p * 100}% - 5px)`;
      if (fill && tl) {
        const r = tl.getBoundingClientRect();
        const h = Math.min(r.height, Math.max(0, innerHeight * .6 - r.top));
        fill.style.height = h + 'px';
      }
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    const burger = $('.burger'), menu = $('.menu');
    if (burger) burger.addEventListener('click', () => {
      const o = burger.classList.toggle('open'); menu.classList.toggle('open', o);
      burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : '';
    });
  }

  /* ---------- page transitions ---------- */
  function transitions() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      const href = a.getAttribute('href');
      if (!href || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || /^(mailto:|tel:|#|https?:)/.test(href)) return;
      e.preventDefault();
      if (a.dataset.replay !== undefined) { store.del('av_intro'); store.del('av_loaded'); }
      document.body.classList.add('leaving');
      setTimeout(() => { location.href = href; }, reduce ? 0 : 700);
    });
    addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });
  }

  /* ---------- 3D skill sphere ---------- */
  function sphere() {
    const el = $('#sphere'); if (!el) return;
    const tags = $$('.sphere-tag', el), n = tags.length;
    let pts = tags.map((_, i) => {
      const phi = Math.acos(1 - 2 * (i + .5) / n), th = Math.PI * (1 + Math.sqrt(5)) * (i + .5);
      return [Math.cos(th) * Math.sin(phi), Math.sin(th) * Math.sin(phi), Math.cos(phi)];
    });
    let vx = .004, vy = .006, drag = false, lx = 0, ly = 0;
    const base = { x: .0025, y: .005 };
    el.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointerup', () => drag = false);
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      vy = (e.clientX - lx) * .0009; vx = -(e.clientY - ly) * .0009; lx = e.clientX; ly = e.clientY;
    });
    (function f() {
      const R = el.clientWidth * .39;
      const cx = Math.cos(vx), sx = Math.sin(vx), cy = Math.cos(vy), sy = Math.sin(vy);
      pts = pts.map(([x, y, z]) => {
        let y1 = y * cx - z * sx, z1 = y * sx + z * cx;
        let x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
        return [x2, y1, z2];
      });
      pts.forEach((p, i) => {
        const s = (p[2] + 2.2) / 3.2, op = .25 + (p[2] + 1) / 2 * .75;
        tags[i].style.transform = `translate(-50%,-50%) translate3d(${p[0] * R}px,${p[1] * R}px,0) scale(${s})`;
        tags[i].style.opacity = op; tags[i].style.zIndex = Math.round(p[2] * 100) + 100;
      });
      if (!drag) { vx += (base.x - vx) * .02; vy += (base.y - vy) * .02; }
      if (reduce) { vx = vy = 0; }
      requestAnimationFrame(f);
    })();
  }

  /* ---------- flip cards (touch support) ---------- */
  function flips() { $$('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('on'))); }

  /* ---------- contact form -> mailto ---------- */
  function form() {
    const f = $('#contactForm'); if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(f);
      const subject = encodeURIComponent(d.get('subject') || 'Hello from your portfolio');
      const body = encodeURIComponent(`${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`);
      const t = $('#toast');
      t.textContent = 'Opening your email app…'; t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3200);
      location.href = `mailto:${f.dataset.to}?subject=${subject}&body=${body}`;
    });
  }

  /* ---------- init ---------- */
  splitChars();
  sky(); cursor(); parallax(); tilt(); magnetic(); ripple(); scrollFx(); transitions(); sphere(); flips(); form();
  boot();
})();
