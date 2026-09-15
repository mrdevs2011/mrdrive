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

// Boot: session bor-yo'qligini avval tekshirib, keyingina to'g'ri ekranni ko'rsatamiz
sb.auth.getSession().then(({ data: { session } }) => {
  bootLoader.style.display = "none";
  if (session) {
    authScreen.style.display = "none";
    appScreen.style.display = "block";
  } else {
    authScreen.style.display = "flex";
  }
});

const BUCKET = "files";
const TABLE = "files";

// ---------- AUTH ----------

const FAKE_EMAIL_DOMAIN = "mrdrive.local";

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

  if (data.session) {
    authStatus.textContent = "";
  } else {
    authStatus.textContent = "Ro'yxatdan o'tdi. Kirish sahifasiga o't.";
  }
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
  if (bootLoader.style.display !== "none") return; // boot tugagunicha bu ishlamasin
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

// ---------- UPLOAD ----------

// Ishga tushiriladigan / zararli bo'lishi mumkin bo'lgan kengaytmalar - bloklanadi
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

  const { error: uploadError } = await sb.storage
    .from(BUCKET)
    .upload(path, file);

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
dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});
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

// ---------- LIST + DOWNLOAD + DELETE ----------

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

  fileListEl.innerHTML = files.map(f => `
    <div class="file-card">
      <div class="file-info">
        <span class="file-name">${escapeHtml(f.filename)}</span>
        <span class="file-meta">${formatSize(f.size)} · ${formatDate(f.uploaded_at)}</span>
      </div>
      <div class="file-actions">
        <button onclick="downloadFile('${f.storage_path}', '${escapeHtml(f.filename)}')" title="Yuklab olish">${ICON_DOWNLOAD}</button>
        <button onclick="deleteFile(${f.id}, '${f.storage_path}')" title="O'chirish">${ICON_DELETE}</button>
      </div>
    </div>
  `).join("");
}

async function downloadFile(path, filename) {
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(path, 60);

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

// ---------- HELPERS ----------

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
