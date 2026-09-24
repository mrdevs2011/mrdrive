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

// SVG markup for list rows; data-URL variants for drag ghosts (setDragImage needs an Image)
function svgToDataUrl(svgMarkup) {
  const cleaned = svgMarkup
    .replace(/class="[^"]*"/g, "")
    .replace(/width="\d+"/, 'width="44"')
    .replace(/height="\d+"/, 'height="44"')
    .replace(/currentColor/g, "#52525b");
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(cleaned);
}
const DRAG_ICON_URL = svgToDataUrl(ICON_FILE);
const DRAG_ICON_ZIP_URL = svgToDataUrl(ICON_ZIP);
const DRAG_ICON_VIDEO_URL = svgToDataUrl(ICON_VIDEO);
const DRAG_ICON_IMAGE_URL = svgToDataUrl(ICON_IMAGE);
[DRAG_ICON_URL, DRAG_ICON_ZIP_URL, DRAG_ICON_VIDEO_URL, DRAG_ICON_IMAGE_URL].forEach((u) => { const i = new Image(); i.src = u; });

function fileIconSvgForName(name) {
  name = name || "";
  if (/\.zip$/i.test(name)) return ICON_ZIP;
  if (/\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|ogv)$/i.test(name)) return ICON_VIDEO;
  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg|ico|heic|heif|tiff?)$/i.test(name)) return ICON_IMAGE;
  return ICON_FILE;
}
function fileIconUrlForName(name) {
  name = name || "";
  if (/\.zip$/i.test(name)) return DRAG_ICON_ZIP_URL;
  if (/\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|ogv)$/i.test(name)) return DRAG_ICON_VIDEO_URL;
  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg|ico|heic|heif|tiff?)$/i.test(name)) return DRAG_ICON_IMAGE_URL;
  return DRAG_ICON_URL;
}

const BUCKET = "files";
const TABLE = "files";
const FOLDERS_TABLE = "folders";
const FAKE_EMAIL_DOMAIN = "gmail.com";

let allFiles = [];
let allFolders = [];
let currentSearch = "";
let currentFolder = null;
let selectedFileIds = new Set(); // ids currently selected via click/marquee
let lastClickedFileId = null; // for shift-click range select

// Claude / remote activity: don't toast our own uploads/deletes as "Claude"
const localUploadKeys = new Set(); // "filename:::size"
const localDeleteIds = new Set();
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
    if (localDeleteIds.has(String(f.id))) continue;
    showToast(`Claude ${f.filename} o'chirdi`, "warning");
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
  if (parsed.folder !== undefined) {
    currentFolder = parsed.folder;
  }
  if (!parsed.filename) return;
  const file = findFileFromPath(parsed);
  if (!file) return;
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

