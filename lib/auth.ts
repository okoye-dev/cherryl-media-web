/**
 * Authentication Client for Cherryl Media Newsroom
 * Handles JWT token storage, login, logout, and current user retrieval.
 */

import { BACKEND_URL } from "./backend-url";

export const TOKEN_KEY = "cherryl_newsroom_token";
/** Fired on the window whenever someone signs in or out, so the header can update. */
export const SESSION_EVENT = "cherryl:session-changed";
const USER_KEY = "cherryl_newsroom_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also store in cookie for server-side / proxy consistency
  document.cookie = `cherryl_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "cherryl_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let errorMsg = "Login failed. Please check your credentials.";
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new Error(errorMsg);
  }

  const data: LoginResponse = await res.json();
  saveSession(data.token, data.user);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    const token = getStoredToken();
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {}
  clearSession();
}

export async function getMe(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const user: AuthUser = await res.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
  } catch {}

  return getStoredUser();
}
