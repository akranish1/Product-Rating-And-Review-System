function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
  }

  throw new Error("VITE_API_URL is not configured. Set it to your backend API URL.");
}

export function buildApiUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export function buildAssetUrl(path = "") {
  if (!path) {
    return null;
  }

  if (path.startsWith("data:") || path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return buildApiUrl(path);
  }

  return path;
}

export async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from ${response.url || "API"}, but received ${contentType || "unknown content type"} with status ${response.status}.`
    );
  }

  return responseText ? JSON.parse(responseText) : {};
}
