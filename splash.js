// Splash: aniq 3 soniya (sahifa boshlanganidan). Fayllar, rasmlar va media logo
// atrofida aylanib yuradi, so'ng "whoop" bilan MRdrive ichiga so'rilib kiradi.
// Oxirgi 250ms da butun sahna kattalashib app ichiga o'tadi. Shu vaqt ichida
// sahifa orqa fonda yuklanaveradi.
(function () {
  var DURATION = 3000; // jami splash vaqti
  var FADE = 250;      // oxirgi "kirib ketish" animatsiyasi
  var el = document.getElementById("boot-loader");
  var scene = document.getElementById("splash-scene");
  var finished = false;
  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });

  // ---- Sahna ----
  function thumb(grad, inner) {
    return '<div class="sp-thumb sp-body" style="background:' + grad + '">' + inner + '</div>';
  }
  var SVG_PHOTO = '<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="22" cy="9" r="3.2" fill="#fff" opacity=".9"/>' +
    '<path d="M2 26l8-10 5 6 4-4 9 8z" fill="#fff" opacity=".85"/></svg>';
  var SVG_PLAY = '<svg width="26" height="26" viewBox="0 0 26 26"><path d="M8 5l14 8-14 8z" fill="#fff"/></svg>';
  var SVG_NOTE = '<svg width="26" height="26" viewBox="0 0 26 26"><path d="M10 4v13.2A3.5 3.5 0 1 0 12 20V9l9-2v7.2A3.5 3.5 0 1 0 23 17V3z" fill="#fff"/></svg>';
  var SVG_DOC = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 4h9l5 5v11H5z" fill="#fff" opacity=".92"/>' +
    '<path d="M8 12h8M8 15h8M8 18h5" stroke="#8b5cf6" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function icon(n) { return '<img class="sp-icon sp-body" src="/assets/' + n + '-icon.png" alt="">'; }
  function pill(dot, t) { return '<div class="sp-pill sp-body"><i class="' + dot + '"></i>' + t + '</div>'; }

  // r = orbita radiusi, a = boshlang'ich burchak, dir = aylanish yo'nalishi, d = kechikish (s)
  var ITEMS = [
    { h: icon("image"),  r: 150, a: 10,  dir: 1,  d: 0.00 },
    { h: pill("dot-blue", "report.pdf"), r: 178, a: 42, dir: -1, d: 0.05 },
    { h: thumb("linear-gradient(135deg,#f9a8d4,#fb923c)", SVG_PHOTO), r: 128, a: 75, dir: 1, d: 0.10 },
    { h: icon("video"),  r: 168, a: 108, dir: -1, d: 0.02 },
    { h: pill("dot-green", "photo.jpg"), r: 140, a: 140, dir: 1, d: 0.12 },
    { h: thumb("linear-gradient(135deg,#60a5fa,#8b5cf6)", SVG_PLAY), r: 172, a: 170, dir: -1, d: 0.07 },
    { h: icon("folder"), r: 122, a: 200, dir: 1,  d: 0.15 },
    { h: pill("dot-amber", "notes.txt"), r: 176, a: 232, dir: -1, d: 0.03 },
    { h: thumb("linear-gradient(135deg,#34d399,#0ea5e9)", SVG_PHOTO), r: 146, a: 262, dir: 1, d: 0.09 },
    { h: icon("zip"),    r: 132, a: 292, dir: -1, d: 0.14 },
    { h: pill("dot-pink", "video.mp4"), r: 168, a: 322, dir: 1, d: 0.06 },
    { h: thumb("linear-gradient(135deg,#f472b6,#a855f7)", SVG_NOTE), r: 118, a: 350, dir: -1, d: 0.11 },
    { h: icon("file"),   r: 158, a: 56,  dir: -1, d: 0.16 },
    { h: thumb("linear-gradient(135deg,#fbbf24,#ef4444)", SVG_DOC), r: 108, a: 160, dir: 1, d: 0.13 }
  ];
  var SPARK_COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#22c55e", "#8b5cf6"];

  function build() {
    if (!scene) return;
    var h = '<div class="sp-swirl"></div><div class="sp-flash"></div>' +
            '<div class="sp-ring"></div><div class="sp-ring r2"></div>';
    ITEMS.forEach(function (it) {
      h += '<div class="sp-orb" style="--r:' + it.r + 'px;--a:' + it.a + 'deg;--dir:' + it.dir + ';--d:' + it.d + 's">' +
           '<div class="sp-orb-in"><div class="sp-fx">' + it.h + '</div></div></div>';
    });
    for (var i = 0; i < 14; i++) {
      h += '<div class="sp-spark" style="--ang:' + (i * (360 / 14) + 6) + 'deg;--dist:' + (70 + (i % 3) * 22) +
           'px;background:' + SPARK_COLORS[i % SPARK_COLORS.length] + '"></div>';
    }
    h += '<div class="sp-logo"><svg viewBox="0 0 40 40" fill="none">' +
         '<rect width="40" height="40" rx="10" fill="#18181b"/>' +
         '<path d="M10 26V14L20 22L30 14V26" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
         '</svg></div>' +
         '<div class="sp-word">MRdrive</div>' +
         '<div class="sp-progress"><i></i></div>';
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
    // Ochiq (share) havola kabi joylarda splash kerak bo'lmasa
    skip: function () { clearTimeout(timer); finish(); }
  };
  window.MRSplash = api;
})();
