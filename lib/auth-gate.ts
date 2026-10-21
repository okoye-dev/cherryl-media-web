/**
 * The sign-in gate. When a request to the backend is refused because nobody is signed in
 * (or the session ran out), the request does not just fail. It asks the admin screen to open
 * the sign-in window, waits, and then tries again with the new session.
 *
 * Only the admin screen registers a handler, so on the public site a refusal is just an error.
 */

import { clearSession, getStoredToken } from "./session";

type AskToSignIn = (message: string) => Promise<boolean>;

let handler: AskToSignIn | null = null;
let waiting: Promise<boolean> | null = null;

export function registerSignInHandler(h: AskToSignIn | null): void {
  handler = h;
}

/** Opens the sign-in window and resolves true once the person has signed in. Many callers share one window. */
export function askToSignIn(message: string): Promise<boolean> {
  if (!handler) return Promise.resolve(false);
  if (!waiting) {
    waiting = handler(message).finally(() => {
      waiting = null;
    });
  }
  return waiting;
}

/** 401: not signed in or the session ended. 403: signed in as someone who is not an admin. */
export function isAuthRefusal(status: number): boolean {
  return status === 401 || status === 403;
}

/** Paths that must never trigger the window themselves (they are how a person signs in). */
export function isSignInPath(path: string): boolean {
  return path.includes("/api/auth/");
}

/** Drops the stale session, then asks the person to sign in. True when they did. */
export async function recoverFromRefusal(message: string): Promise<boolean> {
  clearSession();
  return askToSignIn(message);
}

/**
 * fetch with the admin session attached. If the backend refuses it, the sign-in window opens and,
 * once the person has signed in, the same request is sent again.
 */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const send = () => {
    const token = getStoredToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  const res = await send();
  if (!isAuthRefusal(res.status) || isSignInPath(input)) return res;

  let message = res.status === 403 ? "This account does not have admin access." : "Sign in to continue.";
  try {
    const body = await res.clone().json();
    if (body && typeof body.error === "string") message = body.error;
  } catch {}

  return (await recoverFromRefusal(message)) ? send() : res;
}
