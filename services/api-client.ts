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

import { getBackendUrl } from "@/lib/backend-url";
import { getStoredToken } from "@/lib/session";
import { isAuthRefusal, isSignInPath, recoverFromRefusal } from "@/lib/auth-gate";

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

/** Reply body plus headers. If nobody is signed in, the sign-in window opens and the request is retried once after sign-in. */
async function requestWithMeta<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; headers: Headers }> {
  try {
    return await send<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && isAuthRefusal(err.status) && !isSignInPath(path) && (await recoverFromRefusal(err.message))) {
      return send<T>(path, options);
    }
    throw err;
  }
}

async function send<T>(
  path: string,
  options: RequestOptions
): Promise<{ data: T; headers: Headers }> {
  const { timeoutMs = 8000, params, headers, ...rest } = options;

  let url = path.startsWith("http") ? path : `${getBackendUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const authHeaders: Record<string, string> = {};
  const token = getStoredToken();
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      credentials: rest.credentials || "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders,
        ...headers,
      },
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
            ? (errorData as { error: { message?: string } }).error?.message || "API Error"
            : String((errorData as { error: unknown }).error)
          : `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(message, response.status, errorData);
    }

    if (response.status === 204) {
      return { data: {} as T, headers: response.headers };
    }

    return { data: (await response.json()) as T, headers: response.headers };
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

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return (await requestWithMeta<T>(path, options)).data;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function requestPaged<T>(path: string, options: RequestOptions = {}): Promise<Paged<T>> {
  const { data, headers } = await requestWithMeta<T[] | { items?: T[] }>(path, options);
  const items = Array.isArray(data) ? data : (data as { items?: T[] }).items ?? [];
  const num = (name: string, fallback: number) => {
    const n = Number(headers.get(name));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const total = Number(headers.get("X-Total-Count"));
  return {
    items,
    total: Number.isFinite(total) && headers.get("X-Total-Count") !== null ? total : items.length,
    page: num("X-Page", 1),
    pageSize: num("X-Page-Size", items.length || 1),
    totalPages: Math.max(1, Number(headers.get("X-Total-Pages")) || 1),
  };
}
