(function () {
  var KEY = "mrdrive-theme";
  var ch = null;
  try { ch = new BroadcastChannel("mrdrive-theme"); } catch (_) {}

  function paint(t) {
    t = t === "dark" ? "dark" : "light";
    var root = document.documentElement;
    root.setAttribute("data-theme", t);
    root.classList.toggle("theme-dark", t === "dark");
    root.classList.toggle("public-dark", t === "dark");
    root.style.colorScheme = t;
    if (document.body) {
      document.body.classList.toggle("theme-dark", t === "dark");
      document.body.classList.toggle("public-dark", t === "dark");
    }
    var link = document.getElementById("hljs-theme");
    if (link) {
      link.href = t === "dark"
        ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
        : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css";
    }
    var cb = document.getElementById("settings-dark-mode");
    if (cb) cb.checked = t === "dark";
  }

  window.__mrTheme = function (on, fromRemote) {
    var t = on === true || on === "dark" ? "dark" : "light";
    paint(t);
    try { localStorage.setItem(KEY, t); } catch (_) {}
    if (!fromRemote && ch) {
      try { ch.postMessage(t); } catch (_) {}
    }
  };

  // Initial: stored preference, else system preference, else light
  var cur = null;
  try { cur = localStorage.getItem(KEY); } catch (_) {}
  if (cur !== "dark" && cur !== "light") {
    try {
      cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" : "light";
    } catch (_) { cur = "light"; }
  }
  paint(cur);

  // Body may not exist yet (script in <head>) — re-apply classes when it appears
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", function () {
      try { paint(localStorage.getItem(KEY) || cur); } catch (_) { paint(cur); }
    });
  }

  if (ch) {
    ch.onmessage = function (ev) {
      if (ev.data === "dark" || ev.data === "light") paint(ev.data);
    };
  }
  window.addEventListener("storage", function (ev) {
    if (ev.key === KEY && (ev.newValue === "dark" || ev.newValue === "light")) {
      paint(ev.newValue);
    }
  });
})();
