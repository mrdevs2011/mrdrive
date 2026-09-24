// ==========================================
// TUGMANI USHLAB TURISH = FOYDASIZ
// Har bir shortcut/action uchun tugma alohida bosiladi. Ushlab turilsa
// (OS auto-repeat) takroriy keydown'lar butunlay yutiladi — action faqat 1 marta
// ishlaydi. Yozish maydonlarida (qidiruv, prompt) takror yozish saqlanadi.
// Bu listener eng birinchi ro'yxatdan o'tadi (capture), shuning uchun boshqa
// hamma keydown handler'lardan (viewer, modal, settings) oldin ishlaydi.
// ==========================================
window.addEventListener("keydown", (e) => {
  if (!e.repeat) return;
  if (e.key === "Tab") return;
  if (kbIsTyping(e.target)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);

const splashActive = () => !!(window.MRSplash && !window.MRSplash.done);

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const appScreen = document.getElementById("app");
const userEmailEl = document.getElementById("user-email"); // optional, header da ism ko'rsatilmaydi
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const fileListEl = document.getElementById("file-list");
const uploadProgressEl = document.getElementById("upload-progress");
const bootLoader = document.getElementById("boot-loader");

const ICON_FULLSCREEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_EXIT_FULLSCREEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 4V9H4M20 9H15V4M15 20V15H20M4 15H9V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_SPINNER = `<svg class="public-spinner" width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.2" stroke-width="2.5"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const ICON_DOWNLOAD = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 18H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_DELETE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 7L7 19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_LINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_UNLINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_COPY = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V5C5 4.44772 5.44772 4 6 4H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_REFRESH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4V9H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 20V15H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9C4 9 6 4 12 4C16 4 19 6 20 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M20 15C20 15 18 20 12 20C8 20 5 18 4 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_SEARCH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
// Unified outline SVG icons (same stroke style as action buttons)
const ICON_FOLDER = `<svg class="folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const ICON_FILE = `<svg class="file-type-icon" width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3V8H19" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 13H15M9 17H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_IMAGE = `<svg class="file-type-icon" width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="10" r="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 16.5L8 12L12 15.5L16 11L21 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_VIDEO = `<svg class="file-type-icon" width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M10 10L15 12L10 14V10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const ICON_ZIP = `<svg class="file-type-icon" width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3V8H19" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 10V11M11 13V14M11 16V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="9.5" y="17.5" width="3" height="2" rx="0.5" stroke="currentColor" stroke-width="1.4"/></svg>`;

// List rows use inline SVG. Drag ghost needs a fully-decoded bitmap —
// SVG data-URLs often paint blank in setDragImage, so we rasterize to PNG.
const DRAG_ICON_SIZE = 44;
function svgToPngDataUrl(svgMarkup, size) {
  size = size || DRAG_ICON_SIZE;
  const cleaned = svgMarkup
    .replace(/class="[^"]*"/g, "")
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`)
    .replace(/currentColor/g, "#52525b");
  // White rounded card behind the stroke so the ghost is visible on any bg
  const wrapped =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="8" fill="#fff" stroke="#e4e4e7"/>` +
    `<g fill="none" transform="translate(${(size - 28) / 2},${(size - 28) / 2}) scale(${28 / 24})">` +
    cleaned.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") +
    `</g></svg>`;
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(wrapped);
  // Synchronous path: draw via Image is async; we also keep a preloaded map below.
  return svgUrl;
}

// Preloaded, fully decoded Image elements (key = "file"|"zip"|"video"|"image")
const dragIconReady = {}; // key -> HTMLImageElement (complete)
const dragIconPngUrl = {}; // key -> png data URL (after rasterize)

function rasterizeDragIcon(key, svgMarkup) {
  const size = DRAG_ICON_SIZE;
  const dpr = 2;
  const cleaned = svgMarkup
    .replace(/class="[^"]*"/g, "")
    .replace(/width="\d+"/, 'width="24"')
    .replace(/height="\d+"/, 'height="24"')
    .replace(/currentColor/g, "#52525b");
  const wrapped =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="8" fill="#ffffff" stroke="#e4e4e7"/>` +
    `<g fill="none" transform="translate(${(size - 28) / 2},${(size - 28) / 2}) scale(${28 / 24})">` +
    cleaned.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") +
    `</g></svg>`;
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(wrapped);
  const img = new Image();
  img.decoding = "sync";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0, size, size);
      const png = canvas.toDataURL("image/png");
      dragIconPngUrl[key] = png;
      const ready = new Image();
      ready.src = png;
      ready.width = size;
      ready.height = size;
      ready.onload = () => { dragIconReady[key] = ready; };
      // If already cached by browser
      if (ready.complete) dragIconReady[key] = ready;
    } catch (_) {
      dragIconReady[key] = img;
      dragIconPngUrl[key] = svgUrl;
    }
  };
  img.src = svgUrl;
}

rasterizeDragIcon("file", ICON_FILE);
rasterizeDragIcon("zip", ICON_ZIP);
rasterizeDragIcon("video", ICON_VIDEO);
rasterizeDragIcon("image", ICON_IMAGE);

function fileIconKeyForName(name) {
  name = name || "";
  if (/\.zip$/i.test(name)) return "zip";
  if (/\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|ogv)$/i.test(name)) return "video";
  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg|ico|heic|heif|tiff?)$/i.test(name)) return "image";
  return "file";
}
function isImageFileName(name) {
  return fileIconKeyForName(name) === "image";
}
function fileIconSvgForName(name) {
  const k = fileIconKeyForName(name);
  if (k === "zip") return ICON_ZIP;
  if (k === "video") return ICON_VIDEO;
  if (k === "image") return ICON_IMAGE;
  return ICON_FILE;
}
function fileIconUrlForName(name) {
  const k = fileIconKeyForName(name);
  return dragIconPngUrl[k] || dragIconPngUrl.file || "";
}

// Signed preview URLs for image thumbnails (list + drag ghost)
const thumbUrlCache = new Map(); // id -> { url, expiresAt }
// Real <img> objects kept alive so the browser's own image cache is warm —
// this is what actually removes the delay when a preview opens, not just
// having a signed URL string ready.
const warmedImageCache = new Map(); // id -> HTMLImageElement

function thumbUrlFor(fileId) {
  const c = thumbUrlCache.get(String(fileId));
  return c && c.url ? c.url : "";
}

/** Drop a file's thumbnail (signed URL + warmed image) from every in-memory
 * cache. Call this the moment a file is deleted — locally or remotely —
 * so a stale/old image can never be shown again for that id. */
function forgetThumb(fileId) {
  const key = String(fileId);
  thumbUrlCache.delete(key);
  warmedImageCache.delete(key);
}
function forgetThumbs(fileIds) {
  (fileIds || []).forEach(forgetThumb);
}

/** Preload every image file's bytes into the browser cache right away, so
 * opening a preview later is instant. Runs in the background and is safe
 * to call repeatedly — already-warmed images are skipped. */
function preloadAllThumbs(files) {
  (files || []).forEach((f) => {
    if (!isImageFileName(f.filename)) return;
    const key = String(f.id);
    const url = thumbUrlFor(key);
    if (!url) return;
    const existing = warmedImageCache.get(key);
    if (existing && existing.src === url) return; // already warmed for this URL
    const img = new Image();
    img.src = url;
    // Bytes + decode — preview ochilganda hech qanday kechikish bo'lmasin
    if (img.decode) img.decode().catch(() => {});
    warmedImageCache.set(key, img);
  });
}

/** Left-side icon: real square crop for images, SVG otherwise */
function fileLeadIconHtml(f) {
  if (f && isImageFileName(f.filename)) {
    const url = thumbUrlFor(f.id);
    if (url) {
      return `<img class="file-type-icon file-thumb" src="${escapeHtml(url)}" alt="" draggable="false" loading="lazy">`;
    }
    return `<span class="file-type-icon file-thumb file-thumb-pending" aria-hidden="true"></span>`;
  }
  return fileIconSvgForName(f ? f.filename : "");
}

async function prefetchThumbUrls(files) {
  const now = Date.now();
  const images = (files || []).filter((f) => isImageFileName(f.filename));
  const stale = images.filter((f) => {
    const cached = thumbUrlCache.get(String(f.id));
    return !cached || cached.expiresAt - now < 5 * 60 * 1000;
  });
  if (!stale.length) {
    // Still patch DOM in case cache was warm from a previous pass
  } else {
    await Promise.all(stale.map(async (f) => {
      // No download disposition — must work as <img src>
      const { data, error } = await sb.storage
        .from(BUCKET)
        .createSignedUrl(f.storage_path, 3600);
      if (!error && data) {
        thumbUrlCache.set(String(f.id), { url: data.signedUrl, expiresAt: Date.now() + 3600 * 1000 });
      }
    }));
  }
  // Warm the browser's real image cache for every image file (not just the
  // ones currently rendered as cards) so opening a preview later has zero delay.
  preloadAllThumbs(images);

  if (!fileListEl) return;
  fileListEl.querySelectorAll(".file-card[data-file-id]").forEach((card) => {
    const id = card.dataset.fileId;
    const url = thumbUrlFor(id);
    if (!url) return;
    const slot = card.querySelector(".file-type-icon");
    if (!slot) return;
    if (slot.tagName === "IMG") {
      if (slot.getAttribute("src") !== url) slot.src = url;
      return;
    }
    const img = document.createElement("img");
    img.className = "file-type-icon file-thumb";
    img.src = url;
    img.alt = "";
    img.draggable = false;
    img.loading = "lazy";
    slot.replaceWith(img);
  });
}

const BUCKET = "files";
const TABLE = "files";
const FOLDERS_TABLE = "folders";
const FAKE_EMAIL_DOMAIN = "gmail.com";

let allFiles = [];
let allFolders = [];
let newlyCreatedFolderId = null; // for appear animation
let currentSearch = "";
let currentFolder = null;
let selectedFileIds = new Set(); // ids currently selected via click/marquee
let lastClickedFileId = null; // for shift-click range select
let kbCursorId = null; // card the arrow keys are standing on (keyboard shortcuts)

// Claude / remote activity: don't toast our own uploads/deletes as "Claude"
const localUploadKeys = new Set(); // "filename:::size"
const localDeleteIds = new Set();
const localDeleteFolderIds = new Set();
const localDeleteFolderNames = new Set();
const highlightFileIds = new Set(); // ids to flash green after render
let filesListReady = false;

function markLocalUpload(filename, size) {
  const key = `${filename}:::${size}`;
  localUploadKeys.add(key);
  setTimeout(() => localUploadKeys.delete(key), 20000);
}
function markLocalDelete(id) {
  localDeleteIds.add(String(id));
  setTimeout(() => localDeleteIds.delete(String(id)), 20000);
}
function markLocalDeleteFolder(id, name) {
  localDeleteFolderIds.add(String(id));
  if (name) localDeleteFolderNames.add(String(name));
  setTimeout(() => {
    localDeleteFolderIds.delete(String(id));
    if (name) localDeleteFolderNames.delete(String(name));
  }, 20000);
}
function notifyRemoteFileChanges(prevFiles, nextFiles) {
  const remoteDeleted = [];
  if (!filesListReady) return remoteDeleted;
  const prevById = new Map((prevFiles || []).map((f) => [f.id, f]));
  const nextById = new Map((nextFiles || []).map((f) => [f.id, f]));

  for (const f of nextFiles || []) {
    if (prevById.has(f.id)) continue;
    const key = `${f.filename}:::${f.size}`;
    if (localUploadKeys.has(key)) continue;
    highlightFileIds.add(String(f.id));
    showToast(`Claude ${f.filename} qo'shdi`);
  }
  for (const f of prevFiles || []) {
    if (nextById.has(f.id)) continue;
    forgetThumb(f.id); // gone from the DB elsewhere (Claude/another session) — drop its cached image too
    if (localDeleteIds.has(String(f.id))) continue;
    showToast(`Claude ${f.filename} o'chirdi`, "warning");
    remoteDeleted.push(f);
  }
  return remoteDeleted;
}
/** Remote folder add/remove (Claude MCP). Returns folders deleted remotely. */
function notifyRemoteFolderChanges(prevFolders, nextFolders) {
  const remoteDeleted = [];
  if (!filesListReady) return remoteDeleted;
  const prevById = new Map((prevFolders || []).map((f) => [f.id, f]));
  const nextById = new Map((nextFolders || []).map((f) => [f.id, f]));

  // Optimistic folders ("temp-<ts>") are created locally by createFolder()/ensureFolderExists().
  // A background poll can land before the real row replaces the temp one; that is NOT a remote change.
  const isTemp = (f) => String(f.id).startsWith("temp-");
  const prevTempNames = new Set((prevFolders || []).filter(isTemp).map((f) => f.name.toLowerCase()));

  for (const f of nextFolders || []) {
    if (prevById.has(f.id)) continue;
    if (prevTempNames.has(String(f.name).toLowerCase())) continue; // my own just-created folder
    showToast(`Claude papka qo'shdi: ${f.name}`);
  }
  for (const f of prevFolders || []) {
    if (nextById.has(f.id)) continue;
    if (isTemp(f)) continue; // local optimistic folder, never a remote delete
    if (localDeleteFolderIds.has(String(f.id))) continue;
    showToast(`Claude papkani o'chirdi: ${f.name}`, "warning");
    remoteDeleted.push(f);
  }
  return remoteDeleted;
}

// URL routing (SPA):
//   /                              → all files
//   /f/folder/                     → folder
//   /f/image.png                   → root file
//   /f/folder/image.png            → file in folder
//   /f/image.png/20260908/         → same name disambiguated by upload date (YYYYMMDD)
function decodePathSeg(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}
function formatDateKey(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
function looksLikeFilename(seg) {
  if (!seg || !seg.includes(".")) return false;
  // any extension-looking tail; isViewable decides preview, others still route
  return /\.[a-zA-Z0-9]{1,12}$/.test(seg);
}
function parseAppPath(pathname) {
  const raw = (pathname || "/").replace(/\/+$/, "") || "/";
  if (raw === "/" || !raw.startsWith("/f/")) {
    return { folder: null, filename: null, dateKey: null };
  }
  const parts = raw.slice(3).split("/").filter(Boolean).map(decodePathSeg);
  let dateKey = null;
  if (parts.length && /^\d{8}$/.test(parts[parts.length - 1])) {
    dateKey = parts.pop();
  }
  if (!parts.length) return { folder: null, filename: null, dateKey: null };
  if (looksLikeFilename(parts[parts.length - 1])) {
    const filename = parts.pop();
    const folder = parts.length ? parts[0] : null;
    return { folder, filename, dateKey };
  }
  return { folder: parts[0] || null, filename: null, dateKey: null };
}
function parseFolderFromPath(pathname) {
  return parseAppPath(pathname).folder;
}
function folderToPath(folder) {
  if (folder == null || folder === "") return "/";
  return "/f/" + encodeURIComponent(folder) + "/";
}
function fileToPath(file) {
  if (!file || !file.filename) return folderToPath(file && file.folder);
  const folder = file.folder || null;
  const name = file.filename;
  let path = folder
    ? "/f/" + encodeURIComponent(folder) + "/" + encodeURIComponent(name)
    : "/f/" + encodeURIComponent(name);
  // Same name in same folder → append YYYYMMDD from uploaded_at
  const same = (allFiles || []).filter(
    (f) => f.filename === name && (f.folder || null) === folder
  );
  if (same.length > 1) {
    const key = formatDateKey(file.uploaded_at);
    if (key) path += "/" + key;
  }
  return path;
}
function syncUrl(path, state, replace) {
  const qs = window.location.search || "";
  const hash = window.location.hash || "";
  const url = path + qs + hash;
  const norm = (p) => (p || "/").replace(/\/+$/, "") || "/";
  if (replace) {
    history.replaceState(state, "", url);
  } else if (norm(window.location.pathname) === norm(path)) {
    history.replaceState(state, "", url);
  } else {
    history.pushState(state, "", url);
  }
}
function syncFolderUrl(folder, replace) {
  syncUrl(folderToPath(folder), { folder: folder, filename: null, dateKey: null }, replace);
}
function syncFileUrl(file, replace) {
  const path = fileToPath(file);
  syncUrl(path, {
    folder: file.folder || null,
    filename: file.filename,
    dateKey: formatDateKey(file.uploaded_at) || null,
    fileId: file.id
  }, replace);
}
function findFileFromPath(parsed) {
  if (!parsed || !parsed.filename) return null;
  const folder = parsed.folder || null;
  let candidates = (allFiles || []).filter(
    (f) => f.filename === parsed.filename && (f.folder || null) === folder
  );
  if (parsed.dateKey) {
    const byDate = candidates.filter((f) => formatDateKey(f.uploaded_at) === parsed.dateKey);
    if (byDate.length) candidates = byDate;
  }
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    // Prefer exact date, else newest
    candidates.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    return candidates[0];
  }
  return null;
}
/** After list load: open file from URL if path points to one. */
function applyPathAfterLoad(opts) {
  const parsed = parseAppPath(window.location.pathname);
  // Stay on All after refresh; only a file path may still open a preview.
  if (!parsed.filename) return;
  const file = findFileFromPath(parsed);
  if (!file) {
    // Bunday fayl yo'q -> root ga qaytamiz (faqat ro'yxat haqiqatan yuklangan bo'lsa)
    if (filesListReady) {
      currentFolder = null;
      history.replaceState({ folder: null, filename: null, dateKey: null }, "", "/" + (window.location.search || "") + (window.location.hash || ""));
      renderToolbar();
      renderFiles();
    }
    return;
  }
  const kind = isViewable(file.filename);
  if (!kind) return;
  if (annotState.open && annotState.file && annotState.file.id === file.id) return;
  openAnnotationViewer(file, kind, { skipUrl: true });
}

let realtimeChannel = null;
let realtimeDebounce = null;
let pollTimer = null;
const POLL_MS = 2000; // fallback refresh interval, no Supabase config needed

// ==========================================
// LIVE UPDATES (no Supabase dashboard access needed)
// ==========================================
// Two mechanisms, both purely client-side:
//   1) A lightweight poll every POLL_MS that silently re-fetches the file
//      list. This alone guarantees changes show up within ~2s, with zero
//      Supabase configuration required.
//   2) A best-effort Realtime subscription (postgres_changes). This only
//      fires if the project's "files"/"folders" tables happen to already be
//      in the realtime publication; if not, it silently does nothing and
//      polling still covers you. Safe to leave in either way.
function startPolling(userId) {
  stopPolling();
  if (!userId) return;
  pollTimer = setInterval(() => {
    if (document.visibilityState === "visible") loadFiles(true);
  }, POLL_MS);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function setupRealtime(userId) {
  if (realtimeChannel) {
    sb.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  if (!userId) return;

  const scheduleReload = () => {
    // Debounce so a burst of changes (e.g. bulk upload) triggers one reload.
    clearTimeout(realtimeDebounce);
    realtimeDebounce = setTimeout(loadFiles, 50);
  };

  realtimeChannel = sb
    .channel(`mrdrive-changes-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE, filter: `user_id=eq.${userId}` },
      scheduleReload
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: FOLDERS_TABLE, filter: `user_id=eq.${userId}` },
      scheduleReload
    )
    .subscribe();
}

// ==========================================
// PUBLIC LINK MODAL
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const shareToken = urlParams.get("share");

/** Splash (3s) davomida orqa fonda yuklab qo'yiladigan statik narsalar:
 * ikonlar, Claude logo, PDF worker. Fayl ro'yxati va rasm thumbnaillari
 * loadFiles() ichida yuklanadi (prefetchThumbUrls / prefetchDragUrls). */
function preloadBootAssets() {
  ["image", "zip", "folder", "video", "file"].forEach((n) => {
    const img = new Image();
    img.src = `/assets/${n}-icon.png`;
    if (img.decode) img.decode().catch(() => {});
  });
  const claude = new Image();
  claude.src = "/claude-icon.png";
  // PDF viewer worker — birinchi PDF ochilganda kutib turmasin
  try {
    fetch("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js", { mode: "no-cors" }).catch(() => {});
  } catch (_) { /* best-effort */ }
}

if (shareToken) {
  // Ochiq havola: splash kerak emas
  if (window.MRSplash) window.MRSplash.skip(); else bootLoader.style.display = "none";
  if (appScreen) appScreen.style.display = "none";
  showPublicDownloadModal(shareToken);
} else {
  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // App splash ORQASIDA render bo'ladi (splash opaque, ustida turadi):
      // fayllar, papkalar, thumbnaillar, ikonlar — hammasi 2 soniya ichida
      // yuklanib, splash tugaganda tayyor holda ochiladi.
      if (appScreen) appScreen.style.display = "block";
      preloadBootAssets();
      const parsed = parseAppPath(window.location.pathname);
      // Refresh / first paint always starts on All — folder tabs are session-only.
      currentFolder = null;
      if (!parsed.filename) {
        syncFolderUrl(null, true);
      }
      loadFiles().then(() => applyPathAfterLoad());
      setupRealtime(session.user.id);
      startPolling(session.user.id);
    } else {
      // Ro'yxatdan o'tmagan / login qilmagan — login sahifasiga
      location.replace("/login/");
    }
  });
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac", "opus", "weba"];
const PDF_EXTENSIONS = ["pdf"];

function getFileExt(filename) {
  return (filename.split(".").pop() || "").toLowerCase();
}

function getFileKind(filename) {
  const ext = getFileExt(filename);
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (PDF_EXTENSIONS.includes(ext)) return "pdf";
  return "other";
}

function showPublicDownloadModal(token) {
  const modal = document.createElement("div");
  modal.id = "public-modal";
  modal.innerHTML = `
    <div class="public-modal-backdrop">
      <div class="public-modal-box is-boot" id="public-modal-box">
        <div class="public-topbar" id="public-info">
          <div class="public-topbar-main">
            <div class="public-modal-icon is-loading" id="public-modal-icon">${ICON_SPINNER}</div>
            <div class="public-topbar-text">
              <h2 id="public-filename">Loading…</h2>
              <p id="public-meta" class="public-meta"></p>
              <a class="public-brand-link" href="https://mrdrive.vercel.app" target="_blank" rel="noopener noreferrer" title="MRdrive">MRdrive</a>
            </div>
          </div>
          <div class="public-actions">
            <button id="public-edit-btn" class="public-edit-btn" title="Tahrirlash" style="display:none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </button>
            <button id="public-download-btn" class="public-download-btn" disabled title="Yuklab olish" aria-label="Yuklab olish">${ICON_DOWNLOAD}</button>
            <button id="public-fs-btn" class="public-fs-btn" title="Fullscreen" aria-label="Fullscreen" style="display:none;">${ICON_FULLSCREEN}</button>
          </div>
          <p id="public-status" class="public-status"></p>
        </div>
        <div id="public-preview-wrap"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // Behave like a standalone page: no scrolling of the page behind
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  const modalBox = document.getElementById("public-modal-box");
  const previewWrap = document.getElementById("public-preview-wrap");
  const modalIcon = document.getElementById("public-modal-icon");
  const filenameEl = document.getElementById("public-filename");
  const metaEl = document.getElementById("public-meta");
  const statusEl = document.getElementById("public-status");
  const downloadBtn = document.getElementById("public-download-btn");
  const fsBtn = document.getElementById("public-fs-btn");
  const editBtn = document.getElementById("public-edit-btn");
  let publicEdit = null; // set once an image preview loads; see setupPublicImageEdit

  sb.from(TABLE)
    .select("*")
    .eq("public_token", token)
    .eq("is_public", true)
    .single()
    .then(async ({ data, error }) => {
      // Data arrived: leave the spinner-only boot state
      modalBox.classList.remove("is-boot");
      if (error || !data) {
        modalIcon.classList.remove("is-loading");
        modalIcon.innerHTML = ICON_DOWNLOAD;
        modalBox.classList.add("is-error");
        filenameEl.textContent = "Fayl topilmadi";
        metaEl.textContent = "Bu havola o'chirilgan yoki mavjud emas.";
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        modalIcon.classList.remove("is-loading");
        modalIcon.innerHTML = ICON_DOWNLOAD;
        modalBox.classList.add("is-error");
        filenameEl.textContent = "Muddati tugagan";
        metaEl.textContent = "Bu havolaning muddati tugagan.";
        return;
      }

      filenameEl.textContent = data.filename;
      let meta = `${formatSize(data.size)} · ${formatDate(data.uploaded_at)}`;
      if (data.expires_at) {
        meta += ` · <span class="public-expiry-inline">amal qilish: ${formatDate(data.expires_at)}</span>`;
      }
      metaEl.innerHTML = meta;

      downloadBtn.disabled = false;

      const kind = getFileKind(data.filename);

      // Previewable files: switch to the full preview layout IMMEDIATELY
      // with a loading spinner, instead of flashing the plain download card
      // while the signed URL / media loads.
      const loaderEl = document.createElement("div");
      loaderEl.className = "public-loading";
      loaderEl.innerHTML = `${ICON_SPINNER}<span>Loading preview…</span>`;
      const hideLoader = () => {
        loaderEl.classList.add("is-hiding");
        setTimeout(() => loaderEl.remove(), 220);
      };
      if (kind === "image" || kind === "video" || kind === "audio" || kind === "pdf") {
        modalIcon.style.display = "none";
        modalBox.classList.add("has-preview");
        previewWrap.appendChild(loaderEl);
      } else {
        modalIcon.classList.remove("is-loading");
        modalIcon.innerHTML = ICON_DOWNLOAD;
      }

      if (kind === "image" || kind === "video" || kind === "audio") {
        const { data: previewUrlData, error: previewUrlError } = await sb.storage
          .from(BUCKET)
          .createSignedUrl(data.storage_path, 3600);

        if (previewUrlError || !previewUrlData) {
          hideLoader();
          modalBox.classList.remove("has-preview");
          modalIcon.style.display = "";
          modalIcon.classList.remove("is-loading");
          modalIcon.innerHTML = ICON_DOWNLOAD;
        } else {
          fsBtn.style.display = "flex";
          if (kind !== "audio") {
            fsBtn.style.display = "flex";
            setupPublicFullscreen(fsBtn, modalBox, previewWrap);
            setupPublicControlsFade(modalBox, previewWrap, kind !== "video");
          }

          if (kind === "image") {
            // crossOrigin BEFORE src — otherwise canvas export (edit→download) taints
            const wrap = document.createElement("div");
            wrap.className = "public-preview is-image";
            const imgEl = document.createElement("img");
            imgEl.crossOrigin = "anonymous";
            imgEl.alt = data.filename;
            imgEl.loading = "eager";
            imgEl.classList.add("public-fade-in");
            wrap.appendChild(imgEl);
            // keep the loader in place; remove only the old content
            Array.from(previewWrap.children).forEach((c) => { if (c !== loaderEl) c.remove(); });
            previewWrap.appendChild(wrap);
            imgEl.addEventListener("load", () => {
              hideLoader();
              imgEl.classList.add("is-loaded");
              editBtn.style.display = "flex";
              publicEdit = setupPublicImageEdit(editBtn, previewWrap, imgEl);
            }, { once: true });
            imgEl.addEventListener("error", () => {
              hideLoader();
              statusEl.textContent = "Rasmni yuklab bo'lmadi";
            }, { once: true });
            imgEl.src = previewUrlData.signedUrl;
          } else if (kind === "audio") {
            Array.from(previewWrap.children).forEach((c) => { if (c !== loaderEl) c.remove(); });
            const wrap = document.createElement("div");
            wrap.className = "public-preview is-audio";
            previewWrap.appendChild(wrap);
            mountMrAudioPlayer(wrap, {
              url: previewUrlData.signedUrl,
              filename: data.filename,
              size: data.size,
              shareUrl: window.location.href,
              onReady: hideLoader,
              onError: () => { hideLoader(); statusEl.textContent = "Audioni yuklab bo'lmadi"; }
            });
          } else {
            Array.from(previewWrap.children).forEach((c) => { if (c !== loaderEl) c.remove(); });
            const wrap = document.createElement("div");
            wrap.className = "public-preview is-video";
            const videoEl = document.createElement("video");
            videoEl.controls = true;
            videoEl.playsInline = true;
            videoEl.setAttribute("webkit-playsinline", "");
            videoEl.preload = "metadata";
            videoEl.addEventListener("loadeddata", hideLoader, { once: true });
            videoEl.addEventListener("loadedmetadata", hideLoader, { once: true });
            videoEl.addEventListener("error", () => {
              hideLoader();
              statusEl.textContent = "Videoni yuklab bo'lmadi";
            }, { once: true });
            videoEl.src = previewUrlData.signedUrl;
            wrap.appendChild(videoEl);
            previewWrap.appendChild(wrap);
          }
        }
      } else if (kind === "pdf") {
        const { data: previewUrlData, error: previewUrlError } = await sb.storage
          .from(BUCKET)
          .createSignedUrl(data.storage_path, 3600);

        if (previewUrlError || !previewUrlData || !window.pdfjsLib) {
          hideLoader();
          modalBox.classList.remove("has-preview");
          modalIcon.style.display = "";
          modalIcon.classList.remove("is-loading");
          modalIcon.innerHTML = ICON_DOWNLOAD;
        } else {
          try {
            const pages = await renderPublicPdf(previewUrlData.signedUrl, previewWrap);
            hideLoader();
            statusEl.textContent = "";
            editBtn.style.display = "flex";
            publicEdit = setupPublicPdfEdit(editBtn, pages);
            setupPublicControlsFade(modalBox, previewWrap, true);
          } catch (err) {
            console.error(err);
            hideLoader();
            statusEl.textContent = "PDF ni ko'rib bo'lmadi";
          }
        }
      }

      downloadBtn.onclick = async () => {
        statusEl.textContent = "Yuklab olishga tayyorlanmoqda...";
        downloadBtn.disabled = true;

        try {
          // If the person drew on the image/PDF with Edit, download the
          // edited version locally instead of fetching the original from
          // storage.
          if (publicEdit && publicEdit.hasDrawing()) {
            let blob = null;
            try {
              blob = await publicEdit.getEditedBlob();
            } catch (err) {
              console.error("getEditedBlob failed:", err);
            }
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              // Prefer .png for annotated images so strokes are preserved
              const name = data.filename || "download";
              a.download = /\.(png|jpe?g|webp|gif)$/i.test(name)
                ? name.replace(/\.[^.]+$/, "") + "-edited.png"
                : name;
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
              statusEl.textContent = "Yuklab olindi";
              return;
            }
            statusEl.textContent = "Chizma eksport qilinmadi — asl fayl...";
          }

          const { data: urlData, error: urlError } = await sb.storage
            .from(BUCKET)
            .createSignedUrl(data.storage_path, 60, {
              download: data.filename
            });

          if (urlError) {
            statusEl.textContent = "Xato: " + urlError.message;
            return;
          }

          const a = document.createElement("a");
          a.href = urlData.signedUrl;
          a.download = data.filename;
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();

          sb.rpc("increment_download_count", { file_id: data.id });
          statusEl.textContent = "Yuklab olindi";
        } catch (err) {
          console.error(err);
          statusEl.textContent = "Xato: " + (err.message || "download failed");
        } finally {
          downloadBtn.disabled = false;
        }
      };
    });
}

// Lightweight, standalone pencil-only drawing overlay for the public share
// preview (no toolbar — Edit just toggles freehand drawing on/off).
// Renders every page of a public PDF into the preview area using pdf.js,
// stacking a same-size transparent drawing canvas on top of each page's
// raster canvas. Returns the list of {renderCanvas, drawCanvas, width,
// height} pairs so setupPublicPdfEdit can wire pencil drawing on them and
// the download handler can flatten them back into a PDF.
async function renderPublicPdf(url, previewWrap) {
  const wrap = document.createElement("div");
  wrap.className = "public-preview is-pdf";
  Array.from(previewWrap.children).forEach((c) => {
    if (!c.classList.contains("public-loading")) c.remove();
  });
  previewWrap.appendChild(wrap);

  const pdf = await pdfjsLib.getDocument(url).promise;
  const dpr = dprOverride || Math.min(Math.round(window.devicePixelRatio || 1), 2) || 1;
  const cssWidth = Math.min(900, wrap.clientWidth || window.innerWidth || 800);
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const unscaled = page.getViewport({ scale: 1 });
    const scale = (cssWidth / unscaled.width) * dpr;
    const viewport = page.getViewport({ scale });

    const pageWrap = document.createElement("div");
    pageWrap.className = "public-pdf-page";
    pageWrap.style.width = (viewport.width / dpr) + "px";
    pageWrap.style.height = (viewport.height / dpr) + "px";

    const renderCanvas = document.createElement("canvas");
    renderCanvas.className = "public-pdf-render-canvas";
    renderCanvas.width = viewport.width;
    renderCanvas.height = viewport.height;
    await page.render({ canvasContext: renderCanvas.getContext("2d"), viewport }).promise;

    const drawCanvas = document.createElement("canvas");
    drawCanvas.className = "public-edit-canvas";
    drawCanvas.width = viewport.width;
    drawCanvas.height = viewport.height;
    drawCanvas.style.left = "0";
    drawCanvas.style.top = "0";
    drawCanvas.style.width = "100%";
    drawCanvas.style.height = "100%";

    pageWrap.appendChild(renderCanvas);
    pageWrap.appendChild(drawCanvas);
    wrap.appendChild(pageWrap);

    pages.push({ renderCanvas, drawCanvas, width: viewport.width, height: viewport.height });
  }

  return pages;
}

// Pencil-only drawing across every page of a rendered PDF. Same on/off
// toggle behavior as setupPublicImageEdit, and the same
// hasDrawing()/getEditedBlob() interface, so the download handler doesn't
// need to know whether it's dealing with an image or a PDF.
function setupPublicPdfEdit(editBtn, pages) {
  let editing = false;
  let drawing = false;
  let hasStrokes = false;

  pages.forEach((p) => {
    const ctx = p.drawCanvas.getContext("2d");
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, p.width / 250);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const getPos = (e) => {
      const rect = p.drawCanvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (p.drawCanvas.width / rect.width),
        y: (e.clientY - rect.top) * (p.drawCanvas.height / rect.height)
      };
    };

    p.drawCanvas.addEventListener("pointerdown", (e) => {
      if (!editing) return;
      drawing = true;
      p.drawCanvas.setPointerCapture(e.pointerId);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });
    p.drawCanvas.addEventListener("pointermove", (e) => {
      if (!editing || !drawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      hasStrokes = true;
    });
    const stop = () => { drawing = false; };
    p.drawCanvas.addEventListener("pointerup", stop);
    p.drawCanvas.addEventListener("pointercancel", stop);
    p.drawCanvas.addEventListener("pointerleave", stop);
  });

  editBtn.onclick = () => {
    editing = !editing;
    editBtn.classList.toggle("active", editing);
    editBtn.title = editing ? "Chizishni tugatish" : "Tahrirlash";
    // Keep pencil icon always visible (active = red bg + white icon)
    if (!editBtn.querySelector("svg")) {
      editBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    }
    pages.forEach((p) => {
      p.drawCanvas.style.pointerEvents = editing ? "auto" : "none";
    });
  };

  return {
    hasDrawing: () => hasStrokes,
    getEditedBlob: async () => {
      if (!window.PDFLib) return null;
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();
      for (const p of pages) {
        const off = document.createElement("canvas");
        off.width = p.width;
        off.height = p.height;
        const octx = off.getContext("2d");
        octx.drawImage(p.renderCanvas, 0, 0);
        octx.drawImage(p.drawCanvas, 0, 0);
        const pngBytes = await fetch(off.toDataURL("image/png")).then(r => r.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const pdfPage = pdfDoc.addPage([p.width, p.height]);
        pdfPage.drawImage(pngImage, { x: 0, y: 0, width: p.width, height: p.height });
      }
      const bytes = await pdfDoc.save();
      return new Blob([bytes], { type: "application/pdf" });
    }
  };
}

function setupPublicImageEdit(editBtn, previewWrap, imgEl) {
  let editing = false;
  let canvas = null;
  let ctx = null;
  let drawing = false;
  let hasStrokes = false;

  // The <img> uses object-fit: contain, so its rendered pixels usually don't
  // fill the whole wrap (letterboxing). Compute that inner content rect so
  // the drawing canvas lines up with what the user actually sees.
  function syncCanvasRect() {
    const wrap = previewWrap.querySelector(".public-preview.is-image");
    if (!wrap || !canvas) return;
    const wrapRect = wrap.getBoundingClientRect();
    const naturalW = imgEl.naturalWidth || 1;
    const naturalH = imgEl.naturalHeight || 1;
    const containerRatio = wrapRect.width / wrapRect.height;
    const imageRatio = naturalW / naturalH;

    let width, height;
    if (imageRatio > containerRatio) {
      width = wrapRect.width;
      height = width / imageRatio;
    } else {
      height = wrapRect.height;
      width = height * imageRatio;
    }
    canvas.style.left = (wrapRect.width - width) / 2 + "px";
    canvas.style.top = (wrapRect.height - height) / 2 + "px";
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function buildCanvas() {
    canvas = document.createElement("canvas");
    canvas.className = "public-edit-canvas";
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;

    ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, imgEl.naturalWidth / 250);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    canvas.addEventListener("pointerdown", (e) => {
      if (!editing) return;
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!editing || !drawing) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      hasStrokes = true;
    });
    const stop = () => { drawing = false; };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    canvas.addEventListener("pointerleave", stop);

    const wrap = previewWrap.querySelector(".public-preview.is-image");
    wrap.style.position = "relative";
    wrap.appendChild(canvas);
    syncCanvasRect();
    window.addEventListener("resize", syncCanvasRect);
    document.addEventListener("fullscreenchange", syncCanvasRect);
  }

  editBtn.onclick = () => {
    editing = !editing;
    editBtn.classList.toggle("active", editing);
    editBtn.title = editing ? "Chizishni tugatish" : "Tahrirlash";
    // Keep pencil icon always visible (active = red bg + white icon)
    if (!editBtn.querySelector("svg")) {
      editBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    }
    if (editing && !canvas) buildCanvas();
    if (canvas) {
      canvas.style.pointerEvents = editing ? "auto" : "none";
      syncCanvasRect();
    }
  };

  return {
    hasDrawing: () => hasStrokes,
    getEditedBlob: () => new Promise((resolve) => {
      try {
        const w = imgEl.naturalWidth || (canvas && canvas.width) || 0;
        const h = imgEl.naturalHeight || (canvas && canvas.height) || 0;
        if (!w || !h) {
          resolve(null);
          return;
        }
        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        const octx = off.getContext("2d");
        try {
          octx.drawImage(imgEl, 0, 0, w, h);
        } catch (e) {
          // CORS-tainted image — cannot export composite
          console.error("drawImage base failed:", e);
          resolve(null);
          return;
        }
        if (canvas) {
          try {
            octx.drawImage(canvas, 0, 0, w, h);
          } catch (e) {
            console.error("drawImage strokes failed:", e);
          }
        }
        off.toBlob((blob) => resolve(blob || null), "image/png");
      } catch (e) {
        console.error("getEditedBlob:", e);
        resolve(null);
      }
    })
  };
}

// Fullscreen: the button sits in the bottom panel, never on top of the preview.
// Desktop/Android: real Fullscreen API. iPhone (no element fullscreen): native player for video,
// "focus mode" for images (text hidden, preview gets the max space).
function setupPublicFullscreen(btn, modalBox, previewWrap) {
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const canReal = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);

  const sync = () => {
    const active = !!fsEl() || modalBox.classList.contains("focus-mode");
    btn.innerHTML = active ? ICON_EXIT_FULLSCREEN : ICON_FULLSCREEN;
    const label = active ? "Exit fullscreen" : "Fullscreen";
    btn.title = label;
    btn.setAttribute("aria-label", label);
  };

  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);

  // Clicking the image while in fullscreen also exits
  previewWrap.addEventListener("click", (e) => {
    if (fsEl() && e.target.tagName === "IMG") {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  });

  btn.onclick = () => {
    const target = previewWrap.querySelector(".public-preview");
    if (!target) return;

    if (fsEl()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      return;
    }
    if (modalBox.classList.contains("focus-mode")) {
      modalBox.classList.remove("focus-mode");
      sync();
      return;
    }

    if (canReal && (target.requestFullscreen || target.webkitRequestFullscreen)) {
      const req = target.requestFullscreen || target.webkitRequestFullscreen;
      Promise.resolve(req.call(target)).catch(() => {
        modalBox.classList.add("focus-mode");
        sync();
      });
      return;
    }

    const video = target.querySelector("video");
    if (video && video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }

    modalBox.classList.add("focus-mode");
    sync();
  };
}

