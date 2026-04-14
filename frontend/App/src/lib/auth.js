import { buildApiUrl, getApiBaseUrl, readJsonResponse } from "./api";

const AUTH_TOKEN_KEY = "authToken";
const CURRENT_USER_KEY = "currentUser";
const IS_LOGGED_IN_KEY = "isLoggedIn";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const TOKEN_EXPIRY_BUFFER_MS = 5 * 1000;

function getCookieValue(name) {
  if (typeof document === "undefined") {
    return "";
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const prefix = `${name}=`;

  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return cookie.slice(prefix.length);
    }
  }

  return "";
}

function setCookieValue(name, value, maxAge = AUTH_COOKIE_MAX_AGE) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function removeCookie(name) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

function clearLegacyLocalStorage() {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(IS_LOGGED_IN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function notifyAuthChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("auth-change"));
}

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
  removeCookie(AUTH_TOKEN_KEY);
  removeCookie(CURRENT_USER_KEY);
  removeCookie(IS_LOGGED_IN_KEY);
  clearLegacyLocalStorage();
  notifyAuthChanged();
}

export function getStoredUser() {
  const rawUser = getCookieValue(CURRENT_USER_KEY);

  if (rawUser) {
    try {
      return JSON.parse(decodeURIComponent(rawUser));
    } catch {
      clearClientAuth();
      return null;
    }
  }

  const tokenUser = buildUserFromToken(getStoredToken());

  if (tokenUser) {
    setCookieValue(
      CURRENT_USER_KEY,
      encodeURIComponent(JSON.stringify(tokenUser))
    );
    setCookieValue(IS_LOGGED_IN_KEY, "true");
    clearLegacyLocalStorage();
    return tokenUser;
  }

  if (getStoredToken()) {
    clearClientAuth();
  }

  return null;
}

export function getStoredToken() {
  return decodeURIComponent(getCookieValue(AUTH_TOKEN_KEY));
}

export function storeClientSession({ user, token }) {
  const sessionUser = user || buildUserFromToken(token);

  if (token) {
    setCookieValue(AUTH_TOKEN_KEY, encodeURIComponent(token));
  }

  if (sessionUser) {
    setCookieValue(
      CURRENT_USER_KEY,
      encodeURIComponent(JSON.stringify(sessionUser))
    );
    setCookieValue(IS_LOGGED_IN_KEY, "true");
  }

  clearLegacyLocalStorage();
  notifyAuthChanged();
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
  return typeof window !== "undefined" && Boolean(getApiBaseUrl());
}

export async function fetchCurrentUser() {
  const storedUser = getStoredUser();

  if (!shouldProbeServerSession()) {
    clearClientAuth();
    return { ok: false, error: "No stored session" };
  }

  try {
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

    return { ok: true, user: data.user || storedUser };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Unable to verify session",
    };
  }
}
