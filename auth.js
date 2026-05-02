// ─── GATE Prep ML · auth.js ────────────────────────────────────────────────
// Client-side auth using localStorage. Replace with a real backend (Supabase,
// Firebase Auth, etc.) for production use.

const Auth = (() => {

  // ── Storage Keys ───────────────────────────────────────────────────────
  const USERS_KEY   = 'gateml_users';
  const SESSION_KEY = 'gateml_session';
  const HISTORY_KEY = 'gateml_history';

  // ── Helpers ────────────────────────────────────────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function hashPassword(pw) {
    // Simple deterministic hash — for demo. Use bcrypt/Argon2 server-side in production.
    let h = 0;
    for (let i = 0; i < pw.length; i++) {
      h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
    }
    return h.toString(16);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ── Session ────────────────────────────────────────────────────────────
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  }
  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, ts: Date.now() }));
  }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    // Expire after 7 days
    if (Date.now() - s.ts > 7 * 24 * 3600 * 1000) { clearSession(); return null; }
    return s;
  }

  // ── Register ───────────────────────────────────────────────────────────
  function register({ name, email, password }) {
    if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };
    if (password.length < 6)          return { ok: false, error: 'Password must be at least 6 characters.' };
    if (!/\S+@\S+\.\S+/.test(email))  return { ok: false, error: 'Enter a valid email address.' };

    const users = getUsers();
    const key   = email.toLowerCase().trim();
    if (users[key]) return { ok: false, error: 'An account with this email already exists.' };

    const user = {
      id:        generateId(),
      name:      name.trim(),
      email:     key,
      password:  hashPassword(password),
      createdAt: Date.now(),
      avatar:    name.trim()[0].toUpperCase(),
    };
    users[key] = user;
    saveUsers(users);
    const { password: _, ...safe } = user;
    setSession(safe);
    return { ok: true, user: safe };
  }

  // ── Login ──────────────────────────────────────────────────────────────
  function login({ email, password }) {
    if (!email || !password) return { ok: false, error: 'Email and password are required.' };

    const users = getUsers();
    const key   = email.toLowerCase().trim();
    const user  = users[key];
    if (!user)                              return { ok: false, error: 'No account found with that email.' };
    if (user.password !== hashPassword(password)) return { ok: false, error: 'Incorrect password.' };

    const { password: _, ...safe } = user;
    setSession(safe);
    return { ok: true, user: safe };
  }

  // ── Logout ─────────────────────────────────────────────────────────────
  function logout() { clearSession(); }

  // ── Test History ───────────────────────────────────────────────────────
  function saveTestResult(userId, result) {
    const all = getAllHistory();
    if (!all[userId]) all[userId] = [];
    all[userId].unshift({ ...result, id: generateId(), date: Date.now() });
    // Keep last 20 tests per user
    if (all[userId].length > 20) all[userId] = all[userId].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  }

  function getUserHistory(userId) {
    const all = getAllHistory();
    return all[userId] || [];
  }

  function getAllHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); } catch { return {}; }
  }

  // ── Profile Update ─────────────────────────────────────────────────────
  function updateProfile(userId, { name }) {
    const users = getUsers();
    const user  = Object.values(users).find(u => u.id === userId);
    if (!user) return { ok: false, error: 'User not found.' };
    user.name   = name.trim();
    user.avatar = name.trim()[0].toUpperCase();
    users[user.email] = user;
    saveUsers(users);
    const { password: _, ...safe } = user;
    setSession(safe);
    return { ok: true, user: safe };
  }

  return { register, login, logout, currentUser, saveTestResult, getUserHistory, updateProfile };
})();
