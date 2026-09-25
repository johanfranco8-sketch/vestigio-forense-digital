/* ==========================================================
   VESTIGIO · Informática Forense
   Lógica de interfaz + medidas de seguridad del lado cliente
   ========================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Seguridad: enlaces externos sin acceso a window.opener ---------- */
  $$('a[href^="http"]').forEach(function (a) {
    if (a.hostname !== window.location.hostname) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  /* ---------- Tema claro / oscuro ---------- */
  var themeBtn = $('#theme-toggle');
  var metaTheme = $('meta[name="theme-color"]');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#07090d' : '#f4f6f8');
  }
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Menú móvil ---------- */
  var menuBtn = $('#menu-toggle');
  var nav = $('#main-nav');
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    doc.body.style.overflow = '';
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      doc.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });
  }

  /* ---------- Header con scroll + botón subir + enlace activo ---------- */
  var header = $('.site-header');
  var toTop = $('#to-top');
  var navLinks = $$('.main-nav ul a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 700);
    var current = null;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight * 0.35) current = s; });
    navLinks.forEach(function (a) { a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id); });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- Revelado al hacer scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Contadores ---------- */
  var counters = $$('.counter');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (reduceMotion) { el.textContent = target.toLocaleString('es-CO'); return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('es-CO');
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCounter(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(animateCounter); }

  /* ---------- Brillo que sigue al cursor en tarjetas ---------- */
  $$('.service').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Terminal animada (sin innerHTML con datos externos) ---------- */
  var term = $('#terminal-body');
  var script = [
    [['p', '$ '], ['', 'lsblk -o NAME,SIZE,MODEL /dev/sdb']],
    [['c', 'sdb  476.9G  Samsung SSD 860 EVO']],
    [['p', '$ '], ['', 'wblock --enable /dev/sdb']],
    [['ok', '[OK] '], ['', 'Bloqueador de escritura activo']],
    [['p', '$ '], ['', 'dc3dd if=/dev/sdb hof=caso0417.e01 hash=sha256']],
    [['c', '512000 MB copiados · 0 errores · 00:41:07']],
    [['h', 'sha256 src  '], ['', '9f2c4e1a7b...d03e88']],
    [['h', 'sha256 img  '], ['', '9f2c4e1a7b...d03e88']],
    [['ok', '[OK] '], ['', 'Integridad verificada · hashes coinciden']],
    [['p', '$ '], ['', 'custodia --sellar caso0417 --perito JF-042']],
    [['w', '[!]  '], ['', 'Registro firmado 2026-09-25T14:03:11-05:00']],
    [['ok', '[OK] '], ['', 'Evidencia lista para análisis']]
  ];
  function renderStatic() {
    term.textContent = '';
    script.forEach(function (line) {
      line.forEach(function (seg) {
        var s = doc.createElement('span');
        if (seg[0]) s.className = seg[0];
        s.textContent = seg[1];
        term.appendChild(s);
      });
      term.appendChild(doc.createTextNode('\n'));
    });
  }
  if (term) {
    if (reduceMotion) { renderStatic(); }
    else {
      var cursor = doc.createElement('span');
      cursor.className = 'cursor';
      var li = 0, si = 0, ci = 0, span = null;
      var typeLine = function () {
        if (li >= script.length) {
          term.appendChild(cursor);
          window.setTimeout(function () { term.textContent = ''; li = 0; si = 0; ci = 0; span = null; typeLine(); }, 5200);
          return;
        }
        var line = script[li];
        var seg = line[si];
        var isCmd = line[0][0] === 'p' && si === 1;
        if (!span) {
          span = doc.createElement('span');
          if (seg[0]) span.className = seg[0];
          term.appendChild(span);
          term.appendChild(cursor);
        }
        if (isCmd && ci < seg[1].length) {
          span.textContent += seg[1].charAt(ci++);
          window.setTimeout(typeLine, 18 + Math.random() * 40);
          return;
        }
        if (!isCmd) span.textContent = seg[1];
        si++; ci = 0; span = null;
        if (si >= line.length) {
          term.insertBefore(doc.createTextNode('\n'), cursor);
          li++; si = 0;
          window.setTimeout(typeLine, isCmd ? 380 : 140);
        } else { typeLine(); }
      };
      typeLine();
    }
  }

  /* ---------- Lluvia de caracteres (canvas) ---------- */
  var canvas = $('#matrix');
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var chars = '01ABCDEF#$%<>/{}[]'.split('');
    var fontSize = 14, cols = 0, drops = [], w = 0, h = 0, last = 0;
    var resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / fontSize);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    };
    var draw = function (ts) {
      if (doc.hidden) { window.requestAnimationFrame(draw); return; }
      if (ts - last > 60) {
        last = ts;
        var rgb = getComputedStyle(root).getPropertyValue('--matrix-color').trim() || '51, 227, 155';
        var bg = getComputedStyle(root).getPropertyValue('--bg').trim() || '#07090d';
        ctx.globalAlpha = 0.12; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1; ctx.fillStyle = 'rgb(' + rgb + ')';
        ctx.font = fontSize + 'px JetBrains Mono, monospace';
        for (var i = 0; i < cols; i++) {
          ctx.fillText(chars[(Math.random() * chars.length) | 0], i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 1;
        }
      }
      window.requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    window.requestAnimationFrame(draw);
  }

  /* ---------- Verificador SHA-256 local ---------- */
  var fileInput = $('#hash-file');
  var dropzone = $('#dropzone');
  var hashOut = $('#hash-out'), hashName = $('#hash-name'), hashSize = $('#hash-size');
  var expected = $('#hash-expected'), compareStatus = $('#compare-status'), copyBtn = $('#hash-copy');
  var currentHash = '';
  var MAX_BYTES = 200 * 1024 * 1024;

  function fmtBytes(b) {
    var u = ['B', 'KB', 'MB', 'GB']; var i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return b.toFixed(i ? 2 : 0) + ' ' + u[i];
  }
  function compare() {
    var v = (expected.value || '').trim().toLowerCase().replace(/[^a-f0-9]/g, '');
    compareStatus.className = 'compare-status';
    if (!v || !currentHash) { compareStatus.textContent = ''; return; }
    if (v.length !== 64) { compareStatus.textContent = 'Un SHA-256 tiene 64 caracteres hexadecimales (' + v.length + '/64).'; return; }
    if (v === currentHash) { compareStatus.textContent = '✔ Coincide · integridad verificada'; compareStatus.classList.add('match'); }
    else { compareStatus.textContent = '✖ No coincide · el archivo pudo ser alterado'; compareStatus.classList.add('nomatch'); }
  }
  function handleFile(file) {
    if (!file) return;
    hashName.textContent = file.name.slice(0, 120);
    hashSize.textContent = fmtBytes(file.size);
    currentHash = ''; copyBtn.disabled = true;
    if (file.size > MAX_BYTES) { hashOut.textContent = 'Archivo demasiado grande para el navegador (máx. 200 MB).'; return; }
    if (!window.crypto || !window.crypto.subtle) { hashOut.textContent = 'Su navegador no soporta Web Crypto (requiere HTTPS).'; return; }
    hashOut.textContent = 'Calculando…';
    file.arrayBuffer().then(function (buf) {
      return window.crypto.subtle.digest('SHA-256', buf);
    }).then(function (digest) {
      currentHash = Array.prototype.map.call(new Uint8Array(digest), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      hashOut.textContent = currentHash;
      copyBtn.disabled = false;
      compare();
    }).catch(function () { hashOut.textContent = 'No se pudo leer el archivo.'; });
  }
  if (fileInput && dropzone) {
    fileInput.addEventListener('change', function () { handleFile(fileInput.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove('drag'); });
    });
    dropzone.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    expected.addEventListener('input', compare);
    copyBtn.addEventListener('click', function () {
      if (!currentHash || !navigator.clipboard) return;
      navigator.clipboard.writeText(currentHash).then(function () {
        copyBtn.textContent = 'Copiado';
        window.setTimeout(function () { copyBtn.textContent = 'Copiar'; }, 1600);
      });
    });
  }

  /* ---------- Formulario: validación, saneamiento y antispam ---------- */
  var form = $('#contact-form');
  if (form) {
    var status = $('#form-status');
    var submitBtn = $('#f-submit');
    var msg = $('#f-msg');
    var msgCount = $('#msg-count');
    var loadedAt = Date.now();
    var lastSubmit = 0;
    var RATE_MS = 60 * 1000;

    // Elimina etiquetas, caracteres de control y espacios sobrantes
    var sanitize = function (str, max) {
      return String(str || '')
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/[<>]/g, '')
        .replace(/\s{3,}/g, '  ')
        .trim()
        .slice(0, max);
    };
    var rules = {
      'f-name': function (v) { return v.length >= 3 && /^[\p{L}\s.'-]+$/u.test(v) ? '' : 'Ingrese un nombre válido (solo letras).'; },
      'f-email': function (v) { return /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(v) ? '' : 'Ingrese un correo válido.'; },
      'f-phone': function (v) { return !v || /^[+\d\s()-]{7,20}$/.test(v) ? '' : 'Teléfono no válido.'; },
      'f-service': function (v) { return v ? '' : 'Seleccione un servicio.'; },
      'f-msg': function (v) { return v.length >= 20 ? '' : 'Describa el caso con al menos 20 caracteres.'; }
    };
    var showError = function (input, text) {
      var err = input.parentNode.querySelector('.field-error');
      input.classList.toggle('invalid', !!text);
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (err) err.textContent = text;
    };
    Object.keys(rules).forEach(function (id) {
      var el = $('#' + id);
      el.addEventListener('blur', function () { showError(el, rules[id](sanitize(el.value, 1500))); });
      el.addEventListener('input', function () { if (el.classList.contains('invalid')) showError(el, rules[id](sanitize(el.value, 1500))); });
    });
    msg.addEventListener('input', function () { msgCount.textContent = String(msg.value.length); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      // Honeypot y envío demasiado rápido => bot
      if ($('#f-web').value !== '' || Date.now() - loadedAt < 3000) {
        status.textContent = 'No se pudo enviar. Intente nuevamente.';
        status.classList.add('err');
        return;
      }
      // Límite de frecuencia en el cliente (en memoria)
      if (Date.now() - lastSubmit < RATE_MS) {
        status.textContent = 'Espere un minuto antes de enviar otra solicitud.';
        status.classList.add('err');
        return;
      }

      var data = {}, firstInvalid = null;
      Object.keys(rules).forEach(function (id) {
        var el = $('#' + id);
        var clean = sanitize(el.value, id === 'f-msg' ? 1500 : 120);
        var error = rules[id](clean);
        showError(el, error);
        if (error && !firstInvalid) firstInvalid = el;
        data[el.name] = clean;
      });
      var consent = $('#f-consent');
      $('#consent-error').textContent = consent.checked ? '' : 'Debe aceptar la política de privacidad.';
      if (!consent.checked && !firstInvalid) firstInvalid = consent;
      if (firstInvalid) { firstInvalid.focus(); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Cifrando y enviando…';

      // Sin backend: se abre el cliente de correo con los datos saneados.
      // Para producción reemplace por fetch() a su endpoint HTTPS con token CSRF.
      var body = 'Nombre: ' + data.nombre + '\nCorreo: ' + data.email + '\nTeléfono: ' + (data.telefono || '-') +
        '\nServicio: ' + data.servicio + '\n\n' + data.mensaje;
      var href = 'mailto:contacto@vestigio.example?subject=' + encodeURIComponent('Solicitud de peritaje · ' + data.servicio) +
        '&body=' + encodeURIComponent(body);

      window.setTimeout(function () {
        lastSubmit = Date.now();
        window.location.href = href;
        status.textContent = 'Solicitud preparada. Se abrió su cliente de correo para completar el envío.';
        status.classList.add('ok');
        form.reset();
        msgCount.textContent = '0';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitud cifrada';
      }, 700);
    });
  }

  /* ---------- Año dinámico ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
