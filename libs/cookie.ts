// src/libs/cookie.ts
type SameSite = "Lax" | "Strict" | "None";

export type CookieOptions = {
  days?: number;           // default 1
  path?: string;           // default "/"
  domain?: string;         // optional (kalau cookie diset dengan domain)
  sameSite?: SameSite;     // default "Lax"
  secure?: boolean;        // default auto (true jika https, atau sameSite None)
};

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function isHttps(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:";
}

function encode(v: string) {
  return encodeURIComponent(v);
}

function decode(v: string) {
  return decodeURIComponent(v);
}

function buildCookieString(name: string, value: string, opt: CookieOptions = {}) {
  const days = opt.days ?? 1;
  const path = opt.path ?? "/";
  const sameSite = opt.sameSite ?? "Lax";

  // Browser modern: SameSite=None HARUS Secure
  const secure =
    opt.secure ?? (sameSite === "None" ? true : isHttps());

  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  let cookie = `${encode(name)}=${encode(value)}; Expires=${expires}; Path=${path}; SameSite=${sameSite}`;

  if (opt.domain) cookie += `; Domain=${opt.domain}`;
  if (secure) cookie += "; Secure";

  return cookie;
}

export function setCookie(name: string, value: string, opt: CookieOptions = {}) {
  if (!isBrowser()) return;
  document.cookie = buildCookieString(name, value, opt);
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const key = encode(name) + "=";
  const parts = document.cookie ? document.cookie.split("; ") : [];

  for (const part of parts) {
    if (part.startsWith(key)) return decode(part.slice(key.length));
  }
  return null;
}

export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Hapus cookie (default path "/").
 * IMPORTANT:
 * - Cookie hanya bisa dihapus jika path/domain cocok dengan saat cookie dibuat.
 * - Kalau kamu pernah set cookie dengan domain tertentu, isi opt.domain juga.
 */
export function deleteCookie(
  name: string,
  opt: { path?: string; domain?: string; sameSite?: SameSite; secure?: boolean } = {}
) {
  if (!isBrowser()) return;

  const path = opt.path ?? "/";
  const sameSite = opt.sameSite ?? "Lax";
  const secure = opt.secure ?? isHttps();

  let cookie = `${encode(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}; SameSite=${sameSite}`;
  if (opt.domain) cookie += `; Domain=${opt.domain}`;
  if (secure) cookie += "; Secure";

  document.cookie = cookie;
}

export function setCookieJson<T>(name: string, value: T, opt: CookieOptions = {}) {
  setCookie(name, JSON.stringify(value), opt);
}

export function getCookieJson<T>(name: string): T | null {
  const raw = getCookie(name);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Debug helper (optional)
export function getAllCookies(): Record<string, string> {
  if (!isBrowser()) return {};
  const out: Record<string, string> = {};
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx <= 0) continue;
    const k = decode(p.slice(0, idx));
    const v = decode(p.slice(idx + 1));
    out[k] = v;
  }
  return out;
}
