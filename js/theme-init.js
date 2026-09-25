/* Aplica el tema del sistema antes del primer render (evita parpadeo) */
(function () {
  'use strict';
  var light = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
})();
