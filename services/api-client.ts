/**
 * Centralized API Client for Cherryl Media
 * Handles base URLs, timeout, JSON serialization, and error normalization.
 */

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
export { getBackendUrl };

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

/** The reply body plus the response headers. Used where the headers carry information (paging). */
export async function requestWithMeta<T>(
  path: string,
  options: RequestOptions = {}
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
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cherryl_newsroom_token");
    if (token) {
      authHeaders["Authorization"] = `Bearer ${token}`;
    }
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
          ? String((errorData as { error: unknown }).error)
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

/** One page of a list, with where it sits in the whole list. */
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Reads a list endpoint that is paged with ?page= and ?pageSize= and reports the totals in headers. */
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
