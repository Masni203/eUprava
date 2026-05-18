// ============ API klijent ============
//
// Dva backend servisa: zdravstvo (:8080) i otvoreni-podaci (:8081).
// Svaki ima svoj JWT — držimo dva odvojena tokena u localStorage.

const API = {
  zdravstvo: 'http://localhost:8080',
  op:        'http://localhost:8081',
};

const TOKEN_KEY = {
  zdravstvo: 'auth_zdravstvo',
  op:        'auth_op',
};

function getToken(svc)  { try { return localStorage.getItem(TOKEN_KEY[svc]) || null; } catch { return null; } }
function setToken(svc, t) { try { t ? localStorage.setItem(TOKEN_KEY[svc], t) : localStorage.removeItem(TOKEN_KEY[svc]); } catch {} }
function clearTokens()  { setToken('zdravstvo', null); setToken('op', null); }

// JWT payload bez verifikacije (za UI — server validira)
function decodeJwt(token) {
  try {
    const part = token.split('.')[1];
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) {
    return null;
  }
}

function meFromToken(svc) {
  const t = getToken(svc);
  if (!t) return null;
  const c = decodeJwt(t);
  if (!c) return null;
  return {
    uid: c.uid,
    email: c.sub,
    ime: c.ime,
    prezime: c.prezime,
    uloga: c.uloga,           // ADMIN / DOKTOR / PACIJENT / KORISNIK_OP / ADMIN_OP
    exp: c.exp ? c.exp * 1000 : null,
  };
}

class ApiError extends Error {
  constructor(status, body, url) {
    super((body && body.message) || `HTTP ${status}`);
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

async function apiCall(svc, method, path, { body, query, asBlob, anon } = {}) {
  let url = API[svc] + path;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  const headers = { 'Accept': asBlob ? '*/*' : 'application/json' };
  if (body !== undefined && body !== null) headers['Content-Type'] = 'application/json';
  if (!anon) {
    const t = getToken(svc);
    if (t) headers['Authorization'] = 'Bearer ' + t;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  // Server može da vrati svež JWT (npr. posle PUT /me) — automatski ga zameni u localStorage.
  const refreshed = res.headers.get('X-New-Token');
  if (refreshed && !anon) setToken(svc, refreshed);
  if (asBlob) {
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, { message: text || res.statusText }, url);
    }
    return await res.blob();
  }
  let payload = null;
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('json')) payload = await res.json().catch(() => null);
  else if (res.status !== 204) payload = await res.text().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, payload, url);
  return payload;
}

// Convenience
const api = {
  zd: {
    get:    (path, opts) => apiCall('zdravstvo', 'GET',    path, opts),
    post:   (path, body, opts) => apiCall('zdravstvo', 'POST',   path, { body, ...(opts || {}) }),
    put:    (path, body, opts) => apiCall('zdravstvo', 'PUT',    path, { body, ...(opts || {}) }),
    patch:  (path, body, opts) => apiCall('zdravstvo', 'PATCH',  path, { body, ...(opts || {}) }),
    del:    (path, opts) => apiCall('zdravstvo', 'DELETE', path, opts),
    login:  (email, lozinka) => apiCall('zdravstvo', 'POST', '/api/auth/login', { body: { email, lozinka }, anon: true }),
    register: (body) => apiCall('zdravstvo', 'POST', '/api/auth/register', { body, anon: true }),
  },
  op: {
    get:    (path, opts) => apiCall('op', 'GET',    path, opts),
    post:   (path, body, opts) => apiCall('op', 'POST',   path, { body, ...(opts || {}) }),
    put:    (path, body, opts) => apiCall('op', 'PUT',    path, { body, ...(opts || {}) }),
    del:    (path, opts) => apiCall('op', 'DELETE', path, opts),
    login:  (email, lozinka) => apiCall('op', 'POST', '/api/auth/login', { body: { email, lozinka }, anon: true }),
    register: (body) => apiCall('op', 'POST', '/api/auth/register', { body, anon: true }),
  },
};

// Sačuva blob na disk (za /export i /izvestaji?format=CSV)
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

// Mapa backend uloga → UI uloga (deli sa pages-auth.jsx).
function uiRoleFromBackend(uloga) {
  return ({
    'PACIJENT':    'pacijent',
    'DOKTOR':      'doktor',
    'ADMIN':       'admin',
    'KORISNIK_OP': 'op-korisnik',
    'ADMIN_OP':    'op-admin',
  })[uloga];
}

// Vraća prvu validnu sesiju (token nije istekao). Briše istekle tokene.
function activeSession() {
  const now = Date.now();
  const meZd = meFromToken('zdravstvo');
  const meOp = meFromToken('op');
  if (meZd && meZd.exp && meZd.exp <= now) { setToken('zdravstvo', null); }
  if (meOp && meOp.exp && meOp.exp <= now) { setToken('op', null); }
  if (meZd && meZd.exp > now) return { svc: 'zdravstvo', me: meZd, role: uiRoleFromBackend(meZd.uloga) };
  if (meOp && meOp.exp > now) return { svc: 'op', me: meOp, role: uiRoleFromBackend(meOp.uloga) };
  return null;
}

Object.assign(window, { api, apiCall, ApiError, getToken, setToken, clearTokens, decodeJwt, meFromToken, downloadBlob, uiRoleFromBackend, activeSession });
