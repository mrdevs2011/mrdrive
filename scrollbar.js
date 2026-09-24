/* ==========================================================
   MrDrive thin custom scrollbars
   ----------------------------------------------------------
   Native browser scrollbars are hidden globally (see style.css).
   Every scrollable area gets its own hair-thin overlay bar that
   fades in while scrolling and fades out when idle.

   Add a new scroll area in ONE place: put its CSS selector in
   the SCROLL_AREAS list below (or add data-thin-scroll="" to the
   element). Native wheel / touch / keyboard scrolling is untouched —
   these bars only *show* position and can be dragged / clicked.
   ========================================================== */
(function () {
  "use strict";

  const SCROLL_AREAS = [
    ".folder-tabs",                 // folder tab strip   (horizontal)
    "#upload-progress",             // upload list        (vertical)
    ".public-preview.is-pdf",       // public PDF preview (vertical)
    ".folder-picker-list",          // folder picker      (horizontal)
    ".annot-scroll",                // image / pdf viewer (both)
    ".annot-code-wrap pre",         // code viewer        (both)
    "[data-thin-scroll]",
  ];

  const THICK = 3;          // px, resting thickness
  const THICK_ACTIVE = 6;   // px, on hover / drag
  const EDGE = 3;           // px gap from the edge of the scroll area
  const MIN_THUMB = 28;     // px
  const IDLE_MS = 900;

  const registry = new Map(); // element (or document) -> instance
  const selector = SCROLL_AREAS.join(",");

  /* ---------- helpers ---------- */
  function isDarkBg(el) {
    let n = el;
    while (n && n.nodeType === 1) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(",").map(parseFloat);
        const a = p.length > 3 ? p[3] : 1;
        if (a > 0.05) return (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) < 128;
      }
      n = n.parentElement;
    }
    return false;
  }

  function stackZ(el) {
    let z = 0;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const v = parseInt(getComputedStyle(n).zIndex, 10);
      if (!isNaN(v) && v > z) z = v;
    }
    return z + 1;
  }

  /* ---------- one scroller ---------- */
  class ThinScroll {
    constructor(el) {
      this.el = el;
      this.isPage = el === document;
      this.scroller = this.isPage ? (document.scrollingElement || document.documentElement) : el;
      this.bars = { y: this.makeBar("y"), x: this.makeBar("x") };
      this.hideTimer = null;
      this.dragging = null;

      this.onScroll = () => { this.update(); this.flash(); };
      this.onResize = () => this.update();
      (this.isPage ? window : el).addEventListener("scroll", this.onScroll, { passive: true });
      window.addEventListener("resize", this.onResize, { passive: true });

      this.ro = new ResizeObserver(this.onResize);
      this.mo = new MutationObserver(this.onResize);
      if (this.isPage) {
        this.ro.observe(document.documentElement);
        this.ro.observe(document.body);
      } else {
        this.ro.observe(el);
        this.mo.observe(el, { childList: true, subtree: true });
      }
      this.update();
    }

    makeBar(axis) {
      const track = document.createElement("div");
      track.className = "ts-track ts-" + axis;
      const thumb = document.createElement("div");
      thumb.className = "ts-thumb";
      track.appendChild(thumb);
      document.body.appendChild(track);

      thumb.addEventListener("pointerdown", (e) => this.startDrag(e, axis));
      track.addEventListener("pointerdown", (e) => {
        if (e.target !== track) return;
        // click on the track: jump so the thumb centres on the pointer
        const r = track.getBoundingClientRect();
        const m = this.metrics(axis);
        if (!m) return;
        const pos = axis === "y" ? e.clientY - r.top : e.clientX - r.left;
        this.setScroll(axis, ((pos - m.thumb / 2) / (m.track - m.thumb)) * (m.content - m.view));
      });
      track.addEventListener("pointerenter", () => { this.flash(true); });
      track.addEventListener("pointerleave", () => { if (!this.dragging) this.flash(); });
      return { track, thumb };
    }

    rect() {
      if (this.isPage) return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      return this.el.getBoundingClientRect();
    }

    metrics(axis) {
      const s = this.scroller;
      const view = this.isPage ? window[axis === "y" ? "innerHeight" : "innerWidth"] : (axis === "y" ? s.clientHeight : s.clientWidth);
      const content = axis === "y" ? s.scrollHeight : s.scrollWidth;
      if (content - view <= 1) return null;
      const r = this.rect();
      const other = this.needs(axis === "y" ? "x" : "y") ? THICK_ACTIVE + EDGE : 0;
      const track = (axis === "y" ? r.bottom - r.top : r.right - r.left) - EDGE * 2 - other;
      if (track < 20) return null;
      const thumb = Math.max(MIN_THUMB, Math.min(track, (view / content) * track));
      const pos = axis === "y" ? s.scrollTop : s.scrollLeft;
      const offset = (pos / (content - view)) * (track - thumb);
      return { view, content, track, thumb, offset };
    }

    needs(axis) {
      const s = this.scroller;
      return axis === "y"
        ? s.scrollHeight - (this.isPage ? window.innerHeight : s.clientHeight) > 1
        : s.scrollWidth - (this.isPage ? window.innerWidth : s.clientWidth) > 1;
    }

    setScroll(axis, v) {
      const s = this.scroller;
      if (axis === "y") s.scrollTop = v; else s.scrollLeft = v;
    }

    update() {
      if (!this.isPage && !this.el.isConnected) return this.destroy();
      const visibleEl = this.isPage || this.el.offsetParent !== null || getComputedStyle(this.el).position === "fixed";
      const r = this.rect();
      const dark = this.isPage ? false : isDarkBg(this.el);
      const z = this.isPage ? 40 : stackZ(this.el);

      for (const axis of ["y", "x"]) {
        const { track, thumb } = this.bars[axis];
        const m = visibleEl ? this.metrics(axis) : null;
        if (!m) { track.style.display = "none"; continue; }
        track.style.display = "block";
        track.classList.toggle("ts-dark", dark);
        track.style.zIndex = z;
        if (axis === "y") {
          track.style.top = r.top + EDGE + "px";
          track.style.left = r.right - EDGE - THICK_ACTIVE + "px";
          track.style.height = m.track + "px";
          thumb.style.height = m.thumb + "px";
          thumb.style.transform = `translateY(${m.offset}px)`;
        } else {
          track.style.left = r.left + EDGE + "px";
          track.style.top = r.bottom - EDGE - THICK_ACTIVE + "px";
          track.style.width = m.track + "px";
          thumb.style.width = m.thumb + "px";
          thumb.style.transform = `translateX(${m.offset}px)`;
        }
      }
    }

    flash(hold) {
      clearTimeout(this.hideTimer);
      for (const axis of ["y", "x"]) this.bars[axis].track.classList.add("ts-show");
      if (hold) return;
      this.hideTimer = setTimeout(() => {
        if (this.dragging) return;
        for (const axis of ["y", "x"]) this.bars[axis].track.classList.remove("ts-show");
      }, IDLE_MS);
    }

    startDrag(e, axis) {
      const m = this.metrics(axis);
      if (!m) return;
      e.preventDefault();
      e.stopPropagation();
      const thumb = this.bars[axis].thumb;
      const startPointer = axis === "y" ? e.clientY : e.clientX;
      const startScroll = axis === "y" ? this.scroller.scrollTop : this.scroller.scrollLeft;
      this.dragging = axis;
      this.bars[axis].track.classList.add("ts-drag");
      thumb.setPointerCapture(e.pointerId);
      this.flash(true);

      const move = (ev) => {
        const mm = this.metrics(axis);
        if (!mm) return;
        const d = (axis === "y" ? ev.clientY : ev.clientX) - startPointer;
        this.setScroll(axis, startScroll + (d / (mm.track - mm.thumb)) * (mm.content - mm.view));
      };
      const up = () => {
        thumb.removeEventListener("pointermove", move);
        thumb.removeEventListener("pointerup", up);
        thumb.removeEventListener("pointercancel", up);
        this.bars[axis].track.classList.remove("ts-drag");
        this.dragging = null;
        this.flash();
      };
      thumb.addEventListener("pointermove", move);
      thumb.addEventListener("pointerup", up);
      thumb.addEventListener("pointercancel", up);
    }

    destroy() {
      clearTimeout(this.hideTimer);
      this.ro.disconnect();
      this.mo.disconnect();
      window.removeEventListener("resize", this.onResize);
      (this.isPage ? window : this.el).removeEventListener("scroll", this.onScroll);
      this.bars.x.track.remove();
      this.bars.y.track.remove();
      registry.delete(this.el);
    }
  }

  /* ---------- wiring ---------- */
  function attach(el) {
    if (!registry.has(el)) registry.set(el, new ThinScroll(el));
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(selector)) attach(root);
    root.querySelectorAll(selector).forEach(attach);
  }

  function init() {
    attach(document);          // the page itself
    scan(document.body);

    // Pick up scroll areas that the app creates later (viewer, modals, …)
    new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach(scan);
      for (const inst of Array.from(registry.values())) {
        if (!inst.isPage && !inst.el.isConnected) inst.destroy();
      }
    }).observe(document.body, { childList: true, subtree: true });

    // Bars are position:fixed, so keep them glued when layout shifts
    // without a scroll / resize event (viewer opens, modal shows, …).
    let raf = 0;
    const tick = () => {
      registry.forEach((i) => i.update());
      raf = 0;
    };
    ["transitionend", "animationend", "click"].forEach((ev) =>
      document.addEventListener(ev, () => { if (!raf) raf = requestAnimationFrame(tick); }, true)
    );
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);

  window.ThinScroll = { attach, refresh: () => registry.forEach((i) => i.update()) };
})();
