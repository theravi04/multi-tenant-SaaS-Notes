export async function apiFetch(path, token, options = {}) {
const API_BASE = "https://multi-tenant-saas-notes.onrender.com";
// const API_BASE = "http://localhost:4000";
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = options.headers || {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!options.body && options.json) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.json);
  }
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    json = text;
  }
  if (!res.ok) {
    const err = new Error(
      (json && json.message) || res.statusText || "API error"
    );
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}