// Keeps the content in the spotlight: the filename/download bar fades out
// after a moment of inactivity so the preview gets the full screen, and
// reappears on any tap/move/scroll. Images and PDFs (no built-in controls
// of their own) auto-hide; video keeps the bar up since native controls
// already need room and the person is actively scrubbing.
function setupPublicControlsFade(modalBox, previewWrap, autoHide) {
  if (!autoHide) return;
  let hideTimer = null;
  const HIDE_DELAY = 2600;

  const show = () => {
    modalBox.classList.remove("controls-hidden");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      modalBox.classList.add("controls-hidden");
    }, HIDE_DELAY);
  };

  ["pointerdown", "pointermove", "wheel", "touchstart"].forEach((evt) => {
    modalBox.addEventListener(evt, show, { passive: true });
  });

  show();
}

// ==========================================
// AUTH
// ==========================================

// "Delete without asking" — saved in the browser (localStorage), shared by all
// tabs; read fresh every time so a change in Settings applies immediately.
const SKIP_DELETE_KEY = "mrdrive_skip_delete_confirm";
let skipDeleteMemory = false; // fallback if localStorage is blocked
function isSkipDeleteConfirm() {
  try {
    const v = localStorage.getItem(SKIP_DELETE_KEY);
    if (v !== null) return v === "1";
  } catch (_) {}
  return skipDeleteMemory;
}
function setSkipDeleteConfirm(on) {
  skipDeleteMemory = !!on;
  try { localStorage.setItem(SKIP_DELETE_KEY, on ? "1" : "0"); } catch (_) {}
}

async function logout() {
  await sb.auth.signOut();
  location.replace("/login/");
}

// ==========================================
// USAGE — Supabase storage quota in the settings menu
// Red = video, yellow = images, blue = everything else.
// Totals come from the get_storage_usage() SQL function (usage-stats.sql),
// which sums the WHOLE project. If it isn't installed yet we fall back to the
// signed-in user's own files and say so.
// ==========================================
// The real limit is stored in the database (app_settings.storage_limit_bytes) and
// returned by get_storage_usage(); Supabase doesn't expose the plan quota to the
// browser. 1 GB (Free plan) is only the fallback until usage-stats.sql is run.
const DEFAULT_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;
let usageFetchedAt = 0;

function renderStorageUsage(u, note) {
  const STORAGE_LIMIT_BYTES = Number(u.limit) > 0 ? Number(u.limit) : DEFAULT_STORAGE_LIMIT_BYTES;
  const total = (u.video || 0) + (u.image || 0) + (u.file || 0);
  const pct = (total / STORAGE_LIMIT_BYTES) * 100;
  const pctText = total > 0 && pct < 0.1 ? "<0.1%" : (pct >= 10 ? Math.round(pct) : pct.toFixed(1)) + "%";
  const $ = (id) => document.getElementById(id);

  const pctEl = $("usage-pct");
  pctEl.textContent = pctText;
  pctEl.classList.toggle("is-warn", pct >= 70 && pct < 90);
  pctEl.classList.toggle("is-full", pct >= 90);

  // Segment widths are shares of the 1 GB limit (scaled down if somehow over).
  const scale = Math.max(total, STORAGE_LIMIT_BYTES);
  const seg = (id, bytes) => {
    const w = bytes > 0 ? Math.max(1.2, (bytes / scale) * 100) : 0; // keep tiny slices visible
    $(id).style.width = w + "%";
  };
  seg("usage-seg-video", u.video || 0);
  seg("usage-seg-image", u.image || 0);
  seg("usage-seg-file", u.file || 0);
  $("usage-bar").setAttribute("aria-valuenow", String(Math.min(100, Math.round(pct))));

  $("usage-total").textContent = `${formatSize(total)} / ${formatSize(STORAGE_LIMIT_BYTES)} ishlatilgan`;
  $("usage-video").textContent = formatSize(u.video || 0);
  $("usage-image").textContent = formatSize(u.image || 0);
  $("usage-file").textContent = formatSize(u.file || 0);

  const noteEl = $("usage-note");
  const bits = [];
  if (typeof u.mine === "number") bits.push(`Sizning fayllaringiz: ${formatSize(u.mine)}`);
  if (note) bits.push(note);
  noteEl.textContent = bits.join(" · ");
  noteEl.hidden = !bits.length;
}

async function refreshStorageUsage() {
  if (Date.now() - usageFetchedAt < 3000) return; // don't hammer the DB on every open
  try {
    const { data, error } = await sb.rpc("get_storage_usage");
    if (error || !data) throw error || new Error("no data");
    renderStorageUsage(data);
    usageFetchedAt = Date.now();
  } catch (err) {
    // Fallback: only this user's own files (RLS), until usage-stats.sql is run.
    const mine = { video: 0, image: 0, file: 0 };
    (allFiles || []).forEach((f) => {
      const k = fileIconKeyForName(f.filename);
      mine[k === "video" ? "video" : k === "image" ? "image" : "file"] += f.size || 0;
    });
    renderStorageUsage(mine, "faqat sizning fayllaringiz (usage-stats.sql ni ishga tushiring)");
  }
}

// Gear icon → sozlamalar modal (Claude ga ulang + Account + Log out)
(function initSettingsMenu() {
  const gearBtn = document.getElementById("gear-btn");
  const modal = document.getElementById("settings-modal");
  const logoutBtn = document.getElementById("settings-logout-btn");
  const accountBtn = document.getElementById("settings-account-btn");
  const accountPanel = document.getElementById("settings-account-panel");
  const accountNameEl = document.getElementById("account-name");
  const accountUsernameEl = document.getElementById("account-username");
  const skipDeleteCb = document.getElementById("settings-skip-delete");
  if (!gearBtn || !modal) return;
  skipDeleteCb?.addEventListener("change", () => setSkipDeleteConfirm(skipDeleteCb.checked));

  function closeSettings() {
    modal.hidden = true;
    gearBtn.classList.remove("open");
    if (accountPanel) accountPanel.hidden = true;
  }
  function openSettings() {
    if (skipDeleteCb) skipDeleteCb.checked = isSkipDeleteConfirm();
    modal.hidden = false;
    gearBtn.classList.add("open");
    refreshStorageUsage();
  }

  gearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (modal.hidden) openSettings();
    else closeSettings();
  });

  accountBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!accountPanel) return;
    const opening = accountPanel.hidden;
    if (opening) {
      // Sessiyadan name / username
      sb.auth.getSession().then(({ data: { session } }) => {
        const meta = session?.user?.user_metadata || {};
        if (accountNameEl) accountNameEl.textContent = meta.name || "—";
        if (accountUsernameEl) accountUsernameEl.textContent = meta.username || "—";
      });
    }
    accountPanel.hidden = !opening;
  });

  logoutBtn?.addEventListener("click", () => {
    closeSettings();
    logout();
  });
  document.addEventListener("click", (e) => {
    if (!modal.hidden && !modal.contains(e.target) && !gearBtn.contains(e.target)) {
      closeSettings();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSettings();
  });
})();

sb.auth.onAuthStateChange((event, session) => {
  // Splash paytida boot oqimi hamma narsani o'zi yuklaydi — takror yuklamaymiz
  // (lekin sign-out bo'lsa baribir login'ga o'tamiz).
  if (splashActive() && session) return;
  // Public share link — login majburiy emas
  if (shareToken) return;
  if (session) {
    if (appScreen) appScreen.style.display = "block";
    loadFiles();
    setupRealtime(session.user.id);
    startPolling(session.user.id);
  } else {
    setupRealtime(null);
    stopPolling();
    location.replace("/login/");
  }
});

// ==========================================
// UPLOAD  (dedup + real progress bar)
// ==========================================

// No blocked extensions — any file type can be uploaded.

// --- Deduplication -------------------------------------------------------
// A file is "the same" if name + size match. lastModified is deliberately NOT
// part of the key: a pasted clipboard image ("image.png") gets a brand-new
// lastModified on every paste, so including it made every CTRL+V look unique.
// The ID is added to the Set SYNCHRONOUSLY (before any `await`), so a burst of
// pastes can never slip through. After a successful upload the ID stays blocked
// for DUPLICATE_COOLDOWN_MS (fast uploads finish before the next paste arrives,
// so in-flight tracking alone is not enough). On error it is freed immediately
// so the user can retry. A skipped duplicate is never silent: a toast tells why.
const uploadingFileIds = new Set();
const DUPLICATE_COOLDOWN_MS = 15000;
let lastDuplicateToastAt = 0;

function getFileUniqueId(file) {
  return `${file.name}:::${file.size}`;
}

function notifyDuplicate(file) {
  console.warn(`Skipped duplicate: ${file.name}`);
  const now = Date.now();
  if (now - lastDuplicateToastAt < 2000) return; // one toast per burst
  lastDuplicateToastAt = now;
  showToast("Takror fayl o'tkazib yuborildi", "warning", `${file.name} hozirgina yuklandi`);
}

// --- Progress UI ---------------------------------------------------------
// One DOM item per upload (NOT keyed by filename - two files can share a name).
// Everything goes through textContent, never innerHTML: file names are user input.
function createProgressItem(filename) {
  const item = document.createElement("div");
  item.className = "upload-item";

  const top = document.createElement("div");
  top.className = "upload-item-top";

  const name = document.createElement("span");
  name.className = "upload-item-name";
  name.textContent = filename;

  const status = document.createElement("span");
  status.className = "upload-item-status";
  status.textContent = "0%";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "upload-item-cancel";
  cancelBtn.title = "Bekor qilish";
  cancelBtn.setAttribute("aria-label", "Bekor qilish");
  cancelBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  const meta = document.createElement("div");
  meta.className = "upload-item-meta";
  meta.append(status, cancelBtn);

  top.append(name, meta);

  const track = document.createElement("div");
  track.className = "upload-bar";
  const fill = document.createElement("div");
  fill.className = "upload-bar-fill";
  track.appendChild(fill);

  item.append(top, track);
  uploadProgressEl.appendChild(item);

  let cancelled = false;
  let abortFn = null;
  const onCancelFns = [];

  function hideCancel() {
    cancelBtn.style.display = "none";
  }

  cancelBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (cancelled) return;
    cancelled = true;
    hideCancel();
    if (typeof abortFn === "function") {
      try { abortFn(); } catch (_) {}
    }
    onCancelFns.forEach((fn) => { try { fn(); } catch (_) {} });
    item.classList.remove("queued", "saving");
    item.classList.add("cancelled");
    fill.style.width = fill.style.width || "0%";
    status.textContent = "Bekor qilindi";
    setTimeout(() => item.remove(), 900);
  });

  return {
    isCancelled() { return cancelled; },
    setAbort(fn) { abortFn = fn; },
    onCancel(fn) { onCancelFns.push(fn); },
    setQueued() {
      if (cancelled) return;
      fill.style.width = "0%";
      status.textContent = "Kutilmoqda…";
      item.classList.add("queued");
    },
    setPercent(p) {
      if (cancelled) return;
      item.classList.remove("queued");
      const v = Math.max(0, Math.min(100, Math.round(p)));
      fill.style.width = v + "%";
      status.textContent = v + "%";
    },
    setSaving() {
      if (cancelled) return;
      fill.style.width = "100%";
      status.textContent = "Saqlanmoqda…";
      item.classList.add("saving");
    },
    setDone() {
      if (cancelled) return;
      hideCancel();
      item.classList.remove("saving");
      item.classList.add("done");
      fill.style.width = "100%";
      status.textContent = "Bajarildi";
      setTimeout(() => item.remove(), 1200);
    },
    setError(message) {
      if (cancelled) return;
      hideCancel();
      item.classList.remove("saving");
      item.classList.add("error");
      fill.style.width = "100%";
      status.textContent = message || "Error";
      item.title = "Click to dismiss";
      item.addEventListener("click", () => item.remove());
      setTimeout(() => item.remove(), 10000);
    }
  };
}

// --- Real upload progress --------------------------------------------------
// supabase-js has no progress callback, so we POST to the Storage REST endpoint
// ourselves with XMLHttpRequest (xhr.upload.onprogress = real bytes sent).
// Same endpoint / headers / body format that supabase-js uses internally.
function uploadToStorage(path, file, accessToken, onProgress, upsert) {
  let xhr = null;
  const promise = new Promise((resolve, reject) => {
    xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("x-upsert", upsert ? "true" : "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = `HTTP ${xhr.status}`;
      try {
        const j = JSON.parse(xhr.responseText);
        msg = j.message || j.error || msg;
      } catch (_) { /* keep HTTP status */ }
      const err = new Error(msg);
      err.retryable = xhr.status >= 500 || xhr.status === 429 || xhr.status === 408;
      reject(err);
    };
    xhr.onerror = () => { const e = new Error("Network error"); e.retryable = true; reject(e); };
    xhr.onabort = () => {
      const e = new Error("Upload cancelled");
      e.cancelled = true;
      reject(e);
    };

    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    xhr.send(form);
  });
  return {
    promise,
    abort() { if (xhr) try { xhr.abort(); } catch (_) {} }
  };
}

// --- Upload queue ----------------------------------------------------------
// 100 files at once must not open 100 parallel requests (browser/Supabase
// throttle -> random failures). Files are queued and UPLOAD_CONCURRENCY run at
// a time; every file remembers the folder that was open WHEN IT WAS ADDED, so
// switching tabs while a big batch uploads can't misplace files.
const UPLOAD_CONCURRENCY = 4;
const UPLOAD_MAX_ATTEMPTS = 3;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB — reject before queue/UI
const uploadQueue = [];
let activeUploads = 0;
let batchStats = { ok: 0, fail: 0, skipped: 0 };
let reloadTimer = null;

function scheduleLoadFiles() {
  // One list refresh for a burst of finished uploads, not one per file.
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => loadFiles(), 500);
}

function pumpUploadQueue() {
  while (activeUploads < UPLOAD_CONCURRENCY && uploadQueue.length) {
    const job = uploadQueue.shift();
    if (job.cancelled || (job.ui && job.ui.isCancelled())) continue;
    activeUploads++;
    job.run().finally(() => {
      activeUploads--;
      pumpUploadQueue();
    });
  }
  if (!activeUploads && !uploadQueue.length) finishBatch();
}

function finishBatch() {
  const { ok, fail, skipped } = batchStats;
  batchStats = { ok: 0, fail: 0, skipped: 0 };
  if (ok + fail + skipped <= 1) return;   // single file: the row itself is feedback
  clearTimeout(reloadTimer);
  loadFiles();
  const detail = [fail ? `${fail} failed` : "", skipped ? `${skipped} duplicates skipped` : ""]
    .filter(Boolean).join(" · ");
  showToast(`${ok} files uploaded`, fail ? "warning" : "success", detail);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function uploadFile(file, folder) {
  // Size gate: block before progress UI / queue / network
  if (file && typeof file.size === "number" && file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    showToast("Fayl juda katta", "warning", `${file.name} — ${mb} MB (maks. 50 MB)`);
    return Promise.resolve();
  }

  const fileId = getFileUniqueId(file);
  if (uploadingFileIds.has(fileId)) {
    batchStats.skipped++;
    notifyDuplicate(file);
    return Promise.resolve();
  }
  uploadingFileIds.add(fileId); // must stay BEFORE the first await

  // Decide the destination NOW (not when the upload finally starts).
  const targetFolder = folder !== undefined ? folder : currentFolder;
  const ui = createProgressItem(file.name);
  ui.setQueued();

  return new Promise((resolve) => {
    const job = {
      cancelled: false,
      ui,
      async run() {
        try {
          if (job.cancelled || ui.isCancelled()) return;
          await runUpload(file, fileId, targetFolder, ui);
        } finally {
          resolve();
        }
      }
    };
    ui.onCancel(() => {
      job.cancelled = true;
      // Drop from queue if still waiting
      const idx = uploadQueue.indexOf(job);
      if (idx >= 0) uploadQueue.splice(idx, 1);
      uploadingFileIds.delete(fileId);
      // If nothing left running/queued, settle batch stats quietly
      if (!activeUploads && !uploadQueue.length) {
        // don't count cancelled as fail
      }
    });
    uploadQueue.push(job);
    pumpUploadQueue();
  });
}

async function runUpload(file, fileId, targetFolder, ui) {
  let keepBlocked = false;
  let path = null;

  try {
    if (ui.isCancelled()) return;

    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error("Not logged in");
    const user = session.user;

    // Unique even for same-named files added in the same millisecond.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const rand = Math.random().toString(36).slice(2, 8);
    path = `${user.id}/${Date.now()}_${rand}_${safeName}`;

    ui.setPercent(0);
    for (let attempt = 1; ; attempt++) {
      if (ui.isCancelled()) return;
      try {
        const up = uploadToStorage(path, file, session.access_token, (ratio) => {
          if (ui.isCancelled()) return;
          if (ratio >= 1) ui.setSaving();   // bytes sent, server still working
          else ui.setPercent(ratio * 100);
        }, attempt > 1);
        ui.setAbort(() => up.abort());
        await up.promise;
        break;
      } catch (err) {
        if (err && err.cancelled) return; // user cancelled — quiet exit
        if (!err.retryable || attempt >= UPLOAD_MAX_ATTEMPTS) throw err;
        if (ui.isCancelled()) return;
        ui.setPercent(0);
        await sleep(600 * attempt);
      }
    }
    if (ui.isCancelled()) {
      // Bytes may have landed; remove orphan object
      if (path) await sb.storage.from(BUCKET).remove([path]).catch(() => {});
      return;
    }
    ui.setSaving();

    const insertData = {
      user_id: user.id,
      filename: file.name,
      storage_path: path,
      size: file.size
    };
    if (targetFolder) insertData.folder = targetFolder;

    const { error: dbError } = await sb.from(TABLE).insert(insertData);
    if (dbError) {
      // Don't leave an orphan in the bucket that no row points to
      await sb.storage.from(BUCKET).remove([path]).catch(() => {});
      throw new Error(`DB error: ${dbError.message}`);
    }

    if (ui.isCancelled()) {
      // Rare race: cancel during DB insert — remove row + object
      await sb.from(TABLE).delete().eq("storage_path", path).catch(() => {});
      await sb.storage.from(BUCKET).remove([path]).catch(() => {});
      return;
    }

    markLocalUpload(file.name, file.size);
    ui.setDone();
    keepBlocked = true;
    batchStats.ok++;
    scheduleLoadFiles();
  } catch (err) {
    if (err && err.cancelled) return;
    if (ui.isCancelled()) return;
    console.error(`Upload error (${file.name}):`, err);
    batchStats.fail++;
    ui.setError(err.message);
  } finally {
    if (keepBlocked) {
      setTimeout(() => uploadingFileIds.delete(fileId), DUPLICATE_COOLDOWN_MS);
    } else {
      uploadingFileIds.delete(fileId);
    }
  }
}

function handleFiles(fileListObj) {
  // Snapshot the list (a live FileList/input can be reset) and the folder that
  // is open right now; never hand uploadFile straight to forEach — it would
  // receive the array index as its 2nd argument (= "folder").
  const files = Array.from(fileListObj || []);
  const folder = currentFolder || null;

  // webkitdirectory / folder picker: group by top-level folder → one ZIP each
  const byRoot = new Map(); // rootName -> [{ path, file }]
  const plain = [];
  for (const f of files) {
    const rel = (f.webkitRelativePath || "").replace(/^\/+/, "");
    if (rel && rel.includes("/")) {
      const parts = rel.split("/");
      const root = parts[0];
      const inner = parts.slice(1).join("/") || f.name;
      if (!byRoot.has(root)) byRoot.set(root, []);
      byRoot.get(root).push({ path: inner, file: f });
    } else {
      plain.push(f);
    }
  }
  plain.forEach((f) => uploadFile(f, folder));
  byRoot.forEach((entries, rootName) => {
    zipAndUploadFolder(rootName, entries, folder);
  });
}

// ---- Folder drop → single ZIP (not expanded into MRdrive folders) ----
function readAllDirectoryEntries(reader) {
  return new Promise((resolve, reject) => {
    const all = [];
    const pump = () => {
      reader.readEntries((batch) => {
        if (!batch.length) return resolve(all);
        all.push(...batch);
        pump();
      }, reject);
    };
    pump();
  });
}

function entryToFile(fileEntry) {
  return new Promise((resolve, reject) => fileEntry.file(resolve, reject));
}

/** All files inside a directory entry, paths relative to that directory root. */
async function collectDirContents(dirEntry) {
  const out = [];
  async function walkDir(dirEnt, relDir) {
    const children = await readAllDirectoryEntries(dirEnt.createReader());
    for (const child of children) {
      if (child.isFile) {
        const file = await entryToFile(child);
        const path = relDir ? (relDir + "/" + file.name) : file.name;
        out.push({ path, file });
      } else if (child.isDirectory) {
        const next = relDir ? (relDir + "/" + child.name) : child.name;
        await walkDir(child, next);
      }
    }
  }
  await walkDir(dirEntry, "");
  return out;
}

async function zipFilesAsArchive(zipName, entries) {
  if (!window.JSZip) throw new Error("JSZip yuklanmagan");
  const zip = new JSZip();
  for (const { path, file } of entries) {
    // Skip junk / VCS noise inside zips when possible (still include if user wants? skip .git)
    if (/(^|\/)\.git(\/|$)/i.test(path)) continue;
    if (/(^|\/)node_modules(\/|$)/i.test(path)) continue;
    zip.file(path, file);
  }
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  if (!names.length) throw new Error("ZIP ichida fayl yo'q (.git / node_modules o'tkazib yuborildi)");
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
  const name = /\.zip$/i.test(zipName) ? zipName : (zipName + ".zip");
  return new File([blob], name, { type: "application/zip", lastModified: Date.now() });
}

async function zipAndUploadFolder(folderName, entries, targetFolder) {
  try {
    const zipFile = await zipFilesAsArchive(folderName + ".zip", entries);
    uploadFile(zipFile, targetFolder || null);
  } catch (err) {
    console.error("Folder zip failed:", err);
    showToast("Papkani ZIP qilib bo'lmadi", "error", (err && err.message) || folderName);
  }
}

async function handleDropItems(dataTransfer) {
  const targetFolder = currentFolder || null;
  const items = dataTransfer && dataTransfer.items;

  // Prefer FileSystemEntry so we can tell files from real directories
  if (items && items.length) {
    let anyEntry = false;
    const jobs = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (!entry) {
        const f = item.getAsFile && item.getAsFile();
        if (f) jobs.push(Promise.resolve().then(() => uploadFile(f, targetFolder)));
        continue;
      }
      anyEntry = true;
      if (entry.isFile) {
        jobs.push(
          entryToFile(entry).then((file) => uploadFile(file, targetFolder))
        );
      } else if (entry.isDirectory) {
        jobs.push(
          (async () => {
            const contents = await collectDirContents(entry);
            if (!contents.length) {
              showToast("Bo'sh papka", "warning", entry.name);
              return;
            }
            await zipAndUploadFolder(entry.name, contents, targetFolder);
          })()
        );
      }
    }
    if (anyEntry || jobs.length) {
      try {
        await Promise.all(jobs);
      } catch (err) {
        console.error("Drop failed:", err);
        showToast("Yuklashda xato", "error", err && err.message);
      }
      return;
    }
  }

  // Fallback: plain FileList
  handleFiles(dataTransfer.files);
}

