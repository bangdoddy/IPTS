// src/libs/auth.ts
import { deleteCookie, getCookieJson, setCookieJson } from "./cookie";

export const AUTH_COOKIE_NAME = "inovasis_auth";

export type ActorType = string;

export type AuthUser = {
  nrp: string;
  nama: string;
  email: string;
  jobsite: string;
  actortype: ActorType; // "REVIEWER" | "SUPERIOR" | dll
};

export type AuthCookieOptions = {
  days?: number;
  path?: string;
  domain?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

const DEFAULT_OPT: Required<Pick<AuthCookieOptions, "days" | "path" | "sameSite">> = {
  days: 1,
  path: "/",
  sameSite: "Lax",
};

export function authSet(user: AuthUser, opt: AuthCookieOptions = {}) {
  setCookieJson(AUTH_COOKIE_NAME, user, {
    days: opt.days ?? DEFAULT_OPT.days,
    path: opt.path ?? DEFAULT_OPT.path,
    domain: opt.domain,
    sameSite: opt.sameSite ?? DEFAULT_OPT.sameSite,
    secure: opt.secure, // auto di cookie.ts kalau undefined
  });
}

export function authGet(): AuthUser | null {
  return getCookieJson<AuthUser>(AUTH_COOKIE_NAME);
}

/**
 * Hapus cookie auth.
 * Kalau environment kamu pakai https + secure cookie,
 * hapusnya kadang perlu attempt beberapa kombinasi.
 */
export function authClear(opt: Pick<AuthCookieOptions, "path" | "domain" | "sameSite" | "secure"> = {}) {
  const path = opt.path ?? DEFAULT_OPT.path;

  // attempt normal
  deleteCookie(AUTH_COOKIE_NAME, { path, domain: opt.domain, sameSite: opt.sameSite, secure: opt.secure });

  // fallback attempts (biar lebih "kebal")
  deleteCookie(AUTH_COOKIE_NAME, { path, domain: opt.domain, sameSite: "Lax", secure: false });
  deleteCookie(AUTH_COOKIE_NAME, { path, domain: opt.domain, sameSite: "Lax", secure: true });
  deleteCookie(AUTH_COOKIE_NAME, { path, domain: opt.domain, sameSite: "None", secure: true });
}

function isValidEmail(email: string): boolean {
  // validasi ringan aja (cukup untuk cookie sanity check)
  const e = email.trim();
  return e.length >= 5 && e.includes("@") && e.includes(".");
}

// ✅ validasi cookie (biar gak bypass dengan cookie kosong/acak)
export function authIsValid(u: AuthUser | null): u is AuthUser {
  if (!u) return false;

  const nrp = String(u.nrp ?? "").trim();
  const nama = String(u.nama ?? "").trim();
  const email = String(u.email ?? "").trim();
  const jobsite = String(u.jobsite ?? "").trim();
  const actortype = String(u.actortype ?? "").trim();

  if (!nrp || !nama || !email || !actortype) return false;
  if (!isValidEmail(email)) return false;

  return true;
}

// ✅ helper: ambil user valid atau null
export function authUserOrNull(): AuthUser | null {
  const u = authGet();
  return authIsValid(u) ? u : null;
}
