;(function () {
  'use strict';

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

  /* ---- Hero parallax ---- */
  var heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          heroArt.style.transform = 'translateY(' + (window.scrollY * 0.09) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
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
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) translateY(-5px)';
        card.style.transition = 'border-color .15s, box-shadow .15s';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = '';
      });
    });
  }

  /* ---- Magnetic buttons (desktop only) ---- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn:not(.sm):not(.block)').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.2;
        var y = (e.clientY - r.top - r.height / 2) * 0.2;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

})();
