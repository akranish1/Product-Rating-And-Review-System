import { buildApiUrl, readJsonResponse } from "./api";

export function clearClientAuth() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");
}

export function getStoredUser() {
  const rawUser = localStorage.getItem("currentUser");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    clearClientAuth();
    return null;
  }
}

export async function fetchCurrentUser() {
  const response = await fetch(buildApiUrl("/auth/me"), {
    credentials: "include",
  });

  const data = await readJsonResponse(response).catch(() => ({}));

  if (!response.ok) {
    clearClientAuth();
    return { ok: false, error: data.error || "Unauthorized" };
  }

  if (data.user) {
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    localStorage.setItem("isLoggedIn", "true");
  }

  return { ok: true, user: data.user };
}
