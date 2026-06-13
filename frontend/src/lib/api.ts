/**
 * API client — base URL from NEXT_PUBLIC_API_URL (see frontend/.env.example).
 * Works locally (http://localhost:8000) and on Vercel (https://your-api.example.com).
 */
const DEFAULT_API_BASE_URL = "http://localhost:8000";

/** Strip trailing slashes so `${base}/api/...` never doubles slashes. */
export function normalizeApiBaseUrl(url: string | undefined): string {
  const trimmed = url?.trim();
  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }
  return trimmed.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export const API_PREFIX = "/api";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
