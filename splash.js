// Splash: theme-aware orbit around the logo. ~2.8s. API: ready / skip / done.
(function () {
  var DURATION = 2800;
  var FADE = 400;
  var el = document.getElementById("boot-loader");
  var scene = document.getElementById("splash-scene");
  var finished = false;
  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });

  function svg(name, body) {
    return '<svg class="sp-icon sp-body sp-ic-' + name + '" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + body + '</svg>';
  }

  var SVG = {
    image: svg("image",
      '<rect class="sp-fill" x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle class="sp-dot" cx="8.5" cy="8.5" r="1.8"/>' +
      '<path d="M3.5 16.5l4.8-4.2a1.2 1.2 0 0 1 1.6.1L14 16l2.2-2.1a1.2 1.2 0 0 1 1.7.1l2.6 2.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    ),
    file: svg("file",
      '<path class="sp-fill" d="M7 3.5h7.2L19 8.3V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M14 3.6V8h4.6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M9 12h6M9 15.5h4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>'
    ),
    video: svg("video",
      '<rect class="sp-fill" x="2.5" y="5" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.6"/>' +
      '<path class="sp-fill" d="M16.5 10.2l4.2-2.4a1 1 0 0 1 1.5.9v6.6a1 1 0 0 1-1.5.9l-4.2-2.4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path class="sp-dot" d="M8.2 9.6v4.8l4.1-2.4-4.1-2.4z"/>'
    ),
    folder: svg("folder",
      '<path class="sp-fill" d="M3.2 7.2A2.2 2.2 0 0 1 5.4 5h3.1c.5 0 1 .2 1.3.6l1 1.2c.3.4.8.6 1.3.6h6.5A2.2 2.2 0 0 1 20.8 9.6v7.2a2.2 2.2 0 0 1-2.2 2.2H5.4a2.2 2.2 0 0 1-2.2-2.2V7.2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
    ),
    zip: svg("zip",
      '<path class="sp-fill" d="M7 3.5h7.2L19 8.3V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M14 3.6V8h4.6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M11 8.2h2M11 10.4h2M11 12.6h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<rect class="sp-dot" x="10" y="14.2" width="4" height="3.6" rx="1"/>'
    ),
    audio: svg("audio",
      '<circle class="sp-fill" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>' +
      '<path class="sp-dot" d="M10 8.5v7l6-3.5-6-3.5z"/>'
    )
  };

  function icon(name, px) {
    var raw = SVG[name] || SVG.file;
    return raw.replace('class="sp-icon', 'width="' + px + '" height="' + px + '" class="sp-icon');
  }

  var ITEMS = [
    { h: icon("image", 28),  r: 102, a: 18,  dir: 1,  d: 0.00 },
    { h: icon("file", 26),   r: 118, a: 78,  dir: -1, d: 0.05 },
    { h: icon("video", 26),  r: 106, a: 138, dir: 1,  d: 0.09 },
    { h: icon("folder", 26), r: 122, a: 198, dir: -1, d: 0.03 },
    { h: icon("zip", 26),    r: 98,  a: 258, dir: 1,  d: 0.07 },
    { h: icon("audio", 24),  r: 114, a: 318, dir: -1, d: 0.11 }
  ];

  function build() {
    if (!scene) return;
    var h = '<div class="sp-glow" aria-hidden="true"></div><div class="sp-ring" aria-hidden="true"></div>';
    ITEMS.forEach(function (it) {
      h += '<div class="sp-orb" style="--r:' + it.r + 'px;--a:' + it.a + 'deg;--dir:' + it.dir + ';--d:' + it.d + 's">' +
           '<div class="sp-orb-in"><div class="sp-fx"><span class="sp-chip">' + it.h + '</span></div></div></div>';
    });
    h += '<div class="sp-logo" aria-hidden="true">' +
         '<img src="/assets/logo.png" width="56" height="56" alt="" draggable="false"></div>' +
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