if (shareToken) {
  bootLoader.style.display = "none";
  if (appScreen) appScreen.style.display = "none";
  showPublicDownloadModal(shareToken);
} else {
  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      bootLoader.style.display = "none";
      if (appScreen) appScreen.style.display = "block";
      const parsed = parseAppPath(window.location.pathname);
      currentFolder = parsed.folder;
      // Don't rewrite URL on boot if it already has a file path — loadFiles
      // will open that file. Folder-only paths get a clean trailing slash.
      if (!parsed.filename) {
        syncFolderUrl(currentFolder, true);
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
const PDF_EXTENSIONS = ["pdf"];

function getFileExt(filename) {
  return (filename.split(".").pop() || "").toLowerCase();
}

function getFileKind(filename) {
  const ext = getFileExt(filename);
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
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
            <button id="public-download-btn" class="public-download-btn" disabled title="Download" aria-label="Download">${ICON_DOWNLOAD}</button>
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
        filenameEl.textContent = "File not found";
        metaEl.textContent = "This link was removed or doesn't exist.";
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        modalIcon.classList.remove("is-loading");
        modalIcon.innerHTML = ICON_DOWNLOAD;
        modalBox.classList.add("is-error");
        filenameEl.textContent = "Expired";
        metaEl.textContent = "This link has expired.";
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
      if (kind === "image" || kind === "video" || kind === "pdf") {
        modalIcon.style.display = "none";
        modalBox.classList.add("has-preview");
        previewWrap.appendChild(loaderEl);
      } else {
        modalIcon.classList.remove("is-loading");
        modalIcon.innerHTML = ICON_DOWNLOAD;
      }

      if (kind === "image" || kind === "video") {
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
          setupPublicFullscreen(fsBtn, modalBox, previewWrap);
          setupPublicControlsFade(modalBox, previewWrap, kind !== "video");

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
              statusEl.textContent = "Could not load this image";
            }, { once: true });
            imgEl.src = previewUrlData.signedUrl;
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
              statusEl.textContent = "Could not load this video";
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
            statusEl.textContent = "Could not preview this PDF";
          }
        }
      }

      downloadBtn.onclick = async () => {
        statusEl.textContent = "Preparing download...";
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
              statusEl.textContent = "Downloaded";
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
            statusEl.textContent = "Error: " + urlError.message;
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
          statusEl.textContent = "Downloaded";
        } catch (err) {
          console.error(err);
          statusEl.textContent = "Error: " + (err.message || "download failed");
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    ctx.strokeStyle = "#ef4444";
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
    ctx.strokeStyle = "#ef4444";
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

async function logout() {
  await sb.auth.signOut();
  location.replace("/login/");
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
  if (!gearBtn || !modal) return;

  function closeSettings() {
    modal.hidden = true;
    gearBtn.classList.remove("open");
    if (accountPanel) accountPanel.hidden = true;
  }
  function openSettings() {
    modal.hidden = false;
    gearBtn.classList.add("open");
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
  if (bootLoader.style.display !== "none") return;
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
  showToast("Duplicate skipped", "warning", `${file.name} was just uploaded`);
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

  top.append(name, status);

  const track = document.createElement("div");
  track.className = "upload-bar";
  const fill = document.createElement("div");
  fill.className = "upload-bar-fill";
  track.appendChild(fill);

  item.append(top, track);
  uploadProgressEl.appendChild(item);

  return {
    setPercent(p) {
      const v = Math.max(0, Math.min(100, Math.round(p)));
      fill.style.width = v + "%";
      status.textContent = v + "%";
    },
    setSaving() {
      fill.style.width = "100%";
      status.textContent = "Saving…";
      item.classList.add("saving");
    },
    setDone() {
      item.classList.remove("saving");
      item.classList.add("done");
      fill.style.width = "100%";
      status.textContent = "Done";
      setTimeout(() => item.remove(), 1200);
    },
    setError(message) {
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
function uploadToStorage(path, file, accessToken, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("x-upsert", "false");

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
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    xhr.send(form);
  });
}

async function uploadFile(file) {
  const fileId = getFileUniqueId(file);
  if (uploadingFileIds.has(fileId)) {
    notifyDuplicate(file);
    return;
  }
  uploadingFileIds.add(fileId); // must stay BEFORE the first await

  let keepBlocked = false;
  const ui = createProgressItem(file.name);
  let path = null;

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error("Not logged in");
    const user = session.user;

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    path = `${user.id}/${Date.now()}_${safeName}`;

    await uploadToStorage(path, file, session.access_token, (ratio) => {
      if (ratio >= 1) ui.setSaving();   // bytes sent, server still working
      else ui.setPercent(ratio * 100);
    });
    ui.setSaving();

    const insertData = {
      user_id: user.id,
      filename: file.name,
      storage_path: path,
      size: file.size
    };
    if (currentFolder) insertData.folder = currentFolder;

    const { error: dbError } = await sb.from(TABLE).insert(insertData);
    if (dbError) {
      // Don't leave an orphan in the bucket that no row points to
      await sb.storage.from(BUCKET).remove([path]).catch(() => {});
      throw new Error(`DB error: ${dbError.message}`);
    }

    markLocalUpload(file.name, file.size);
    ui.setDone();
    keepBlocked = true;
    loadFiles();
  } catch (err) {
    console.error(`Upload error (${file.name}):`, err);
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
  [...fileListObj].forEach(uploadFile);
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
  handleFiles(e.dataTransfer.files);
});

window.addEventListener("paste", (e) => {
  if (appScreen.style.display === "none") return;
  const items = e.clipboardData.files;
  if (items.length) handleFiles(items);
});

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

  const newFiles = filesRes.data;
  const newFolders = foldersRes.data || [];

  if (silent) {
    // Polling call: skip the re-render entirely if nothing actually changed,
    // so the list doesn't flicker or lose scroll position every 2s.
    const same =
      JSON.stringify(newFiles) === JSON.stringify(allFiles) &&
      JSON.stringify(newFolders) === JSON.stringify(allFolders);
    if (same) return;
  }

  // Remote (Claude MCP / other session) add/remove → toast + green flash
  // + sand-like dissolve animation when Claude (MCP) deletes a file
  const remoteDeleted = notifyRemoteFileChanges(allFiles, newFiles) || [];

  if (remoteDeleted.length && fileListEl) {
    const dissolvePromises = remoteDeleted.map((f) => {
      const card = fileListEl.querySelector(`.file-card[data-file-id="${f.id}"]`);
      if (!card) return Promise.resolve();
      // No click coords for remote deletes — dissolve from the right side of the card
      return playDeleteDissolve(card);
    });
    // Wait for collapse so the row animates out before we re-render the list
    await Promise.all(dissolvePromises);
  }

  allFiles = newFiles;
  allFolders = newFolders;
  filesListReady = true;
  const liveIds = new Set(newFiles.map((f) => String(f.id)));
  Array.from(selectedFileIds).forEach((id) => { if (!liveIds.has(id)) selectedFileIds.delete(id); });
  renderToolbar();
  renderFiles();
  prefetchDragUrls(newFiles).catch(() => {}); // best-effort, drag-out just won't work if this fails
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
      <input type="text" id="search-input" placeholder="Search files..." value="${escapeHtml(currentSearch)}" />
    </div>
    <div class="folder-tabs">
      <button class="folder-tab ${currentFolder === null ? 'active' : ''}" data-folder="" onclick="setFolder(null)" title="Drop files here to remove from folder">
        ${ICON_FOLDER} All
      </button>
      ${allFolders.map(f => `
        <div class="folder-tab-wrap" data-folder="${escapeHtml(f.name)}">
          <button class="folder-tab ${currentFolder === f.name ? 'active' : ''}" data-folder="${escapeHtml(f.name)}" onclick="setFolder('${escapeJs(f.name)}')" title="Drop files here">
            ${ICON_FOLDER} ${escapeHtml(f.name)}
          </button>
          <button class="folder-del-btn" onclick="deleteFolder(${f.id}, '${escapeJs(f.name)}')" title="Delete folder">
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
    moveFilesToFolder(fileIds, targetFolder);
  }

  // Bind once on the toolbar (re-created each render, so always fresh)
  toolbar.addEventListener("dragover", onDragOver);
  toolbar.addEventListener("dragleave", onDragLeave);
  toolbar.addEventListener("drop", onDrop);
}

async function moveFilesToFolder(fileIds, targetFolder) {
  const ids = fileIds.map(String);
  const files = allFiles.filter((f) => ids.includes(String(f.id)));
  if (!files.length) return;

  const next = targetFolder || null;
  const toMove = files.filter((f) => (f.folder || null) !== next);
  if (!toMove.length) {
    showToast(next ? `Already in "${next}"` : "Already in All", "warning");
    return;
  }

  const { error } = await sb.from(TABLE).update({ folder: next }).in("id", toMove.map((f) => f.id));
  if (error) {
    showAlert("Error: " + error.message);
    return;
  }

  toMove.forEach((f) => { f.folder = next; });
  const label = next ? `"${next}"` : "All";
  showToast(toMove.length === 1 ? `Moved to ${label}` : `Moved ${toMove.length} files to ${label}`);
  renderFiles();
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

async function createFolder(fileIds) {
  const dropIds = Array.isArray(fileIds) ? fileIds.map(String) : null; // set when files were dropped on "+ Folder"
  const name = await showPrompt(dropIds ? "Enter your folder name" : "New folder", {
    okLabel: dropIds ? "Create & move" : "Create",
    placeholder: "Folder name"
  });
  if (name == null || !String(name).trim()) return;
  const trimmed = String(name).trim();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  if (allFolders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
    showToast("Folder already exists", "warning", "Pick a different name.");
    return;
  }

  const { error } = await sb.from(FOLDERS_TABLE).insert({
    user_id: user.id,
    name: trimmed
  });

  if (error) {
    showAlert("Error: " + error.message);
    return;
  }

  if (dropIds) {
    // Files were dropped on "+ Folder": create it, put them inside, stay in the current view.
    await moveFilesToFolder(dropIds, trimmed);
    loadFiles();
    return;
  }

  currentFolder = trimmed;
  syncFolderUrl(trimmed);
  showToast(`Folder created: ${trimmed}`);
  loadFiles();
}

async function deleteFolder(id, name) {
  const filesInFolder = allFiles.filter(f => f.folder === name);
  let msg = `Delete folder "${name}"?`;
  if (filesInFolder.length > 0) {
    msg += `\n\nHeads up: this folder has ${filesInFolder.length} ${filesInFolder.length === 1 ? "file" : "files"}. ${filesInFolder.length === 1 ? "It" : "They"} will move to "All" (not deleted).`;
  }

  if (!(await showConfirm(msg, "Delete"))) return;

  if (filesInFolder.length > 0) {
    await sb.from(TABLE).update({ folder: null }).eq("folder", name);
  }

  const { error } = await sb.from(FOLDERS_TABLE).delete().eq("id", id);

  if (error) {
    showAlert("Error: " + error.message);
    return;
  }

  if (currentFolder === name) {
    currentFolder = null;
    syncFolderUrl(null);
  }
  showToast("Folder deleted");
  loadFiles();
}

function renderFiles() {
  let filtered = allFiles;

  if (currentFolder !== null) {
    filtered = filtered.filter(f => f.folder === currentFolder);
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(f => f.filename.toLowerCase().includes(q));
  }

  if (!filtered.length) {
    if (allFiles.length === 0) {
      fileListEl.innerHTML = `<p class="empty">No files yet.</p>`;
    } else {
      fileListEl.innerHTML = `<p class="empty">Nothing found.</p>`;
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
        ${fileIconSvgForName(f.filename)}
        <div class="file-info">
          <span class="file-name">${escapeHtml(f.filename)}</span>
          <span class="file-meta">${meta}</span>
        </div>
      </div>
      <div class="file-actions">
        <div class="file-actions-more">
          ${isPublic
            ? `<div class="toggle-group">
                 <button class="toggle-btn copy-btn" onclick="copyPublicLink(${f.id}, this)" title="Copy link">${ICON_COPY}</button>
                 <button class="toggle-btn refresh-btn" onclick="refreshPublicLink(${f.id})" title="Create a new link (the old one stops working)">${ICON_REFRESH}</button>
                 <button class="toggle-btn unlink-btn" onclick="unpublishFile(${f.id})" title="Remove from public">${ICON_UNLINK}</button>
               </div>`
            : `<button class="link-btn" onclick="createPublicLink(${f.id})" title="Create public link">${ICON_LINK}</button>`
          }
          <button onclick="downloadFile(${f.id}, '${escapeJs(f.storage_path)}', '${escapeJs(f.filename)}')" title="Download">${ICON_DOWNLOAD}</button>
          <button onclick="deleteFile(${f.id}, '${escapeJs(f.storage_path)}', event)" title="Delete">${ICON_DELETE}</button>
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

function updateSelectionClasses() {
  fileListEl.querySelectorAll(".file-card").forEach((card) => {
    card.classList.toggle("selected", selectedFileIds.has(card.dataset.fileId));
  });
  updateSelectionBar();
}

// Reliable alternative to dragging files out to the OS file manager (which
// browsers on Linux/Wayland mostly can't do): a bar with real save buttons.
function updateSelectionBar() {
  let bar = document.getElementById("selection-bar");
  const n = selectedFileIds.size;
  if (!n) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement("button");
    bar.id = "selection-bar";
    bar.type = "button";
    bar.className = "selection-fab";
    bar.setAttribute("aria-label", "Download selected");
    bar.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12m0 0-5-5m5 5 5-5"/><path d="M5 20h14"/></svg>`;
    bar.onclick = async () => {
      if (bar.classList.contains("busy")) return;
      bar.classList.add("busy");
      try { await downloadSelectedZip(); } finally { bar.classList.remove("busy"); }
    };
    // Drop target: drag selected file cards onto the button to get them as a ZIP.
    const isCardDrag = (e) => Array.from(e.dataTransfer.types || []).some((t) => t.startsWith("application/x-mrdrive-file"));
    bar.addEventListener("dragover", (e) => {
      if (!isCardDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      bar.classList.add("drop-hover");
    });
    bar.addEventListener("dragleave", () => bar.classList.remove("drop-hover"));
    bar.addEventListener("drop", async (e) => {
      if (!isCardDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      bar.classList.remove("drop-hover");
      let ids = [];
      try { ids = JSON.parse(e.dataTransfer.getData("application/x-mrdrive-files") || "[]"); } catch { ids = []; }
      if (!ids.length) { const one = e.dataTransfer.getData("application/x-mrdrive-file"); if (one) ids = [one]; }
      if (!ids.length || bar.classList.contains("busy")) return;
      bar.classList.add("busy");
      try { await downloadSelectedZip(ids); } finally { bar.classList.remove("busy"); }
    });
    document.body.appendChild(bar);
  }
  bar.title = n > 1 ? `Download ${n} files as ZIP` : "Download";
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
    showToast("Saving…");
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
    showAlert("Error: " + (err.message || err));
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
    showAlert("Error: " + (err.message || err));
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

// Card click: open preview when the file is viewable (image/video/pdf/code).
// Clicks on action buttons are ignored. Non-viewable files still toggle the
// mobile action row (actions-open). Ctrl/Cmd toggles the file into the
// multi-selection instead; Shift extends the selection to a range.
fileListEl.addEventListener("click", (e) => {
  if (e.target.closest(".file-actions")) return;
  const card = e.target.closest(".file-card");
  if (!card) return;
  const id = card.dataset.fileId;

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
      openAnnotationViewer(f, kind);
      return;
    }
  }

  const wasOpen = card.classList.contains("actions-open");
  document.querySelectorAll(".file-card.actions-open").forEach(c => c.classList.remove("actions-open"));
  if (!wasOpen) card.classList.add("actions-open");
});

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
  hint.innerHTML = `Hold <kbd>Ctrl</kbd> to add to the current selection`;
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

// Small floating file-icon used as the drag image instead of the full
// card. When several files are dragged together, a few icons are stacked
// behind the front one with a count badge.
function dragIconUrlFor(fileId) {
  const f = allFiles.find((x) => String(x.id) === String(fileId));
  return fileIconUrlForName((f && f.filename) || "");
}

function dragIconEl(url) {
  const img = new Image();
  img.src = url || DRAG_ICON_URL;
  img.width = 44;
  img.height = 44;
  img.draggable = false;
  img.style.cssText = "display:block; width:44px; height:44px;";
  return img;
}

function buildDragGhost(ids, frontId) {
  const count = ids.length;
  const ghost = document.createElement("div");
  ghost.style.cssText = "position:fixed; top:-1000px; left:-1000px; width:56px; height:56px; pointer-events:none;";

  // Front icon = the file you grabbed; the (up to 2) layers behind it = other dragged files.
  const rest = ids.filter((id) => String(id) !== String(frontId)).slice(0, 2);
  for (let i = rest.length; i >= 1; i--) {
    const layer = document.createElement("div");
    layer.style.cssText = `position:absolute; top:${i * 4}px; left:${i * 4}px; filter:drop-shadow(0 1px 2px rgba(0,0,0,.25));`;
    layer.appendChild(dragIconEl(dragIconUrlFor(rest[i - 1])));
    ghost.appendChild(layer);
  }
  const front = document.createElement("div");
  front.style.cssText = "position:absolute; top:0; left:0; filter:drop-shadow(0 2px 5px rgba(0,0,0,.3));";
  front.appendChild(dragIconEl(dragIconUrlFor(frontId)));
  ghost.appendChild(front);

  if (count > 1) {
    const badge = document.createElement("div");
    badge.textContent = String(count);
    badge.style.cssText =
      "position:absolute; top:-6px; right:-6px; background:#ef4444; color:#fff; " +
      "font:700 11px/1 -apple-system,system-ui,sans-serif; min-width:17px; height:17px; " +
      "padding:0 4px; border-radius:9px; display:flex; align-items:center; justify-content:center; " +
      "box-shadow:0 1px 3px rgba(0,0,0,.3);";
    ghost.appendChild(badge);
  }

  document.body.appendChild(ghost);
  return ghost;
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
  e.dataTransfer.setDragImage(ghost, -16, 6); // negative x: icon sits to the RIGHT of the cursor, not under it
  setTimeout(() => ghost.remove(), 0); // browser has already snapshotted it by now

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
    showAlert("Error: " + error.message);
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
const ANIM_DURATION  = 1800;
const SWEEP_DURATION = 450;
const COLLAPSE_DELAY = 700;
const TILE_SIZE      = 1.6;
const DRIFT_X        = 20;
const DRIFT_Y        = -70;
const FLOAT_UP_FORCE = -0.04;
const NOISE_AMP      = 10;

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
    dest.style.display = "none";
  }
  const srcChildren = src.children;
  const destChildren = dest.children;
  for (let i = 0; i < srcChildren.length; i++) {
    if (destChildren[i]) __dissolveInlineAllStyles(srcChildren[i], destChildren[i]);
  }
}

/** DOM → canvas via SVG foreignObject (demo.html approach, self-contained styles). */
function __dissolveDomToCanvas(el) {
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

    // Hide action buttons in snapshot (cleaner, like a message bubble)
    clone.querySelectorAll(".file-actions, .file-actions-more, button").forEach((b) => {
      b.style.display = "none";
    });

    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
        `<foreignObject width="100%" height="100%" x="0" y="0">` +
          `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;margin:0;padding:0;box-sizing:border-box;">` +
            clone.outerHTML +
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

function __dissolveBuildTiles(snapshotCanvas, cssWidth, cssHeight, dpr, epX, epY) {
  const ctx = snapshotCanvas.getContext("2d", { willReadFrequently: true });
  const data = ctx.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height).data;
  const tiles = [];
  const maxDist = Math.hypot(cssWidth, cssHeight) || 1;
  // Keep particle count reasonable on wide cards (still looks dense)
  let tile = TILE_SIZE;
  const est = (cssWidth / tile) * (cssHeight / tile);
  if (est > 12000) tile = 2.2;
  if (est > 20000) tile = 2.8;

  for (let y = 0; y < cssHeight; y += tile) {
    for (let x = 0; x < cssWidth; x += tile) {
      const midX = Math.min(snapshotCanvas.width  - 1, Math.floor((x + tile * 0.5) * dpr));
      const midY = Math.min(snapshotCanvas.height - 1, Math.floor((y + tile * 0.5) * dpr));
      const a = data[(midY * snapshotCanvas.width + midX) * 4 + 3];
      if (a < 10) continue;

      const distToEp = Math.hypot(x - epX, y - epY) || 0.001;
      const seed = (x * 73856) ^ (y * 19349);
      const rnd = (k) => __dissolveHash(seed + k);

      tiles.push({
        sx: x * dpr, sy: y * dpr,
        sw: Math.min(tile * dpr, snapshotCanvas.width  - x * dpr),
        sh: Math.min(tile * dpr, snapshotCanvas.height - y * dpr),
        x, y, tile,
        vx: (rnd(2) - 0.5) * 0.8,
        vy: -0.3 - rnd(3) * 0.5,
        rot:  (rnd(4) - 0.5) * 1.5,
        rotV: (rnd(5) - 0.5) * 0.2,
        delay: (distToEp / maxDist) * SWEEP_DURATION + rnd(6) * 150,
        fadeBias: 0.5 + rnd(7) * 0.5,
        seed,
      });
    }
  }
  return tiles;
}

/** Fallback when pixel snapshot fails: whole card floats up & fades (still not a snap). */
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
      "transition:transform 1.1s cubic-bezier(.22,.61,.36,1), opacity 1.1s ease",
      "transform:translateY(0) scale(1)",
      "opacity:1"
    ].join(";");
    document.body.appendChild(ghost);
    card.style.visibility = "hidden";
    requestAnimationFrame(() => {
      ghost.style.transform = "translateY(-90px) scale(0.96)";
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
async function playDeleteDissolve(card, clickX, clickY) {
  if (!card || !card.isConnected) return;

  const startRect = card.getBoundingClientRect();
  card.style.maxHeight = startRect.height + "px";
  card.style.boxSizing = "border-box";
  card.style.overflow = "hidden";

  let snap = null;
  try {
    snap = await __dissolveDomToCanvas(card);
  } catch (err) {
    console.warn("[dissolve] snapshot failed, using float fallback:", err);
  }

  if (snap && snap.canvas) {
    const { canvas: snapshotCanvas, width, height, rect, dpr } = snap;
    const epX = clickX !== undefined ? clickX - rect.left : width * 0.85;
    const epY = clickY !== undefined ? clickY - rect.top  : height * 0.5;
    const tiles = __dissolveBuildTiles(snapshotCanvas, width, height, dpr, epX, epY);

    if (!tiles.length) {
      await __dissolveFloatFallback(card);
    } else {
      const pad = 120;
      const overlay = document.createElement("canvas");
      overlay.className = "particle-canvas";
      overlay.width  = Math.ceil((width  + pad * 2) * dpr);
      overlay.height = Math.ceil((height + pad * 2) * dpr);
      overlay.style.width  = (width  + pad * 2) + "px";
      overlay.style.height = (height + pad * 2) + "px";
      overlay.style.left = (rect.left - pad) + "px";
      overlay.style.top  = (rect.top  - pad) + "px";
      document.body.appendChild(overlay);

      const octx = overlay.getContext("2d");
      octx.scale(dpr, dpr);
      octx.imageSmoothingEnabled = false;

      const startT = performance.now();

      function paint(elapsed) {
        octx.clearRect(0, 0, overlay.width, overlay.height);
        let anyAlive = false;

        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i];
          const ts = t.tile || TILE_SIZE;
          const local = elapsed - t.delay;

          if (local < 0) {
            octx.globalAlpha = 1;
            octx.drawImage(
              snapshotCanvas, t.sx, t.sy, t.sw, t.sh,
              t.x + pad, t.y + pad, ts, ts
            );
            anyAlive = true;
            continue;
          }

          const life = local / ANIM_DURATION;
          if (life >= 1) continue;
          anyAlive = true;

          const moveEase = 1 - Math.pow(1 - life, 2.2);
          const nX = (__dissolveNoise1D(t.seed * 0.001 + life * 2.5) - 0.5) * NOISE_AMP * life;
          const px = t.x + t.vx * moveEase * DRIFT_X + nX;
          const py = t.y + t.vy * moveEase * Math.abs(DRIFT_Y) + (FLOAT_UP_FORCE * local);

          const fade = Math.min(1, life * t.fadeBias);
          const alpha = Math.max(0, 1 - Math.pow(fade, 1.4));
          if (alpha <= 0.01) continue;

          const scale = 1 - life * 0.3;
          octx.globalAlpha = alpha;
          octx.save();
          octx.translate(px + pad + ts * 0.5, py + pad + ts * 0.5);
          octx.rotate(t.rot + t.rotV * moveEase * 3);
          octx.scale(scale, scale);
          octx.drawImage(
            snapshotCanvas, t.sx, t.sy, t.sw, t.sh,
            -ts * 0.5, -ts * 0.5, ts, ts
          );
          octx.restore();
        }
        return anyAlive;
      }

      // First frame drawn BEFORE hiding the real card (no flash)
      paint(0);
      card.style.visibility = "hidden";

      // Particles run independently (do not block delete/API)
      function frame(now) {
        const alive = paint(now - startT);
        if (alive) requestAnimationFrame(frame);
        else overlay.remove();
      }
      requestAnimationFrame(frame);

      // Demo timing: collapse list row after COLLAPSE_DELAY while particles still fly
      await new Promise((r) => setTimeout(r, COLLAPSE_DELAY));
    }
  } else {
    await __dissolveFloatFallback(card);
  }

  // Collapse the list row (demo .collapsing)
  return new Promise((resolve) => {
    if (!card.isConnected) {
      resolve();
      return;
    }
    card.style.visibility = "hidden";
    card.classList.add("is-deleting");
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    card.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 600);
  });
}