fileInput.addEventListener("change", (e) => {
  handleFiles(e.target.files);
  e.target.value = ""; // allow picking the same file again later
});

dropzone.addEventListener("dragover", (e) => {
  // Ignore internal file-card drags (moving between folders)
  if (e.dataTransfer.types.includes("application/x-mrdrive-file")) return;
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  if (e.dataTransfer.types.includes("application/x-mrdrive-file")) return;
  e.preventDefault();
  dropzone.classList.remove("dragover");
  // Real folders need async entry walk — plain files path still works inside
  handleDropItems(e.dataTransfer);
});

window.addEventListener("paste", (e) => {
  if (appScreen.style.display === "none") return;
  const items = e.clipboardData.files;
  if (items.length) { handleFiles(items); return; }

  // No file/image on the clipboard — if it's plain text, let normal paste
  // happen inside inputs/textareas/prompt boxes, otherwise offer to save
  // the text as a new file.
  const active = document.activeElement;
  const isEditable = active && (
    active.tagName === "INPUT" ||
    active.tagName === "TEXTAREA" ||
    active.isContentEditable
  );
  if (isEditable) return;
  if (annotState.open) return; // don't hijack paste while a file is open
  if (document.querySelector(".modal-backdrop")) return; // any dialog (confirm/prompt/etc.) already open

  const text = e.clipboardData.getData("text/plain");
  if (!text || !text.trim()) return;

  e.preventDefault();
  pasteTextAsFile(text);
});

// Extension -> MIME type for text pasted from the clipboard as a new file.
function guessTextMime(filename) {
  const map = {
    html: "text/html", htm: "text/html", css: "text/css",
    js: "text/javascript", mjs: "text/javascript", json: "application/json",
    md: "text/markdown", xml: "application/xml", csv: "text/csv",
    yml: "text/yaml", yaml: "text/yaml"
  };
  return map[getFileExt(filename)] || "text/plain";
}

// Creates the folder (if it doesn't already exist) that a pasted text file
// should be saved into, mirroring createFolder()'s optimistic-then-DB flow
// but without its own name prompt. Returns the folder name to store on the file.
async function ensureFolderExists(name) {
  const existing = allFolders.find(f => f.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing.name;

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return name;

  const optimisticFolder = {
    id: "temp-" + Date.now(),
    name,
    user_id: user.id,
    created_at: new Date().toISOString()
  };
  allFolders.push(optimisticFolder);
  renderToolbar();

  const { data, error } = await sb.from(FOLDERS_TABLE).insert({
    user_id: user.id,
    name
  }).select().single();

  if (error) {
    allFolders = allFolders.filter(f => f.id !== optimisticFolder.id);
    renderToolbar();
    return name;
  }

  const idx = allFolders.findIndex(f => f.id === optimisticFolder.id);
  if (idx !== -1) {
    allFolders[idx] = data;
    renderToolbar();
  }
  return data.name;
}

// Ctrl+V with plain text on the clipboard: ask for a filename ("notes.txt",
// or "folder/index.html" to save straight into — and create if needed — a
// folder), then upload the text as a new file.
async function pasteTextAsFile(text) {
  const raw = await showPrompt("Fayl nomini kiriting", {
    okLabel: "Saqlash",
    placeholder: "masalan: notes.txt yoki folder/index.html"
  });
  if (raw == null || !String(raw).trim()) return;

  let name = String(raw).trim().replace(/^\/+/, "");

  let folder = null;
  const slashIdx = name.lastIndexOf("/");
  if (slashIdx > -1) {
    folder = name.slice(0, slashIdx).trim() || null;
    name = name.slice(slashIdx + 1).trim();
  }
  if (!name) {
    showToast("Fayl nomi bo'sh bo'lishi mumkin emas", "error");
    return;
  }
  if (!/\.[a-z0-9]+$/i.test(name)) name += ".txt"; // no extension given

  const targetFolder = folder ? await ensureFolderExists(folder) : currentFolder;
  const file = new File([text], name, { type: guessTextMime(name) });
  await uploadFile(file, targetFolder);
}

// ==========================================
// LIST + TOOLBAR + FOLDERS
// ==========================================

// Cache of short-lived signed URLs, keyed by file id, used so dragging a
// file card out of the browser window (onto the desktop / a file manager)
// can drop the real file there. The "DownloadURL" dataTransfer format has
// to be set synchronously inside the dragstart handler, but creating a
// signed URL is an async Supabase call — so URLs are pre-fetched here
// whenever the file list changes, and dragstart just reads the cache.
const dragUrlCache = new Map(); // id -> { url, expiresAt }

async function prefetchDragUrls(files) {
  const now = Date.now();
  const stale = files.filter((f) => {
    const cached = dragUrlCache.get(f.id);
    return !cached || cached.expiresAt - now < 5 * 60 * 1000;
  });
  if (!stale.length) return;
  await Promise.all(stale.map(async (f) => {
    const { data, error } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(f.storage_path, 3600, { download: f.filename });
    if (!error && data) {
      dragUrlCache.set(f.id, { url: data.signedUrl, expiresAt: Date.now() + 3600 * 1000 });
    }
  }));
}

async function loadFiles(silent) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  // Only MY rows. Without this filter the "anyone can read public files" policy
  // also returns other accounts' public files, which then show up (undeletable) in this drive.
  const [filesRes, foldersRes] = await Promise.all([
    sb.from(TABLE).select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
    sb.from(FOLDERS_TABLE).select("*").eq("user_id", user.id).order("created_at", { ascending: true })
  ]);

  if (filesRes.error) {
    if (!silent) fileListEl.innerHTML = `<p>Error: ${filesRes.error.message}</p>`;
    return;
  }

  const newFiles = (filesRes.data || [])
    .filter((f) => !localDeleteIds.has(String(f.id)))
    .map((f) => (f.folder && localDeleteFolderNames.has(String(f.folder)) ? { ...f, folder: null } : f));
  const newFolders = (foldersRes.data || []).filter((f) =>
    !localDeleteFolderIds.has(String(f.id)) && !localDeleteFolderNames.has(String(f.name))
  );

  if (silent) {
    // Polling call: skip the re-render entirely if nothing actually changed,
    // so the list doesn't flicker or lose scroll position every 2s.
    const same =
      JSON.stringify(newFiles) === JSON.stringify(allFiles) &&
      JSON.stringify(newFolders) === JSON.stringify(allFolders);
    if (same) return;
  }

  // Remote (Claude MCP / other session) add/remove → toast + green flash
  // + sand-like dissolve when Claude deletes a file or folder
  const remoteDeleted = notifyRemoteFileChanges(allFiles, newFiles) || [];
  const remoteFoldersDeleted = notifyRemoteFolderChanges(allFolders, newFolders) || [];

  const dissolvePromises = [];
  if (remoteDeleted.length && fileListEl) {
    const remoteCards = remoteDeleted
      .map((f) => fileListEl.querySelector(`.file-card[data-file-id="${f.id}"]`))
      .filter(Boolean);
    const remoteGroup = dissolveGroupInfo(remoteCards);
    for (const card of remoteCards) dissolvePromises.push(playDeleteDissolve(card, undefined, undefined, remoteGroup));
  }
  if (remoteFoldersDeleted.length) {
    const toolbar = document.getElementById("toolbar");
    for (const folder of remoteFoldersDeleted) {
      const el =
        (toolbar && toolbar.querySelector(`.folder-tab-wrap[data-folder-id="${folder.id}"]`)) ||
        document.querySelector(`.folder-tab-wrap[data-folder-id="${folder.id}"]`);
      if (el) dissolvePromises.push(playDeleteDissolve(el));
    }
  }
  if (dissolvePromises.length) await Promise.all(dissolvePromises);

  allFiles = newFiles;
  allFolders = newFolders;
  filesListReady = true;
  const liveIds = new Set(newFiles.map((f) => String(f.id)));
  Array.from(selectedFileIds).forEach((id) => { if (!liveIds.has(id)) selectedFileIds.delete(id); });
  renderToolbar();
  renderFiles();
  prefetchDragUrls(newFiles).catch((e) => console.warn("prefetchDragUrls failed:", e)); // best-effort, drag-out just won't work if this fails
  prefetchThumbUrls(newFiles).catch((e) => console.warn("prefetchThumbUrls failed:", e)); // image square thumbs for list + drag, preload
}

function renderToolbar() {
  let toolbar = document.getElementById("toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.id = "toolbar";
    toolbar.className = "toolbar";
    dropzone.parentNode.insertBefore(toolbar, dropzone.nextSibling);
  }

  toolbar.innerHTML = `
    <div class="search-wrap">
      <span class="search-icon">${ICON_SEARCH}</span>
      <input type="text" id="search-input" placeholder="Fayllarni qidirish..." value="${escapeHtml(currentSearch)}" />
    </div>
    <div class="folder-tabs">
      <button class="folder-tab ${currentFolder === null ? 'active' : ''}" data-folder="" onclick="setFolder(null)" title="Faylni papkadan chiqarish uchun shu yerga tashlang">
        ${ICON_FOLDER} All
      </button>
      ${allFolders.map(f => `
        <div class="folder-tab-wrap" data-folder="${escapeHtml(f.name)}" data-folder-id="${f.id}">
          <button class="folder-tab ${currentFolder === f.name ? 'active' : ''}" data-folder="${escapeHtml(f.name)}" onclick="setFolder('${escapeJs(f.name)}')" title="Faylni shu papkaga tashlang">
            ${ICON_FOLDER} ${escapeHtml(f.name)}
          </button>
          <button class="folder-del-btn" onclick="deleteFolder(${f.id}, '${escapeJs(f.name)}', event)" title="Papkani o'chir">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      `).join("")}
      <button class="folder-tab new-folder-btn" onclick="createFolder()">+ Folder</button>
    </div>
  `;

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderFiles();
  });

  // Animate newly created folder tab
  if (newlyCreatedFolderId) {
    const newWrap = toolbar.querySelector(`.folder-tab-wrap[data-folder-id="${newlyCreatedFolderId}"]`);
    if (newWrap) {
      newWrap.classList.add("is-appearing");
      // Next frame: remove class to trigger transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newWrap.classList.remove("is-appearing");
        });
      });
    }
    newlyCreatedFolderId = null;
  }

  wireFolderDropTargets(toolbar);
}

/** Folder tabs as drop targets for dragging files between folders. */
function wireFolderDropTargets(toolbar) {
  if (!toolbar) return;
  // Toolbar node is reused across renders (getElementById), only its
  // innerHTML changes. Without this guard, every re-render (including the
  // ~2s polling refresh) would stack another set of drop/dragover
  // listeners on the same node, so a single drop fires moveFileToFolder
  // (and showToast) once per accumulated listener.
  if (toolbar.dataset.dropWired === "1") return;
  toolbar.dataset.dropWired = "1";

  function clearDragOver() {
    toolbar.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
  }

  function isFileDrag(dt) {
    const types = Array.from(dt.types || []);
    return (
      types.includes("application/x-mrdrive-file") ||
      types.includes("application/x-mrdrive-files") ||
      types.includes("text/plain")
    );
  }

  function onDragOver(e) {
    if (!isFileDrag(e.dataTransfer)) return;
    const newBtn = e.target.closest(".new-folder-btn");
    if (newBtn) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      clearDragOver();
      newBtn.classList.add("drag-over");
      return;
    }
    const target = e.target.closest("[data-folder]");
    if (!target) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    clearDragOver();
    target.classList.add("drag-over");
    const wrap = target.closest(".folder-tab-wrap");
    if (wrap) wrap.classList.add("drag-over");
  }

  function onDragLeave(e) {
    const newBtn = e.target.closest(".new-folder-btn");
    if (newBtn && !newBtn.contains(e.relatedTarget)) newBtn.classList.remove("drag-over");
    const target = e.target.closest("[data-folder]");
    if (!target) return;
    if (target.contains(e.relatedTarget)) return;
    target.classList.remove("drag-over");
    const wrap = target.closest(".folder-tab-wrap");
    if (wrap && !wrap.contains(e.relatedTarget)) wrap.classList.remove("drag-over");
  }

  function onDrop(e) {
    if (!isFileDrag(e.dataTransfer)) return;
    const newBtn = e.target.closest(".new-folder-btn");
    const target = newBtn ? null : e.target.closest("[data-folder]");
    if (!newBtn && !target) return;
    e.preventDefault();
    e.stopPropagation();
    clearDragOver();

    let fileIds = [];
    const multiRaw = e.dataTransfer.getData("application/x-mrdrive-files");
    if (multiRaw) {
      try { fileIds = JSON.parse(multiRaw); } catch { fileIds = []; }
    }
    if (!fileIds.length) {
      const single =
        e.dataTransfer.getData("application/x-mrdrive-file") ||
        e.dataTransfer.getData("text/plain");
      if (single) fileIds = single.split(",");
    }
    if (!fileIds.length) return;

    if (newBtn) { createFolder(fileIds); return; }

    const raw = target.getAttribute("data-folder");
    const targetFolder = raw === "" || raw == null ? null : raw;
    moveFilesToFolder(fileIds, targetFolder, { animate: true });
  }

  // Bind once on the toolbar (re-created each render, so always fresh)
  toolbar.addEventListener("dragover", onDragOver);
  toolbar.addEventListener("dragleave", onDragLeave);
  toolbar.addEventListener("drop", onDrop);
}

function findFolderTabEl(targetFolder) {
  const toolbar = document.getElementById("toolbar");
  if (!toolbar) return null;
  if (targetFolder == null || targetFolder === "") {
    return toolbar.querySelector('.folder-tab[data-folder=""]');
  }
  const wraps = toolbar.querySelectorAll(".folder-tab-wrap");
  for (const w of wraps) {
    if (w.getAttribute("data-folder") === targetFolder) return w;
  }
  return toolbar.querySelector(`.folder-tab[data-folder="${CSS.escape(String(targetFolder))}"]`);
}

function shouldPlayMoveFlight() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Wow flight: selected cards arc into the destination folder tab.
 *  Used only for the picker / context-menu / mobile button path — never for
 *  drag-and-drop onto a folder tab (the user is already dragging there). */
async function playMoveToFolderVisual(fileIds, targetFolder) {
  try {
    if (!fileListEl) return;
    const ids = (fileIds || []).map(String);
    if (!ids.length) return;

    const tab = findFolderTabEl(targetFolder);
    if (!tab) return;

    try {
      tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } catch (_) {}
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const dest = tab.getBoundingClientRect();
    const destX = dest.left + Math.max(dest.width, 8) / 2;
    const destY = dest.top + Math.max(dest.height, 8) / 2;

    let cards = ids
      .map((id) => fileListEl.querySelector('.file-card[data-file-id="' + id + '"]'))
      .filter(Boolean);
    if (!cards.length) {
      const listBox = fileListEl.getBoundingClientRect();
      const ghost = document.createElement("div");
      ghost.className = "file-card move-fly-fallback";
      ghost.style.cssText = "position:fixed;left:" + Math.max(16, listBox.left + 16) + "px;top:" + Math.max(80, listBox.top + 24) + "px;width:220px;height:56px;";
      cards = [ghost];
    }

    const MAX_FLIGHTS = 8;
    const flyCards = cards.slice(0, MAX_FLIGHTS);
    const extra = Math.max(0, ids.length - flyCards.length);

    const layer = document.createElement("div");
    layer.className = "move-fly-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    tab.classList.add("folder-awaiting-catch");

    const waitAnim = (anim, fallbackMs) => {
      if (anim && anim.finished && typeof anim.finished.then === "function") {
        return anim.finished.catch(function () {});
      }
      return new Promise(function (r) { setTimeout(r, fallbackMs || 600); });
    };

    const flights = flyCards.map((card, i) => {
      const r = card.getBoundingClientRect();
      const clone = card.classList.contains("move-fly-fallback") ? card : card.cloneNode(true);
      clone.classList.add("move-fly-card");
      clone.classList.remove("selected", "actions-open", "long-pressing", "is-dragging", "is-flying-away");
      clone.removeAttribute("draggable");
      clone.querySelectorAll(".file-actions, .file-actions-more").forEach((n) => n.remove());
      clone.style.position = "fixed";
      clone.style.left = r.left + "px";
      clone.style.top = r.top + "px";
      clone.style.width = Math.max(r.width, 40) + "px";
      clone.style.height = Math.max(r.height, 36) + "px";
      clone.style.margin = "0";
      clone.style.zIndex = "30000";
      clone.style.pointerEvents = "none";
      layer.appendChild(clone);
      if (card.parentNode && card !== clone) card.classList.add("is-flying-away");

      const startX = r.left + r.width / 2;
      const startY = r.top + r.height / 2;
      const dx = destX - startX;
      const dy = destY - startY;
      const lift = -48 - (i % 4) * 8;
      const spin = (i % 2 === 0 ? -1 : 1) * (8 + (i % 3) * 3);
      const delay = i * 45;
      const dur = 620 + Math.min(i, 6) * 20;

      const anim = clone.animate(
        [
          { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1, offset: 0 },
          {
            transform: "translate(" + (dx * 0.4) + "px, " + (dy * 0.25 + lift) + "px) scale(0.82) rotate(" + spin + "deg)",
            opacity: 1,
            offset: 0.4
          },
          {
            transform: "translate(" + dx + "px, " + dy + "px) scale(0.14) rotate(" + (spin * 0.3) + "deg)",
            opacity: 0.08,
            offset: 1
          }
        ],
        { duration: dur, delay: delay, easing: "cubic-bezier(0.22, 0.9, 0.28, 1)", fill: "forwards" }
      );
      return waitAnim(anim, delay + dur);
    });

    if (extra > 0 && flyCards.length) {
      const last = flyCards[flyCards.length - 1].getBoundingClientRect();
      const badge = document.createElement("div");
      badge.className = "move-fly-badge";
      badge.textContent = "+" + extra;
      badge.style.left = (last.left + last.width - 18) + "px";
      badge.style.top = (last.top - 8) + "px";
      layer.appendChild(badge);
      const dx = destX - (last.left + last.width);
      const dy = destY - last.top;
      const anim = badge.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: "translate(" + dx + "px, " + dy + "px) scale(0.2)", opacity: 0 }
        ],
        { duration: 640, delay: flyCards.length * 45, easing: "cubic-bezier(0.22, 0.9, 0.28, 1)", fill: "forwards" }
      );
      flights.push(waitAnim(anim, 800));
    }

    window.setTimeout(function () {
      tab.classList.remove("folder-awaiting-catch");
      tab.classList.add("folder-catch");
    }, 280);

    await Promise.all(flights);
    await new Promise(function (r) { setTimeout(r, 60); });
    tab.classList.remove("folder-catch", "folder-awaiting-catch");
    layer.remove();
  } catch (err) {
    console.warn("move visual failed", err);
  }
}

async function moveFilesToFolder(fileIds, targetFolder, opts) {
  const ids = fileIds.map(String);
  const files = allFiles.filter((f) => ids.includes(String(f.id)));
  if (!files.length) return;

  const next = targetFolder || null;
  const toMove = files.filter((f) => (f.folder || null) !== next);
  if (!toMove.length) {
    showToast(next ? `Already in "${next}"` : "Allaqachon hammada", "warning");
    return;
  }

  if (opts && opts.animate) {
    await playMoveToFolderVisual(toMove.map((f) => f.id), next);
  }

  const { error } = await sb.from(TABLE).update({ folder: next }).in("id", toMove.map((f) => f.id));
  if (error) {
    showAlert("Xato: " + error.message);
    return;
  }

  toMove.forEach((f) => { f.folder = next; });
  const label = next ? `"${next}"` : "All";
  showToast(toMove.length === 1 ? `Moved to ${label}` : `Moved ${toMove.length} files to ${label}`);
  setFolder(next);
  // Keep the moved files highlighted for a beat so the drop feels
  // confirmed, then fade the selection back to the default look.
  setTimeout(() => {
    ids.forEach((id) => selectedFileIds.delete(id));
    updateSelectionClasses();
  }, 1000);
  // If we're viewing a folder and the file left it, list updates above already.
}

function setFolder(folder, opts) {
  currentFolder = folder;
  if (!opts || opts.updateUrl !== false) {
    // Closing a file preview when switching folders via tab
    if (annotState.open) closeAnnotationViewer({ skipUrl: true });
    syncFolderUrl(folder, !!(opts && opts.replace));
  }
  renderToolbar();
  renderFiles();
}

window.addEventListener("popstate", (e) => {
  const parsed = (e.state && (e.state.filename || e.state.folder !== undefined))
    ? { folder: e.state.folder ?? null, filename: e.state.filename || null, dateKey: e.state.dateKey || null, fileId: e.state.fileId }
    : parseAppPath(window.location.pathname);
  currentFolder = parsed.folder;
  renderToolbar();
  renderFiles();
  if (parsed.filename) {
    let file = null;
    if (parsed.fileId) file = allFiles.find((f) => f.id === parsed.fileId) || null;
    if (!file) file = findFileFromPath(parsed);
    const kind = file && isViewable(file.filename);
    if (file && kind) {
      if (!(annotState.open && annotState.file && annotState.file.id === file.id)) {
        openAnnotationViewer(file, kind, { skipUrl: true });
      }
      return;
    }
  }
  if (annotState.open) closeAnnotationViewer({ skipUrl: true });
});

async function createFolder(fileIds, opts) {
  const dropIds = Array.isArray(fileIds) ? fileIds.map(String) : null; // set when files were dropped on "+ Folder"
  const name = await showPrompt(dropIds ? "Papka nomini kiriting" : "Yangi papka", {
    okLabel: dropIds ? "Yaratish va ko'chirish" : "Yaratish",
    placeholder: "Folder name"
  });
  if (name == null || !String(name).trim()) return;
  const trimmed = String(name).trim();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  if (allFolders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
    showToast("Papka allaqachon mavjud", "warning", "Boshqa nom tanlang.");
    return;
  }

  // OPTIMISTIC: Add folder to local state immediately (no wait for DB)
  const optimisticFolder = {
    id: "temp-" + Date.now(),
    name: trimmed,
    user_id: user.id,
    created_at: new Date().toISOString()
  };
  allFolders.push(optimisticFolder);
  newlyCreatedFolderId = optimisticFolder.id;
  
  // Show folder instantly
  renderToolbar();
  showToast(`Papka yaratildi: ${trimmed}`, "success");
  
  if (dropIds) {
    currentFolder = trimmed;
    syncFolderUrl(trimmed);
    renderFiles();
  } else {
    currentFolder = trimmed;
    syncFolderUrl(trimmed);
    renderFiles();
  }

  // Background sync to database
  const { data, error } = await sb.from(FOLDERS_TABLE).insert({
    user_id: user.id,
    name: trimmed
  }).select().single();

  if (error) {
    // Revert optimistic update on error
    allFolders = allFolders.filter(f => f.id !== optimisticFolder.id);
    renderToolbar();
    showAlert("Error creating folder: " + error.message);
    return;
  }

  // Replace temporary ID with real ID from database
  const idx = allFolders.findIndex(f => f.id === optimisticFolder.id);
  if (idx !== -1) {
    allFolders[idx] = data;
    renderToolbar();
  }

  if (dropIds) {
    // Files were dropped on "+ Folder": move them inside
    await moveFilesToFolder(dropIds, trimmed, { animate: !!(opts && opts.animate) });
    loadFiles();
    return;
  }

  loadFiles();
}

async function deleteFolder(id, name, evt) {
  const filesInFolder = allFiles.filter(f => f.folder === name);
  let msg = `"${name}" papkasini o'chirishni xohlaysizmi?`;
  if (filesInFolder.length > 0) {
    msg += `\n\nDiqqat: bu papkada ${filesInFolder.length} ta fayl bor. Ular "Hammasi" ga ko'chiriladi (o'chirilmaydi).`;
  }

  if (!(await showConfirm(msg, "O'chirish", { skippable: true }))) return;

  const clickX = evt ? evt.clientX : undefined;
  const clickY = evt ? evt.clientY : undefined;
  const toolbar = document.getElementById("toolbar");
  let tabEl =
    (toolbar && toolbar.querySelector(`.folder-tab-wrap[data-folder-id="${id}"]`)) ||
    document.querySelector(`.folder-tab-wrap[data-folder-id="${id}"]`);
  if (!tabEl && evt && evt.target) {
    tabEl = evt.target.closest(".folder-tab-wrap");
  }
  if (tabEl) await playDeleteDissolve(tabEl, clickX, clickY);

  markLocalDeleteFolder(id, name);

  if (filesInFolder.length > 0) {
    await sb.from(TABLE).update({ folder: null }).eq("folder", name);
  }

  const { error } = await sb.from(FOLDERS_TABLE).delete().eq("id", id);

  if (error) {
    showAlert("Xato: " + error.message);
    loadFiles();
    return;
  }

  showToast("Papka o'chirildi");
  allFolders = allFolders.filter((f) => String(f.id) !== String(id));
  if (filesInFolder.length > 0) {
    allFiles = allFiles.map((f) => (f.folder === name ? { ...f, folder: null } : f));
  }
  setFolder(null);
}

// Parses the search box. A leading "/" scopes the search to one specific
// folder regardless of the active folder tab — "/design/" lists everything
// inside the "design" folder, and "/design/logo" also filters those files
// by name.
function parseSearchQuery(raw) {
  const q = (raw || "").trim();
  if (q.startsWith("/")) {
    const rest = q.slice(1);
    const slashIdx = rest.indexOf("/");
    if (slashIdx === -1) return { folder: rest, name: "" };
    return { folder: rest.slice(0, slashIdx), name: rest.slice(slashIdx + 1) };
  }
  return { folder: null, name: q };
}

function getSearchFilteredFiles() {
  let filtered = allFiles;
  const parsed = parseSearchQuery(currentSearch);

  if (parsed.folder !== null && parsed.folder.trim()) {
    const folderQ = parsed.folder.trim().toLowerCase();
    filtered = filtered.filter(f => (f.folder || "").toLowerCase() === folderQ);
  } else if (currentFolder !== null) {
    filtered = filtered.filter(f => f.folder === currentFolder);
  }

  if (parsed.name.trim()) {
    const q = parsed.name.trim().toLowerCase();
    filtered = filtered.filter(f => f.filename.toLowerCase().includes(q));
  }

  return filtered;
}

