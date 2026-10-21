import { request } from "./api-client";

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  categories: string[];
  active: boolean;
  createdAt: string;
}

export interface SubscribersPage {
  subscribers: Subscriber[];
  count: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchSubscribers(activeOnly = true, page = 1, pageSize = 25): Promise<SubscribersPage> {
  const res = await request<Partial<SubscribersPage>>("/api/subscribers", {
    params: { activeOnly: activeOnly ? "true" : "false", page, pageSize },
    cache: "no-store",
  });
  const subscribers = Array.isArray(res.subscribers) ? res.subscribers : [];
  return {
    subscribers,
    count: res.count ?? subscribers.length,
    total: res.total ?? subscribers.length,
    page: res.page ?? page,
    pageSize: res.pageSize ?? pageSize,
    totalPages: Math.max(1, res.totalPages ?? 1),
  };
}

export async function addSubscriber(email: string, name = "", categories: string[] = []): Promise<Subscriber> {
  const res = await request<{ success: boolean; subscriber: Subscriber }>("/api/subscribers", {
    method: "POST",
    body: JSON.stringify({ email, name, categories }),
  });
  return res.subscriber;
}

export async function removeSubscriber(email: string): Promise<boolean> {
  const res = await request<{ success: boolean }>(`/api/subscribers?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  return res.success;
}