async function deleteFile(id, path, evt) {
  const clickX = evt ? evt.clientX : undefined;
  const clickY = evt ? evt.clientY : undefined;

  if (!(await showConfirm("Delete this file?", "Delete"))) return;

  // Prefer data-file-id; fall back to the button's parent card (event target)
  let card = fileListEl.querySelector(`.file-card[data-file-id="${id}"]`);
  if (!card && evt && evt.target) {
    card = evt.target.closest(".file-card");
  }
  if (card) await playDeleteDissolve(card, clickX, clickY);

  markLocalDelete(id);

  // 1) Database row first. .select() returns the rows that were actually deleted,
  //    so a silent RLS block (0 rows, no error) can be detected instead of ignored.
  const { data: deletedRows, error } = await sb.from(TABLE).delete().eq("id", id).select();

  if (error) {
    showAlert("Error: " + error.message);
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
    showToast("File deleted", "warning", "Storage cleanup failed: " + storageError.message);
  } else if (!removed || removed.length === 0) {
    showToast("File deleted", "warning", "It's gone from your list, but the stored copy may still be in storage.");
  } else {
    showToast("File deleted");
  }

  loadFiles();
}

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
      showAlert("Error: " + updateError.message);
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?share=${newToken}`;
    await copyToClipboard(url);

    showToast("Public link created and copied");
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
  showToast("Link copied");

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
  if (!(await showConfirm("Create a new link? The old link will stop working.", "Create new link"))) return;

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
    showAlert("Error: " + updateError.message);
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}?share=${newToken}`;
  await copyToClipboard(url);

  showToast("New link created and copied");
  loadFiles();
}

