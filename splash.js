// Splash: refined scene with inline SVG orbit icons around the logo.
// ~2.8s total while app loads. API: ready / skip / done.
(function () {
  var DURATION = 2800;
  var FADE = 380;
  var el = document.getElementById("boot-loader");
  var scene = document.getElementById("splash-scene");
  var finished = false;
  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });

  // Crisp line-icons (24 viewBox), tinted via currentColor / soft fills
  var SVG = {
    image:
      '<svg class="sp-icon sp-body" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="3" y="3" width="18" height="18" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.6"/>' +
      '<circle cx="8.5" cy="8.5" r="1.8" fill="#60a5fa"/>' +
      '<path d="M3.5 16.5l4.8-4.2a1.2 1.2 0 0 1 1.6.1L14 16l2.2-2.1a1.2 1.2 0 0 1 1.7.1l2.6 2.7" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>',
    file:
      '<svg class="sp-icon sp-body" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M7 3.5h7.2L19 8.3V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5z" fill="#f8fafc" stroke="#64748b" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M14 3.6V8h4.6" stroke="#64748b" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M9 12h6M9 15.5h4.5" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg>',
    video:
      '<svg class="sp-icon sp-body" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="2.5" y="5" width="14" height="14" rx="3" fill="#faf5ff" stroke="#8b5cf6" stroke-width="1.6"/>' +
      '<path d="M16.5 10.2l4.2-2.4a1 1 0 0 1 1.5.9v6.6a1 1 0 0 1-1.5.9l-4.2-2.4" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M8.2 9.6v4.8l4.1-2.4-4.1-2.4z" fill="#8b5cf6"/>' +
      '</svg>',
    folder:
      '<svg class="sp-icon sp-body" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M3.2 7.2A2.2 2.2 0 0 1 5.4 5h3.1c.5 0 1 .2 1.3.6l1 1.2c.3.4.8.6 1.3.6h6.5A2.2 2.2 0 0 1 20.8 9.6v7.2a2.2 2.2 0 0 1-2.2 2.2H5.4a2.2 2.2 0 0 1-2.2-2.2V7.2z" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M3.4 11h17.2" stroke="#fbbf24" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>' +
      '</svg>',
    zip:
      '<svg class="sp-icon sp-body" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M7 3.5h7.2L19 8.3V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5z" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M14 3.6V8h4.6" stroke="#16a34a" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M11 8.2h2M11 10.4h2M11 12.6h2" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/>' +
      '<rect x="10" y="14.2" width="4" height="3.6" rx="1" fill="#22c55e"/>' +
      '</svg>',
    audio:
      '<svg class="sp-icon sp-body" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.6"/>' +
      '<path d="M10 8.5v7l6-3.5-6-3.5z" fill="#ec4899"/>' +
      '</svg>'
  };

  function icon(name, px) {
    var svg = SVG[name] || SVG.file;
    return svg.replace('class="sp-icon sp-body"', 'class="sp-icon sp-body" width="' + px + '" height="' + px + '"');
  }

  // Orbit items: radius (px), start angle (deg), direction, delay
  var ITEMS = [
    { h: icon("image", 28),  r: 96,  a: 20,  dir: 1,  d: 0.00 },
    { h: icon("file", 26),   r: 112, a: 75,  dir: -1, d: 0.05 },
    { h: icon("video", 26),  r: 100, a: 140, dir: 1,  d: 0.09 },
    { h: icon("folder", 26), r: 118, a: 200, dir: -1, d: 0.03 },
    { h: icon("zip", 26),    r: 94,  a: 255, dir: 1,  d: 0.07 },
    { h: icon("audio", 24),  r: 108, a: 310, dir: -1, d: 0.11 }
  ];

  function build() {
    if (!scene) return;
    var h = '<div class="sp-glow" aria-hidden="true"></div>';
    ITEMS.forEach(function (it) {
      h += '<div class="sp-orb" style="--r:' + it.r + 'px;--a:' + it.a + 'deg;--dir:' + it.dir + ';--d:' + it.d + 's">' +
           '<div class="sp-orb-in"><div class="sp-fx">' + it.h + '</div></div></div>';
    });
    h += '<div class="sp-logo" aria-hidden="true">' +
         '<img src="/assets/logo.png" width="52" height="52" alt="" draggable="false"></div>' +
         '<div class="sp-word">MRdrive</div>' +
         '<div class="sp-progress" role="progressbar" aria-label="Yuklanmoqda"><i></i></div>';
    scene.innerHTML = h;
  }
  build();

  function finish() {
    if (finished) return;
    finished = true;
    if (el) el.style.display = "none";
    api.done = true;
    resolveReady();
  }
  function hide() {
    if (!el) { finish(); return; }
    el.classList.add("is-hiding");
    setTimeout(finish, FADE);
  }

  var timer = setTimeout(hide, DURATION - FADE);
  var api = {
    done: false,
    ready: ready,
    skip: function () { clearTimeout(timer); finish(); }
  };
  window.MRSplash = api;
})();
