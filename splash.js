// Splash: aniq 2 soniya turadi (sahifa boshlanganidan), oxirgi 250ms da yumshoq
// yo'qoladi. Shu vaqt ichida sahifa orqa fonda yuklanaveradi.
(function () {
  var DURATION = 2000; // jami splash vaqti
  var FADE = 250;      // oxirgi yo'qolish animatsiyasi
  var el = document.getElementById("boot-loader");
  var finished = false;
  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });

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