async function unpublishFile(fileId) {
  if (!(await showConfirm("Remove from public? The link will stop working.", "Remove"))) return;

  const { error } = await sb
    .from(TABLE)
    .update({ is_public: false, public_token: null, expires_at: null })
    .eq("id", fileId);

  if (error) {
    showAlert("Error: " + error.message);
    return;
  }

  showToast("Removed from public");
  loadFiles();
}

// In-app confirm dialog. Native confirm() can be suppressed by the browser
// ("prevent additional dialogs"), in which case it silently returns false.
function showConfirm(message, okLabel = "OK") {
  return new Promise((resolve) => {
    const existing = document.getElementById("confirm-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "confirm-modal";
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-box">
          <p class="confirm-msg"></p>
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
    modal.querySelector(".confirm-ok").onclick = () => done(true);
    modal.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) done(false);
    });
    modal.querySelector(".confirm-cancel").focus();
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
    cancelLabel = "Cancel",
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
  // Instant show — 0ms delay
  toast.classList.add("show");

  const hide = () => {
    clearTimeout(timer);
    toast.remove();
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

const ANNOT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#000000", "#ffffff"];
const ANNOT_SIZES = [2, 4, 8, 14];

let annotState = {
  open: false,
  tool: "pen",
  color: "#ef4444",
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
  let filtered = allFiles;
  if (currentFolder !== null) filtered = filtered.filter(f => f.folder === currentFolder);
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(f => f.filename.toLowerCase().includes(q));
  }
  return filtered;
}

async function openAnnotationViewer(file, kind, opts) {
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
  annotState.color = "#ef4444";
  annotState.size = 4;
  annotState.editMode = false;

  filenameEl.textContent = file.filename;
  scroll.innerHTML = "";
  scroll.className = "annot-scroll";
  viewer.style.display = "flex";
  viewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Image/video previews sit on a near-white workspace; code/text previews
  // stay dark. Toggled via a class so CSS owns the actual colors.
  // Kind class is also on the viewer so topbar / status / toolbar can match.
  const workspaceEl = document.getElementById("annot-workspace");
  const kindClasses = ["kind-image", "kind-video", "kind-pdf", "kind-code"];
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
  const isReadOnly = kind === "code" || kind === "video";
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
    const { data: { session } } = await sb.auth.getSession();
    const { data: urlData, error } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_path, 3600);
    if (error || !urlData) throw error || new Error("Could not get file URL");

    if (kind === "image") {
      await loadImageForAnnot(urlData.signedUrl, scroll, loader);
      statusHint.textContent = "1 barmoq = chizish · 2 barmoq = surish · Pinch = zoom";
    } else if (kind === "pdf") {
      await loadPdfForAnnot(urlData.signedUrl, scroll, loader);
      statusHint.textContent = "Chizmalar sahifaga yopishadi · 1 barmoq chizish · 2 barmoq surish";
    } else if (kind === "code") {
      scroll.classList.add("is-text");
      await loadCodeForAnnot(urlData.signedUrl, scroll, loader, file.filename);
      statusHint.textContent = "Dark mode kod ko'rinishi · Faqat o'qish";
      // Hide drawing tools for code
      toolbar.querySelectorAll(".annot-tool-group.draw-tools").forEach(g => g.style.display = "none");
    } else if (kind === "video") {
      await loadVideoForAnnot(urlData.signedUrl, scroll);
      statusHint.textContent = "Video ko'rish · Faqat o'qish";
      toolbar.querySelectorAll(".annot-tool-group.draw-tools").forEach(g => g.style.display = "none");
    }
  } catch (err) {
    console.error(err);
    loader.innerHTML = `<span style="color:#f87171">Fayl yuklanmadi</span>`;
  }

  // Wire top buttons
  document.getElementById("annot-close").onclick = closeAnnotationViewer;
  document.getElementById("annot-fullscreen").onclick = toggleAnnotFullscreen;

  // Keyboard
  window.addEventListener("keydown", annotKeyHandler);
}

