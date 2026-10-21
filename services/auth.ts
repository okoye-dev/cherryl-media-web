import { BACKEND_URL } from "@/lib/backend-url";
import { saveSession, clearSession, getStoredToken, type AuthUser } from "@/lib/session";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Plain fetch (not the shared client) so a wrong password never opens the sign-in window again.
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
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  } catch {}
  clearSession();
}
