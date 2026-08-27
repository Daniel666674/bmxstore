;(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Page loader ---- */
  const loader = document.createElement('div');
  loader.id = 'stike-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = '<div class="loader-inner"><div class="loader-ring"></div><span class="loader-text">STIKE</span></div>';
  if (document.body) document.body.insertBefore(loader, document.body.firstChild);
  window.addEventListener('load', function () {
    loader.classList.add('done');
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 700);
  });

  /* ---- Scroll progress bar ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  if (document.body) document.body.appendChild(bar);
  var barTick = false;
  window.addEventListener('scroll', function () {
    if (barTick) return;
    barTick = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      barTick = false;
    });
  }, { passive: true });

  /* ---- Volver arriba ---- */
  var backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Volver arriba');
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  if (document.body) document.body.appendChild(backToTop);
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  var backToTopTick = false;
  window.addEventListener('scroll', function () {
    if (backToTopTick) return;
    backToTopTick = true;
    requestAnimationFrame(function () {
      backToTop.classList.toggle('show', window.scrollY > 600);
      backToTopTick = false;
    });
  }, { passive: true });

  /* ---- Auto-tag more elements so the whole site animates ---- */
  document.querySelectorAll('.section-head, .cta-band .wrap, .tl-item, .map-embed, .contact-card, .about-hero > div, .pdp-info, .pdp-gallery')
    .forEach(function (el) { el.classList.add('reveal'); });
  document.querySelectorAll('.brand-grid, .ig-grid, .values, .props, .subcat-chips')
    .forEach(function (el) { el.classList.add('stagger'); });

  /* ---- Scroll reveal ---- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  /* ---- Stagger ---- */
  var staggerObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var children = Array.prototype.slice.call(e.target.children);
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 72) + 'ms';
        child.classList.add('in');
      });
      staggerObs.unobserve(e.target);
    });
  }, { threshold: 0.06 });

  function observeAll() {
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });
    document.querySelectorAll('.stagger').forEach(function (el) { staggerObs.observe(el); });
  }
  observeAll();

  /* ---- Hero parallax (copy drifts up + fades on scroll) ---- */
  var heroCopy = document.querySelector('.hero-copy');
  if (heroCopy && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroCopy.style.transform = 'translateY(' + (y * 0.16) + 'px)';
          heroCopy.style.opacity = Math.max(0, 1 - y / 620);
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Stat counters ---- */
  var statObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var b = entry.target.querySelector('b');
      if (!b || b.dataset.done) return;
      b.dataset.done = '1';
      var raw = b.textContent;
      var m = raw.match(/[\d.]+/);
      if (!m) return;
      var num = parseFloat(m[0]);
      var pre = raw.slice(0, m.index);
      var suf = raw.slice(m.index + m[0].length);
      var dur = 1600;
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min((t - t0) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        b.textContent = pre + Math.round(ease * num) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
      statObs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat').forEach(function (el) { statObs.observe(el); });

  /* ---- Glitch ---- */
  document.querySelectorAll('.glitch').forEach(function (el) {
    el.dataset.text = el.textContent;
    var interval = Math.random() * 3500 + 2000;
    setInterval(function () {
      el.classList.add('glitching');
      setTimeout(function () { el.classList.remove('glitching'); }, 240);
    }, interval);
  });

  /* ---- 3D card tilt (desktop only) ---- */
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg) translateY(-8px)';
        card.style.transition = 'border-color .2s, box-shadow .2s';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = '';
      });
    });
  }

  /* ---- Magnetic buttons (desktop only) ---- */
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    document.querySelectorAll('.btn:not(.sm):not(.block)').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.3;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.04)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

})();
