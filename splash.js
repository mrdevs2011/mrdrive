// Splash: sodda klassik sahna. Logo markazda, bir nechta fayl ikonkasi
// atrofida sekin aylanadi, so'ng tinch yo'qoladi. Jami ~3s — shu vaqtda
// ilova orqa fonda yuklanadi. API o'zgarmaydi (ready / skip / done).
(function () {
  var DURATION = 2800;
  var FADE = 320;
  var el = document.getElementById("boot-loader");
  var scene = document.getElementById("splash-scene");
  var finished = false;
  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });

  function icon(n, px) {
    return '<img class="sp-icon sp-body" style="width:' + px + 'px;height:' + px + 'px" src="/assets/' + n + '-icon.png" alt="">';
  }

  var ITEMS = [
    { h: icon("image", 28), r: 92, a: 18, dir: 1, d: 0.00 },
    { h: icon("file", 26), r: 108, a: 78, dir: -1, d: 0.04 },
    { h: icon("video", 26), r: 96, a: 148, dir: 1, d: 0.08 },
    { h: icon("zip", 26), r: 112, a: 208, dir: -1, d: 0.02 },
    { h: icon("image", 24), r: 88, a: 268, dir: 1, d: 0.06 },
    { h: icon("file", 26), r: 104, a: 328, dir: -1, d: 0.10 }
  ];

  function build() {
    if (!scene) return;
    var h = '';
    ITEMS.forEach(function (it) {
      h += '<div class="sp-orb" style="--r:' + it.r + 'px;--a:' + it.a + 'deg;--dir:' + it.dir + ';--d:' + it.d + 's">' +
           '<div class="sp-orb-in"><div class="sp-fx">' + it.h + '</div></div></div>';
    });
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
    skip: function () { clearTimeout(timer); finish(); }
  };
  window.MRSplash = api;
})();