// Enter drawing mode: pencil active (gray). Only freehand pen — no tools bar.
// Save stays visible always (like public preview). Tapping pencil again exits.
function enterAnnotEditMode(toolbar, editBtn) {
  if (annotState.editMode) return;
  annotState.editMode = true;
  annotState.tool = "pen";
  annotState.color = "#ef4444";
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

function closeAnnotationViewer(opts) {
  const viewer = document.getElementById("annot-viewer");
  const videoEl = viewer.querySelector("#annot-scroll video");
  if (videoEl) { videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load(); }
  viewer.style.display = "none";
  viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // Clear kind classes so next open starts clean
  viewer.classList.remove("kind-image", "kind-video", "kind-pdf", "kind-code");
  const workspaceEl = document.getElementById("annot-workspace");
  if (workspaceEl) workspaceEl.classList.remove("kind-image", "kind-video", "kind-pdf", "kind-code");
  const closedFile = annotState.file;
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
  if (e.key === "Escape") closeAnnotationViewer();
}

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
  attachDrawingHandlers(canvas, 0);
  updateCursor();
  pushHistory();
}

async function loadPdfForAnnot(url, scroll, loader) {
  if (!window.pdfjsLib) {
    loader.innerHTML = `<span style="color:#f87171">PDF.js failed to load</span>`;
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