function renderFiles() {
  let filtered = getSearchFilteredFiles();

  if (!filtered.length) {
    if (allFiles.length === 0) {
      fileListEl.innerHTML = `<p class="empty">Hali fayllar yo'q.</p>`;
    } else {
      fileListEl.innerHTML = `<p class="empty">Hech narsa topilmadi.</p>`;
    }
    return;
  }

  fileListEl.innerHTML = filtered.map(f => {
    const isPublic = f.is_public && f.public_token;
    const isExpired = f.expires_at && new Date(f.expires_at) < new Date();

    let meta = `${formatSize(f.size)} · ${formatDate(f.uploaded_at)}`;
    if (f.download_count > 0) {
      meta += ` · ${f.download_count} ${f.download_count === 1 ? "download" : "downloads"}`;
    }
    if (isPublic && !isExpired) {
      meta += ` · <span class="public-badge">Public</span>`;
      if (f.expires_at) {
        meta += ` · <span class="expiry-badge">Until ${formatDate(f.expires_at)}</span>`;
      } else {
        meta += ` · <span class="expiry-badge">Unlimited</span>`;
      }
    }
    if (isExpired) {
      meta += ` · <span class="expired-badge">Expired</span>`;
    }
    if (f.folder) {
      meta += ` · <span class="folder-badge">${escapeHtml(f.folder)}</span>`;
    }

    return `
    <div class="file-card${selectedFileIds.has(String(f.id)) ? ' selected' : ''}" data-file-id="${f.id}" draggable="true" title="Drag to a folder">
      <div class="file-lead">
        ${fileLeadIconHtml(f)}
        <div class="file-info">
          <span class="file-name">${escapeHtml(f.filename)}</span>
          <span class="file-meta">${meta}</span>
        </div>
      </div>
      <div class="file-actions">
        <div class="file-actions-more">
          ${isPublic
            ? `<div class="toggle-group">
                 <button class="toggle-btn copy-btn" onclick="copyPublicLink(${f.id}, this)" title="Havolani nusxalash">${ICON_COPY}</button>
                 <button class="toggle-btn refresh-btn" onclick="refreshPublicLink(${f.id})" title="Yangi havola (eski ishlamay qoladi)">${ICON_REFRESH}</button>
                 <button class="toggle-btn unlink-btn" onclick="unpublishFile(${f.id})" title="Ommaviydan o'chirish">${ICON_UNLINK}</button>
               </div>`
            : `<button class="link-btn" onclick="createPublicLink(${f.id})" title="Ommaviy havola yaratish">${ICON_LINK}</button>`
          }
          <button onclick="downloadFile(${f.id}, '${escapeJs(f.storage_path)}', '${escapeJs(f.filename)}')" title="Yuklab olish">${ICON_DOWNLOAD}</button>
          <button onclick="deleteFile(${f.id}, '${escapeJs(f.storage_path)}', event)" title="O'chirish">${ICON_DELETE}</button>
        </div>
      </div>
    </div>
  `;
  }).join("");
}

// Closes any open action row when tapping/clicking anywhere else.
document.addEventListener("click", (e) => {
  document.querySelectorAll(".file-card.actions-open").forEach(card => {
    if (!card.contains(e.target)) card.classList.remove("actions-open");
  });
});

// Hover-preview intentionally removed: hovering a file card no longer darkens
// the screen or shows an enlarged image. Thumbnails are still preloaded on
// page load (preloadAllThumbs) so opening a file is instant either way.

function updateSelectionClasses() {
  fileListEl.querySelectorAll(".file-card").forEach((card) => {
    card.classList.toggle("selected", selectedFileIds.has(card.dataset.fileId));
  });
  updateSelectionBar();
}

// Selection bar: on touch screens (no keyboard) it carries the same actions the
// keyboard shortcuts give on a computer. CSS shows it only for `pointer: coarse`,
// so desktop keeps the clean right-click menu + shortcuts.
const SEL_BAR_ICON_ALL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`;
const SEL_BAR_ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg>`;

function updateSelectionBar() {
  const n = selectedFileIds.size;
  let bar = document.getElementById("selection-bar");
  if (!n) {
    if (bar) bar.hidden = true;
    document.body.classList.remove("has-sel-bar");
    return;
  }
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "selection-bar";
    bar.className = "selection-bar";
    bar.innerHTML = `
      <div class="sel-head">
        <button type="button" class="sel-close" data-act="clear" aria-label="Bekor qilish">${SEL_BAR_ICON_CLOSE}</button>
        <span class="sel-count"></span>
      </div>
      <div class="sel-actions">
        <button type="button" data-act="all">${SEL_BAR_ICON_ALL}<span>Hammasi</span></button>
        <button type="button" data-act="download">${ICON_DOWNLOAD}<span>Yuklash</span></button>
        <button type="button" data-act="move">${ICON_FOLDER}<span>Ko'chirish</span></button>
        <button type="button" data-act="link">${ICON_LINK}<span>Havola</span></button>
        <button type="button" data-act="delete" class="sel-danger">${ICON_DELETE}<span>O'chirish</span></button>
      </div>`;
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      e.stopPropagation();
      const ids = Array.from(selectedFileIds);
      switch (b.dataset.act) {
        case "clear": kbClear(); break;
        case "all": kbSelectAll(true); break;
        case "download": kbDownload(); break;
        case "move": if (ids.length) showFolderPicker(ids); break;
        case "link": kbLink(); break;
        case "delete": {
          const r = b.getBoundingClientRect();
          kbDelete({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          break;
        }
      }
    });
    document.body.appendChild(bar);
  }
  bar.hidden = false;
  bar.querySelector(".sel-count").textContent = `${n} ta tanlandi`;
  bar.querySelector('[data-act="link"]').hidden = n !== 1;
  document.body.classList.add("has-sel-bar");
}

// Clicking anywhere except a file card / the download button drops the selection
// (and with it the button). Ctrl/Shift-clicks are left alone: they extend it.
document.addEventListener("mousedown", (e) => {
  if (e.button !== 0 || !selectedFileIds.size) return;
  if (e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest && e.target.closest(".file-card, #selection-bar")) return;
  selectedFileIds.clear();
  updateSelectionClasses();
});

async function fetchSelectedBlobs(ids) {
  const want = new Set((ids || Array.from(selectedFileIds)).map(String));
  const files = allFiles.filter((f) => want.has(String(f.id)));
  return Promise.all(files.map(async (f) => {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(f.storage_path, 300);
    if (error) throw error;
    const r = await fetch(data.signedUrl);
    if (!r.ok) throw new Error(f.filename + ": HTTP " + r.status);
    sb.rpc("increment_download_count", { file_id: f.id });
    return { name: f.filename, blob: await r.blob() };
  }));
}

// Chromium only: pick a folder once, write every selected file straight into it.
async function saveSelectedToFolder() {
  try {
    const dir = await window.showDirectoryPicker({ mode: "readwrite" });
    showToast("Saqlanmoqda…");
    const items = await fetchSelectedBlobs();
    for (const it of items) {
      const fh = await dir.getFileHandle(it.name, { create: true });
      const w = await fh.createWritable();
      await w.write(it.blob);
      await w.close();
    }
    showToast(`Saved ${items.length} file(s)`);
  } catch (err) {
    if (err && err.name === "AbortError") return;
    showAlert("Xato: " + (err.message || err));
  }
}

async function downloadSelectedZip(ids) {
  try {
    const items = await fetchSelectedBlobs(Array.isArray(ids) ? ids : undefined);
    const triggerSave = (blob, name) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    };
    if (items.length === 1) return triggerSave(items[0].blob, items[0].name);
    const zip = new JSZip();
    items.forEach((it) => zip.file(it.name, it.blob));
    triggerSave(await zip.generateAsync({ type: "blob" }), "mrdrive-files.zip");
  } catch (err) {
    showAlert("Xato: " + (err.message || err));
  }
}

function selectRange(fromId, toId) {
  const order = Array.from(fileListEl.querySelectorAll(".file-card")).map((c) => c.dataset.fileId);
  const i = order.indexOf(String(fromId));
  const j = order.indexOf(String(toId));
  if (i === -1 || j === -1) {
    selectedFileIds.add(String(toId));
    return;
  }
  const [start, end] = i < j ? [i, j] : [j, i];
  for (let k = start; k <= end; k++) selectedFileIds.add(order[k]);
}

// Zoom-from-thumbnail open transition: when an image is clicked while its
// hover-zoomed thumbnail is showing, a clone of exactly that thumbnail (same
// spot, same size) grows to fill the screen while the real viewer loads
// underneath — so it visually "opens" from where the user was looking.
let pendingZoomClone = null;

function playImageOpenZoom(thumbImg) {
  const rect = thumbImg.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  if (pendingZoomClone) { pendingZoomClone.remove(); pendingZoomClone = null; }

  // The clone mirrors the hover preview EXACTLY (same box, object-fit: contain,
  // no radius/border), so there is no visual jump at the moment of the click.
  const clone = document.createElement("img");
  clone.src = thumbImg.currentSrc || thumbImg.src;
  clone.className = "thumb-zoom-clone";
  clone.style.cssText =
    "position:fixed;margin:0;padding:0;border:0;background:transparent;" +
    "object-fit:contain;pointer-events:none;z-index:2100;" +
    `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
  document.body.appendChild(clone);
  pendingZoomClone = clone;

  // Safety net: never leave the clone on screen if the viewer fails to load.
  setTimeout(() => {
    if (pendingZoomClone === clone) { clone.remove(); pendingZoomClone = null; }
  }, 4000);
}

// Called by loadImageForAnnot once the viewer's real image is in the DOM.
// Grows the clone smoothly from the hover-preview size straight to the exact
// box the viewer image occupies (no overshoot, so nothing "snaps back"), then
// reveals the real image and removes the clone.
function finishImageOpenZoom(pageEl) {
  const clone = pendingZoomClone;
  if (!clone) return;
  pendingZoomClone = null;
  const target = pageEl.getBoundingClientRect();
  if (!target.width || !target.height) { clone.remove(); return; }

  // .annot-page has its own fade-in keyframes that would override our
  // opacity:0 and flash the real image mid-animation — turn them off here.
  pageEl.style.animation = "none";
  pageEl.style.opacity = "0";
  const DURATION = 650; // ms — slow, smooth growth
  const ease = "cubic-bezier(.25,.8,.25,1)";
  clone.style.transition =
    `left ${DURATION}ms ${ease}, top ${DURATION}ms ${ease}, ` +
    `width ${DURATION}ms ${ease}, height ${DURATION}ms ${ease}`;
  // Force a reflow so the transition starts from the current (hover) box.
  void clone.offsetWidth;
  clone.style.left = target.left + "px";
  clone.style.top = target.top + "px";
  clone.style.width = target.width + "px";
  clone.style.height = target.height + "px";

  let done = false;
  const end = () => {
    if (done) return;
    done = true;
    pageEl.style.opacity = "";
    clone.remove();
  };
  clone.addEventListener("transitionend", (e) => {
    if (e.propertyName === "height" || e.propertyName === "width") end();
  });
  setTimeout(end, DURATION + 120);
}

// Card click: open preview when the file is viewable (image/video/pdf/code).
// Clicks on action buttons are ignored. Non-viewable files still toggle the
// mobile action row (actions-open). Ctrl/Cmd toggles the file into the
// multi-selection instead; Shift extends the selection to a range.
// Remember whether the last input was a finger/pen (touch has no Ctrl/Shift key).
let lastInputTouch = false;
document.addEventListener("pointerdown", (e) => {
  lastInputTouch = e.pointerType === "touch" || e.pointerType === "pen";
}, true);

fileListEl.addEventListener("click", (e) => {
  if (e.target.closest(".file-actions")) return;
  const card = e.target.closest(".file-card");
  if (!card) return;
  const id = card.dataset.fileId;

  // Touch selection mode (same as Ctrl+click on a computer): once something is
  // selected, tapping a file adds/removes it instead of opening it. Deselecting
  // the last one (or tapping empty space) leaves selection mode.
  if (lastInputTouch && selectedFileIds.size) {
    if (selectedFileIds.has(id)) selectedFileIds.delete(id); else selectedFileIds.add(id);
    lastClickedFileId = id;
    updateSelectionClasses();
    return;
  }

  if (e.ctrlKey || e.metaKey) {
    if (selectedFileIds.has(id)) selectedFileIds.delete(id); else selectedFileIds.add(id);
    lastClickedFileId = id;
    updateSelectionClasses();
    return;
  }
  if (e.shiftKey && lastClickedFileId) {
    selectRange(lastClickedFileId, id);
    updateSelectionClasses();
    return;
  }
  // Plain click: collapse any multi-selection down to just this file.
  if (selectedFileIds.size) {
    selectedFileIds.clear();
    updateSelectionClasses();
  }
  lastClickedFileId = id;

  const filtered = getFilteredFiles();
  const f = filtered.find((x) => String(x.id) === id) || allFiles.find((x) => String(x.id) === id);
  if (f) {
    const kind = isViewable(f.filename);
    if (kind) {
      if (kind === "image") {
        const thumbImg = card.querySelector("img.file-type-icon.file-thumb");
        if (thumbImg && thumbImg.src) playImageOpenZoom(thumbImg);
      }
      openAnnotationViewer(f, kind);
      return;
    }
  }

  const wasOpen = card.classList.contains("actions-open");
  document.querySelectorAll(".file-card.actions-open").forEach(c => c.classList.remove("actions-open"));
  if (!wasOpen) card.classList.add("actions-open");
});

// ==========================================
// LONG-PRESS (touch) — hold a card to enter selection mode / open the context menu
// ==========================================
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 12; // px: bigger movement = scrolling, cancel
let touchHoldActive = false;
(function initLongPress() {
  let timer = null, hint = null, card = null;
  let startX = 0, startY = 0, fired = false, releaseTimer = null, dragCard = null;

  function clear() {
    clearTimeout(timer); clearTimeout(hint);
    timer = hint = null;
    if (card) card.classList.remove("long-pressing");
    card = null;
  }

  fileListEl.addEventListener("touchstart", (e) => {
    clearTimeout(releaseTimer);
    fired = false;
    if (e.touches.length !== 1) { clear(); touchHoldActive = false; return; }
    const c = e.target.closest && e.target.closest(".file-card");
    if (!c || !c.dataset.fileId) return;
    if (e.target.closest(".file-actions, .file-actions-more, button, a, input")) return;

    touchHoldActive = true;
    clear();
    card = c;
    // Enable drag-and-drop on touch too - allow users to drag files to folder tabs
    c.draggable = true;
    dragCard = c;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;

    // small visual cue after a moment (so quick taps don't flash)
    hint = setTimeout(() => { if (card) card.classList.add("long-pressing"); }, 120);

    timer = setTimeout(() => {
      const id = String(c.dataset.fileId);
      fired = true;
      clear();
      if (navigator.vibrate) { try { navigator.vibrate(30); } catch (_) {} }

      if (selectedFileIds.size >= 2 && selectedFileIds.has(id)) {
        // 2+ files selected and this is one of them → open the menu
        showFileContextMenu(startX, startY, Array.from(selectedFileIds));
        return;
      }
      // Otherwise: hold = select this file and enter selection mode
      // (tap more files to add them, then hold on one of them for the menu).
      if (selectedFileIds.size === 0 || !selectedFileIds.has(id)) {
        if (!selectedFileIds.size || !lastInputTouch) selectedFileIds = new Set([id]);
        else selectedFileIds.add(id);
      }
      lastClickedFileId = id;
      updateSelectionClasses();
      let hinted = false;
      try { hinted = !!sessionStorage.getItem("mrdrive_sel_hint"); } catch (_) {}
      if (!hinted) {
        try { sessionStorage.setItem("mrdrive_sel_hint", "1"); } catch (_) {}
        showToast("Tanlash rejimi", "success", "Ko'proq fayl tanlang, menyu ochish uchun ushlab turing. Bekor qilish uchun bo'sh joyga bosing.");
      }
    }, LONG_PRESS_MS);
  }, { passive: true });

  fileListEl.addEventListener("touchmove", (e) => {
    if (!timer) return;
    const t = e.touches[0];
    if (Math.hypot(t.clientX - startX, t.clientY - startY) > LONG_PRESS_MOVE_TOLERANCE) clear();
  }, { passive: true });

  const end = (e) => {
    clear();
    // The finger lifting after a long press must not also "click" the card
    // (which would open the preview) or close the menu that just opened.
    if (fired && e.cancelable) e.preventDefault();
    releaseTimer = setTimeout(() => {
      touchHoldActive = false; fired = false;
      if (dragCard) { dragCard.draggable = true; dragCard = null; }
    }, 700);
  };
  fileListEl.addEventListener("touchend", end, { passive: false });
  fileListEl.addEventListener("touchcancel", end, { passive: false });
})();

// Rubber-band (marquee) selection, like a desktop file manager: press on ANY
// empty spot of the page (also below the list), drag, and every card the box
// touches is selected. Ctrl/Shift while starting adds to the current selection.
// The box is kept in page coordinates so it stays correct while auto-scrolling.
let marquee = null;
const MARQUEE_IGNORE =
  ".file-card, button, input, textarea, select, a, label, header, #dropzone, #toolbar, .selection-bar, " +
  ".annot-viewer, .settings-menu, [class*='modal'], [class*='backdrop'], [class*='toast']";

document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return; // left click only
  if (marquee) return;
  if (e.clientX >= document.documentElement.clientWidth) return; // page scrollbar
  if (e.target.closest && e.target.closest(MARQUEE_IGNORE)) return;
  const viewer = document.getElementById("annot-viewer");
  if (viewer && viewer.style.display !== "none") return;
  if (!fileListEl.children.length) return;

  const additive = e.shiftKey || e.ctrlKey || e.metaKey;
  const baseSelection = additive ? new Set(selectedFileIds) : new Set();
  if (!additive && selectedFileIds.size) {
    selectedFileIds.clear();
    updateSelectionClasses();
  }

  const box = document.createElement("div");
  box.className = "selection-box";
  document.body.appendChild(box);

  const hint = document.createElement("div");
  hint.className = "marquee-hint";
  hint.innerHTML = `Ko'proq tanlash uchun <kbd>Ctrl</kbd> ni ushlab turing`;
  document.body.appendChild(hint);

  marquee = {
    startX: e.pageX, startY: e.pageY, curX: e.clientX, curY: e.clientY,
    box, hint, baseSelection, moved: false, raf: 0,
  };
});

function updateMarquee() {
  if (!marquee) return;
  const cx = marquee.curX + window.scrollX;
  const cy = marquee.curY + window.scrollY;
  const x1 = Math.min(marquee.startX, cx) - window.scrollX;
  const y1 = Math.min(marquee.startY, cy) - window.scrollY;
  const x2 = Math.max(marquee.startX, cx) - window.scrollX;
  const y2 = Math.max(marquee.startY, cy) - window.scrollY;
  Object.assign(marquee.box.style, {
    left: `${x1}px`, top: `${y1}px`, width: `${x2 - x1}px`, height: `${y2 - y1}px`,
  });

  const next = new Set(marquee.baseSelection);
  fileListEl.querySelectorAll(".file-card").forEach((card) => {
    const r = card.getBoundingClientRect();
    if (r.left < x2 && r.right > x1 && r.top < y2 && r.bottom > y1) next.add(card.dataset.fileId);
  });
  const same = next.size === selectedFileIds.size && [...next].every((id) => selectedFileIds.has(id));
  if (!same) {
    selectedFileIds = next;
    updateSelectionClasses();
  }
}

// Scroll the page while the pointer is held near the top/bottom edge.
function marqueeAutoScroll() {
  if (!marquee) return;
  const edge = 50;
  let dy = 0;
  if (marquee.curY < edge) dy = -Math.ceil((edge - marquee.curY) / 4);
  else if (marquee.curY > window.innerHeight - edge) dy = Math.ceil((marquee.curY - (window.innerHeight - edge)) / 4);
  if (dy) { window.scrollBy(0, dy); updateMarquee(); }
  marquee.raf = requestAnimationFrame(marqueeAutoScroll);
}

document.addEventListener("mousemove", (e) => {
  if (!marquee) return;
  marquee.curX = e.clientX;
  marquee.curY = e.clientY;
  if (!marquee.moved) {
    // Small dead-zone so a plain click on empty space doesn't flash a box.
    if (Math.abs(e.pageX - marquee.startX) < 4 && Math.abs(e.pageY - marquee.startY) < 4) return;
    marquee.moved = true;
    marquee.hint.style.display = "block";
    document.body.classList.add("is-marquee");
    window.getSelection && window.getSelection().removeAllRanges();
    marquee.raf = requestAnimationFrame(marqueeAutoScroll);
  }
  updateMarquee();
});

function endMarquee() {
  if (!marquee) return;
  cancelAnimationFrame(marquee.raf);
  marquee.box.remove();
  marquee.hint.remove();
  marquee = null;
  document.body.classList.remove("is-marquee");
}
document.addEventListener("mouseup", endMarquee);
window.addEventListener("blur", endMarquee);

// Drag ghost: paint onto a CANVAS (setDragImage is reliable with canvas;
// opacity:0 DOM nodes and half-loaded <img> often produce a blank/default icon).
function dragIconKeyFor(fileId) {
  const f = allFiles.find((x) => String(x.id) === String(fileId));
  return fileIconKeyForName((f && f.filename) || "");
}

/** Return an HTMLImageElement that is already decoded, or null */
function resolvedDragBitmap(fileId) {
  const f = allFiles.find((x) => String(x.id) === String(fileId));
  if (f && isImageFileName(f.filename)) {
    const existing = fileListEl && fileListEl.querySelector(
      `.file-card[data-file-id="${f.id}"] img.file-thumb`
    );
    if (existing && existing.complete && existing.naturalWidth > 0) return existing;
  }
  const key = dragIconKeyFor(fileId);
  const ready = dragIconReady[key] || dragIconReady.file;
  if (ready && ready.complete && ready.naturalWidth > 0) return ready;
  return null;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function paintIconOnto(ctx, fileId, x, y, size) {
  // White rounded card
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  drawRoundedRect(ctx, x, y, size, size, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#e4e4e7";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.clip();

  const bmp = resolvedDragBitmap(fileId);
  if (bmp) {
    // Cover-fit draw
    const iw = bmp.naturalWidth || bmp.width;
    const ih = bmp.naturalHeight || bmp.height;
    const scale = Math.max(size / iw, size / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + (size - dw) / 2;
    const dy = y + (size - dh) / 2;
    ctx.drawImage(bmp, dx, dy, dw, dh);
  } else {
    // Minimal fallback glyph (document shape) so something always shows
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    const p = size * 0.22;
    ctx.moveTo(x + p, y + p);
    ctx.lineTo(x + size * 0.55, y + p);
    ctx.lineTo(x + size - p, y + size * 0.38);
    ctx.lineTo(x + size - p, y + size - p);
    ctx.lineTo(x + p, y + size - p);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

/** Build a canvas drag image (always has pixels). Returns { canvas, hotX, hotY }. */
function buildDragGhost(ids, frontId) {
  const count = ids.length;
  const size = DRAG_ICON_SIZE;
  const stack = Math.min(2, Math.max(0, count - 1));
  const pad = 8;
  const badgeExtra = count > 1 ? 10 : 0;
  const cssW = size + stack * 4 + pad * 2 + badgeExtra;
  const cssH = size + stack * 4 + pad * 2 + badgeExtra;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(cssW * dpr);
  canvas.height = Math.ceil(cssH * dpr);
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  // Must be in the document for some browsers
  canvas.style.cssText += ";position:fixed;left:-9999px;top:0;pointer-events:none;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const rest = ids.filter((id) => String(id) !== String(frontId)).slice(0, 2);
  // Back layers first
  for (let i = rest.length; i >= 1; i--) {
    paintIconOnto(ctx, rest[i - 1], pad + i * 4, pad + i * 4, size);
  }
  // Front
  paintIconOnto(ctx, frontId, pad, pad, size);

  if (count > 1) {
    const bx = pad + size - 6;
    const by = pad - 6;
    const label = String(count);
    ctx.font = "700 11px -apple-system, system-ui, sans-serif";
    const tw = Math.max(17, ctx.measureText(label).width + 8);
    const th = 17;
    ctx.fillStyle = "#2563eb";
    drawRoundedRect(ctx, bx, by, tw, th, 9);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, bx + tw / 2, by + th / 2 + 0.5);
  }

  // Hotspot: icon sits slightly to the right of the cursor
  return { canvas, hotX: -8, hotY: pad + 6 };
}

// Drag file cards onto folder tabs to move them. Dragging a card that's
// part of the current multi-selection carries every selected file;
// dragging one outside the selection drags just that file (and replaces
// the selection with it).
fileListEl.addEventListener("dragstart", (e) => {
  // Don't start drag from action buttons
  if (e.target.closest(".file-actions") || e.target.closest("button")) {
    e.preventDefault();
    return;
  }
  const card = e.target.closest(".file-card");
  if (!card || !card.dataset.fileId) {
    e.preventDefault();
    return;
  }
  const id = card.dataset.fileId;

  let idsToMove;
  if (selectedFileIds.has(id) && selectedFileIds.size > 1) {
    idsToMove = Array.from(selectedFileIds);
  } else {
    idsToMove = [id];
    selectedFileIds = new Set(idsToMove);
    updateSelectionClasses();
  }

  e.dataTransfer.setData("application/x-mrdrive-file", id); // back-compat, primary file
  e.dataTransfer.setData("application/x-mrdrive-files", JSON.stringify(idsToMove));
  e.dataTransfer.effectAllowed = "copyMove"; // "move" makes native file managers reject the drop

  // Drop onto the OS file manager / desktop (outside the browser) saves the
  // real file(s) there. One "mime:filename:url" entry per line; only works
  // for files whose signed URL was already prefetched.
  // Chromium honours only ONE DownloadURL entry (a multi-line value is
  // ignored), and ":" in the filename breaks its "mime:name:url" parsing.
  const lines = idsToMove
    .map((fid) => {
      const f = allFiles.find((x) => String(x.id) === String(fid));
      const cached = f && dragUrlCache.get(f.id);
      return f && cached ? `application/octet-stream:${f.filename.replace(/[:\\/]/g, "_")}:${cached.url}` : null;
    })
    .filter(Boolean);
  if (lines.length) e.dataTransfer.setData("DownloadURL", lines[0]);

  const ghost = buildDragGhost(idsToMove, id);
  try {
    e.dataTransfer.setDragImage(ghost.canvas, ghost.hotX, ghost.hotY);
  } catch (_) { /* some browsers reject exotic drag images */ }
  // Keep canvas in DOM briefly so the browser can snapshot it
  setTimeout(() => { if (ghost.canvas && ghost.canvas.parentNode) ghost.canvas.remove(); }, 50);

  fileListEl.querySelectorAll(".file-card").forEach((c) => {
    if (idsToMove.includes(c.dataset.fileId)) c.classList.add("is-dragging");
  });
  document.body.classList.add("is-dragging-file");
});
fileListEl.addEventListener("dragend", (e) => {
  fileListEl.querySelectorAll(".file-card.is-dragging").forEach((c) => c.classList.remove("is-dragging"));
  document.body.classList.remove("is-dragging-file");
  document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
});

async function downloadFile(id, path, filename) {
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, { download: filename });

  if (error) {
    showAlert("Xato: " + error.message);
    return;
  }

  const a = document.createElement("a");
  a.href = data.signedUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();

  sb.rpc("increment_download_count", { file_id: id });
  const file = allFiles.find(f => f.id === id);
  if (file) file.download_count = (file.download_count || 0) + 1;
  renderFiles();
}

// The DB said "0 rows deleted" without an error (that's how RLS blocks a delete).
// Work out WHY, so the message says something useful instead of a generic guess.
async function explainDeleteFailure(id) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { message: "Error: your session is gone. Log out, log in again, then retry." };
  }

  const { data: row } = await sb.from(TABLE).select("user_id, is_public").eq("id", id).maybeSingle();

  if (!row) {
    return { refresh: true, message: "This file record no longer exists (already deleted?). The list was refreshed." };
  }

  const me = user.user_metadata?.username || user.user_metadata?.name || "this account";

  if (row.user_id !== user.id) {
    return {
      message:
        "Error: this file belongs to a DIFFERENT account, so you can't delete it.\n\n" +
        `You are logged in as "${me}". It only shows up here because it is public. ` +
        "Log in with the account that uploaded it."
    };
  }

  return {
    message:
      "Error: you own this file, but the database still refuses the delete.\n\n" +
      "The delete policy on the \"files\" table is missing or different. " +
      "It has to be fixed in the Supabase dashboard (fix-delete.sql)."
  };
}

/* ============================================================
   Telegram message-disintegration — robust 1:1 of demo.html
   - Fully inlined computed styles (no fetch dependency)
   - Guaranteed visual effect (never snaps away)
   ============================================================ */
const ANIM_DURATION  = 3000;   // sand falls fast, doesn't linger
const SWEEP_DURATION = 1500;   // wave of grains breaking loose — a touch longer so it reads as a graceful cascade
const COLLAPSE_DELAY = 1200;
const FADE_IN_MS     = 180;    // canvas crossfades over the live card, grains stay still meanwhile — longer = imperceptible hand-off
const TILE_SIZE      = 1.0;    // finer grain = reads as sand, not confetti
const DRIFT_X        = 110;    // px: how far grains spread sideways (wide, airy scatter)
const PUFF_Y         = 16;     // px: soft upward lift as a grain breaks loose, then it arcs outward and down
const GRAVITY        = 0.00065; // gentler downward pull — grains drift down like dust, not snap like rocks
const START_SPEED     = 0.012;  // px/ms: grains ease into motion instead of jumping
const NOISE_AMP      = 0;      // subtle jitter, not chaotic

function __dissolveHash(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
function __dissolveNoise1D(x) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return __dissolveHash(i) * (1 - u) + __dissolveHash(i + 1) * u;
}

/** Inline every visual computed style so SVG foreignObject needs no external CSS. */
function __dissolveInlineAllStyles(src, dest) {
  const s = window.getComputedStyle(src);
  // Copy the important visual props (full cssText of computed is not assignable)
  const props = [
    "box-sizing","display","position","width","height","min-width","min-height","max-width","max-height",
    "margin","margin-top","margin-right","margin-bottom","margin-left",
    "padding","padding-top","padding-right","padding-bottom","padding-left",
    "border","border-radius","border-top","border-right","border-bottom","border-left",
    "border-width","border-style","border-color",
    "background","background-color","background-image","box-shadow",
    "color","font-family","font-size","font-weight","font-style","line-height","letter-spacing",
    "text-align","text-decoration","text-overflow","white-space","word-break","overflow","overflow-x","overflow-y",
    "opacity","visibility","flex","flex-direction","flex-wrap","align-items","justify-content","align-self","gap",
    "grid-template-columns","grid-template-rows","object-fit","vertical-align","cursor"
  ];
  for (const p of props) {
    try {
      const v = s.getPropertyValue(p);
      if (v) dest.style.setProperty(p, v);
    } catch (_) {}
  }
  // Kill interactive chrome in the snapshot
  if (dest.classList && (dest.classList.contains("file-actions") || dest.classList.contains("file-actions-more"))) {
    // visibility (not display) so the snapshot keeps the exact live layout
    dest.style.setProperty("visibility", "hidden");
  }
  const srcChildren = src.children;
  const destChildren = dest.children;
  for (let i = 0; i < srcChildren.length; i++) {
    if (destChildren[i]) __dissolveInlineAllStyles(srcChildren[i], destChildren[i]);
  }
}

/** DOM → canvas via SVG foreignObject (demo.html approach, self-contained styles). */
function __dissolveDomToCanvas(el, dprOverride) {
  return new Promise((resolve, reject) => {
    const rect = el.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    if (w < 2 || h < 2) {
      reject(new Error("card too small"));
      return;
    }

    const clone = el.cloneNode(true);
    clone.classList.remove("actions-open");
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.width = w + "px";
    clone.style.height = h + "px";
    __dissolveInlineAllStyles(el, clone);

    // Hide actions + type icons in snapshot (same clean bubble as download-icon;
    // external PNGs / complex SVG would break foreignObject → blank → no sand)
    // File cards: hide actions. Folder tabs: only hide the X, keep the name label.
    if (clone.classList.contains("folder-tab-wrap")) {
      clone.querySelectorAll(".folder-del-btn").forEach((b) => { b.style.setProperty("visibility", "hidden"); });
    } else {
      // Hide with visibility (NOT display:none): the card is usually still hovered
      // when Delete is clicked (no confirm dialog), so its layout has the action
      // buttons expanded. display:none re-flowed the text and the card "jumped".
      clone.querySelectorAll(".file-actions, .file-actions-more, button, .file-type-icon, .folder-icon").forEach((b) => {
        b.style.setProperty("visibility", "hidden");
      });
    }
    // Solid fallbacks so snapshot never depends on CSS variables
    if (!clone.style.background || clone.style.background.includes("var(")) {
      clone.style.background = "#ffffff";
    }
    if (!clone.style.color || clone.style.color.includes("var(")) {
      clone.style.color = "#18181b";
    }
    clone.style.border = "1px solid #e4e4e7";
    clone.style.borderRadius = clone.classList.contains("folder-tab-wrap") ? "8px" : "12px";

    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
        `<foreignObject width="100%" height="100%" x="0" y="0">` +
          `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;margin:0;padding:0;box-sizing:border-box;">` +
            new XMLSerializer().serializeToString(clone) +
          `</div>` +
        `</foreignObject>` +
      `</svg>`;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
    const img = new Image();
    img.onload = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Sanity: if almost fully transparent, treat as failure
      try {
        const sample = ctx.getImageData(0, 0, Math.min(8, canvas.width), Math.min(8, canvas.height)).data;
        let opaque = 0;
        for (let i = 3; i < sample.length; i += 4) if (sample[i] > 10) opaque++;
        if (opaque < 2) {
          reject(new Error("blank snapshot"));
          return;
        }
      } catch (_) {}
      resolve({ canvas, width: w, height: h, rect, dpr });
    };
    img.onerror = () => reject(new Error("svg image load failed"));
    img.src = url;
  });
}

