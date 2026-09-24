// Splash: refined classic scene. Soft glow, calm orbit of file icons,
// logo + wordmark, thin progress bar. ~2.8s total while app loads.
// API unchanged: ready / skip / done.
(function () {
  var DURATION = 2800;
  var FADE = 380;
  var el = document.getElementById("boot-loader");
  var scene = document.getElementById("splash-scene");
  var finished = false;
  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });

  function icon(n, px) {
    return '<img class="sp-icon sp-body" style="width:' + px + 'px;height:' + px + 'px" src="/assets/' + n + '-icon.png" alt="" draggable="false">';
  }

  // Orbit items: radius (px), start angle (deg), direction, delay
  var ITEMS = [
    { h: icon("image", 28),  r: 96,  a: 20,  dir: 1,  d: 0.00 },
    { h: icon("file", 26),   r: 112, a: 75,  dir: -1, d: 0.05 },
    { h: icon("video", 26),  r: 100, a: 140, dir: 1,  d: 0.09 },
    { h: icon("folder", 26), r: 118, a: 200, dir: -1, d: 0.03 },
    { h: icon("zip", 26),    r: 94,  a: 255, dir: 1,  d: 0.07 },
    { h: icon("image", 24),  r: 108, a: 310, dir: -1, d: 0.11 }
  ];

  function build() {
    if (!scene) return;
    var h = '<div class="sp-glow" aria-hidden="true"></div>';
    ITEMS.forEach(function (it) {
      h += '<div class="sp-orb" style="--r:' + it.r + 'px;--a:' + it.a + 'deg;--dir:' + it.dir + ';--d:' + it.d + 's">' +
           '<div class="sp-orb-in"><div class="sp-fx">' + it.h + '</div></div></div>';
    });
    h += '<div class="sp-logo" aria-hidden="true">' +
         '<svg viewBox="0 0 40 40" fill="none">' +
         '<rect width="40" height="40" rx="10" fill="#18181b"/>' +
         '<path d="M10 26V14L20 22L30 14V26" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
         '</svg></div>' +
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
