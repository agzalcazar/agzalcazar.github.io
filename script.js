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

    // Deterministic PRNG: the field is identical on every load, so the page
    // never looks like it reshuffled itself between visits.
    function rng(seed) {
      return function () {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
    }

    // Positions are normalised, so a resize re-renders without rebuilding
    // (and therefore without moving any star).
    var stars = [];
    var nebulae = [];

    (function build() {
      var rand = rng(20260913);
      for (var i = 0; i < 200; i++) {
        // Skewed so bright sources stay rare, as in a real magnitude distribution.
        var mag = Math.pow(rand(), 2.6);
        stars.push({
          x: rand(),
          y: rand(),
          mag: mag,
          accent: rand() > 0.88,
          phase: rand() * Math.PI * 2,
          speed: 0.25 + rand() * 0.75,
          twinkles: rand() > 0.45
        });
      }
      for (var g = 0; g < 10; g++) {
        nebulae.push({
          x: rand(), y: rand(),
          r: 16 + rand() * 34,
          squash: 0.45 + rand() * 0.4,
          rot: rand() * Math.PI,
          a: rand()
        });
      }
    })();

    var w = 0, h = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = sky.offsetWidth;
      h = sky.offsetHeight;
      sky.width = Math.round(w * dpr);
      sky.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render(t) {
      if (!w || !h) return;

      var dark = currentTheme() === 'dark';
      var css = getComputedStyle(document.documentElement);
      var accent = css.getPropertyValue('--accent').trim() || '#0a8';
      // Light theme is a photographic plate, not a faded night sky: on a glass
      // negative the stars are DARK and the brighter ones burn a LARGER blob.
      var ink = dark ? '#cfd3d8' : '#1b1d21';

      // Very slow drift on two incommensurate periods, so the field never
      // visibly repeats a position.
      var dx = Math.sin(t / 38000) * 14;
      var dy = Math.cos(t / 61000) * 10;

      ctx.clearRect(0, 0, w, h);

      for (var n = 0; n < nebulae.length; n++) {
        var g = nebulae[n];
        if (!dark && n >= 5) continue;
        var gx = g.x * w + dx * 0.45;
        var gy = g.y * h + dy * 0.45;
        var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.r);
        grad.addColorStop(0, dark ? accent : ink);
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = dark ? 0.05 + g.a * 0.05 : 0.030 + g.a * 0.026;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(gx, gy, g.r, g.r * g.squash, g.rot, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var sx = st.x * w + dx;
        var sy = st.y * h + dy;

        // Scintillation: a slow breath on alpha, not a strobe.
        var tw = st.twinkles && !reduceMotion
          ? 0.62 + 0.38 * Math.sin(t / 1000 * st.speed + st.phase)
          : 1;

        // Floors matter more than ceilings here: most sources are faint, and
        // a sub-pixel dot at 13% alpha simply does not render on cream.
        var r = dark ? 0.45 + st.mag * 1.8 : 0.75 + st.mag * 2.2;
        var a = (dark ? 0.18 + st.mag * 0.55 : 0.24 + st.mag * 0.46) * tw;

        ctx.fillStyle = st.accent ? accent : ink;

        // Brightest sources get a soft bloom — emulsion halation on the
        // plate, atmospheric seeing on the sky. Kept rarer and tighter on
        // light, where a wide halo reads as a smudge over the copy.
        if (st.mag > (dark ? 0.62 : 0.78)) {
          ctx.globalAlpha = a * (dark ? 0.16 : 0.08);
          ctx.beginPath();
          ctx.arc(sx, sy, r * (dark ? 3.6 : 2.4), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      sky.classList.add('in');
    }

    var raf = null;
    var running = false;

    function frame(now) {
      render(now);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    render(performance.now());

    // Animate only while the hero is on screen, and never in a hidden tab.
    // The observer is held in a variable on purpose: an unreferenced one can
    // be collected before it ever fires, which silently kills the loop.
    start();

    var hero = document.querySelector('.hero');
    var heroWatch = null;
    if (hero && 'IntersectionObserver' in window) {
      heroWatch = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          entries[i].isIntersecting ? start() : stop();
        }
      }, { threshold: 0 });
      heroWatch.observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        render(performance.now());
      }, 180);
    });

    if (toggle) toggle.addEventListener('click', function () {
      setTimeout(function () { render(performance.now()); }, 30);
    });

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