const MAX_GRAINS = 70000;

/** Typed-array grains: one grain per (G x G) device pixels, colour = packed RGBA of that pixel. */
/** Info for a multi-card delete: ONE wave sweeping from the top-most card down through all of them. */
function dissolveGroupInfo(cards) {
  const list = (cards || []).filter((c) => c && c.isConnected);
  if (list.length < 2) return null;
  let top = Infinity, bottom = -Infinity;
  for (const c of list) {
    const r = c.getBoundingClientRect();
    if (r.top < top) top = r.top;
    if (r.bottom > bottom) bottom = r.bottom;
  }
  const span = Math.max(1, bottom - top);
  // Wave speed stays similar for long lists (longer span -> longer sweep), capped.
  const sweep = Math.min(3500, Math.max(SWEEP_DURATION, span * 3));
  return { top, span, sweep };
}

function __dissolveBuildGrains(snapCanvas, cssW, cssH, dpr, epX, epY, groupCtx, tabMode) {
  const W = snapCanvas.width, H = snapCanvas.height;
  const ctx = snapCanvas.getContext("2d", { willReadFrequently: true });
  const px32 = new Uint32Array(ctx.getImageData(0, 0, W, H).data.buffer);
  const G = Math.max(1, Math.ceil(Math.sqrt((W * H) / MAX_GRAINS)));
  const cap = Math.ceil(W / G) * Math.ceil(H / G);
  const x = new Float32Array(cap), y = new Float32Array(cap), vx = new Float32Array(cap);
  const g = new Float32Array(cap), delay = new Float32Array(cap), col = new Uint32Array(cap);
  const lift = new Float32Array(cap), ph = new Float32Array(cap);
  const maxDist = Math.hypot(cssW, cssH) || 1;
  let n = 0;
  for (let yy = 0; yy < H; yy += G) {
    const sy = Math.min(H - 1, yy + (G >> 1));
    const cy = yy / dpr;
    for (let xx = 0; xx < W; xx += G) {
      const c = px32[sy * W + Math.min(W - 1, xx + (G >> 1))];
      if ((c >>> 24) < 10) continue;
      const cx = xx / dpr;
      const dist = Math.hypot(cx - epX, cy - epY);
      x[n] = xx; y[n] = yy;
      // Wide, natural spread: bell-shaped random sideways speed + a push away
      // from the epicenter, so the cloud opens up like a puff of dust.
      const away = (cx - epX) / (cssW || 1);              // -1 … 1
      vx[n] = tabMode
        ? (Math.random() + Math.random() - 1) * 0.35          // folder tab: crumbles in place, falls almost straight down
        : groupCtx
        ? (Math.random() + Math.random() - 1) * 0.5           // group: near-vertical streaks
        : (Math.random() + Math.random() - 1) * 1.6 + away * 1.2;
      lift[n] = tabMode ? 0.05 + Math.random() * 0.25 : 0.4 + Math.random() * 1.3;
      ph[n] = Math.random() * 6.2832;
      g[n] = tabMode ? 1.1 + Math.random() * 0.7 : 0.8 + Math.random() * 0.5; // each grain falls a bit differently
      delay[n] = tabMode
        // Folder tab: the tab itself erodes from the bottom edge and its own grains drop down
        // (NOT a top-down wave, which reads like sand being poured on it).
        ? ((1 - cy / cssH) * 0.35) * SWEEP_DURATION * 0.5 + Math.random() * 450
        : groupCtx
        // One continuous wave: delay depends on the absolute height inside the
        // whole selection, so it runs top -> bottom across ALL cards as one.
        ? ((groupCtx.offsetY + cy) / groupCtx.span) * groupCtx.sweep + Math.random() * 200
        : ((cy / cssH) * 0.7 + (dist / maxDist) * 0.3) * SWEEP_DURATION + Math.random() * 380;
      col[n] = c;
      n++;
    }
  }
  return { n, G, x, y, vx, g, delay, col, lift, ph };
}

function __dissolveBuildTiles(snapshotCanvas, cssWidth, cssHeight, dpr, epX, epY) {
  const ctx = snapshotCanvas.getContext("2d", { willReadFrequently: true });
  const data = ctx.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height).data;
  const tiles = [];
  const maxDist = Math.hypot(cssWidth, cssHeight) || 1;
  // Keep particle count reasonable on wide cards (still looks dense)
  // Very fine grains: start at TILE_SIZE and only coarsen as much as needed to
  // keep the grain count under MAX_GRAINS (keeps big cards smooth).
  const MAX_GRAINS = 24000;
  const tile = Math.max(TILE_SIZE, Math.sqrt((cssWidth * cssHeight) / MAX_GRAINS));

  for (let y = 0; y < cssHeight; y += tile) {
    for (let x = 0; x < cssWidth; x += tile) {
      const midX = Math.min(snapshotCanvas.width  - 1, Math.floor((x + tile * 0.5) * dpr));
      const midY = Math.min(snapshotCanvas.height - 1, Math.floor((y + tile * 0.5) * dpr));
      const a = data[(midY * snapshotCanvas.width + midX) * 4 + 3];
      if (a < 10) continue;

      const distToEp = Math.hypot(x - epX, y - epY) || 0.001;
      const seed = (x * 73856) ^ (y * 19349);
      const rnd = (k) => __dissolveHash(seed + k);
      // Grains break loose near the epicenter first, drift a little sideways,
      // then fall — real sand, not floating ash.
      const tSize = tile * (0.65 + rnd(8) * 0.7);
      const vx = (rnd(2) - 0.5) * 1.0;            // almost straight down
      const vy = 0;                                // no upward/floaty motion

      tiles.push({
        sx: x * dpr, sy: y * dpr,
        sw: Math.min(tile * dpr, snapshotCanvas.width  - x * dpr),
        sh: Math.min(tile * dpr, snapshotCanvas.height - y * dpr),
        x, y, tile: tSize, base: tile,
        vx,
        vy,
        rot: 0,
        rotV: 0,
        g: 0.8 + rnd(9) * 0.5,                    // each grain falls a bit differently
        // sand crumbles from the top down (mixed with distance from the tap)
        delay: ((y / cssHeight) * 0.7 + (distToEp / maxDist) * 0.3) * SWEEP_DURATION + rnd(6) * 500,
        fadeBias: 0.4 + rnd(7) * 0.45,
        seed,
      });
    }
  }
  return tiles;
}

/** Fallback when pixel snapshot fails: whole card falls down & fades (still not a snap). */
function __dissolveFloatFallback(card) {
  return new Promise((resolve) => {
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.classList.remove("actions-open");
    ghost.style.cssText = [
      "position:fixed",
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      "margin:0",
      "z-index:9998",
      "pointer-events:none",
      "box-sizing:border-box",
      "transition:transform 1.6s cubic-bezier(.45,0,.8,.5), opacity 1.6s ease-in",
      "transform:translateY(0)",
      "opacity:1"
    ].join(";");
    document.body.appendChild(ghost);
    card.style.visibility = "hidden";
    requestAnimationFrame(() => {
      ghost.style.transform = "translateY(" + Math.max(240, window.innerHeight - rect.top) + "px)";
      ghost.style.opacity = "0";
    });
    setTimeout(() => {
      ghost.remove();
      resolve();
    }, 1200);
  });
}

/**
 * Full disintegrate — demo.html physics.
 * Always produces a visible effect; never snaps the card away.
 */
async function playDeleteDissolve(card, clickX, clickY, group) {
  if (!card || !card.isConnected) return;

  const tabMode = card.classList.contains("folder-tab-wrap");
  const startRect = card.getBoundingClientRect();
  card.style.maxHeight = startRect.height + "px";
  card.style.boxSizing = "border-box";
  card.style.overflow = "hidden";

  const padX = 150, padTop = 60;
  const padBottom = Math.min(340, Math.max(200, window.innerHeight - startRect.top + 40));
  // Match the screen's real resolution (a 1x snapshot over a 2x card looks blurry -> visible "pop").
  // Only step down if the pixel buffer would get too big.
  const overlayCss = (startRect.width + padX * 2) * (startRect.height + padTop + padBottom);
  let sdpr = Math.min(Math.round(window.devicePixelRatio || 1), 3) || 1;
  while (sdpr > 1 && overlayCss * sdpr * sdpr > 2.4e6) sdpr--;

  let snap = null;
  try {
    snap = await __dissolveDomToCanvas(card, sdpr);
  } catch (err) {
    console.warn("[dissolve] snapshot failed, using float fallback:", err);
  }

  if (snap && snap.canvas) {
    const { canvas: snapshotCanvas, width, height, rect, dpr } = snap;
    // Epicenter = where the grains start breaking loose first (tap point if known).
    const hasClick = typeof clickX === "number" && typeof clickY === "number";
    const epX = hasClick ? Math.min(Math.max(clickX - rect.left, 0), width) : width * 0.5;
    const epY = hasClick ? Math.min(Math.max(clickY - rect.top, 0), height) : height * 0.3;
    const groupCtx = group
      ? { offsetY: startRect.top - group.top, span: group.span, sweep: group.sweep }
      : null;
    const grains = __dissolveBuildGrains(snapshotCanvas, width, height, dpr, epX, epY, groupCtx, tabMode);

    if (!grains.n) {
      await __dissolveFloatFallback(card);
    } else {
      const { n, G, x: gx, y: gy, vx: gvx, g: gg, delay: gdelay, col: gcol, lift: glift, ph: gph } = grains;
      const ox = Math.round(padX * dpr), oy = Math.round(padTop * dpr);
      const OW = Math.ceil((width + padX * 2) * dpr);
      const OH = Math.ceil((height + padTop + padBottom) * dpr);

      const overlay = document.createElement("canvas");
      overlay.className = "particle-canvas";
      overlay.width = OW;
      overlay.height = OH;
      overlay.style.width = (OW / dpr) + "px";
      overlay.style.height = (OH / dpr) + "px";
      overlay.style.left = (rect.left - padX) + "px";
      overlay.style.top = (rect.top - padTop) + "px";
      document.body.appendChild(overlay);

      const octx = overlay.getContext("2d");
      // Whole frame = one Uint32 pixel buffer + ONE putImageData (no per-grain draw calls).
      const img = octx.createImageData(OW, OH);
      const buf = new Uint32Array(img.data.buffer);
      const fadeZone = 130 * dpr;            // grains dissolve smoothly before the canvas edge
      const fadeZoneX = 100 * dpr;           // …and before the left/right edges
      const gravDev = GRAVITY * dpr;
      const v0Dev = START_SPEED * dpr;
      const driftDev = DRIFT_X * dpr * (tabMode ? 0.2 : 1);
      const puffDev = PUFF_Y * dpr;
      let started = false;
      let prevMin = -1, prevMax = -1;

      const startT = performance.now();

      function paint(elapsed) {
        // Fade-in phase: nothing moves, so the whole card is one cheap drawImage.
        if (elapsed < FADE_IN_MS) {
          octx.drawImage(snapshotCanvas, ox, oy);
          return true;
        }
        if (!started) { octx.clearRect(0, 0, OW, OH); started = true; }

        if (prevMax >= 0) buf.fill(0, prevMin * OW, (prevMax + 1) * OW);
        let minY = 1e9, maxY = -1, alive = false;

        for (let i = 0; i < n; i++) {
          const local = elapsed - FADE_IN_MS - gdelay[i];
          let px, py, c = gcol[i];

          if (local < 0) {
            px = gx[i]; py = gy[i];
            alive = true;
          } else {
            const life = local / ANIM_DURATION;
            if (life >= 1) continue;
            alive = true;
            const tSec = local * 0.55;
            // Sideways spread eases OUT (fast start, glides to a stop) and a slow
            // sway makes each grain wander instead of travelling in a straight line.
            const inv = 1 - life;
            const driftEase = 1 - inv * inv * inv;
            const sway = Math.sin(local * 0.0016 + gph[i]) * (groupCtx || tabMode ? 2 : 7) * dpr * Math.min(1, life * 5);
            px = gx[i] + gvx[i] * driftDev * driftEase + sway;
            // Tiny soft "lift" right as the grain breaks loose (decays in ~150ms),
            // then gravity takes over — reads as a gentle breath, not a hard drop.
            const puff = puffDev * glift[i] * Math.exp(-local / 320);
            py = gy[i] - puff + v0Dev * local + gravDev * gg[i] * tSec * tSec;
            // stays solid while falling, fades smoothly near the end
            let a = 1;
            if (life > 0.45) {
              const f = (life - 0.45) / 0.55;
              a = 1 - f * f * (3 - 2 * f);
            }
            const room = OH - (py + oy);
            if (room < fadeZone) {
              const t = Math.max(0, room / fadeZone);
              a *= t * t * (3 - 2 * t); // smoothstep — no hard edge cutoff
            }
            const roomX = Math.min(px + ox, OW - (px + ox));
            if (roomX < fadeZoneX) {
              const t = Math.max(0, roomX / fadeZoneX);
              a *= t * t * (3 - 2 * t);
            }
            if (a <= 0.01) continue;
            if (a < 1) c = (c & 0x00ffffff) | ((((c >>> 24) * a) | 0) << 24);
          }

          const ix = (px + ox) | 0, iy = (py + oy) | 0;
          if (iy >= OH || ix < 0 || ix >= OW) continue;
          if (G === 1) {
            buf[iy * OW + ix] = c;
            if (iy < minY) minY = iy;
            if (iy > maxY) maxY = iy;
          } else {
            const ye = Math.min(iy + G, OH), xe = Math.min(ix + G, OW);
            for (let r = iy; r < ye; r++) {
              const base = r * OW;
              for (let q = ix; q < xe; q++) buf[base + q] = c;
            }
            if (iy < minY) minY = iy;
            if (ye - 1 > maxY) maxY = ye - 1;
          }
        }

        // Upload only the rows that changed (this frame ∪ previous frame).
        const top = prevMax >= 0 ? Math.min(prevMin, minY) : minY;
        const bottom = Math.max(prevMax, maxY);
        if (bottom >= top && bottom >= 0) {
          octx.putImageData(img, 0, 0, 0, top, OW, bottom - top + 1);
        }
        if (maxY >= 0) { prevMin = minY; prevMax = maxY; } else { prevMin = prevMax = -1; }
        return alive;
      }

      // Crossfade: the canvas fades IN over the still-visible card (no instant swap).
      paint(0);
      overlay.style.opacity = "0";
      if (overlay.animate) {
        overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: FADE_IN_MS, easing: "ease-in-out", fill: "forwards",
        });
      } else {
        overlay.style.transition = "opacity " + FADE_IN_MS + "ms ease-in-out";
        void overlay.offsetHeight;
        overlay.style.opacity = "1";
      }
      setTimeout(() => { card.style.visibility = "hidden"; }, FADE_IN_MS + 30);

      // Particles run independently (do not block delete/API)
      function frame(now) {
        const alive = paint(now - startT);
        if (alive) requestAnimationFrame(frame);
        else overlay.remove();
      }
      requestAnimationFrame(frame);

      // Collapse the list row after COLLAPSE_DELAY while grains still fall
      await new Promise((r) => setTimeout(r, COLLAPSE_DELAY + (group ? Math.max(0, group.sweep - SWEEP_DURATION) : 0)));
    }
  } else {
    await __dissolveFloatFallback(card);
  }

  // Classic list collapse — row closes, siblings ease up into the gap
  return new Promise((resolve) => {
    if (!card.isConnected) {
      resolve();
      return;
    }
    card.style.visibility = "hidden";
    // Explicit start height so max-height transition interpolates classically
    const h = card.getBoundingClientRect().height || startRect.height;
    card.style.maxHeight = h + "px";
    void card.offsetHeight; // reflow
    card.classList.add("is-deleting");
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      if (card.parentNode) card.remove();
      resolve();
    };
    const onEnd = (e) => {
      if (!e || e.target !== card) return;
      if (e.propertyName === "max-height" || e.propertyName === "max-width") {
        card.removeEventListener("transitionend", onEnd);
        done();
      }
    };
    card.addEventListener("transitionend", onEnd);
    setTimeout(done, 1250);
  });
}

async function deleteFile(id, path, evt) {
  const clickX = evt ? evt.clientX : undefined;
  const clickY = evt ? evt.clientY : undefined;

  if (!(await showConfirm("Ushbu faylni o'chirishni xohlaysizmi?", "O'chirish", { skippable: true }))) return;

  // Prefer data-file-id; fall back to the button's parent card (event target)
  let card = fileListEl.querySelector(`.file-card[data-file-id="${id}"]`);
  if (!card && evt && evt.target) {
    card = evt.target.closest(".file-card");
  }
  if (card) await playDeleteDissolve(card, clickX, clickY);

  markLocalDelete(id);
  forgetThumb(id); // drop the cached image immediately — it must vanish together with the file

  // 1) Database row first. .select() returns the rows that were actually deleted,
  //    so a silent RLS block (0 rows, no error) can be detected instead of ignored.
  const { data: deletedRows, error } = await sb.from(TABLE).delete().eq("id", id).select();

  if (error) {
    showAlert("Xato: " + error.message);
    loadFiles();
    return;
  }
  if (!deletedRows || deletedRows.length === 0) {
    const reason = await explainDeleteFailure(id);
    if (reason.refresh) loadFiles();
    showAlert(reason.message);
    return;
  }

  // 2) Then the stored file
  const { data: removed, error: storageError } = await sb.storage.from(BUCKET).remove([path]);
  if (storageError) {
    showToast("Fayl o'chirildi", "warning", "Xotirani tozalashda xato: " + storageError.message);
  } else if (!removed || removed.length === 0) {
    showToast("Fayl o'chirildi", "warning", "Ro'yxatdan o'chirildi, lekin xotiradagi nusxa qolgan bo'lishi mumkin.");
  } else {
    showToast("Fayl o'chirildi");
  }

  // Keep list in sync without a hard re-render (preserves classic gap-close)
  allFiles = allFiles.filter((f) => String(f.id) !== String(id));
  selectedFileIds.delete(String(id));
  updateSelectionClasses();
  setTimeout(() => loadFiles(true), 500);
}

// ==========================================
// CONTEXT MENU (right-click) — delete selected
// ==========================================
function hideFileContextMenu() {
  const m = document.getElementById("file-context-menu");
  if (m) m.remove();
}

function showFileContextMenu(clientX, clientY, ids) {
  hideFileContextMenu();
  const n = ids.length;
  if (n < 2) return; // menu is only for 2+ selected files

  const menu = document.createElement("div");
  menu.id = "file-context-menu";
  menu.className = "file-context-menu";
  menu.setAttribute("role", "menu");

  const dlLabel = n === 1 ? "Yuklab olish" : `Download ${n} files (ZIP)`;
  const delLabel = n === 1 ? "Ushbu faylni o'chirish" : `Delete these ${n} files`;
  menu.innerHTML = `
    <button type="button" class="ctx-item" role="menuitem" data-action="download">
      ${ICON_DOWNLOAD}<span>${dlLabel}</span>
    </button>
    <button type="button" class="ctx-item" role="menuitem" data-action="move" title="Drag to a folder tab">
      ${ICON_FOLDER}<span>${n === 1 ? "Drag to folder" : `Drag ${n} files to folder`}</span>
    </button>
    ${getFilteredFiles().length > n ? `<button type="button" class="ctx-item" role="menuitem" data-action="selectall">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg><span>Hammasini tanlash</span>
    </button>` : ""}
    <button type="button" class="ctx-item ctx-danger" role="menuitem" data-action="delete">
      ${ICON_DELETE}<span>${delLabel}</span>
    </button>
  `;

  document.body.appendChild(menu);

  // Position, keep inside viewport
  const pad = 8;
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  let left = clientX;
  let top = clientY;
  if (left + mw > window.innerWidth - pad) left = window.innerWidth - mw - pad;
  if (top + mh > window.innerHeight - pad) top = window.innerHeight - mh - pad;
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  menu.style.left = left + "px";
  menu.style.top = top + "px";

  menu.querySelector('[data-action="download"]').addEventListener("click", async (e) => {
    e.stopPropagation();
    hideFileContextMenu();
    showToast(n === 1 ? "Yuklab olinmoqda…" : `Preparing ${n} files…`);
    await downloadSelectedZip(ids);
  });

  menu.querySelector('[data-action="move"]').addEventListener("click", (e) => {
    e.stopPropagation();
    hideFileContextMenu();
    showFolderPicker(ids);
  });
  const selAllBtn = menu.querySelector('[data-action="selectall"]');
  if (selAllBtn) selAllBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hideFileContextMenu();
    selectedFileIds = new Set(getFilteredFiles().map((f) => String(f.id)));
    updateSelectionClasses();
    showToast(`${selectedFileIds.size} files selected`);
  });

  menu.querySelector('[data-action="delete"]').addEventListener("click", async (e) => {
    e.stopPropagation();
    hideFileContextMenu();
    await deleteSelectedFiles(ids, clientX, clientY);
  });

  // Close on outside click / escape / scroll
  const close = (ev) => {
    if (ev.type === "keydown" && ev.key !== "Escape") return;
    if ((ev.type === "mousedown" || ev.type === "touchstart") && menu.contains(ev.target)) return;
    hideFileContextMenu();
    document.removeEventListener("touchstart", close, true);
    document.removeEventListener("mousedown", close, true);
    document.removeEventListener("keydown", close, true);
    window.removeEventListener("scroll", close, true);
  };
  setTimeout(() => {
    document.addEventListener("mousedown", close, true);
    document.addEventListener("touchstart", close, true);
    document.addEventListener("keydown", close, true);
    window.addEventListener("scroll", close, true);
  }, 0);
}

// Folder chooser sheet: the touch (and keyboard) alternative to dragging files onto a folder tab.
function showFolderPicker(fileIds) {
  const ids = (fileIds || []).map(String);
  if (!ids.length) return;
  const existing = document.getElementById("folder-picker-modal");
  if (existing) existing.remove();

  const files = allFiles.filter((f) => ids.includes(String(f.id)));
  const allIn = (name) => files.length && files.every((f) => (f.folder || null) === name);

  const modal = document.createElement("div");
  modal.id = "folder-picker-modal";
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box folder-picker-box">
        <h3 class="prompt-title"></h3>
        <div class="folder-picker-list"></div>
        <button type="button" class="prompt-btn prompt-btn-cancel folder-picker-cancel">Cancel</button>
      </div>
    </div>`;
  modal.querySelector(".prompt-title").textContent =
    ids.length === 1 ? "Papkaga ko'chirish" : `Move ${ids.length} files to`;
  const list = modal.querySelector(".folder-picker-list");

  const close = () => { document.removeEventListener("keydown", onKey); modal.remove(); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  const addItem = (label, current, onPick, extraClass) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "folder-picker-item" + (current ? " current" : "") + (extraClass ? " " + extraClass : "");
    const span = document.createElement("span");
    span.textContent = label;
    b.innerHTML = ICON_FOLDER;
    b.appendChild(span);
    if (current) { const chk = document.createElement("em"); chk.textContent = "✓"; b.appendChild(chk); }
    b.addEventListener("click", () => { close(); onPick(); });
    list.appendChild(b);
  };

  addItem("All (no folder)", allIn(null), () => moveFilesToFolder(ids, null, { animate: true }));
  allFolders.forEach((f) => addItem(f.name, allIn(f.name), () => moveFilesToFolder(ids, f.name, { animate: true })));
  addItem("+ New folder", false, () => createFolder(ids, { animate: true }), "folder-picker-new");

  modal.querySelector(".folder-picker-cancel").addEventListener("click", close);
  modal.querySelector(".modal-backdrop").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(modal);
}

async function deleteSelectedFiles(ids, clickX, clickY, opts) {
  const list = (ids || []).map(String).filter(Boolean);
  if (!list.length) return;

  const msg =
    list.length === 1
      ? "Ushbu faylni o'chirishni xohlaysizmi?"
      : `Delete these ${list.length} files?`;
  if (!(await showConfirm(msg, "O'chirish", { skippable: true, focusOk: !!(opts && opts.viaKeyboard) }))) return;

  // Dissolve all visible selected cards in parallel
  const cards = list
    .map((id) => fileListEl && fileListEl.querySelector(`.file-card[data-file-id="${id}"]`))
    .filter(Boolean);
  if (cards.length) {
    const group = dissolveGroupInfo(cards); // one shared top->bottom wave for all selected files
    await Promise.all(cards.map((c) => playDeleteDissolve(c, clickX, clickY, group)));
  }

  list.forEach((id) => markLocalDelete(id));
  forgetThumbs(list); // drop cached images for every file being deleted, together with the files

  const files = list
    .map((id) => allFiles.find((f) => String(f.id) === String(id)))
    .filter(Boolean);

  // DB delete
  const { data: deletedRows, error } = await sb
    .from(TABLE)
    .delete()
    .in("id", list.map((id) => {
      const n = Number(id);
      return Number.isFinite(n) && String(n) === String(id) ? n : id;
    }))
    .select();

  if (error) {
    showAlert("Xato: " + error.message);
    loadFiles();
    return;
  }

  // Storage cleanup (best-effort)
  const paths = files.map((f) => f.storage_path).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await sb.storage.from(BUCKET).remove(paths);
    if (storageError) {
      showToast(
        list.length === 1 ? "Fayl o'chirildi" : `${list.length} files deleted`,
        "warning",
        "Xotirani tozalashda xato: " + storageError.message
      );
    } else {
      showToast(list.length === 1 ? "Fayl o'chirildi" : `${list.length} files deleted`);
    }
  } else {
    showToast(list.length === 1 ? "Fayl o'chirildi" : `${list.length} files deleted`);
  }

  const gone = new Set((deletedRows || []).map((r) => String(r.id)));
  if (!gone.size) list.forEach((id) => gone.add(String(id)));
  allFiles = allFiles.filter((f) => !gone.has(String(f.id)));
  list.forEach((id) => selectedFileIds.delete(String(id)));
  updateSelectionClasses();
  setTimeout(() => loadFiles(true), 500);
}

fileListEl.addEventListener("contextmenu", (e) => {
  const card = e.target.closest && e.target.closest(".file-card");
  if (!card || !card.dataset.fileId) return;
  // On touch screens the browser fires this after ~0.5s of holding; our own
  // 3-second long-press (below) handles touch instead.
  if (touchHoldActive || e.pointerType === "touch") { e.preventDefault(); return; }

  // The menu is for MULTIPLE files only: right-click on one of 2+ selected files.
  // Anything else keeps the browser's normal behaviour.
  const id = String(card.dataset.fileId);
  if (selectedFileIds.size < 2 || !selectedFileIds.has(id)) return;
  e.preventDefault();
  showFileContextMenu(e.clientX, e.clientY, Array.from(selectedFileIds));
});

// ==========================================
// PUBLIC LINK — CREATE / COPY / REFRESH / UNPUBLISH
// ==========================================

async function createPublicLink(fileId) {
  const { data: file, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("id", fileId)
    .single();

  if (error || !file) {
    showAlert("Error: file not found.");
    return;
  }

  showDurationPicker(async (duration) => {
    const newToken = generateToken();
    const expiresAt = computeExpiry(duration);

    const { error: updateError } = await sb
      .from(TABLE)
      .update({
        is_public: true,
        public_token: newToken,
        expires_at: expiresAt
      })
      .eq("id", fileId);

    if (updateError) {
      showAlert("Xato: " + updateError.message);
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?share=${newToken}`;
    await copyToClipboard(url);

    showToast("Ommaviy havola yaratildi va nusxalandi");
    loadFiles();
  });
}

