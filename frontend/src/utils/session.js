// src/utils/session.js

export function saveSession(token, user) {
  localStorage.setItem("saas_token", token);
  localStorage.setItem("saas_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("saas_token");
  localStorage.removeItem("saas_user");
}

export function loadSession() {
  const token = localStorage.getItem("saas_token");
  const userStr = localStorage.getItem("saas_user");
  return { token, user: userStr ? JSON.parse(userStr) : null };
}
