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

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  getMe(): Promise<AuthUser | null>;
  getStoredUser(): AuthUser | null;
  getStoredToken(): string | null;
  isAuthenticated(): boolean;
}