async function copyPublicLink(fileId, btn) {
  const { data: file, error } = await sb
    .from(TABLE)
    .select("public_token")
    .eq("id", fileId)
    .single();

  if (error || !file || !file.public_token) {
    showAlert("Error: link not found.");
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}?share=${file.public_token}`;
  await copyToClipboard(url);
  showToast("Havola nusxalandi");

  // Morph the button itself into a checkmark for a moment instead of
  // just relying on the toast — same button, brief state change.
  if (btn && !btn.classList.contains("is-copied")) {
    const original = btn.innerHTML;
    btn.classList.add("is-copied");
    btn.innerHTML = ICON_CHECK;
    setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.innerHTML = original;
    }, 1200);
  }
}

async function refreshPublicLink(fileId) {
  if (!(await showConfirm("Yangi havola yaratilsinmi? Eski havola ishlamay qoladi.", "Yangi havola"))) return;

  const { data: file, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("id", fileId)
    .single();

  if (error || !file) {
    showAlert("Error: file not found.");
    return;
  }

  const currentExpiry = file.expires_at;
  const newToken = generateToken();

  const { error: updateError } = await sb
    .from(TABLE)
    .update({
      is_public: true,
      public_token: newToken,
      expires_at: currentExpiry
    })
    .eq("id", fileId);

  if (updateError) {
    showAlert("Xato: " + updateError.message);
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}?share=${newToken}`;
  await copyToClipboard(url);

  showToast("Yangi havola yaratildi va nusxalandi");
  loadFiles();
}

async function unpublishFile(fileId) {
  if (!(await showConfirm("Ommaviydan o'chirish? Havola ishlamay qoladi.", "O'chirish"))) return;

  const { error } = await sb
    .from(TABLE)
    .update({ is_public: false, public_token: null, expires_at: null })
    .eq("id", fileId);

  if (error) {
    showAlert("Xato: " + error.message);
    return;
  }

  showToast("Ommaviydan o'chirildi");
  loadFiles();
}

// In-app confirm dialog. Native confirm() can be suppressed by the browser
// ("prevent additional dialogs"), in which case it silently returns false.
function showConfirm(message, okLabel = "OK", opts = {}) {
  const skippable = !!opts.skippable;
  if (skippable && isSkipDeleteConfirm()) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.getElementById("confirm-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "confirm-modal";
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-box">
          <p class="confirm-msg"></p>
          ${skippable ? `<label class="confirm-skip"><input type="checkbox" class="confirm-skip-cb"><span>O'chirishdan oldin so'ramaslik.</span></label>` : ""}
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel">Cancel</button>
            <button type="button" class="confirm-ok"></button>
          </div>
        </div>
      </div>
    `;
    modal.querySelector(".confirm-msg").textContent = message;
    modal.querySelector(".confirm-ok").textContent = okLabel;
    document.body.appendChild(modal);

    const onKey = (e) => { if (e.key === "Escape") done(false); };
    const done = (value) => {
      document.removeEventListener("keydown", onKey);
      modal.remove();
      resolve(value);
    };
    document.addEventListener("keydown", onKey);

    modal.querySelector(".confirm-cancel").onclick = () => done(false);
    modal.querySelector(".confirm-ok").onclick = () => {
      const cb = modal.querySelector(".confirm-skip-cb");
      if (skippable && cb && cb.checked) setSkipDeleteConfirm(true);
      done(true);
    };
    modal.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) done(false);
    });
    modal.querySelector(opts.focusOk ? ".confirm-ok" : ".confirm-cancel").focus();
  });
}

// In-app alert dialog (native alert() is suppressed together with confirm()
// when the browser blocks dialogs, which would hide every error message).
function showAlert(message) {
  return new Promise((resolve) => {
    const existing = document.getElementById("alert-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "alert-modal";
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-box">
          <p class="confirm-msg"></p>
          <div class="confirm-actions">
            <button type="button" class="confirm-ok">OK</button>
          </div>
        </div>
      </div>
    `;
    modal.querySelector(".confirm-msg").textContent = message;
    document.body.appendChild(modal);

    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter") done(); };
    const done = () => {
      document.removeEventListener("keydown", onKey);
      modal.remove();
      resolve();
    };
    document.addEventListener("keydown", onKey);
    modal.querySelector(".confirm-ok").onclick = done;
    modal.querySelector(".confirm-ok").focus();
  });
}

// In-app text input dialog — never use native prompt().
function showPrompt(message, opts = {}) {
  const {
    okLabel = "OK",
    cancelLabel = "Bekor qilish",
    placeholder = "",
    defaultValue = ""
  } = opts;
  return new Promise((resolve) => {
    const existing = document.getElementById("prompt-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "prompt-modal";
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-box prompt-box">
          <h3 class="prompt-title"></h3>
          <input type="text" class="prompt-input" autocomplete="off" spellcheck="false" />
          <div class="prompt-actions">
            <button type="button" class="prompt-btn prompt-btn-cancel"></button>
            <button type="button" class="prompt-btn prompt-btn-ok"></button>
          </div>
        </div>
      </div>
    `;
    modal.querySelector(".prompt-title").textContent = message;
    const input = modal.querySelector(".prompt-input");
    input.placeholder = placeholder;
    input.value = defaultValue;
    modal.querySelector(".prompt-btn-cancel").textContent = cancelLabel;
    modal.querySelector(".prompt-btn-ok").textContent = okLabel;
    document.body.appendChild(modal);

    const onKey = (e) => {
      if (e.key === "Escape") done(null);
      if (e.key === "Enter") {
        e.preventDefault();
        done(input.value);
      }
    };
    const done = (value) => {
      document.removeEventListener("keydown", onKey);
      modal.remove();
      resolve(value);
    };
    document.addEventListener("keydown", onKey);

    modal.querySelector(".prompt-btn-cancel").onclick = () => done(null);
    modal.querySelector(".prompt-btn-ok").onclick = () => done(input.value);
    modal.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) done(null);
    });
    requestAnimationFrame(() => {
      input.focus();
      if (defaultValue) input.select();
    });
  });
}

function showDurationPicker(onSelect) {
  const existing = document.getElementById("duration-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "duration-modal";
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <h3>Link expiry</h3>
        <p class="modal-desc">How long should the link work?</p>
        <div class="duration-options">
          <button data-value="1">1 day</button>
          <button data-value="7">7 days</button>
          <button data-value="30">30 days</button>
          <button data-value="unlimited" class="default-opt">Unlimited</button>
        </div>
        <button class="modal-cancel" onclick="document.getElementById('duration-modal').remove()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll(".duration-options button").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-value");
      modal.remove();
      onSelect(val);
    });
  });
}

function computeExpiry(duration) {
  if (duration === "unlimited") return null;
  const days = parseInt(duration, 10);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function generateToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

const TOAST_ICONS = {
  success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6.5V13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1.4" fill="currentColor"/></svg>`,
  error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 7L17 17M17 7L7 17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`
};

// type: "success" | "warning" | "error". detail = optional second line (muted).
// Click a toast to dismiss it early. Toasts with a detail / non-success stay longer.
function showToast(msg, type = "success", detail = "") {
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.success}</span>
    <div class="toast-body">
      <div class="toast-title"></div>
      ${detail ? '<div class="toast-detail"></div>' : ""}
    </div>
  `;
  toast.querySelector(".toast-title").textContent = msg;
  if (detail) toast.querySelector(".toast-detail").textContent = detail;
  stack.appendChild(toast);
  // Next frame so CSS transition runs (enter from below)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  const hide = () => {
    clearTimeout(timer);
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 240);
  };
  const timer = setTimeout(hide, detail || type !== "success" ? 6000 : 2500);
  toast.addEventListener("click", hide);
}

// ==========================================
// HELPERS
// ==========================================

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US") + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeJs(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ==========================================
// ANNOTATION VIEWER – tools, drawing, PDF/PNG
// ==========================================

const ICON_VIEW = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>`;
const ICON_PENCIL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const ICON_CHECK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const ANNOT_TOOLS = [
  {
    id: "pen",
    tip: "Qalam – erkin chizish (1 barmoq)",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 20L8.5 18.5L19 8C19.8284 7.17157 19.8284 5.82843 19 5C18.1716 4.17157 16.8284 4.17157 16 5L5.5 15.5L4 20Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.5 6.5L17.5 9.5" stroke="currentColor" stroke-width="1.8"/></svg>`
  },
  {
    id: "highlighter",
    tip: "Marker – yarim shaffof belgilash",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 20H9L19 10L14 5L4 15V20Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 5L19 10" stroke="currentColor" stroke-width="1.8"/><path d="M5 15H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/></svg>`
  },
  {
    id: "eraser",
    tip: "O'chirgich – chiziqlarni o'chirish",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M16 4L20 8L10 18H6V14L16 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 20H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    id: "rect",
    tip: "To'rtburchak",
    svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>`
  },
  {
    id: "circle",
    tip: "Doira / Ellips",
    svg: `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="8" ry="6" stroke="currentColor" stroke-width="1.8"/></svg>`
  },
  {
    id: "arrow",
    tip: "Strelka",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "text",
    tip: "Matn qo'shish",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 6H19M12 6V19M9 19H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "pan",
    tip: "Surish (yoki 2 barmoq)",
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4V20M12 4L8 8M12 4L16 8M12 20L8 16M12 20L16 16M4 12H20M4 12L8 8M4 12L8 16M20 12L16 8M20 12L16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
];

const ANNOT_COLORS = ["#2563eb", "#3b82f6", "#0f172a", "#64748b", "#94a3b8", "#6366f1", "#000000", "#ffffff"];
const ANNOT_SIZES = [2, 4, 8, 14];

let annotState = {
  open: false,
  tool: "pen",
  color: "#2563eb",
  size: 4,
  file: null,
  type: null, // "image" | "pdf" | "code"
  history: [],
  historyIdx: -1,
  drawing: false,
  lastX: 0,
  lastY: 0,
  startX: 0,
  startY: 0,
  currentStroke: null,
  pages: [], // { canvas, ctx, imgW, imgH, pageNum? }
  touches: new Map(),
  isPanning: false,
  panStart: null,
  scale: 1,
  scrollEl: null,
  isFullscreen: false,
  editMode: false
};

function isViewable(filename) {
  const lower = filename.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(lower)) return "image";
  if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(lower)) return "video";
  if (/\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|weba)$/i.test(lower)) return "audio";
  if (/\.pdf$/i.test(lower)) return "pdf";
  if (/\.(txt|md|json|js|ts|css|html|xml|py|java|c|cpp|h|go|rs|sh|yml|yaml|toml|ini|log|csv)$/i.test(lower)) return "code";
  return null;
}

// Extension -> highlight.js language name, for colored code/text previews.
const CODE_LANG_MAP = {
  js: "javascript", mjs: "javascript", cjs: "javascript", jsx: "javascript",
  ts: "typescript", tsx: "typescript",
  json: "json", html: "xml", xml: "xml", css: "css",
  py: "python", java: "java", c: "c", h: "c", cpp: "cpp",
  go: "go", rs: "rust", sh: "bash", yml: "yaml", yaml: "yaml",
  toml: "ini", ini: "ini", md: "markdown", log: "plaintext",
  csv: "plaintext", txt: "plaintext"
};

// Above this size, skip syntax coloring (plain dark text stays instant and
// the tab never freezes on a huge log/data file).
const CODE_HIGHLIGHT_MAX_CHARS = 400000;

// Patch renderFiles: stable data-id on cards (no eye/view button —
// opening preview is done by tapping the card itself).
const _origRenderFiles = renderFiles;
renderFiles = function () {
  const openIds = new Set();
  fileListEl.querySelectorAll(".file-card.actions-open").forEach((c) => {
    if (c.dataset.fileId) openIds.add(c.dataset.fileId);
  });

  _origRenderFiles();

  const filtered = getFilteredFiles();
  fileListEl.querySelectorAll(".file-card").forEach((card, i) => {
    const f = filtered[i];
    if (!f) return;
    card.dataset.fileId = String(f.id);
    if (kbCursorId === String(f.id)) card.classList.add("kb-focus");
    if (openIds.has(String(f.id))) card.classList.add("actions-open");
    // Green flash for files just added remotely (e.g. Claude MCP)
    if (highlightFileIds.has(String(f.id))) {
      card.classList.add("file-card-new");
      const id = String(f.id);
      setTimeout(() => {
        highlightFileIds.delete(id);
        const el = fileListEl.querySelector(`.file-card[data-file-id="${id}"]`);
        if (el) el.classList.remove("file-card-new");
      }, 2800);
    }
  });
};

function getFilteredFiles() {
  return getSearchFilteredFiles();
}

function setAnnotFilenamePath(file) {
  const el = document.getElementById("annot-filename");
  if (!el) return;
  const name = file && file.filename ? String(file.filename) : "";
  const folder = file && file.folder ? String(file.folder) : "";
  // ~/folder/name.png  or  ~/name.png
  let prefix = "~/";
  if (folder) prefix += folder.replace(/^\/+|\/+$/g, "") + "/";
  el.innerHTML =
    '<span class="annot-path-prefix">' + escapeHtml(prefix) + '</span>' +
    '<span class="annot-path-name">' + escapeHtml(name) + '</span>';
  el.title = prefix + name;
}

async function openAnnotationViewer(file, kind, opts) {
  if (pendingCloseFinish) pendingCloseFinish();
  const viewer = document.getElementById("annot-viewer");
  const scroll = document.getElementById("annot-scroll");
  const filenameEl = document.getElementById("annot-filename");
  const toolbar = document.getElementById("annot-toolbar");
  const statusHint = document.getElementById("annot-tool-hint");

  // Align list folder tab with the file being opened (don't wipe file URL)
  if (file.folder) {
    currentFolder = file.folder;
    renderToolbar();
  } else if (file.folder == null && currentFolder != null) {
    currentFolder = null;
    renderToolbar();
  }
  if (!(opts && opts.skipUrl)) {
    syncFileUrl(file, false);
  }

  annotState.open = true;
  annotState.file = file;
  annotState.type = kind;
  annotState.history = [];
  annotState.historyIdx = -1;
  annotState.pages = [];
  annotState.scale = 1;
  annotState.tool = "pen";
  annotState.color = "#2563eb";
  annotState.size = 4;
  annotState.editMode = false;
  updateAnnotNavButtons();

  setAnnotFilenamePath(file);
  scroll.innerHTML = "";
  scroll.className = "annot-scroll";
  viewer.style.display = "flex";
  viewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Image/video previews sit on a near-white workspace; code/text previews
  // stay dark. Toggled via a class so CSS owns the actual colors.
  // Kind class is also on the viewer so topbar / status / toolbar can match.
  const workspaceEl = document.getElementById("annot-workspace");
  const kindClasses = ["kind-image", "kind-video", "kind-audio", "kind-pdf", "kind-code"];
  workspaceEl.classList.remove(...kindClasses);
  workspaceEl.classList.add("kind-" + kind);
  viewer.classList.remove(...kindClasses);
  viewer.classList.add("kind-" + kind);

  // View-only by default (drawing off). Pen toggles drawing on/off like
  // the public share preview. Save/download stays visible for image/pdf.
  // Code/video stay read-only (no pen, no save).
  const editBtn = document.getElementById("annot-edit");
  const saveBtn = document.getElementById("annot-save");
  toolbar.style.display = "none";
  const isReadOnly = kind === "code" || kind === "video" || kind === "audio";
  if (saveBtn) saveBtn.style.display = isReadOnly ? "none" : "";
  editBtn.classList.remove("is-edit", "is-save", "active");
  editBtn.title = "Tahrirlash";
  editBtn.innerHTML = ICON_PENCIL;
  editBtn.style.display = isReadOnly ? "none" : "";
  editBtn.onclick = () => enterAnnotEditMode(toolbar, editBtn);
  if (saveBtn) saveBtn.onclick = () => saveAnnotated();
  // Drawing tools bar removed — only freehand pen when edit mode is on
  if (toolbar) {
    toolbar.innerHTML = "";
    toolbar.style.display = "none";
  }

  // Loading indicator
  const loader = document.createElement("div");
  loader.className = "annot-loading";
  loader.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="40" stroke-linecap="round"/></svg> Yuklanmoqda…`;
  scroll.appendChild(loader);

  try {
    let signedUrl;
    // Images: reuse the already-preloaded thumbnail URL instead of asking
    // Supabase for a brand-new signed URL every time. A fresh signed URL is a
    // different string, so the browser can't match it to the cached bytes and
    // ends up re-downloading from Supabase on every open. Reusing the same
    // cached URL lets the browser serve it instantly from its own cache.
    if (kind === "image") {
      const cached = thumbUrlCache.get(String(file.id));
      if (cached && cached.url && cached.expiresAt - Date.now() > 60 * 1000) {
        signedUrl = cached.url;
      }
    }
    if (!signedUrl) {
      const { data: urlData, error } = await sb.storage
        .from(BUCKET)
        .createSignedUrl(file.storage_path, 3600);
      if (error || !urlData) throw error || new Error("Could not get file URL");
      signedUrl = urlData.signedUrl;
      if (kind === "image") {
        // Cache it so the next open (and the list thumbnail) reuses this same URL.
        thumbUrlCache.set(String(file.id), { url: signedUrl, expiresAt: Date.now() + 3600 * 1000 });
      }
    }

    if (kind === "image") {
      await loadImageForAnnot(signedUrl, scroll, loader);
      statusHint.textContent = "1 barmoq = chizish · 2 barmoq = surish · Pinch = zoom";
    } else if (kind === "pdf") {
      await loadPdfForAnnot(signedUrl, scroll, loader);
      statusHint.textContent = "Chizmalar sahifaga yopishadi · 1 barmoq chizish · 2 barmoq surish";
    } else if (kind === "code") {
      scroll.classList.add("is-text");
      await loadCodeForAnnot(signedUrl, scroll, loader, file.filename);
      statusHint.textContent = "Dark mode kod ko'rinishi · Faqat o'qish";
      // Hide drawing tools for code
      toolbar.querySelectorAll(".annot-tool-group.draw-tools").forEach(g => g.style.display = "none");
    } else if (kind === "video") {
      await loadVideoForAnnot(signedUrl, scroll);
      statusHint.textContent = "Video ko'rish · Faqat o'qish";
      toolbar.querySelectorAll(".annot-tool-group.draw-tools").forEach(g => g.style.display = "none");
    } else if (kind === "audio") {
      await loadAudioForAnnot(signedUrl, scroll, file);
      statusHint.textContent = "Tinglash · Play / pauza · Takrorlash";
      toolbar.querySelectorAll(".annot-tool-group.draw-tools").forEach(g => g.style.display = "none");
    }
  } catch (err) {
    console.error(err);
    loader.innerHTML = `<span style="color:#64748b">Fayl yuklanmadi</span>`;
  }

  // Wire top buttons
  document.getElementById("annot-close").onclick = requestCloseAnnotationViewer;
  document.getElementById("annot-fullscreen").onclick = toggleAnnotFullscreen;

  // Keyboard
  window.addEventListener("keydown", annotKeyHandler);

  // Live layout: reflow image/video/pdf when window size changes
  bindAnnotResize();
  // One extra pass after layout settles (flex/toolbar)
  requestAnimationFrame(() => requestAnimationFrame(refitAnnotLayout));
}

// Enter drawing mode: pencil active (gray). Only freehand pen — no tools bar.
// Save stays visible always (like public preview). Tapping pencil again exits.
function enterAnnotEditMode(toolbar, editBtn) {
  if (annotState.editMode) return;
  annotState.editMode = true;
  annotState.tool = "pen";
  annotState.color = "#2563eb";
  annotState.size = 4;
  // Tools bar stays hidden — only freehand pen
  if (toolbar) toolbar.style.display = "none";
  editBtn.classList.add("is-edit", "active");
  editBtn.classList.remove("is-save");
  editBtn.title = "Chizishni tugatish";
  editBtn.innerHTML = ICON_PENCIL;
  editBtn.onclick = () => exitAnnotEditMode(toolbar, editBtn);
  updateCursor();
}

// Exit drawing mode: pencil back to normal. Save stays visible.
function exitAnnotEditMode(toolbar, editBtn) {
  annotState.editMode = false;
  if (toolbar) toolbar.style.display = "none";
  editBtn.classList.remove("is-edit", "active", "is-save");
  editBtn.title = "Tahrirlash";
  editBtn.innerHTML = ICON_PENCIL;
  editBtn.onclick = () => enterAnnotEditMode(toolbar, editBtn);
  updateCursor();
}

// True while there are drawn/edited changes on the currently open image or
// PDF that haven't been downloaded via the Save button yet.
function annotHasUnsavedEdits() {
  return !!(
    annotState.open &&
    (annotState.type === "image" || annotState.type === "pdf") &&
    annotState.historyIdx > 0
  );
}

// Ask "save before closing?" when there are unsaved drawings, then act on
// the user's choice. Used by the X button and the Escape key.
async function requestCloseAnnotationViewer() {
  if (!annotHasUnsavedEdits()) {
    closeAnnotationViewer({ animate: true });
    return;
  }
  const choice = await showSaveBeforeCloseConfirm();
  if (choice === "cancel") return;
  if (choice === "save") {
    await saveAnnotated(); // saveAnnotated() closes the viewer itself once the download succeeds
    return;
  }
  closeAnnotationViewer({ animate: true }); // discard
}

// 3-way "Save / Discard / Cancel" dialog shown before closing an image/PDF
// with unsaved drawings.
function showSaveBeforeCloseConfirm() {
  return new Promise((resolve) => {
    const existing = document.getElementById("save-confirm-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "save-confirm-modal";
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-box">
          <p class="confirm-msg">Chizganlaringiz saqlanmagan. Yopishdan oldin saqlaysizmi?</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel">Bekor qilish</button>
            <button type="button" class="confirm-discard">Saqlamasdan chiqish</button>
            <button type="button" class="confirm-ok">Saqlash</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const onKey = (e) => { if (e.key === "Escape") done("cancel"); };
    const done = (value) => {
      document.removeEventListener("keydown", onKey);
      modal.remove();
      resolve(value);
    };
    document.addEventListener("keydown", onKey);

    modal.querySelector(".confirm-cancel").onclick = () => done("cancel");
    modal.querySelector(".confirm-discard").onclick = () => done("discard");
    modal.querySelector(".confirm-ok").onclick = () => done("save");
    modal.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) done("cancel");
    });
    modal.querySelector(".confirm-ok").focus();
  });
}

// Finishes a (possibly animated) close: really hides the viewer and resets
// its classes so the next open starts clean.
let pendingCloseFinish = null;

function hideAnnotViewerNow() {
  const viewer = document.getElementById("annot-viewer");
  viewer.style.display = "none";
  viewer.style.opacity = "";
  viewer.style.transition = "";
  viewer.style.pointerEvents = "";
  viewer.setAttribute("aria-hidden", "true");
  viewer.classList.remove("kind-image", "kind-video", "kind-audio", "kind-pdf", "kind-code");
  const workspaceEl = document.getElementById("annot-workspace");
  if (workspaceEl) workspaceEl.classList.remove("kind-image", "kind-video", "kind-audio", "kind-pdf", "kind-code");
}

// Close transition (mirror of the open zoom): the viewer image shrinks
// smoothly back into its thumbnail in the file list while the viewer fades
// out. Returns false when it can't animate (no thumb on screen, etc.) so the
// caller falls back to the plain instant close.
function playImageCloseZoom(file, viewer) {
  const pageState = annotState.pages && annotState.pages[0];
  const pageEl = pageState && pageState.el;
  const srcImg = pageEl && pageEl.querySelector("img");
  const thumb = fileListEl && fileListEl.querySelector(
    `.file-card[data-file-id="${file.id}"] img.file-thumb`
  );
  if (!pageEl || !srcImg || !thumb) return false;

  const from = pageEl.getBoundingClientRect();
  const to = thumb.getBoundingClientRect();
  if (!from.width || !from.height || !to.width || !to.height) return false;
  if (to.bottom < 0 || to.top > window.innerHeight || to.right < 0 || to.left > window.innerWidth) return false;

  const clone = document.createElement("img");
  clone.src = srcImg.currentSrc || srcImg.src;
  clone.className = "thumb-zoom-clone";
  clone.style.cssText =
    "position:fixed;margin:0;padding:0;border:0;background:transparent;" +
    "object-fit:contain;overflow:hidden;pointer-events:none;z-index:2100;" +
    "border-radius:12px;opacity:1;" +
    `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
  document.body.appendChild(clone);

  // The real viewer image is replaced by the clone; the rest of the viewer
  // (background, top bar) just fades out underneath it.
  pageEl.style.visibility = "hidden";
  const DURATION = 480; // ms
  const ease = "cubic-bezier(.4,0,.2,1)";
  clone.style.transition =
    `left ${DURATION}ms ${ease}, top ${DURATION}ms ${ease}, ` +
    `width ${DURATION}ms ${ease}, height ${DURATION}ms ${ease}, ` +
    `border-radius ${DURATION}ms ${ease}, opacity 140ms ease ${DURATION - 140}ms`;
  viewer.style.transition = "opacity 340ms ease";
  viewer.style.pointerEvents = "none";
  void clone.offsetWidth; // start transitions from the current box
  viewer.style.opacity = "0";
  clone.style.left = to.left + "px";
  clone.style.top = to.top + "px";
  clone.style.width = to.width + "px";
  clone.style.height = to.height + "px";
  clone.style.borderRadius = "8px";
  clone.style.opacity = "0";

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    clone.remove();
    pageEl.style.visibility = "";
    if (pendingCloseFinish === finish) pendingCloseFinish = null;
    if (!annotState.open) hideAnnotViewerNow();
  };
  const timer = setTimeout(finish, DURATION + 60);
  pendingCloseFinish = finish;
  return true;
}

function closeAnnotationViewer(opts) {
  const viewer = document.getElementById("annot-viewer");
  const videoEl = viewer.querySelector("#annot-scroll video, #annot-scroll audio");
  if (videoEl) { videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load(); }
  if (window.__mrAudioDestroy) { try { window.__mrAudioDestroy(); } catch (_) {} }
  unbindAnnotResize();
  viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  const closedFile = annotState.file;

  // Smooth shrink back into the thumbnail (image previews, user-initiated close)
  const animated = !!(opts && opts.animate && annotState.type === "image" && closedFile
    && playImageCloseZoom(closedFile, viewer));
  if (!animated) hideAnnotViewerNow();

  annotState.open = false;
  annotState.file = null;
  annotState.pages = [];
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  window.removeEventListener("keydown", annotKeyHandler);
  // Restore folder (or All) URL when leaving the file preview
  if (!(opts && opts.skipUrl)) {
    const folder = (closedFile && closedFile.folder) || currentFolder;
    syncFolderUrl(folder, false);
  }
}

function annotKeyHandler(e) {
  if (!annotState.open) return;
  if (e.key === "Escape") requestCloseAnnotationViewer();
}

// Browsers won't let JS intercept Ctrl+W itself, but they will show their
// own "leave site?" prompt on tab-close / reload / navigation if we flag
// the page as having unsaved work here — this covers Ctrl+W too.
window.addEventListener("beforeunload", (e) => {
  if (!annotHasUnsavedEdits()) return;
  e.preventDefault();
  e.returnValue = "";
});

