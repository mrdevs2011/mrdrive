const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app");
const authStatus = document.getElementById("auth-status");
const userEmailEl = document.getElementById("user-email");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const fileListEl = document.getElementById("file-list");
const uploadProgressEl = document.getElementById("upload-progress");
const bootLoader = document.getElementById("boot-loader");

const ICON_FULLSCREEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_EXIT_FULLSCREEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 4V9H4M20 9H15V4M15 20V15H20M4 15H9V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_DOWNLOAD = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 18H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_DELETE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 7L7 19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_LINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_UNLINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_COPY = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V5C5 4.44772 5.44772 4 6 4H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_REFRESH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4V9H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 20V15H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9C4 9 6 4 12 4C16 4 19 6 20 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M20 15C20 15 18 20 12 20C8 20 5 18 4 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_SEARCH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_FOLDER = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

const BUCKET = "files";
const TABLE = "files";
const FOLDERS_TABLE = "folders";
const FAKE_EMAIL_DOMAIN = "mrdrive.local";

let allFiles = [];
let allFolders = [];
let currentSearch = "";
let currentFolder = null;

// ==========================================
// PUBLIC LINK MODAL
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const shareToken = urlParams.get("share");

if (shareToken) {
  bootLoader.style.display = "none";
  authScreen.style.display = "none";
  appScreen.style.display = "none";
  showPublicDownloadModal(shareToken);
} else {
  sb.auth.getSession().then(({ data: { session } }) => {
    bootLoader.style.display = "none";
    if (session) {
      authScreen.style.display = "none";
      appScreen.style.display = "block";
      const name = session.user.user_metadata?.name || session.user.user_metadata?.username || "";
      userEmailEl.textContent = name;
      loadFiles();
    } else {
      authScreen.style.display = "flex";
    }
  });
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv"];

function getFileExt(filename) {
  return (filename.split(".").pop() || "").toLowerCase();
}

function getFileKind(filename) {
  const ext = getFileExt(filename);
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  return "other";
}

function showPublicDownloadModal(token) {
  const modal = document.createElement("div");
  modal.id = "public-modal";
  modal.innerHTML = `
    <div class="public-modal-backdrop">
      <div class="public-modal-box" id="public-modal-box">
        <div id="public-preview-wrap"></div>
        <div class="public-info">
          <div class="public-modal-icon" id="public-modal-icon">${ICON_DOWNLOAD}</div>
          <h2 id="public-filename">Loading...</h2>
          <p id="public-meta" class="public-meta"></p>
          <p id="public-expiry" class="public-expiry"></p>
          <div class="public-actions">
            <button id="public-download-btn" disabled>Download</button>
            <button id="public-fs-btn" class="public-fs-btn" title="Fullscreen" aria-label="Fullscreen" style="display:none;">${ICON_FULLSCREEN}</button>
          </div>
          <a class="public-go-link" href="https://mrdrive.vercel.app" target="_blank" rel="noopener noreferrer">Go MRdrive</a>
          <p id="public-status" class="public-status"></p>
        </div>
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
  const expiryEl = document.getElementById("public-expiry");
  const statusEl = document.getElementById("public-status");
  const downloadBtn = document.getElementById("public-download-btn");
  const fsBtn = document.getElementById("public-fs-btn");

  sb.from(TABLE)
    .select("*")
    .eq("public_token", token)
    .eq("is_public", true)
    .single()
    .then(async ({ data, error }) => {
      if (error || !data) {
        filenameEl.textContent = "File not found";
        metaEl.textContent = "This link was removed or doesn't exist.";
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        filenameEl.textContent = "Expired";
        metaEl.textContent = "This link has expired.";
        return;
      }

      filenameEl.textContent = data.filename;
      metaEl.textContent = `${formatSize(data.size)} · ${formatDate(data.uploaded_at)}`;

      if (data.expires_at) {
        expiryEl.textContent = `Valid until: ${formatDate(data.expires_at)}`;
      } else {
        expiryEl.textContent = "No expiry";
      }

      downloadBtn.disabled = false;

      const kind = getFileKind(data.filename);

      if (kind === "image" || kind === "video") {
        const { data: previewUrlData, error: previewUrlError } = await sb.storage
          .from(BUCKET)
          .createSignedUrl(data.storage_path, 3600);

        if (!previewUrlError && previewUrlData) {
          modalIcon.style.display = "none";
          modalBox.classList.add("has-preview");
          fsBtn.style.display = "flex";
          setupPublicFullscreen(fsBtn, modalBox, previewWrap);

          if (kind === "image") {
            previewWrap.innerHTML = `
              <div class="public-preview is-image">
                <img src="${previewUrlData.signedUrl}" alt="${escapeHtml(data.filename)}" loading="eager" />
              </div>
            `;
          } else {
            previewWrap.innerHTML = `
              <div class="public-preview is-video">
                <video src="${previewUrlData.signedUrl}" controls playsinline webkit-playsinline preload="metadata"></video>
              </div>
            `;
          }
        }
      }

      downloadBtn.onclick = async () => {
        statusEl.textContent = "Preparing download...";

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
      };
    });
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

// ==========================================
// AUTH
// ==========================================

function usernameToEmail(username) {
  return username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") + "@" + FAKE_EMAIL_DOMAIN;
}

function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
  authStatus.textContent = "";
}

function showLogin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  authStatus.textContent = "";
}

async function signup() {
  const name = document.getElementById("signup-name").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!name || !username || !password) {
    authStatus.textContent = "Please fill in all fields.";
    return;
  }
  if (password.length < 6) {
    authStatus.textContent = "Password must be at least 6 characters.";
    return;
  }

  authStatus.textContent = "Signing you up...";
  const fakeEmail = usernameToEmail(username);

  const { data, error } = await sb.auth.signUp({
    email: fakeEmail,
    password,
    options: { data: { name, username } }
  });

  if (error) {
    if (error.message.includes("already registered")) {
      authStatus.textContent = "This username is taken. Pick another one.";
    } else {
      authStatus.textContent = "Error: " + error.message;
    }
    return;
  }

  authStatus.textContent = data.session ? "" : "Signed up. Go to the login page.";
}

async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    authStatus.textContent = "Enter your username and password.";
    return;
  }

  authStatus.textContent = "Checking...";
  const fakeEmail = usernameToEmail(username);
  const { error } = await sb.auth.signInWithPassword({ email: fakeEmail, password });

  if (error) {
    authStatus.textContent = "Error: incorrect username or password.";
  } else {
    authStatus.textContent = "";
  }
}

async function logout() {
  await sb.auth.signOut();
}

sb.auth.onAuthStateChange((event, session) => {
  if (bootLoader.style.display !== "none") return;
  if (session) {
    authScreen.style.display = "none";
    appScreen.style.display = "block";
    const name = session.user.user_metadata?.name || session.user.user_metadata?.username || "";
    userEmailEl.textContent = name;
    loadFiles();
  } else {
    authScreen.style.display = "flex";
    appScreen.style.display = "none";
  }
});

// ==========================================
// UPLOAD
// ==========================================

const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "sh", "msi", "com", "scr",
  "vbs", "js", "jar", "ps1", "app", "dmg", "apk"
];

function isBlockedFile(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return BLOCKED_EXTENSIONS.includes(ext);
}

async function uploadFile(file) {
  if (isBlockedFile(file.name)) {
    showAlert(`Blocked: ${file.name} — this file type isn't allowed for security reasons.`);
    return;
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${Date.now()}_${safeName}`;

  const progressLine = document.createElement("div");
  progressLine.textContent = `Uploading: ${file.name}...`;
  uploadProgressEl.appendChild(progressLine);

  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file);

  if (uploadError) {
    progressLine.textContent = `Error (${file.name}): ${uploadError.message}`;
    return;
  }

  const insertData = {
    user_id: user.id,
    filename: file.name,
    storage_path: path,
    size: file.size
  };

  if (currentFolder) {
    insertData.folder = currentFolder;
  }

  const { error: dbError } = await sb.from(TABLE).insert(insertData);

  if (dbError) {
    progressLine.textContent = `DB error (${file.name}): ${dbError.message}`;
    return;
  }

  progressLine.remove();
  loadFiles();
}

function handleFiles(fileListObj) {
  [...fileListObj].forEach(uploadFile);
}

fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
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

async function loadFiles() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  // Only MY rows. Without this filter the "anyone can read public files" policy
  // also returns other accounts' public files, which then show up (undeletable) in this drive.
  const [filesRes, foldersRes] = await Promise.all([
    sb.from(TABLE).select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
    sb.from(FOLDERS_TABLE).select("*").eq("user_id", user.id).order("created_at", { ascending: true })
  ]);

  if (filesRes.error) {
    fileListEl.innerHTML = `<p>Error: ${filesRes.error.message}</p>`;
    return;
  }

  allFiles = filesRes.data;
  allFolders = foldersRes.data || [];
  renderToolbar();
  renderFiles();
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
      <button class="folder-tab ${currentFolder === null ? 'active' : ''}" onclick="setFolder(null)">
        ${ICON_FOLDER} All
      </button>
      ${allFolders.map(f => `
        <div class="folder-tab-wrap">
          <button class="folder-tab ${currentFolder === f.name ? 'active' : ''}" onclick="setFolder('${escapeJs(f.name)}')">
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
}

function setFolder(folder) {
  currentFolder = folder;
  renderToolbar();
  renderFiles();
}

async function createFolder() {
  const name = prompt("Folder name:");
  if (!name || !name.trim()) return;
  const trimmed = name.trim();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  if (allFolders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
    showToast("A folder with this name already exists");
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

  currentFolder = trimmed;
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

  if (currentFolder === name) currentFolder = null;
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
    <div class="file-card">
      <div class="file-info">
        <span class="file-name">${escapeHtml(f.filename)}</span>
        <span class="file-meta">${meta}</span>
      </div>
      <div class="file-actions">
        ${isPublic
          ? `<div class="toggle-group">
               <button class="toggle-btn copy-btn" onclick="copyPublicLink(${f.id})" title="Copy link">${ICON_COPY}</button>
               <button class="toggle-btn refresh-btn" onclick="refreshPublicLink(${f.id})" title="Create a new link (the old one stops working)">${ICON_REFRESH}</button>
               <button class="toggle-btn unlink-btn" onclick="unpublishFile(${f.id})" title="Remove from public">${ICON_UNLINK}</button>
             </div>`
          : `<button class="link-btn" onclick="createPublicLink(${f.id})" title="Create public link">${ICON_LINK}</button>`
        }
        <button onclick="downloadFile(${f.id}, '${escapeJs(f.storage_path)}', '${escapeJs(f.filename)}')" title="Download">${ICON_DOWNLOAD}</button>
        <button onclick="deleteFile(${f.id}, '${escapeJs(f.storage_path)}')" title="Delete">${ICON_DELETE}</button>
      </div>
    </div>
  `;
  }).join("");
}

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

async function deleteFile(id, path) {
  if (!(await showConfirm("Delete this file?", "Delete"))) return;

  // 1) Database row first. .select() returns the rows that were actually deleted,
  //    so a silent RLS block (0 rows, no error) can be detected instead of ignored.
  const { data: deletedRows, error } = await sb.from(TABLE).delete().eq("id", id).select();

  if (error) {
    showAlert("Error: " + error.message);
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
    showToast("Deleted, but storage cleanup failed: " + storageError.message);
  } else if (!removed || removed.length === 0) {
    showToast("Deleted from the list, but the stored file may still exist (check the storage delete policy)");
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

async function copyPublicLink(fileId) {
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

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
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
