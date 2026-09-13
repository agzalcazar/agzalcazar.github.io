(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------------------------------------------------------- theme */

  function systemIsDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return systemIsDark() ? 'dark' : 'light';
  }

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      toggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  /* ------------------------------------------------- scroll reveals */

  var reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 45 + 'ms';
      io.observe(el);
    });
  }

  /* -------------------------------------------- sticky header hairline */

  var topbar = document.querySelector('.topbar');
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle('stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------ active nav link */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-64px 0px -70% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------- deep sky field */

  var sky = document.querySelector('.skyfield');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (sky && sky.getContext) {
    var ctx = sky.getContext('2d');

    // Deterministic PRNG so the field is identical on every load and the
    // page never looks like it reshuffled between visits.
    function rng(seed) {
      return function () {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
    }

    function drawSky() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = sky.offsetWidth;
      var h = sky.offsetHeight;
      if (!w || !h) return;

      sky.width = Math.round(w * dpr);
      sky.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var css = getComputedStyle(document.documentElement);
      var star = css.getPropertyValue('--ink-3').trim() || '#888';
      var accent = css.getPropertyValue('--accent').trim() || '#0a8';
      var rand = rng(20260913);
      var dark = currentTheme() === 'dark';

      // Faint extended sources first, so point sources sit on top. They are
      // dialled right down on a light background, where a tinted blur reads
      // as a smudge rather than as depth.
      for (var g = 0, gn = dark ? 9 : 5; g < gn; g++) {
        var gx = rand() * w;
        var gy = rand() * h;
        var gr = 14 + rand() * 30;
        var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0, accent);
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = dark ? 0.05 + rand() * 0.05 : 0.016 + rand() * 0.018;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(gx, gy, gr, gr * (0.45 + rand() * 0.4), rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var i = 0; i < 170; i++) {
        var x = rand() * w;
        var y = rand() * h;
        var r = 0.4 + rand() * 1.5;
        ctx.globalAlpha = dark ? 0.12 + rand() * 0.42 : 0.10 + rand() * 0.26;
        ctx.fillStyle = rand() > 0.86 ? accent : star;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      sky.classList.add('in');
    }

    drawSky();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawSky, 180);
    });

    // The palette changes with the theme, so repaint after a toggle.
    if (toggle) toggle.addEventListener('click', function () { setTimeout(drawSky, 30); });

    if (!reduceMotion) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          sky.style.transform = 'translate3d(0,' + (window.scrollY * 0.18).toFixed(1) + 'px,0)';
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ----------------------------------------------------- portrait */

  // Shown only once the file actually loads, so a missing portrait.jpg
  // leaves no broken image behind.
  var portraitFig = document.querySelector('.portrait-fig');
  var portrait = portraitFig && portraitFig.querySelector('img');
  if (portrait) {
    var showPortrait = function () {
      portraitFig.hidden = false;
      portraitFig.classList.add('in');
    };
    if (portrait.complete && portrait.naturalWidth > 0) showPortrait();
    else portrait.addEventListener('load', showPortrait);
  }

  /* ------------------------------------------------------------ misc */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