function buildAnnotToolbar(toolbar) {
  toolbar.innerHTML = "";

  // Tools group
  const group = document.createElement("div");
  group.className = "annot-tool-group draw-tools";
  ANNOT_TOOLS.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "annot-tool" + (t.id === annotState.tool ? " active" : "");
    btn.dataset.tool = t.id;
    btn.dataset.tip = t.tip;
    btn.innerHTML = t.svg;
    btn.onclick = () => {
      annotState.tool = t.id;
      toolbar.querySelectorAll(".annot-tool").forEach(b => b.classList.toggle("active", b.dataset.tool === t.id));
      document.getElementById("annot-tool-hint").textContent = t.tip + (t.id === "pan" ? "" : " · 1 barmoq chizish · 2 barmoq surish");
      updateCursor();
    };
    group.appendChild(btn);
  });
  toolbar.appendChild(group);

  // Colors
  const colorGroup = document.createElement("div");
  colorGroup.className = "annot-tool-group";
  ANNOT_COLORS.forEach(c => {
    const sw = document.createElement("button");
    sw.className = "annot-color-swatch" + (c === annotState.color ? " active" : "");
    sw.style.background = c;
    sw.title = c;
    sw.onclick = () => {
      annotState.color = c;
      colorGroup.querySelectorAll(".annot-color-swatch").forEach(s => s.classList.toggle("active", s.style.background === c));
    };
    colorGroup.appendChild(sw);
  });
  toolbar.appendChild(colorGroup);

  // Sizes
  const sizeGroup = document.createElement("div");
  sizeGroup.className = "annot-tool-group";
  ANNOT_SIZES.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "annot-size-btn" + (s === annotState.size ? " active" : "");
    btn.textContent = s;
    btn.onclick = () => {
      annotState.size = s;
      sizeGroup.querySelectorAll(".annot-size-btn").forEach(b => b.classList.toggle("active", +b.textContent === s));
    };
    sizeGroup.appendChild(btn);
  });
  toolbar.appendChild(sizeGroup);

  // Clear
  const clearGroup = document.createElement("div");
  clearGroup.className = "annot-tool-group";
  const clearBtn = document.createElement("button");
  clearBtn.className = "annot-tool";
  clearBtn.dataset.tip = "Barcha chizmalarni tozalash";
  clearBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 7H20M9 7V4H15V7M10 11V17M14 11V17M6 7L7 19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  clearBtn.onclick = async () => {
    const ok = await showConfirm("Ushbu sahifadagi barcha chizmalarni o'chirishni xohlaysizmi?", "Tozalash");
    if (!ok) return;
    annotState.pages.forEach(p => {
      p.ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
    });
    pushHistory();
  };
  clearGroup.appendChild(clearBtn);
  toolbar.appendChild(clearGroup);

  // Zoom controls
  const zoomGroup = document.createElement("div");
  zoomGroup.className = "annot-tool-group annot-zoom-group";
  zoomGroup.innerHTML = `
    <button class="annot-tool" id="annot-zoom-out" data-tip="Kichiklashtirish" title="Kichiklashtirish">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5M8 11H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
    <span class="annot-zoom-label" id="annot-zoom-label">100%</span>
    <button class="annot-tool" id="annot-zoom-in" data-tip="Kattalashtirish" title="Kattalashtirish">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5M11 8V14M8 11H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
    <button class="annot-tool" id="annot-zoom-reset" data-tip="100% ga qaytarish" title="Reset">
      <svg viewBox="0 0 24 24" fill="none"><path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 12L7 9M4 12L7 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;
  toolbar.appendChild(zoomGroup);

  document.getElementById("annot-zoom-in").onclick = () => setAnnotZoom(annotState.scale * 1.25);
  document.getElementById("annot-zoom-out").onclick = () => setAnnotZoom(annotState.scale / 1.25);
  document.getElementById("annot-zoom-reset").onclick = () => setAnnotZoom(1);
}

function setAnnotZoom(scale) {
  scale = Math.max(0.25, Math.min(4, Math.round(scale * 100) / 100));
  annotState.scale = scale;
  const label = document.getElementById("annot-zoom-label");
  if (label) label.textContent = Math.round(scale * 100) + "%";
  annotState.pages.forEach(p => {
    if (!p.el) return;
    if (!p.baseH) {
      p.baseH = p.el.offsetHeight || p.imgH;
    }
    p.el.style.transform = `scale(${scale})`;
    p.el.style.transformOrigin = "top center";
    // Keep flow space so pages don't overlap when zoomed
    const extra = (scale - 1) * p.baseH;
    p.el.style.marginBottom = (extra > 0 ? extra + 16 : 16) + "px";
  });
}

// Live reflow when the window / workspace size changes (desktop ↔ tablet).
let annotResizeObserver = null;
let annotResizeRaf = 0;

function refitAnnotLayout() {
  if (!annotState.open) return;
  const scroll = document.getElementById("annot-scroll");
  if (!scroll) return;
  // Ignore mid-swipe transforms
  if (scroll.style.transform && scroll.style.transform !== "none" && scroll.style.transform !== "") {
    const t = scroll.style.transform;
    if (t.includes("translate") && !t.includes("translate3d(0")) return;
  }

  const pad = 16;
  const availW = Math.max(120, (scroll.clientWidth || window.innerWidth) - pad);
  const availH = Math.max(120, (scroll.clientHeight || (window.innerHeight - 120)) - pad);
  const type = annotState.type;
  const userZoom = annotState.scale || 1;

  if (type === "image" && annotState.pages && annotState.pages[0]) {
    const p = annotState.pages[0];
    if (!p.imgW || !p.imgH || !p.el) return;
    const s = Math.min(availW / p.imgW, availH / p.imgH);
    const w = Math.max(1, Math.round(p.imgW * s));
    const h = Math.max(1, Math.round(p.imgH * s));
    p.el.style.width = w + "px";
    p.el.style.height = h + "px";
    const img = p.el.querySelector("img");
    if (img) {
      img.width = w;
      img.height = h;
      img.style.width = w + "px";
      img.style.height = h + "px";
    }
    if (p.canvas) {
      p.canvas.style.width = w + "px";
      p.canvas.style.height = h + "px";
    }
    p.baseH = h;
    if (userZoom !== 1) {
      setAnnotZoom(userZoom);
    } else {
      p.el.style.transform = "";
      p.el.style.marginBottom = "";
    }
    return;
  }

  if (type === "video") {
    const video = scroll.querySelector("video");
    const page = scroll.querySelector(".annot-page-video");
    if (!video || !page || !video.videoWidth) return;
    const s = Math.min(availW / video.videoWidth, availH / video.videoHeight);
    const w = Math.max(1, Math.round(video.videoWidth * s));
    const h = Math.max(1, Math.round(video.videoHeight * s));
    video.style.width = w + "px";
    video.style.height = h + "px";
    page.style.width = w + "px";
    page.style.height = h + "px";
    return;
  }

  if (type === "pdf" && annotState.pages && annotState.pages.length) {
    annotState.pages.forEach((p) => {
      if (!p.imgW || !p.imgH || !p.el) return;
      // Fit to available width; vertical scroll for tall multi-page docs
      const s = Math.min(1, availW / p.imgW);
      const w = Math.max(1, Math.round(p.imgW * s));
      const h = Math.max(1, Math.round(p.imgH * s));
      p.el.style.width = w + "px";
      p.el.style.height = h + "px";
      const pdfCanvas = p.el.querySelector("canvas.pdf-page");
      if (pdfCanvas) {
        pdfCanvas.style.width = w + "px";
        pdfCanvas.style.height = h + "px";
      }
      if (p.canvas) {
        p.canvas.style.width = w + "px";
        p.canvas.style.height = h + "px";
      }
      p.baseH = h;
    });
    if (userZoom !== 1) setAnnotZoom(userZoom);
    else {
      annotState.pages.forEach((p) => {
        if (!p.el) return;
        p.el.style.transform = "";
        p.el.style.marginBottom = "";
      });
    }
  }
}

function bindAnnotResize() {
  // Idempotent: drop any previous listeners first (openAnnotationViewer can re-run on nav)
  window.removeEventListener("resize", onAnnotWindowResize);
  if (annotResizeObserver) {
    annotResizeObserver.disconnect();
    annotResizeObserver = null;
  }
  const workspace = document.getElementById("annot-workspace");
  if (workspace && typeof ResizeObserver !== "undefined") {
    annotResizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(annotResizeRaf);
      annotResizeRaf = requestAnimationFrame(refitAnnotLayout);
    });
    annotResizeObserver.observe(workspace);
  }
  window.addEventListener("resize", onAnnotWindowResize);
}

function onAnnotWindowResize() {
  if (!annotState.open) return;
  cancelAnimationFrame(annotResizeRaf);
  annotResizeRaf = requestAnimationFrame(refitAnnotLayout);
}

function unbindAnnotResize() {
  if (annotResizeObserver) {
    annotResizeObserver.disconnect();
    annotResizeObserver = null;
  }
  window.removeEventListener("resize", onAnnotWindowResize);
  cancelAnimationFrame(annotResizeRaf);
}


function updateCursor() {
  const scroll = document.getElementById("annot-scroll");
  if (!scroll) return;
  // Crosshair (+) only while drawing (edit mode). Otherwise default arrow.
  let cur = "default";
  if (annotState.editMode) {
    if (annotState.tool === "pan") cur = "grab";
    else if (annotState.tool === "text") cur = "text";
    else cur = "crosshair";
  }
  scroll.style.cursor = cur;
  // Canvas sits on top of the image — set cursor there too
  scroll.querySelectorAll("canvas.annot-layer").forEach((c) => {
    c.style.cursor = cur;
  });
}

async function loadImageForAnnot(url, scroll, loader) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  });

  const page = document.createElement("div");
  page.className = "annot-page";

  // Fit into available workspace (both width AND height), keep aspect ratio.
  // Uses the scroll area size so the image fills the preview like the
  // "Men xohlagan preview" layout — not a small box in the middle.
  const pad = 16;
  const availW = Math.max(120, (scroll.clientWidth || window.innerWidth) - pad);
  const availH = Math.max(120, (scroll.clientHeight || (window.innerHeight - 120)) - pad);
  const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  page.style.width = w + "px";
  page.style.height = h + "px";

  const displayImg = document.createElement("img");
  displayImg.crossOrigin = "anonymous"; // needed so canvas export isn't tainted
  displayImg.src = url;
  displayImg.width = w;
  displayImg.height = h;
  displayImg.draggable = false;
  page.appendChild(displayImg);

  const canvas = document.createElement("canvas");
  canvas.className = "annot-layer";
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  page.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  annotState.pages = [{ canvas, ctx, imgW: img.naturalWidth, imgH: img.naturalHeight, el: page }];

  scroll.innerHTML = "";
  scroll.appendChild(page);
  finishImageOpenZoom(page);
  attachDrawingHandlers(canvas, 0);
  updateCursor();
  pushHistory();
}

async function loadPdfForAnnot(url, scroll, loader) {
  if (!window.pdfjsLib) {
    loader.innerHTML = `<span style="color:#64748b">PDF.js failed to load</span>`;
    return;
  }
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const pages = [];
  scroll.innerHTML = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvasPdf = document.createElement("canvas");
    canvasPdf.className = "pdf-page";
    canvasPdf.width = viewport.width;
    canvasPdf.height = viewport.height;
    const ctxPdf = canvasPdf.getContext("2d");
    await page.render({ canvasContext: ctxPdf, viewport }).promise;

    const wrap = document.createElement("div");
    wrap.className = "annot-page";
    wrap.style.width = viewport.width + "px";
    wrap.appendChild(canvasPdf);

    const annotCanvas = document.createElement("canvas");
    annotCanvas.className = "annot-layer";
    annotCanvas.width = viewport.width;
    annotCanvas.height = viewport.height;
    annotCanvas.style.width = viewport.width + "px";
    annotCanvas.style.height = viewport.height + "px";
    wrap.appendChild(annotCanvas);

    const ctx = annotCanvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    pages.push({ canvas: annotCanvas, ctx, imgW: viewport.width, imgH: viewport.height, el: wrap, pageNum: i });
    scroll.appendChild(wrap);
    attachDrawingHandlers(annotCanvas, pages.length - 1);
  }
  annotState.pages = pages;
  updateCursor();
  pushHistory();
}

function formatAudioClock(s) {
  if (!s || !isFinite(s) || s < 0) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function audioDisplayName(filename) {
  return String(filename || "Audio").replace(/\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|weba)$/i, "");
}

const MR_AUDIO_ICONS = {
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>',
  loop: '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>',
  share: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>'
};

function svgIcon(path, cls) {
  return `<svg class="${cls || "mr-audio-svg"}" viewBox="0 0 24 24">${path}</svg>`;
}

let mrAudioCtx = null;

function mountMrAudioPlayer(host, opts) {
  if (window.__mrAudioDestroy) {
    try { window.__mrAudioDestroy(); } catch (_) {}
  }
  const filename = opts.filename || "Audio";
  const sizeLabel = typeof opts.size === "number" ? formatSize(opts.size) : (opts.size || "");
  host.innerHTML = "";
  const root = document.createElement("div");
  root.className = "mr-audio-player";
  root.innerHTML = `
    <div class="mr-audio-card-meta">
      <h4 class="mr-audio-title"></h4>
      <p class="mr-audio-sub"></p>
    </div>
    <div class="mr-audio-wave" aria-hidden="true">
      <canvas class="mr-audio-wave-canvas"></canvas>
    </div>
    <div class="mr-audio-time">00:00 / 00:00</div>
    <div class="mr-audio-progress" role="slider" aria-label="Progress">
      <div class="mr-audio-progress-fill"></div>
    </div>
    <div class="mr-audio-controls">
      <button type="button" class="mr-audio-btn mr-audio-play" data-act="play" title="Play">${svgIcon(MR_AUDIO_ICONS.play)}</button>
    </div>
  `;
  root.querySelector(".mr-audio-title").textContent = audioDisplayName(filename);
  root.querySelector(".mr-audio-sub").textContent = sizeLabel;
  host.appendChild(root);

  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.playsInline = true;
  audio.crossOrigin = "anonymous";
  audio.src = opts.url;
  audio.style.display = "none";
  root.appendChild(audio);

  const waveWrap = root.querySelector(".mr-audio-wave");
  const canvas = root.querySelector(".mr-audio-wave-canvas");
  const ctx = canvas.getContext("2d");
  const fill = root.querySelector(".mr-audio-progress-fill");
  const timeEl = root.querySelector(".mr-audio-time");
  const playBtn = root.querySelector('[data-act="play"]');
  const pbox = root.querySelector(".mr-audio-progress");
  const subEl = root.querySelector(".mr-audio-sub");

  let analyser = null;
  let freqData = null;
  let sourceNode = null;
  let raf = 0;
  let dragging = false;
  let wiredGraph = false;
  let lastSec = -1;
  let alive = true;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas() {
    const w = waveWrap.clientWidth || 400;
    const h = 120;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  const setIcon = (html) => { playBtn.innerHTML = svgIcon(html); };
  const setTime = () => {
    const t = formatAudioClock(audio.currentTime);
    const d = formatAudioClock(audio.duration);
    const label = t + " / " + d;
    if (timeEl.textContent !== label) timeEl.textContent = label;
  };

  function showSpin(on) {
    const old = playBtn.querySelector(".mr-audio-spin");
    if (old) old.remove();
    playBtn.querySelector(".mr-audio-svg")?.style && (playBtn.querySelector(".mr-audio-svg").style.display = on ? "none" : "");
    if (on) {
      const s = document.createElement("div");
      s.className = "mr-audio-spin";
      playBtn.appendChild(s);
    }
  }

  /* Optimized silk wave — dense look, 60fps, no freeze */
  const BIN_N = 128;
  let smoothBins = new Float32Array(BIN_N).fill(0.2);
  let smoothEnergy = 0.25;
  const SMOOTH = 0.14;

  function envelope(nx) {
    // diamond skeleton: sharp pointed ends, full body in center
    // edges keep a small floor so they still react, but shape is restored
    const s = Math.sin(Math.PI * nx);
    return 0.08 + 0.92 * Math.pow(s, 1.55);
  }

  function sampleFreq(nx) {
    if (!analyser || !freqData) return 0.25;
    const n = freqData.length;
    // spread bins across full width so left/right edges also get strong signal
    const b1 = Math.min(n - 1, (nx * n * 0.85) | 0);
    const b2 = Math.min(n - 1, ((0.15 + nx * 0.7) * n) | 0);
    const b3 = Math.min(n - 1, (Math.abs(nx - 0.5) * 2 * n * 0.4) | 0);
    const raw = (freqData[b1] * 0.45 + freqData[b2] * 0.35 + freqData[b3] * 0.2) / 255;
    return Math.min(1.25, Math.pow(raw, 0.5) * 2.0);
  }

  function updateSmooth(idle) {
    if (analyser && freqData && !idle) analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < BIN_N; i++) {
      const nx = i / (BIN_N - 1);
      const target = idle
        ? 0.18 + 0.07 * Math.sin(nx * Math.PI * 2 + performance.now() / 1800)
        : sampleFreq(nx);
      smoothBins[i] += (target - smoothBins[i]) * SMOOTH;
    }
  }

  function binAt(nx) {
    const bi = nx * (BIN_N - 1);
    const b0 = bi | 0;
    const b1 = Math.min(BIN_N - 1, b0 + 1);
    return smoothBins[b0] + (smoothBins[b1] - smoothBins[b0]) * (bi - b0);
  }

  // 48 well-chosen threads (looks dense, runs smooth)
  const THREADS = [];
  (function build() {
    // 8 bright core
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      THREADS.push({ amp: 0.5 + t * 0.15, speed: 0.3 + t * 0.2, freq: 2 + t, phase: t * 5, thick: 1.2 + t * 0.4, r: 240, g: 248, b: 255, a: 0.5 - t * 0.15, kind: 0 });
    }
    // 16 cyan silk
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      THREADS.push({ amp: 0.6 + (i % 4) * 0.06, speed: 0.4 + t * 0.35, freq: 2.2 + t * 1.5, phase: t * 8 + 1, thick: 1.4 + (i % 3) * 0.3, r: 70 + (i % 5) * 15, g: 160 + (i % 4) * 12, b: 250, a: 0.28 - t * 0.08, kind: 1 });
    }
    // 12 royal membranes
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      THREADS.push({ amp: 0.8 + (i % 3) * 0.05, speed: 0.32 + t * 0.25, freq: 1.6 + t * 1.2, phase: t * 6 + 3, thick: 2.5 + (i % 3) * 0.5, r: 30 + (i % 4) * 12, g: 80 + (i % 3) * 15, b: 210, a: 0.16 - t * 0.04, kind: 2 });
    }
    // 12 fine filaments
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      THREADS.push({ amp: 0.35 + (i % 4) * 0.06, speed: 0.55 + t * 0.4, freq: 3.5 + t * 2, phase: t * 10 + 5, thick: 0.6, r: 140, g: 200, b: 255, a: 0.12, kind: 3 });
    }
  })();

  // Pre-allocated typed buffers — zero GC per frame
  const STEPS = 80;
  const xs = new Float32Array(STEPS + 1);
  const ys = new Float32Array(STEPS + 1);
  const yTop = new Float32Array(STEPS + 1);
  const yBot = new Float32Array(STEPS + 1);

  function strokeFromBuf(n, width, color) {
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (let i = 1; i < n - 1; i++) {
      ctx.quadraticCurveTo(xs[i], ys[i], (xs[i] + xs[i + 1]) * 0.5, (ys[i] + ys[i + 1]) * 0.5);
    }
    ctx.lineTo(xs[n - 1], ys[n - 1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function fillFromBuf(n, c0, c1) {
    ctx.beginPath();
    ctx.moveTo(xs[0], yTop[0]);
    for (let i = 1; i < n - 1; i++)
      ctx.quadraticCurveTo(xs[i], yTop[i], (xs[i] + xs[i + 1]) * 0.5, (yTop[i] + yTop[i + 1]) * 0.5);
    ctx.lineTo(xs[n - 1], yTop[n - 1]);
    ctx.lineTo(xs[n - 1], yBot[n - 1]);
    for (let i = n - 2; i > 0; i--)
      ctx.quadraticCurveTo(xs[i], yBot[i], (xs[i] + xs[i - 1]) * 0.5, (yBot[i] + yBot[i - 1]) * 0.5);
    ctx.lineTo(xs[0], yBot[0]);
    ctx.closePath();
    const mid = (yTop[n >> 1] + yBot[n >> 1]) * 0.5;
    const g = ctx.createLinearGradient(0, mid - 40, 0, mid + 40);
    g.addColorStop(0, c0);
    g.addColorStop(0.5, c1);
    g.addColorStop(1, c0);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawFluidWave(energy, idle) {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    if (w < 4 || h < 4) return;
    ctx.clearRect(0, 0, w, h);
    updateSmooth(idle);

    const targetE = energy < 0.12 ? 0.12 : (energy > 1.35 ? 1.35 : energy);
    smoothEnergy += (targetE - smoothEnergy) * SMOOTH;
    const e = smoothEnergy;

    const t = idle ? performance.now() * 0.00038 : (audio.currentTime || 0);
    const midY = h * 0.5;
    const n = STEPS;

    // precompute x + envelope + freq once per frame
    const envs = new Float32Array(n + 1);
    const fms = new Float32Array(n + 1);
    for (let i = 0; i <= n; i++) {
      const nx = i / n;
      xs[i] = nx * w;
      envs[i] = envelope(nx);
      fms[i] = 0.25 + binAt(nx) * 1.55;
    }

    ctx.save();

    // membranes
    for (let L = 0; L < THREADS.length; L++) {
      const th = THREADS[L];
      if (th.kind !== 2) continue;
      const phase = t * th.speed + th.phase;
      for (let i = 0; i <= n; i++) {
        const nx = i / n;
        const wave =
          Math.sin(nx * Math.PI * th.freq + phase) * 0.5 +
          Math.sin(nx * Math.PI * th.freq * 1.5 + phase * 1.1) * 0.28 +
          Math.sin(nx * Math.PI * th.freq * 0.5 + phase * 0.7) * 0.14;
        const amp = h * 0.48 * th.amp * envs[i] * fms[i] * e;
        const y = midY + wave * amp;
        const half = h * 0.065 * th.thick * envs[i] * (0.5 + fms[i] * 0.5) * e;
        yTop[i] = y - half;
        yBot[i] = y + half;
      }
      const a = th.a * (0.65 + e * 0.4);
      fillFromBuf(n + 1,
        "rgba(" + th.r + "," + th.g + "," + th.b + "," + (a * 0.1).toFixed(3) + ")",
        "rgba(" + th.r + "," + th.g + "," + th.b + "," + a.toFixed(3) + ")"
      );
    }

    // stroke threads
    for (let L = 0; L < THREADS.length; L++) {
      const th = THREADS[L];
      if (th.kind === 2) continue;
      const phase = t * th.speed + th.phase;
      for (let i = 0; i <= n; i++) {
        const nx = i / n;
        const wave =
          Math.sin(nx * Math.PI * th.freq + phase) * 0.5 +
          Math.sin(nx * Math.PI * th.freq * 1.6 + phase * 1.15) * 0.27 +
          Math.sin(nx * Math.PI * th.freq * 0.5 + phase * 0.65) * 0.14;
        const amp = h * 0.52 * th.amp * envs[i] * fms[i] * e;
        ys[i] = midY + wave * amp;
      }
      const a = th.a * (0.7 + e * 0.35);
      strokeFromBuf(n + 1, th.thick * (0.65 + e * 0.45),
        "rgba(" + th.r + "," + th.g + "," + th.b + "," + a.toFixed(3) + ")"
      );
    }

    ctx.restore();
  }

  function resetWave() {
    sizeCanvas();
    for (let i = 0; i < BIN_N; i++) smoothBins[i] = 0.2;
    smoothEnergy = 0.25;
    drawFluidWave(0.25, true);
  }

  function draw() {
    if (!alive) return;
    raf = requestAnimationFrame(draw);
    if (audio.paused && !dragging) {
      drawFluidWave(0.22 + 0.05 * Math.sin(performance.now() / 1400), true);
      return;
    }
    let energy = 0.5;
    if (analyser && freqData) {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      const lim = Math.min(freqData.length, 48);
      for (let i = 0; i < lim; i++) sum += freqData[i];
      energy = 0.15 + Math.pow(sum / (lim * 255), 0.5) * 2.1;
    } else {
      energy = 0.38 + 0.22 * Math.abs(Math.sin((audio.currentTime || 0) * 1.8));
    }
    drawFluidWave(energy, false);
    if (!dragging && audio.duration) fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    const sec = Math.floor(audio.currentTime || 0);
    if (sec !== lastSec) { lastSec = sec; setTime(); }
  }

  async function ensureGraph() {
    if (wiredGraph) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!mrAudioCtx) mrAudioCtx = new AC();
      if (mrAudioCtx.state === "suspended") await mrAudioCtx.resume();
      sourceNode = mrAudioCtx.createMediaElementSource(audio);
      analyser = mrAudioCtx.createAnalyser();
      analyser.fftSize = 128;
      sourceNode.connect(analyser);
      analyser.connect(mrAudioCtx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      wiredGraph = true;
    } catch (_) {
      analyser = null;
      wiredGraph = true;
    }
  }

  async function togglePlay() {
    if (!audio.src) return;
    if (!audio.paused) {
      audio.pause();
      setIcon(MR_AUDIO_ICONS.play);
      return;
    }
    showSpin(true);
    try {
      await ensureGraph();
      if (mrAudioCtx && mrAudioCtx.state === "suspended") await mrAudioCtx.resume();
      await audio.play();
      setIcon(MR_AUDIO_ICONS.pause);
      draw();
    } catch (err) {
      console.error(err);
      if (typeof opts.onError === "function") opts.onError(err);
    } finally {
      showSpin(false);
    }
  }

  function seekFromEvent(e) {
    if (!audio.duration) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = pbox.getBoundingClientRect();
    let p = (clientX - rect.left) / rect.width;
    p = Math.max(0, Math.min(1, p));
    fill.style.width = (p * 100) + "%";
    audio.currentTime = p * audio.duration;
    setTime();
  }

  playBtn.addEventListener("click", togglePlay);
  const onMove = (ev) => { dragging = true; seekFromEvent(ev); };
  const onStop = () => {
    dragging = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
  };
  pbox.addEventListener("mousedown", (e) => {
    seekFromEvent(e);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onStop, { once: true });
  });
  pbox.addEventListener("touchstart", (e) => {
    seekFromEvent(e);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onStop, { once: true });
  }, { passive: true });

  audio.addEventListener("loadedmetadata", () => {
    setTime();
    if (sizeLabel) subEl.textContent = sizeLabel;
    if (typeof opts.onReady === "function") opts.onReady();
  });
  audio.addEventListener("play", () => { setIcon(MR_AUDIO_ICONS.pause); draw(); });
  audio.addEventListener("pause", () => { if (!audio.ended) setIcon(MR_AUDIO_ICONS.play); });
  audio.addEventListener("ended", () => {
    if (audio.loop) return;
    setIcon(MR_AUDIO_ICONS.play);
    fill.style.width = "0%";
    resetWave();
    setTime();
  });
  audio.addEventListener("error", () => {
    showSpin(false);
    if (typeof opts.onError === "function") opts.onError();
  });
  if (audio.readyState >= 1 && typeof opts.onReady === "function") opts.onReady();

  // start gentle idle wave immediately
  resetWave();
  raf = requestAnimationFrame(draw);

  const destroy = () => {
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", sizeCanvas);
    try { audio.pause(); } catch (_) {}
    audio.removeAttribute("src");
    try { audio.load(); } catch (_) {}
    if (window.__mrAudioDestroy === destroy) window.__mrAudioDestroy = null;
  };
  window.__mrAudioDestroy = destroy;
  return { destroy, audio };
}

async function loadAudioForAnnot(url, scroll, file) {
  const page = document.createElement("div");
  page.className = "annot-page annot-page-audio";
  annotState.pages = [];
  scroll.innerHTML = "";
  scroll.appendChild(page);
  mountMrAudioPlayer(page, {
    url,
    filename: file && file.filename,
    size: file && file.size
  });
}

async function loadVideoForAnnot(url, scroll) {
  const page = document.createElement("div");
  page.className = "annot-page annot-page-video";
  const video = document.createElement("video");
  video.src = url;
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";

  const fitVideo = () => {
    const pad = 16;
    const availW = Math.max(120, (scroll.clientWidth || window.innerWidth) - pad);
    const availH = Math.max(120, (scroll.clientHeight || (window.innerHeight - 120)) - pad);
    const vw = video.videoWidth || 16;
    const vh = video.videoHeight || 9;
    const scale = Math.min(availW / vw, availH / vh);
    const w = Math.max(1, Math.round(vw * scale));
    const h = Math.max(1, Math.round(vh * scale));
    video.style.width = w + "px";
    video.style.height = h + "px";
    page.style.width = w + "px";
    page.style.height = h + "px";
  };
  video.addEventListener("loadedmetadata", fitVideo);
  // In case metadata is already available
  if (video.readyState >= 1) fitVideo();

  page.appendChild(video);
  annotState.pages = [];
  scroll.innerHTML = "";
  scroll.appendChild(page);
}

async function loadCodeForAnnot(url, scroll, loader, filename) {
  const res = await fetch(url);
  const text = await res.text();
  const extLower = (filename.split(".").pop() || "").toLowerCase();
  const ext = extLower.toUpperCase();
  const lines = text.split("\n").length;
  const tooBig = text.length > CODE_HIGHLIGHT_MAX_CHARS;

  const wrap = document.createElement("div");
  wrap.className = "annot-code-wrap";
  const header = document.createElement("div");
  header.className = "code-header";
  header.innerHTML = `
    <span class="code-header-name">${escapeHtml(filename)}</span>
    <span class="code-header-meta">
      <span class="code-lang-badge">${escapeHtml(ext)}</span>
      <span class="code-lines">${lines} qator</span>
      ${tooBig ? '<span class="code-lines">rang o\'chirilgan · katta fayl</span>' : ""}
    </span>
  `;
  const pre = document.createElement("pre");
  const codeEl = document.createElement("code");
  const lang = CODE_LANG_MAP[extLower];
  if (lang) codeEl.className = "language-" + lang;
  codeEl.textContent = text;
  pre.appendChild(codeEl);
  wrap.appendChild(header);
  wrap.appendChild(pre);
  scroll.innerHTML = "";
  scroll.appendChild(wrap);

  // Paint the plain text first, then color it on the next frame — the file
  // is readable immediately either way, and highlighting never blocks the
  // initial render. Skipped entirely for very large files.
  if (!tooBig && window.hljs) {
    requestAnimationFrame(() => {
      try { hljs.highlightElement(codeEl); } catch (e) { /* leave plain on failure */ }
    });
  }
}

function attachDrawingHandlers(canvas, pageIdx) {
  // Pointer events (unified mouse + touch)
  canvas.addEventListener("pointerdown", (e) => onPointerDown(e, pageIdx));
  canvas.addEventListener("pointermove", (e) => onPointerMove(e, pageIdx));
  canvas.addEventListener("pointerup", (e) => onPointerUp(e, pageIdx));
  canvas.addEventListener("pointercancel", (e) => onPointerUp(e, pageIdx));
  canvas.addEventListener("pointerleave", (e) => {
    if (annotState.drawing) onPointerUp(e, pageIdx);
  });

  // Prevent default touch gestures that steal the canvas
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && annotState.tool !== "pan") {
      // allow drawing
    } else if (e.touches.length >= 2) {
      e.preventDefault();
    }
  }, { passive: false });
}

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

async function onPointerDown(e, pageIdx) {
  if (!annotState.open) return;
  const canvas = annotState.pages[pageIdx].canvas;
  canvas.setPointerCapture(e.pointerId);
  annotState.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });

  // 2+ fingers → pan mode (allowed even before Edit is tapped, so people can
  // still pinch-zoom/pan while just previewing).
  if (annotState.touches.size >= 2 || annotState.tool === "pan") {
    annotState.isPanning = true;
    annotState.drawing = false;
    const scroll = document.getElementById("annot-scroll");
    annotState.panStart = {
      scrollLeft: scroll.scrollLeft,
      scrollTop: scroll.scrollTop,
      x: e.clientX,
      y: e.clientY
    };
    return;
  }

  // Not in edit mode yet: single-finger/mouse taps just do nothing (no
  // accidental doodles) until the user taps the Edit (pencil) button.
  if (!annotState.editMode) {
    annotState.drawing = false;
    return;
  }

  if (annotState.tool === "text") {
    const pos = getPos(e, canvas);
    const text = await showPrompt("Matn kiriting", { okLabel: "Qo'shish", placeholder: "Matn..." });
    if (text != null && String(text).length) {
      const ctx = annotState.pages[pageIdx].ctx;
      ctx.fillStyle = annotState.color;
      ctx.font = `${Math.max(14, annotState.size * 4)}px sans-serif`;
      ctx.fillText(String(text), pos.x, pos.y);
      pushHistory();
    }
    return;
  }

  annotState.drawing = true;
  const pos = getPos(e, canvas);
  annotState.lastX = pos.x;
  annotState.lastY = pos.y;
  annotState.startX = pos.x;
  annotState.startY = pos.y;

  const ctx = annotState.pages[pageIdx].ctx;
  if (annotState.tool === "pen" || annotState.tool === "highlighter") {
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }
}

function onPointerMove(e, pageIdx) {
  if (!annotState.open) return;
  annotState.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (annotState.isPanning || annotState.touches.size >= 2) {
    const scroll = document.getElementById("annot-scroll");
    if (annotState.panStart) {
      const dx = e.clientX - annotState.panStart.x;
      const dy = e.clientY - annotState.panStart.y;
      scroll.scrollLeft = annotState.panStart.scrollLeft - dx;
      scroll.scrollTop = annotState.panStart.scrollTop - dy;
    }
    return;
  }

  if (!annotState.drawing) return;
  const canvas = annotState.pages[pageIdx].canvas;
  const ctx = annotState.pages[pageIdx].ctx;
  const pos = getPos(e, canvas);

  if (annotState.tool === "pen") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = annotState.color;
    ctx.lineWidth = annotState.size;
    ctx.globalAlpha = 1;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  } else if (annotState.tool === "highlighter") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = annotState.color;
    ctx.lineWidth = annotState.size * 3;
    ctx.globalAlpha = 0.3;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  } else if (annotState.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = annotState.size * 4;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  } else if (["rect", "circle", "arrow"].includes(annotState.tool)) {
    // Preview: restore last history snapshot then draw shape
    restoreHistorySnapshot();
    drawShapePreview(ctx, annotState.tool, annotState.startX, annotState.startY, pos.x, pos.y);
  }

  annotState.lastX = pos.x;
  annotState.lastY = pos.y;
}

function onPointerUp(e, pageIdx) {
  annotState.touches.delete(e.pointerId);
  if (annotState.touches.size < 2) {
    annotState.isPanning = false;
    annotState.panStart = null;
  }

  if (!annotState.drawing) return;
  annotState.drawing = false;

  const ctx = annotState.pages[pageIdx].ctx;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  if (["rect", "circle", "arrow"].includes(annotState.tool)) {
    const pos = getPos(e, annotState.pages[pageIdx].canvas);
    restoreHistorySnapshot();
    drawShapePreview(ctx, annotState.tool, annotState.startX, annotState.startY, pos.x, pos.y);
  }

  pushHistory();
}

function drawShapePreview(ctx, tool, x1, y1, x2, y2) {
  ctx.strokeStyle = annotState.color;
  ctx.lineWidth = annotState.size;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  if (tool === "rect") {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (tool === "circle") {
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tool === "arrow") {
    const headLen = 12 + annotState.size;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
}

function pushHistory() {
  // Snapshot all pages
  const snaps = annotState.pages.map(p => p.canvas.toDataURL("image/png"));
  // Truncate future
  annotState.history = annotState.history.slice(0, annotState.historyIdx + 1);
  annotState.history.push(snaps);
  annotState.historyIdx = annotState.history.length - 1;
  // Limit history size
  if (annotState.history.length > 30) {
    annotState.history.shift();
    annotState.historyIdx--;
  }
}

function restoreHistorySnapshot() {
  if (annotState.historyIdx < 0) return;
  const snaps = annotState.history[annotState.historyIdx];
  snaps.forEach((dataUrl, i) => {
    if (!annotState.pages[i]) return;
    const img = new Image();
    img.onload = () => {
      const p = annotState.pages[i];
      p.ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
      p.ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  });
}

function annotUndo() {
  if (annotState.historyIdx <= 0) return;
  annotState.historyIdx--;
  restoreHistorySnapshot();
}

function annotRedo() {
  if (annotState.historyIdx >= annotState.history.length - 1) return;
  annotState.historyIdx++;
  restoreHistorySnapshot();
}

async function saveAnnotated() {
  if (annotState.type === "code" || annotState.type === "video") {
    showToast("Bu fayl faqat o'qish uchun", "error");
    return;
  }
  if (!annotState.pages.length) return;

  const saveBtn = document.getElementById("annot-save");
  if (saveBtn && saveBtn.disabled) return; // prevent double-tap

  const ICON_SAVE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 18H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const ICON_SAVE_SPIN = `<svg class="annot-save-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="2.4"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;

  // Instant visual feedback on the button — no intermediate toast
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = ICON_SAVE_SPIN;
    saveBtn.title = "Tayyorlanmoqda…";
  }

  try {
    const originalName = annotState.file.filename || "annotated";

    if (annotState.type === "image") {
      const p = annotState.pages[0];
      const off = document.createElement("canvas");
      off.width = p.imgW;
      off.height = p.imgH;
      const octx = off.getContext("2d");
      const imgEl = p.el.querySelector("img");
      octx.drawImage(imgEl, 0, 0, p.imgW, p.imgH);
      octx.drawImage(p.canvas, 0, 0);

      const blob = await new Promise((resolve, reject) => {
        try {
          off.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))), "image/png");
        } catch (e) {
          reject(e);
        }
      });

      downloadFileLocally(new File([blob], originalName, { type: "image/png" }));
    } else if (annotState.type === "pdf") {
      if (!window.PDFLib) {
        throw new Error("PDF kutubxonasi yuklanmadi");
      }
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < annotState.pages.length; i++) {
        const p = annotState.pages[i];
        const off = document.createElement("canvas");
        off.width = p.imgW;
        off.height = p.imgH;
        const octx = off.getContext("2d");
        const pdfCanvas = p.el.querySelector("canvas.pdf-page");
        octx.drawImage(pdfCanvas, 0, 0);
        octx.drawImage(p.canvas, 0, 0);

        const dataUrl = off.toDataURL("image/png");
        const pngBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.addPage([p.imgW, p.imgH]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: p.imgW,
          height: p.imgH
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      downloadFileLocally(new File([blob], originalName, { type: "application/pdf" }));
    } else {
      return;
    }

    // Instant close — 0ms delay
    if (saveBtn) {
      saveBtn.innerHTML = ICON_CHECK;
      saveBtn.title = "Tayyor";
    }
    showToast('"' + originalName + '" yuklab olindi');
    closeAnnotationViewer();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Yuklab olish muvaffaqiyatsiz", "error");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = ICON_SAVE;
      saveBtn.title = "Yuklab olish";
    }
  }
}

