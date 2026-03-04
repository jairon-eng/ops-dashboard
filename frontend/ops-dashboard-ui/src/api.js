import { getToken, clearToken } from "./auth/token";

// Si no quieres .env todavía, esto funciona igual:
const API_BASE = ""; 
// O si tu frontend y backend están en distintos hosts/puertos:
// const API_BASE = "https://localhost:5001";

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
   window.dispatchEvent(new CustomEvent("auth:loggedOut", { detail: { reason: "expired" } }));
    throw new Error("Unauthorized (token inválido o expirado)");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return await res.json();
}

// Públicos (sin auth)
export const apiGet = (path) => request(path);
export const apiLogin = (username, password) =>
  request("/api/Auth/login", { method: "POST", body: { username, password } });

// Protegidos (con auth)
export const apiPost = (path, body) => request(path, { method: "POST", body, auth: true });
export const apiPatch = (path, body) => request(path, { method: "PATCH", body, auth: true });