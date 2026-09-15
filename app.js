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

const BUCKET = "files";
const TABLE = "files";
const FAKE_EMAIL_DOMAIN = "mrdrive.local";

// ==========================================
// PUBLIC LINK MODAL — URL parametri orqali
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
        <button id="public-download-btn" disabled>Yuklab olish</button>
        <p id="public-status" class="public-status"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const filenameEl = document.getElementById("public-filename");
  const metaEl = document.getElementById("public-meta");
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

      filenameEl.textContent = data.filename;
      metaEl.textContent = `${formatSize(data.size)} · ${formatDate(data.uploaded_at)}`;
      downloadBtn.disabled = false;

      downloadBtn.onclick = async () => {
        statusEl.textContent = "Yuklanmoqda...";
        const { data: urlData, error: urlError } = await sb.storage
          .from(BUCKET)
          .createSignedUrl(data.storage_path, 60);

        if (urlError) {
          statusEl.textContent = "Xato: " + urlError.message;
          return;
        }

        const a = document.createElement("a");
        a.href = urlData.signedUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        statusEl.textContent = "Yuklab olindi ✓";
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

  const { error: dbError } = await sb.from(TABLE).insert({
    user_id: user.id,
    filename: file.name,
    storage_path: path,
    size: file.size
  });

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
// LIST + DOWNLOAD + DELETE + PUBLIC LINK
// ==========================================

async function loadFiles() {
  const { data: files, error } = await sb
    .from(TABLE)
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    fileListEl.innerHTML = `<p>Xato: ${error.message}</p>`;
    return;
  }

  if (!files.length) {
    fileListEl.innerHTML = `<p class="empty">Hali fayl yo'q.</p>`;
    return;
  }

  fileListEl.innerHTML = files.map(f => {
    const isPublic = f.is_public && f.public_token;
    const linkIcon = isPublic ? ICON_LINK_ACTIVE : ICON_LINK;
    const linkTitle = isPublic ? "Yangi link yaratish (eskisi o'chadi)" : "Public link yaratish";
    const linkClass = isPublic ? "link-btn active" : "link-btn";

    return `
    <div class="file-card">
      <div class="file-info">
        <span class="file-name">${escapeHtml(f.filename)}</span>
        <span class="file-meta">${formatSize(f.size)} · ${formatDate(f.uploaded_at)}${isPublic ? ' · <span class="public-badge">Public</span>' : ''}</span>
      </div>
      <div class="file-actions">
        <button class="${linkClass}" onclick="togglePublicLink(${f.id})" title="${linkTitle}">${linkIcon}</button>
        <button onclick="downloadFile('${f.storage_path}', '${escapeHtml(f.filename)}')" title="Yuklab olish">${ICON_DOWNLOAD}</button>
        <button onclick="deleteFile(${f.id}, '${f.storage_path}')" title="O'chirish">${ICON_DELETE}</button>
      </div>
    </div>
  `;
  }).join("");
}

async function downloadFile(path, filename) {
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) {
    alert("Xato: " + error.message);
    return;
  }
  window.open(data.signedUrl, "_blank");
}

async function deleteFile(id, path) {
  if (!confirm("O'chirasanmi?")) return;
  await sb.storage.from(BUCKET).remove([path]);
  await sb.from(TABLE).delete().eq("id", id);
  loadFiles();
}

// ==========================================
// PUBLIC LINK — har bosganda yangi token
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

  // Har doim yangi token yaratamiz (eski link o'chadi)
  const newToken = generateToken();

  const { error: updateError } = await sb
    .from(TABLE)
    .update({ is_public: true, public_token: newToken })
    .eq("id", fileId);

  if (updateError) {
    alert("Xato: " + updateError.message);
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}?share=${newToken}`;
  await copyToClipboard(url);

  if (file.is_public && file.public_token) {
    showToast("Yangi link yaratildi — eskisi o'chdi ✓");
  } else {
    showToast("Public link yaratildi va nusxalandi ✓");
  }

  loadFiles();
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
