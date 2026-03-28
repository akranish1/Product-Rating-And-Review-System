import { buildApiUrl, getApiBaseUrl, readJsonResponse } from "./api";

const AUTH_TOKEN_KEY = "authToken";
const TOKEN_EXPIRY_BUFFER_MS = 5 * 1000;

function decodeTokenPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const [, payload = ""] = token.split(".");
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return null;
  }
}

function buildUserFromToken(token) {
  const payload = decodeTokenPayload(token);

  if (!payload?.id) {
    return null;
  }

  if (
    typeof payload.exp === "number" &&
    payload.exp * 1000 <= Date.now() + TOKEN_EXPIRY_BUFFER_MS
  ) {
    return null;
  }

  return {
    id: payload.id,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    isVerified: payload.isVerified !== false,
  };
}

export function clearClientAuth() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem("currentUser");

  if (rawUser) {
    try {
      return JSON.parse(rawUser);
    } catch {
      clearClientAuth();
      return null;
    }
  }

  const tokenUser = buildUserFromToken(getStoredToken());

  if (tokenUser) {
    localStorage.setItem("currentUser", JSON.stringify(tokenUser));
    localStorage.setItem("isLoggedIn", "true");
    return tokenUser;
  }

  if (getStoredToken()) {
    clearClientAuth();
  }

  return null;
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function storeClientSession({ user, token }) {
  const sessionUser = user || buildUserFromToken(token);

  if (sessionUser) {
    localStorage.setItem("currentUser", JSON.stringify(sessionUser));
    localStorage.setItem("isLoggedIn", "true");
  }

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthFetchOptions(options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...options,
    headers,
    credentials: "include",
  };
}

function shouldProbeServerSession() {
  if (typeof window === "undefined") {
    return false;
  }

  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl.startsWith("/")) {
    return true;
  }

  try {
    return new URL(apiBaseUrl, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export async function fetchCurrentUser() {
  const storedToken = getStoredToken();
  const storedUser = getStoredUser();

  if (storedToken && storedUser) {
    return { ok: true, user: storedUser };
  }

  if (!storedToken && !shouldProbeServerSession()) {
    clearClientAuth();
    return { ok: false, error: "No stored session" };
  }

  const response = await fetch(
    buildApiUrl("/auth/me"),
    getAuthFetchOptions()
  );

  const data = await readJsonResponse(response).catch(() => ({}));

  if (!response.ok) {
    clearClientAuth();
    return { ok: false, error: data.error || "Unauthorized" };
  }

  storeClientSession(data);

  return { ok: true, user: data.user };
}
