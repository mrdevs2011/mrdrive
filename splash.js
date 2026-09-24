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
  function icon(n, px) { return '<img class="sp-icon sp-body" style="width:' + px + 'px;height:' + px + 'px" src="/assets/' + n + '-icon.png" alt="">'; }

  // r = orbita radiusi, a = boshlang'ich burchak, dir = aylanish yo'nalishi, d = kechikish (s)
  var ITEMS = [
    { h: icon("image", 46), r: 150, a: 10, dir: 1, d: 0.00 },
    { h: icon("video", 42), r: 178, a: 42, dir: -1, d: 0.05 },
    { h: icon("zip", 48), r: 128, a: 75, dir: 1, d: 0.10 },
    { h: icon("file", 44), r: 168, a: 108, dir: -1, d: 0.02 },
    { h: icon("video", 40), r: 140, a: 140, dir: 1, d: 0.12 },
    { h: icon("file", 46), r: 172, a: 170, dir: -1, d: 0.07 },
    { h: icon("zip", 42), r: 122, a: 200, dir: 1, d: 0.15 },
    { h: icon("image", 48), r: 176, a: 232, dir: -1, d: 0.03 },
    { h: icon("file", 44), r: 146, a: 262, dir: 1, d: 0.09 },
    { h: icon("video", 40), r: 132, a: 292, dir: -1, d: 0.14 },
    { h: icon("image", 46), r: 168, a: 322, dir: 1, d: 0.06 },
    { h: icon("zip", 42), r: 118, a: 350, dir: -1, d: 0.11 },
    { h: icon("file", 44), r: 158, a: 56, dir: -1, d: 0.16 },
    { h: icon("video", 40), r: 108, a: 160, dir: 1, d: 0.13 }
  ];
  var SPARK_COLORS = ["#3b82f6", "#18181b", "#3b82f6", "#a1a1aa"]; // MRdrive: ko'k accent + neytral

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
