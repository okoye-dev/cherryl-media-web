import { isAuthRefusal, isSignInPath, recoverFromRefusal } from "@/lib/auth-gate";
import type { IApiClient, RequestOptions } from "../contracts/IApiClient";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient implements IApiClient {
  private tokenProvider?: () => string | null;

  constructor(
    private readonly baseUrl: string,
    options?: { tokenProvider?: () => string | null }
  ) {
    this.tokenProvider = options?.tokenProvider;
  }

  public setTokenProvider(provider: () => string | null) {
    this.tokenProvider = provider;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    try {
      return await this.send<T>(path, options);
    } catch (err) {
      if (err instanceof ApiError && isAuthRefusal(err.status) && !isSignInPath(path) && (await recoverFromRefusal(err.message))) {
        return this.send<T>(path, options);
      }
      throw err;
    }
  }

  private async send<T>(path: string, options: RequestOptions): Promise<T> {
    const { timeoutMs = 8000, params, headers, ...rest } = options;

    let url = path.startsWith("http")
      ? path
      : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes("?") ? "&" : "?") + qs;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const token = this.tokenProvider ? this.tokenProvider() : null;
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        const message =
          typeof errorData === "object" && errorData !== null && "error" in errorData
            ? typeof (errorData as { error: unknown }).error === "object"
              ? ((errorData as { error: { message?: string } }).error?.message || "API Error")
              : String((errorData as { error: unknown }).error)
            : `HTTP ${response.status}: ${response.statusText}`;

        throw new ApiError(message, response.status, errorData);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(`Request timeout after ${timeoutMs}ms`, 408);
      }
      throw new ApiError(error instanceof Error ? error.message : "Network error", 0);
    }
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET", params });
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}
