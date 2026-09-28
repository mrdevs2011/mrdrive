// Office-style previews, fully client-side: xlsx/xlsm/xlsb/xls/ods/tsv (with embedded
// pictures), docx, pptx, zip listing, ipynb. Colors come from theme variables, so
// dark/light follow the app; source fills are not copied (no-background = theme bg).
(function () {
  const LIBS = {
    xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    mammoth: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
  };
  const EXT = {
    sheet: ["xlsx", "xlsm", "xltx", "xlsb", "xls", "ods", "tsv"],
    docx: ["docx", "docm", "dotx"], pptx: ["pptx", "pptm", "ppsx"], zip: ["zip"], ipynb: ["ipynb"]
  };
  const RNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", bmp: "image/bmp", svg: "image/svg+xml" };
  const loaded = {};
  const lib = (k) => loaded[k] || (loaded[k] = new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = LIBS[k]; s.onload = ok;
    s.onerror = () => { delete loaded[k]; no(new Error("lib " + k)); };
    document.head.appendChild(s);
  }));
  const ext = (n) => (String(n).split(".").pop() || "").toLowerCase();
  const type = (n) => { const e = ext(n); return Object.keys(EXT).find((k) => EXT[k].includes(e)) || null; };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const clean = (n) => { if (typeof sanitizeMdHtml === "function") sanitizeMdHtml(n); };
  const size = (n) => (n == null ? "" : typeof formatSize === "function" ? formatSize(n) : n + " B");

  // ---- OOXML helpers (paths, rels, xml) ----
  const dir = (p) => p.slice(0, p.lastIndexOf("/") + 1);
  const resolve = (base, rel) => {
    const out = [];
    (rel.startsWith("/") ? rel.slice(1) : dir(base) + rel).split("/").forEach((p) => { if (p === "..") out.pop(); else if (p && p !== ".") out.push(p); });
    return out.join("/");
  };
  const xml = async (z, p) => { const f = z.file(p); return f ? new DOMParser().parseFromString(await f.async("string"), "application/xml") : null; };
  const all = (n, name) => Array.from(n.getElementsByTagName("*")).filter((e) => e.localName === name);
  const first = (n, name) => all(n, name)[0];
  const rid = (e, a) => e.getAttributeNS(RNS, a) || e.getAttribute("r:" + a);
  async function rels(z, path) {
    const d = await xml(z, dir(path) + "_rels/" + path.split("/").pop() + ".rels"), m = {};
    if (d) all(d, "Relationship").forEach((r) => { m[r.getAttribute("Id")] = { target: resolve(path, r.getAttribute("Target")), type: r.getAttribute("Type") || "" }; });
    return m;
  }
  async function blobUrl(z, path) {
    const f = z.file(path), m = MIME[ext(path)];
    return f && m ? URL.createObjectURL(new Blob([await f.async("uint8array")], { type: m })) : null;
  }

  // ---- spreadsheets ----
  async function sheetImages(z) {
    const out = {}, wb = await xml(z, "xl/workbook.xml");
    if (!wb) return out;
    const wr = await rels(z, "xl/workbook.xml");
    for (const s of all(wb, "sheet")) {
      const sp = wr[rid(s, "id")] && wr[rid(s, "id")].target;
      if (!sp) continue;
      const dr = Object.values(await rels(z, sp)).find((x) => /\/drawing$/.test(x.type));
      const dx = dr && (await xml(z, dr.target));
      if (!dx) continue;
      const drr = await rels(z, dr.target), list = [];
      for (const a of all(dx, "twoCellAnchor").concat(all(dx, "oneCellAnchor"))) {
        const from = first(a, "from");
        if (!from) continue;
        for (const b of all(a, "blip")) {
          const rel = drr[rid(b, "embed")], url = rel && (await blobUrl(z, rel.target));
          if (url) list.push({ r: +first(from, "row").textContent, c: +first(from, "col").textContent, url });
        }
      }
      out[s.getAttribute("name")] = list;
    }
    return out;
  }
  function sheetTable(ws, imgs) {
    const U = XLSX.utils, ref = ws["!ref"] ? U.decode_range(ws["!ref"]) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
    const at = {}, skip = {}, span = {}, cols = ws["!cols"] || [], rows = ws["!rows"] || [];
    (imgs || []).forEach((i) => {
      const k = i.r + "," + i.c; (at[k] = at[k] || []).push(i.url);
      ref.e.r = Math.max(ref.e.r, i.r); ref.e.c = Math.max(ref.e.c, i.c);
    });
    (ws["!merges"] || []).forEach((m) => {
      span[m.s.r + "," + m.s.c] = [m.e.r - m.s.r + 1, m.e.c - m.s.c + 1];
      for (let r = m.s.r; r <= m.e.r; r++) for (let c = m.s.c; c <= m.e.c; c++) if (r !== m.s.r || c !== m.s.c) skip[r + "," + c] = 1;
    });
    const cs = []; for (let c = ref.s.c; c <= ref.e.c; c++) if (!(cols[c] && cols[c].hidden)) cs.push(c);
    const lastR = Math.min(ref.e.r, ref.s.r + 4999);
    let h = "<table class='office-table'><colgroup><col class='office-rn'>";
    cs.forEach((c) => { const w = cols[c]; h += "<col style='width:" + Math.max(48, Math.min((w && (w.wpx || (w.wch || 0) * 7)) || 90, 520)) + "px'>"; });
    h += "</colgroup><thead><tr><th></th>" + cs.map((c) => "<th>" + U.encode_col(c) + "</th>").join("") + "</tr></thead><tbody>";
    for (let r = ref.s.r; r <= lastR; r++) {
      const ro = rows[r]; if (ro && ro.hidden) continue;
      h += "<tr" + (ro && ro.hpx ? " style='height:" + Math.min(ro.hpx, 400) + "px'" : "") + "><th>" + (r + 1) + "</th>";
      cs.forEach((c) => {
        const k = r + "," + c; if (skip[k]) return;
        const cell = ws[U.encode_cell({ r, c })], sp = span[k];
        const txt = cell ? (cell.w != null ? cell.w : cell.v != null ? String(cell.v) : "") : "";
        h += "<td" + (sp ? " rowspan=" + sp[0] + " colspan=" + sp[1] : "") + (cell && cell.t === "n" ? " class='num'" : "") + ">" +
          (at[k] || []).map((u) => "<img src='" + u + "' alt=''>").join("") + esc(txt) + "</td>";
      });
      h += "</tr>";
    }
    return h + "</tbody></table>" + (ref.e.r > lastR ? "<p class='office-note'>Faqat birinchi 5000 qator ko'rsatildi.</p>" : "");
  }
  async function sheet(buf, box, name) {
    await lib("xlsx");
    const isTsv = ext(name) === "tsv";
    const wb = isTsv ? XLSX.read(new TextDecoder().decode(buf), { type: "string", FS: "\t" }) : XLSX.read(buf, { type: "array" });
    let imgs = {};
    if (/\.(xlsx|xlsm|xltx)$/i.test(name)) { try { imgs = await sheetImages(await JSZip.loadAsync(buf)); } catch (e) { console.warn("xlsx images", e); } }
    const bar = el("div", "office-tabs"), pane = el("div", "office-pane");
    const show = (i) => {
      const n = wb.SheetNames[i];
      pane.innerHTML = sheetTable(wb.Sheets[n], imgs[n]);
      Array.from(bar.children).forEach((b, j) => b.classList.toggle("on", i === j));
    };
    wb.SheetNames.forEach((n, i) => { const b = el("button", "office-tab", esc(n)); b.type = "button"; b.onclick = () => show(i); bar.appendChild(b); });
    if (wb.SheetNames.length > 1) box.appendChild(bar);
    box.appendChild(pane); show(0);
  }

  // ---- word / powerpoint / zip / notebook ----
  async function docx(buf, box) {
    await lib("mammoth");
    const r = await mammoth.convertToHtml({ arrayBuffer: buf });
    const d = el("div", "office-doc", r.value || "<p class='office-note'>Hujjat bo'sh.</p>");
    clean(d); box.appendChild(d);
  }
  async function pptx(buf, box) {
    const z = await JSZip.loadAsync(buf), pres = await xml(z, "ppt/presentation.xml");
    if (!pres) throw new Error("pptx");
    const pr = await rels(z, "ppt/presentation.xml"); let n = 0;
    for (const s of all(pres, "sldId")) {
      const sp = pr[rid(s, "id")] && pr[rid(s, "id")].target, sx = sp && (await xml(z, sp));
      if (!sx) continue;
      const sr = await rels(z, sp), card = el("section", "office-slide", "<div class='office-slide-n'>" + ++n + "</div>");
      for (const e of Array.from(sx.getElementsByTagName("*"))) {
        if (e.localName === "p") {
          const t = all(e, "t").map((x) => x.textContent).join("").trim();
          if (t) card.appendChild(el("p", "", esc(t)));
        } else if (e.localName === "blip") {
          const rel = sr[rid(e, "embed")], u = rel && (await blobUrl(z, rel.target));
          if (u) card.appendChild(el("img", "", "")).src = u;
        }
      }
      box.appendChild(card);
    }
  }
  async function zip(buf, box) {
    const z = await JSZip.loadAsync(buf), fs = Object.values(z.files).slice(0, 3000);
    box.appendChild(el("table", "office-list", "<tbody>" + fs.map((f) =>
      "<tr><td>" + esc(f.name) + "</td><td class='num'>" + (f.dir ? "" : size(f._data && f._data.uncompressedSize)) + "</td></tr>").join("") + "</tbody>"));
  }
  async function ipynb(buf, box) {
    const nb = JSON.parse(new TextDecoder().decode(buf)), j = (s) => (Array.isArray(s) ? s.join("") : s || "");
    (nb.cells || (nb.worksheets && nb.worksheets[0].cells) || []).forEach((c) => {
      const d = el("div", "office-cell"), src = j(c.source || c.input);
      if (c.cell_type === "markdown") {
        const m = el("div", "md-preview", window.marked ? marked.parse(src) : esc(src)); clean(m); d.appendChild(m);
      } else {
        const pre = el("pre", "", "<code class='language-python'></code>"); pre.firstChild.textContent = src;
        if (window.hljs) try { hljs.highlightElement(pre.firstChild); } catch (e) { /* plain */ }
        d.appendChild(pre);
        (c.outputs || []).forEach((o) => {
          const dt = o.data || {}, o2 = el("div", "office-out");
          if (dt["image/png"]) o2.appendChild(el("img", "", "")).src = "data:image/png;base64," + j(dt["image/png"]).replace(/\s/g, "");
          else { const t = j(o.text || dt["text/plain"] || (o.traceback || []).join("\n")); if (t) o2.appendChild(el("pre", "", "")).textContent = t.replace(/\x1b\[[0-9;]*m/g, ""); }
          if (o2.firstChild) d.appendChild(o2);
        });
      }
      box.appendChild(d);
    });
  }

  const RUN = { sheet, docx, pptx, zip, ipynb };
  window.OfficePreview = {
    type,
    async render(url, filename, box) {
      const t = type(filename); if (!t) throw new Error("unsupported: " + filename);
      const res = await fetch(url); if (!res.ok) throw new Error("fetch " + res.status);
      await RUN[t](await res.arrayBuffer(), box, filename);
    }
  };
})();
