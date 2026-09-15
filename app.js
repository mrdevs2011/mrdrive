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

const ICON_DOWNLOAD = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 18H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_DELETE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 7L7 19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_LINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_LINK_ACTIVE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/></svg>`;
const ICON_UNLINK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_SEARCH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_FOLDER = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

const BUCKET = "files";
const TABLE = "files";
const FOLDERS_TABLE = "folders";
const FAKE_EMAIL_DOMAIN = "mrdrive.local";

// State
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

function showPublicDownloadModal(token) {
  const modal = document.createElement("div");
  modal.id = "public-modal";
  modal.innerHTML = `
    <div class="public-modal-backdrop">
      <div class="public-modal-box">
        <div class="public-modal-icon">${ICON_DOWNLOAD}</div>
        <h2 id="public-filename">Yuklanmoqda...</h2>
        <p id="public-meta" class="public-meta"></p>
        <p id="public-expiry" class="public-expiry"></p>
        <button id="public-download-btn" disabled>Yuklab olish</button>
        <p id="public-status" class="public-status"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const filenameEl = document.getElementById("public-filename");
  const metaEl = document.getElementById("public-meta");
  const expiryEl = document.getElementById("public-expiry");
  const statusEl = document.getElementById("public-status");
  const downloadBtn = document.getElementById("public-download-btn");

  sb.from(TABLE)
    .select("*")
    .eq("public_token", token)
    .eq("is_public", true)
    .single()
    .then(({ data, error }) => {
      if (error || !data) {
        filenameEl.textContent = "Fayl topilmadi";
        metaEl.textContent = "Bu link o'chirilgan yoki mavjud emas.";
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        filenameEl.textContent = "Muddati o'tgan";
        metaEl.textContent = "Bu linkning muddati tugagan.";
        return;
      }

      filenameEl.textContent = data.filename;
      metaEl.textContent = `${formatSize(data.size)} · ${formatDate(data.uploaded_at)}`;

      if (data.expires_at) {
        expiryEl.textContent = `Muddat: ${formatDate(data.expires_at)} gacha`;
      } else {
        expiryEl.textContent = "Muddat: cheksiz";
      }

      downloadBtn.disabled = false;

      downloadBtn.onclick = async () => {
        statusEl.textContent = "Yuklanmoqda...";

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
      };
    });
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
    authStatus.textContent = "Hammasini to'ldir, bratan.";
    return;
  }
  if (password.length < 6) {
    authStatus.textContent = "Parol kamida 6 ta belgi bo'lsin.";
    return;
  }

  authStatus.textContent = "Ro'yxatdan o'tkazilmoqda...";
  const fakeEmail = usernameToEmail(username);

  const { data, error } = await sb.auth.signUp({
    email: fakeEmail,
    password,
    options: { data: { name, username } }
  });

  if (error) {
    if (error.message.includes("already registered")) {
      authStatus.textContent = "Bu username band, boshqasini tanla.";
    } else {
      authStatus.textContent = "Xato: " + error.message;
    }
    return;
  }

  authStatus.textContent = data.session ? "" : "Ro'yxatdan o'tdi. Kirish sahifasiga o't.";
}

