// A request refused because nobody is signed in asks the admin screen to open the sign-in window,
// waits, then retries. Only the admin registers a handler, so on the public site a refusal is just an error.

import { clearSession, getStoredToken } from "./session";

type AskToSignIn = (message: string) => Promise<boolean>;

let handler: AskToSignIn | null = null;
let waiting: Promise<boolean> | null = null;

export function registerSignInHandler(h: AskToSignIn | null): void {
  handler = h;
}

function askToSignIn(message: string): Promise<boolean> {
  if (!handler) return Promise.resolve(false);
  if (!waiting) {
    waiting = handler(message).finally(() => {
      waiting = null;
    });
  }
  return waiting;
}

export function isAuthRefusal(status: number): boolean {
  return status === 401 || status === 403;
}

export function isSignInPath(path: string): boolean {
  return path.includes("/api/auth/");
}

export async function recoverFromRefusal(message: string): Promise<boolean> {
  clearSession();
  return askToSignIn(message);
}

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