// Triggers a browser download of the given File/Blob to the user's local
// machine instead of uploading it anywhere.
function downloadFileLocally(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toggleAnnotFullscreen() {
  const viewer = document.getElementById("annot-viewer");
  if (!document.fullscreenElement) {
    viewer.requestFullscreen().catch(() => {});
    viewer.classList.add("is-fullscreen");
  } else {
    document.exitFullscreen().catch(() => {});
    viewer.classList.remove("is-fullscreen");
  }
}

// NOTE: do NOT force renderFiles() after every loadFiles().
// Silent polling runs every 2s; re-rendering the whole list each time
// destroys :hover on file cards (actions flicker open/closed).
// View buttons are already injected by the patched renderFiles() whenever
// a real data change triggers a render.

// ==========================================
// KEYBOARD SHORTCUTS (computer) — the touch equivalents are the selection bar
// (updateSelectionBar), the viewer's prev/next buttons and the 0.5 s hold.
// Press ? to see the full list.
// ==========================================
let kbBusy = false;

function kbAppActive() {
  return !shareToken && !splashActive() && appScreen && appScreen.style.display !== "none";
}

function kbIsTyping(t) {
  if (!t || !t.tagName) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") return !/^(checkbox|radio|button|submit|reset|file)$/i.test(t.type);
  return false;
}

function kbIsInteractive(t) {
  return !!(t && t.closest && t.closest("button, a, summary, [role='button']"));
}

function kbOrder() {
  return Array.from(fileListEl.querySelectorAll(".file-card")).map((c) => c.dataset.fileId).filter(Boolean);
}

function paintKbCursor() {
  fileListEl.querySelectorAll(".file-card").forEach((c) => {
    c.classList.toggle("kb-focus", c.dataset.fileId === kbCursorId);
  });
}

function kbSetCursor(id, noScroll) {
  kbCursorId = id == null ? null : String(id);
  paintKbCursor();
  if (kbCursorId && !noScroll) {
    const c = fileListEl.querySelector(`.file-card[data-file-id="${kbCursorId}"]`);
    if (c) c.scrollIntoView({ block: "nearest" });
  }
}

// target: +1 / -1 / "first" / "last". extend = Shift (grow the range),
// cursorOnly = Alt (move the highlight without touching the selection).
function kbMove(target, extend, cursorOnly) {
  const order = kbOrder();
  if (!order.length) return;
  let i = kbCursorId ? order.indexOf(kbCursorId) : -1;
  if (i === -1 && lastClickedFileId != null) i = order.indexOf(String(lastClickedFileId));
  let next;
  if (target === "first") next = 0;
  else if (target === "last") next = order.length - 1;
  else if (i === -1) next = target > 0 ? 0 : order.length - 1;
  else next = Math.max(0, Math.min(order.length - 1, i + target));
  const id = order[next];

  if (cursorOnly) { kbSetCursor(id); return; }
  if (extend) {
    const anchor = lastClickedFileId != null && order.includes(String(lastClickedFileId))
      ? String(lastClickedFileId)
      : (i !== -1 ? order[i] : id);
    lastClickedFileId = anchor;
    selectedFileIds = new Set();
    selectRange(anchor, id);
  } else {
    selectedFileIds = new Set([id]);
    lastClickedFileId = id;
  }
  kbSetCursor(id);
  updateSelectionClasses();
}

function kbToggleCursor() {
  const order = kbOrder();
  if (!order.length) return;
  let id = kbCursorId && order.includes(kbCursorId) ? kbCursorId : null;
  if (!id && lastClickedFileId != null && order.includes(String(lastClickedFileId))) id = String(lastClickedFileId);
  if (!id) id = order[0];
  if (selectedFileIds.has(id)) selectedFileIds.delete(id); else selectedFileIds.add(id);
  lastClickedFileId = id;
  kbSetCursor(id);
  updateSelectionClasses();
}

// What D / M / L act on: the selection, or the highlighted file if nothing is selected.
function kbTargets() {
  if (selectedFileIds.size) return Array.from(selectedFileIds);
  return kbCursorId ? [kbCursorId] : [];
}

function kbSelectAll(toggle) {
  const ids = getFilteredFiles().map((f) => String(f.id));
  if (!ids.length) return;
  if (toggle && ids.every((id) => selectedFileIds.has(id))) {
    selectedFileIds = new Set();
  } else {
    selectedFileIds = new Set(ids);
    showToast(`${ids.length} ta fayl tanlandi`);
  }
  updateSelectionClasses();
}

function kbInvert() {
  const ids = getFilteredFiles().map((f) => String(f.id));
  selectedFileIds = new Set(ids.filter((id) => !selectedFileIds.has(id)));
  updateSelectionClasses();
}

function kbClear() {
  selectedFileIds = new Set();
  kbSetCursor(null, true);
  updateSelectionClasses();
}

// Delete key / bar button. Only the SELECTION is deleted (never a mere highlight).
function kbDelete(opts) {
  const ids = Array.from(selectedFileIds);
  if (!ids.length || kbBusy) return;
  kbBusy = true;
  let x = opts && opts.x, y = opts && opts.y;
  if (x == null) {
    const card = fileListEl.querySelector(`.file-card[data-file-id="${ids[0]}"]`);
    if (card) { const r = card.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  }
  deleteSelectedFiles(ids, x, y, { viaKeyboard: !!(opts && opts.viaKeyboard) })
    .catch((err) => showAlert("Xato: " + (err && err.message || err)))
    .finally(() => { kbBusy = false; });
}

async function kbDownload() {
  const ids = kbTargets();
  if (!ids.length) { showToast("Avval fayl tanlang", "warning"); return; }
  showToast(ids.length === 1 ? "Yuklab olinmoqda…" : `${ids.length} ta fayl tayyorlanmoqda…`);
  await downloadSelectedZip(ids);
}

function kbMoveToFolder() {
  const ids = kbTargets();
  if (!ids.length) { showToast("Avval fayl tanlang", "warning"); return; }
  showFolderPicker(ids);
}

function kbLink() {
  const ids = kbTargets();
  const f = ids.length === 1 ? allFiles.find((x) => String(x.id) === String(ids[0])) : null;
  if (!f) { showToast("Havola uchun bitta fayl tanlang", "warning"); return; }
  const live = f.is_public && f.public_token && !(f.expires_at && new Date(f.expires_at) < new Date());
  if (live) copyPublicLink(f.id); else createPublicLink(f.id);
}

function kbOpen() {
  let id = kbCursorId;
  if (!id && selectedFileIds.size === 1) id = Array.from(selectedFileIds)[0];
  const f = id && allFiles.find((x) => String(x.id) === String(id));
  if (!f) return;
  const kind = isViewable(f.filename);
  if (kind) openAnnotationViewer(f, kind);
  else downloadFile(f.id, f.storage_path, f.filename);
}

function kbFolder(n) {
  if (n === 0) { setFolder(null); return; }
  const f = allFolders[n - 1];
  if (f) setFolder(f.name);
}

function kbFocusSearch() {
  const s = document.getElementById("search-input");
  if (s) { s.focus(); s.select(); }
}

// ---- file list keys ----
function kbListKey(e, mod, typing) {
  const k = e.key;

  if (typing) {
    if (!(e.target && e.target.id === "search-input")) return;
    if (k === "Escape") {
      e.preventDefault();
      if (e.target.value) { e.target.value = ""; currentSearch = ""; renderFiles(); }
      else e.target.blur();
    } else if (k === "ArrowDown" || k === "Enter") {
      e.preventDefault();
      e.target.blur();
      kbMove("first", false, true);
    }
    return;
  }

  if (mod) {
    if (e.altKey) return;
    const c = k.toLowerCase();
    if (c === "a") { if (getFilteredFiles().length) { e.preventDefault(); kbSelectAll(false); } }
    else if (c === "k") { e.preventDefault(); kbFocusSearch(); }
    else if (k === "Backspace" && selectedFileIds.size) { e.preventDefault(); if (!e.repeat) kbDelete({ viaKeyboard: true }); }
    return;
  }

  if (k === "Delete") {
    if (!selectedFileIds.size) return;
    e.preventDefault();
    if (!e.repeat) kbDelete({ viaKeyboard: true });
    return;
  }

  if (k === "ArrowDown" || k === "ArrowUp") {
    e.preventDefault();
    kbMove(k === "ArrowDown" ? 1 : -1, e.shiftKey, e.altKey);
    return;
  }
  if (k === "Home" || k === "End") {
    e.preventDefault();
    kbMove(k === "Home" ? "first" : "last", e.shiftKey, e.altKey);
    return;
  }
  if (e.altKey) return;

  if (k === "Escape") {
    const settings = document.getElementById("settings-modal");
    if (settings && !settings.hidden) return;
    if (selectedFileIds.size || kbCursorId) kbClear();
    return;
  }
  if (k === " " || k === "Spacebar") {
    if (kbIsInteractive(e.target)) return;
    e.preventDefault();
    kbToggleCursor();
    return;
  }
  if (k === "Enter") {
    if (kbIsInteractive(e.target)) return;
    if (kbCursorId || selectedFileIds.size === 1) { e.preventDefault(); kbOpen(); }
    return;
  }

  const c = k.length === 1 ? k.toLowerCase() : k;
  if (/^[0-9]$/.test(c)) { kbFolder(Number(c)); return; }
  switch (c) {
    case "d": kbDownload(); break;
    case "m": kbMoveToFolder(); break;
    case "l": kbLink(); break;
    case "i": kbInvert(); break;
    case "u": fileInput.click(); break;
    case "n": createFolder(); break;
    case "r": loadFiles(); showToast("Yangilandi"); break;
    case "/": e.preventDefault(); kbFocusSearch(); break;
    case "?": e.preventDefault(); showShortcutsHelp(); break;
    default: return;
  }
}

// ---- viewer keys ----
function kbViewerKey(e, mod, typing) {
  if (typing) return;
  const k = e.key;
  if (mod) {
    if (e.altKey || !annotState.editMode) return;
    const c = k.toLowerCase();
    if (c === "z") { e.preventDefault(); if (e.shiftKey) annotRedo(); else annotUndo(); }
    else if (c === "y") { e.preventDefault(); annotRedo(); }
    else if (c === "s") { e.preventDefault(); saveAnnotated(); }
    return;
  }
  if (e.altKey) return;
  const zoomable = annotState.type === "image" || annotState.type === "pdf";
  const c = k.length === 1 ? k.toLowerCase() : k;
  switch (c) {
    case "ArrowLeft":
    case "ArrowRight":
      if (e.target && e.target.tagName === "VIDEO") return;
      e.preventDefault();
      annotNavigate(c === "ArrowLeft" ? -1 : 1);
      break;
    case "+": case "=": if (zoomable) setAnnotZoom(annotState.scale * 1.25); break;
    case "-": case "_": if (zoomable) setAnnotZoom(annotState.scale / 1.25); break;
    case "0": if (zoomable) setAnnotZoom(1); break;
    case "f": toggleAnnotFullscreen(); break;
    case "d": {
      const f = annotState.file;
      if (f) downloadFile(f.id, f.storage_path, f.filename);
      break;
    }
    case "e": {
      const b = document.getElementById("annot-edit");
      if (b && b.style.display !== "none") b.click();
      break;
    }
    default: return;
  }
}

window.addEventListener("keydown", (e) => {
  if (!kbAppActive()) return;
  const typing = kbIsTyping(e.target);
  const mod = e.ctrlKey || e.metaKey;
  const modalOpen = !!document.querySelector(".modal-backdrop");

  if (modalOpen) {
    // Help dialog: ? closes it again (Esc is handled by the dialog itself)
    if (e.key === "?" && document.getElementById("shortcuts-modal") && !typing) {
      e.preventDefault();
      document.getElementById("shortcuts-modal").remove();
    }
    return;
  }
  const ctx = document.getElementById("file-context-menu");
  if (ctx) {
    if (e.key === "Escape") return; // the menu closes itself
    if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) hideFileContextMenu();
  }
  if (annotState.open) { kbViewerKey(e, mod, typing); return; }
  kbListKey(e, mod, typing);
}, true);

// A mouse/finger interaction ends keyboard-cursor mode (the outline would look stale).
document.addEventListener("pointerdown", () => {
  if (kbCursorId) kbSetCursor(null, true);
}, true);

// ---- viewer: previous / next file (buttons for touch, ← → for keyboard) ----
let annotNavBusy = false;

function annotSiblings() {
  const f = annotState.file;
  if (!f) return [];
  return allFiles.filter((x) => (x.folder || null) === (f.folder || null) && isViewable(x.filename));
}

function updateAnnotNavButtons() {
  const list = annotSiblings();
  const f = annotState.file;
  let i = -1;
  if (f) i = list.findIndex((x) => String(x.id) === String(f.id));
  const prevBtn = document.getElementById("annot-prev");
  const nextBtn = document.getElementById("annot-next");
  if (prevBtn) prevBtn.disabled = i <= 0;
  if (nextBtn) nextBtn.disabled = i < 0 || i >= list.length - 1;
}

async function annotNavigate(dir, opts) {
  if (!annotState.open || !annotState.file || annotNavBusy) return false;
  const list = annotSiblings();
  if (list.length < 2) return false;
  if (annotHasUnsavedEdits()) {
    showToast("Saqlanmagan chizmalar bor", "warning", "Avval saqlang yoki yopib bekor qiling.");
    return false;
  }
  const i = list.findIndex((x) => String(x.id) === String(annotState.file.id));
  if (i < 0) return false;
  // Linear neighbors (no wrap) — swipe feels physical at the ends
  const nextIdx = i + dir;
  if (nextIdx < 0 || nextIdx >= list.length) return false;
  const next = list[nextIdx];
  if (!next) return false;

  annotNavBusy = true;
  const scroll = document.getElementById("annot-scroll");
  const workspace = document.getElementById("annot-workspace");
  const skipSlide = opts && opts.skipSlide;
  const fromSwipe = opts && opts.fromSwipe;

  try {
    // Slide out current content (unless swipe already finished the motion)
    if (!skipSlide && !fromSwipe && scroll && workspace) {
      const w = workspace.clientWidth || window.innerWidth;
      const target = dir > 0 ? -w : w;
      scroll.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
      scroll.style.transform = `translate3d(${target}px,0,0)`;
      await new Promise((r) => setTimeout(r, 280));
    }

    const v = document.querySelector("#annot-scroll video, #annot-scroll audio");
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    if (window.__mrAudioDestroy) { try { window.__mrAudioDestroy(); } catch (_) {} }

    // Prepare incoming slide from the opposite edge
    if (scroll) {
      scroll.style.transition = "none";
      const w = (workspace && workspace.clientWidth) || window.innerWidth;
      scroll.style.transform = `translate3d(${dir > 0 ? w : -w}px,0,0)`;
      scroll.style.opacity = "0.001";
    }

    await openAnnotationViewer(next, isViewable(next.filename));

    // Animate new content into place
    if (scroll) {
      // force reflow so transition applies from off-screen position
      void scroll.offsetWidth;
      scroll.style.transition = "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease";
      scroll.style.transform = "translate3d(0,0,0)";
      scroll.style.opacity = "1";
      await new Promise((r) => setTimeout(r, 320));
      scroll.style.transition = "";
      scroll.style.transform = "";
      scroll.style.opacity = "";
    }
    return true;
  } finally {
    annotNavBusy = false;
  }
}

document.getElementById("annot-prev")?.addEventListener("click", () => annotNavigate(-1));
document.getElementById("annot-next")?.addEventListener("click", () => annotNavigate(1));

// Physical left/right swipe between files (mobile, tablet, desktop).
// Horizontal-dominant drag on the workspace; springs back or commits with velocity.
(function setupAnnotSwipe() {
  const workspace = document.getElementById("annot-workspace");
  if (!workspace) return;

  let tracking = false;
  let decided = false;
  let isHoriz = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let pointerId = null;
  let canPrev = false;
  let canNext = false;

  const SCROLL_SEL = "#annot-scroll";
  const INTERACTIVE = "button, a, input, textarea, select, video, audio, .mr-audio-player, .mr-audio-progress, .mr-audio-controls, .annot-btn, .annot-tool";

  function scrollEl() {
    return document.getElementById("annot-scroll");
  }

  function resetTransform(el, animate) {
    if (!el) return;
    if (animate) {
      el.style.transition = "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "translate3d(0,0,0)";
      const done = () => {
        el.style.transition = "";
        el.style.transform = "";
        el.removeEventListener("transitionend", done);
      };
      el.addEventListener("transitionend", done);
      setTimeout(done, 420);
    } else {
      el.style.transition = "";
      el.style.transform = "";
    }
  }

  function rubber(dx, width) {
    // Resist past the end when no sibling in that direction
    if (dx > 0 && !canPrev) return dx * 0.22;
    if (dx < 0 && !canNext) return dx * 0.22;
    // Slight ease so it feels heavy
    const t = Math.min(Math.abs(dx) / width, 1.4);
    const eased = Math.sin((Math.min(t, 1) * Math.PI) / 2);
    const mag = Math.min(Math.abs(dx), width) * (0.55 + 0.45 * eased) + Math.max(0, Math.abs(dx) - width) * 0.15;
    return (dx < 0 ? -1 : 1) * mag;
  }

  function refreshNeighbors() {
    const list = annotSiblings();
    const f = annotState.file;
    if (!f || list.length < 2) {
      canPrev = canNext = false;
      return;
    }
    const i = list.findIndex((x) => String(x.id) === String(f.id));
    canPrev = i > 0;
    canNext = i >= 0 && i < list.length - 1;
  }

  workspace.addEventListener("pointerdown", (e) => {
    if (!annotState.open || annotNavBusy || annotState.editMode) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    // Don't steal two-finger pan / pinch
    if (annotState.touches && annotState.touches.size >= 2) return;
    if (annotState.isPanning) return;

    refreshNeighbors();
    if (!canPrev && !canNext) return;

    tracking = true;
    decided = false;
    isHoriz = false;
    startX = lastX = e.clientX;
    startY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    pointerId = e.pointerId;

    const sc = scrollEl();
    if (sc) {
      sc.style.transition = "none";
      sc.style.willChange = "transform";
    }
  }, { passive: true });

  workspace.addEventListener("pointermove", (e) => {
    if (!tracking || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    velocity = (e.clientX - lastX) / dt; // px/ms
    lastX = e.clientX;
    lastT = now;

    if (!decided) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      decided = true;
      isHoriz = Math.abs(dx) > Math.abs(dy) * 1.15;
      if (!isHoriz) {
        tracking = false;
        resetTransform(scrollEl(), false);
        return;
      }
      try { workspace.setPointerCapture(pointerId); } catch (_) {}
    }
    if (!isHoriz) return;

    e.preventDefault();
    const sc = scrollEl();
    if (!sc) return;
    const w = workspace.clientWidth || window.innerWidth;
    const x = rubber(dx, w);
    sc.style.transform = `translate3d(${x}px,0,0)`;
  }, { passive: false });

  async function endSwipe(e) {
    if (!tracking || (e && e.pointerId !== pointerId)) return;
    tracking = false;
    const sc = scrollEl();
    if (!isHoriz || !sc) {
      resetTransform(sc, false);
      isHoriz = false;
      return;
    }

    const dx = (e ? e.clientX : lastX) - startX;
    const w = workspace.clientWidth || window.innerWidth;
    const threshold = Math.min(120, w * 0.22);
    const fling = Math.abs(velocity) > 0.55; // ~550 px/s
    let dir = 0;
    if ((dx < -threshold || (fling && velocity < -0.35)) && canNext) dir = 1;
    else if ((dx > threshold || (fling && velocity > 0.35)) && canPrev) dir = -1;

    if (dir === 0) {
      resetTransform(sc, true);
      isHoriz = false;
      return;
    }

    // Finish the slide off-screen, then swap file
    const target = dir > 0 ? -w : w;
    sc.style.transition = "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)";
    sc.style.transform = `translate3d(${target}px,0,0)`;
    isHoriz = false;
    pointerId = null;

    await new Promise((r) => setTimeout(r, 240));
    await annotNavigate(dir, { fromSwipe: true, skipSlide: true });
  }

  workspace.addEventListener("pointerup", endSwipe);
  workspace.addEventListener("pointercancel", (e) => {
    if (!tracking || e.pointerId !== pointerId) return;
    tracking = false;
    isHoriz = false;
    resetTransform(scrollEl(), true);
  });
})();

// ---- help dialog (also opened from the settings menu) ----
// Help page is for computers only: phones and tablets (narrow screens) don't get it.
const HELP_MIN_WIDTH = 1025;
function helpAvailable() {
  return window.matchMedia(`(min-width: ${HELP_MIN_WIDTH}px)`).matches;
}

function showShortcutsHelp() {
  if (!helpAvailable()) return;
  const old = document.getElementById("shortcuts-modal");
  if (old) { old.remove(); return; }

  const combo = (c) => c.split("+").map((p) => `<kbd>${p}</kbd>`).join("+");
  const row = (keys, text) =>
    `<div class="sc-row"><span class="sc-keys">${keys.map(combo).join('<i>yoki</i>')}</span><span class="sc-text">${text}</span></div>`;

  const sections = [
    ["Fayllar", [
      [["Delete", "Ctrl+Backspace"], "Tanlangan fayllarni o'chirish (keyin Enter — tasdiqlash)"],
      [["Ctrl+A"], "Hammasini tanlash"],
      [["I"], "Tanlovni teskarisiga aylantirish"],
      [["↑", "↓"], "Fayllar bo'ylab yurish (tanlaydi)"],
      [["Shift+↑", "Shift+↓"], "Tanlovni kengaytirish"],
      [["Alt+↑", "Alt+↓"], "Tanlamasdan yurish"],
      [["Space"], "Joriy faylni tanlash / bekor qilish"],
      [["Home", "End"], "Birinchi / oxirgi fayl"],
      [["Enter"], "Ochish (ko'rish yoki yuklab olish)"],
      [["Esc"], "Tanlovni bekor qilish"],
    ]],
    ["Amallar", [
      [["D"], "Yuklab olish (bir nechta bo'lsa ZIP)"],
      [["M"], "Papkaga ko'chirish"],
      [["L"], "Ommaviy havola yaratish / nusxalash"],
      [["U"], "Fayl yuklash"],
      [["N"], "Yangi papka"],
      [["R"], "Yangilash"],
      [["/", "Ctrl+K"], "Qidirish"],
      [["0"], "Barcha fayllar (All)"],
      [["1", "2", "…9"], "Papkalarga o'tish"],
      [["?"], "Shu oyna"],
    ]],
    ["Ko'rish oynasi", [
      [["←", "→"], "Oldingi / keyingi fayl"],
      [["+", "-", "0"], "Kattalashtirish / kichraytirish / asl o'lcham"],
      [["F"], "To'liq ekran"],
      [["D"], "Yuklab olish"],
      [["E"], "Chizish rejimi"],
      [["Ctrl+Z", "Ctrl+Y"], "Bekor qilish / qaytarish (chizishda)"],
      [["Ctrl+S"], "Chizmani saqlash"],
      [["Esc"], "Yopish"],
    ]],
  ];
  const modal = document.createElement("div");
  modal.id = "shortcuts-modal";
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box shortcuts-box">
        <h3 class="prompt-title">Tezkor tugmalar</h3>
        ${sections.map(([title, rows]) => `<div class="sc-title">${title}</div>${rows.map(([k, t]) => row(k, t)).join("")}`).join("")}
        <button type="button" class="prompt-btn prompt-btn-ok sc-close">Yopish</button>
      </div>
    </div>`;
  const close = () => { document.removeEventListener("keydown", onKey); modal.remove(); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  modal.querySelector(".sc-close").addEventListener("click", close);
  modal.querySelector(".modal-backdrop").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) close();
  });
  document.body.appendChild(modal);
  modal.querySelector(".sc-close").focus({ preventScroll: true });
}

document.getElementById("settings-shortcuts-btn")?.addEventListener("click", (e) => {
  e.stopPropagation();
  const gear = document.getElementById("gear-btn");
  const menu = document.getElementById("settings-modal");
  if (gear && menu && !menu.hidden) gear.click(); // close the settings menu first
  showShortcutsHelp();
});