async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    authStatus.textContent = "Username va parolni kirit.";
    return;
  }

  authStatus.textContent = "Tekshirilmoqda...";
  const fakeEmail = usernameToEmail(username);
  const { error } = await sb.auth.signInWithPassword({ email: fakeEmail, password });

  if (error) {
    authStatus.textContent = "Xato: username yoki parol noto'g'ri.";
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
    alert(`Bloklangan: ${file.name} — bu turdagi fayllar xavfsizlik sababli ruxsat etilmagan.`);
    return;
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${Date.now()}_${safeName}`;

  const progressLine = document.createElement("div");
  progressLine.textContent = `Yuklanmoqda: ${file.name}...`;
  uploadProgressEl.appendChild(progressLine);

  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file);

  if (uploadError) {
    progressLine.textContent = `Xato (${file.name}): ${uploadError.message}`;
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
    progressLine.textContent = `DB xato (${file.name}): ${dbError.message}`;
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
  const [filesRes, foldersRes] = await Promise.all([
    sb.from(TABLE).select("*").order("uploaded_at", { ascending: false }),
    sb.from(FOLDERS_TABLE).select("*").order("created_at", { ascending: true })
  ]);

  if (filesRes.error) {
    fileListEl.innerHTML = `<p>Xato: ${filesRes.error.message}</p>`;
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
      <input type="text" id="search-input" placeholder="Fayl qidirish..." value="${escapeHtml(currentSearch)}" />
    </div>
    <div class="folder-tabs">
      <button class="folder-tab ${currentFolder === null ? 'active' : ''}" onclick="setFolder(null)">
        ${ICON_FOLDER} Hammasi
      </button>
      ${allFolders.map(f => `
        <div class="folder-tab-wrap">
          <button class="folder-tab ${currentFolder === f.name ? 'active' : ''}" onclick="setFolder('${escapeJs(f.name)}')">
            ${ICON_FOLDER} ${escapeHtml(f.name)}
          </button>
          <button class="folder-del-btn" onclick="deleteFolder(${f.id}, '${escapeJs(f.name)}')" title="Papkani o'chirish">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      `).join("")}
      <button class="folder-tab new-folder-btn" onclick="createFolder()">+ Papka</button>
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
  const name = prompt("Papka nomi:");
  if (!name || !name.trim()) return;
  const trimmed = name.trim();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  if (allFolders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
    showToast("Bu nomdagi papka allaqachon mavjud");
    return;
  }

  const { error } = await sb.from(FOLDERS_TABLE).insert({
    user_id: user.id,
    name: trimmed
  });

  if (error) {
    alert("Xato: " + error.message);
    return;
  }

  currentFolder = trimmed;
  showToast(`Papka yaratildi: ${trimmed}`);
  loadFiles();
}

async function deleteFolder(id, name) {
  const filesInFolder = allFiles.filter(f => f.folder === name);
  let msg = `"${name}" papkasi o'chirilsinmi?`;
  if (filesInFolder.length > 0) {
    msg += `\n\nDiqqat: bu papkada ${filesInFolder.length} ta fayl bor. Ular "Hammasi" bo'limiga o'tadi (o'chmaydi).`;
  }

  if (!confirm(msg)) return;

  if (filesInFolder.length > 0) {
    await sb.from(TABLE).update({ folder: null }).eq("folder", name);
  }

  const { error } = await sb.from(FOLDERS_TABLE).delete().eq("id", id);

  if (error) {
    alert("Xato: " + error.message);
    return;
  }

  if (currentFolder === name) currentFolder = null;
  showToast("Papka o'chirildi");
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
      fileListEl.innerHTML = `<p class="empty">Hali fayl yo'q.</p>`;
    } else {
      fileListEl.innerHTML = `<p class="empty">Hech narsa topilmadi.</p>`;
    }
    return;
  }

  fileListEl.innerHTML = filtered.map(f => {
    const isPublic = f.is_public && f.public_token;
    const isExpired = f.expires_at && new Date(f.expires_at) < new Date();
    const linkIcon = isPublic ? ICON_LINK_ACTIVE : ICON_LINK;
    const linkTitle = isPublic ? "Yangi link yaratish (eskisi o'chadi)" : "Public link yaratish";
    const linkClass = isPublic ? "link-btn active" : "link-btn";

    let meta = `${formatSize(f.size)} · ${formatDate(f.uploaded_at)}`;
    if (f.download_count > 0) {
      meta += ` · ${f.download_count} yuklab olish`;
    }
    if (isPublic && !isExpired) {
      meta += ` · <span class="public-badge">Public</span>`;
      if (f.expires_at) {
        meta += ` · <span class="expiry-badge">${formatDate(f.expires_at)} gacha</span>`;
      } else {
        meta += ` · <span class="expiry-badge">Cheksiz</span>`;
      }
    }
    if (isExpired) {
      meta += ` · <span class="expired-badge">Muddati o'tgan</span>`;
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
        <button class="${linkClass}" onclick="togglePublicLink(${f.id})" title="${linkTitle}">${linkIcon}</button>
        ${isPublic ? `<button class="unlink-btn" onclick="unpublishFile(${f.id})" title="Public'dan olib tashlash">${ICON_UNLINK}</button>` : ''}
        <button onclick="downloadFile(${f.id}, '${escapeJs(f.storage_path)}', '${escapeJs(f.filename)}')" title="Yuklab olish">${ICON_DOWNLOAD}</button>
        <button onclick="deleteFile(${f.id}, '${escapeJs(f.storage_path)}')" title="O'chirish">${ICON_DELETE}</button>
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
    alert("Xato: " + error.message);
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

async function deleteFile(id, path) {
  if (!confirm("O'chirasanmi?")) return;
  await sb.storage.from(BUCKET).remove([path]);
  await sb.from(TABLE).delete().eq("id", id);
  loadFiles();
}

// ==========================================
// PUBLIC LINK
// ==========================================

async function togglePublicLink(fileId) {
  const { data: file, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("id", fileId)
    .single();

  if (error || !file) {
    alert("Xato: fayl topilmadi.");
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
      alert("Xato: " + updateError.message);
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?share=${newToken}`;
    await copyToClipboard(url);

    if (file.is_public && file.public_token) {
      showToast("Yangi link yaratildi, eskisi o'chdi");
    } else {
      showToast("Public link yaratildi va nusxalandi");
    }

    loadFiles();
  });
}

async function unpublishFile(fileId) {
  if (!confirm("Public'dan olib tashlansinmi? Link endi ishlamaydi.")) return;

  const { error } = await sb
    .from(TABLE)
    .update({ is_public: false, public_token: null, expires_at: null })
    .eq("id", fileId);

  if (error) {
    alert("Xato: " + error.message);
    return;
  }

  showToast("Public'dan olib tashlandi");
  loadFiles();
}

function showDurationPicker(onSelect) {
  const existing = document.getElementById("duration-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "duration-modal";
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <h3>Link muddati</h3>
        <p class="modal-desc">Link qancha vaqt ishlaydi?</p>
        <div class="duration-options">
          <button data-value="1">1 kun</button>
          <button data-value="7">7 kun</button>
          <button data-value="30">30 kun</button>
          <button data-value="unlimited" class="default-opt">Cheksiz</button>
        </div>
        <button class="modal-cancel" onclick="document.getElementById('duration-modal').remove()">Bekor qilish</button>
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
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeJs(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
