import type { IApiClient } from "../contracts/IApiClient";
import type { IAuthService, AuthUser, LoginResponse } from "../contracts/IAuthService";

const TOKEN_KEY = "cherryl_newsroom_token";
const USER_KEY = "cherryl_newsroom_user";

export class AuthService implements IAuthService {
  constructor(private readonly client: IApiClient) {}

  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getStoredToken());
  }

  private saveSession(token: string, user: AuthUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.cookie = `cherryl_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }

  private clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "cherryl_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.client.post<LoginResponse>("/api/auth/login", { email, password });
    this.saveSession(data.token, data.user);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post<void>("/api/auth/logout");
    } catch {
      // Best effort remote logout
    }
    this.clearSession();
  }

  async getMe(): Promise<AuthUser | null> {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      return await this.client.get<AuthUser>("/api/auth/me");
    } catch {
      this.clearSession();
      return null;
    }
  }
}
