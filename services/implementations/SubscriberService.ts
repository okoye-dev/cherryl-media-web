import type { IApiClient } from "../contracts/IApiClient";
import type { ISubscriberService, PostSubscriber, SubscribersPage } from "../contracts/ISubscriberService";

export class SubscriberService implements ISubscriberService {
  constructor(private readonly client: IApiClient) {}

  async getSubscribers(activeOnly = true, page = 1, pageSize = 25): Promise<SubscribersPage> {
    const res = await this.client.get<Partial<SubscribersPage>>(
      "/api/subscribers",
      { activeOnly: activeOnly ? "true" : "false", page, pageSize },
      { cache: "no-store" }
    );
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

  async addSubscriber(email: string, name = "", categories: string[] = []): Promise<PostSubscriber> {
    const res = await this.client.post<{ success: boolean; subscriber: PostSubscriber }>("/api/subscribers", {
      email,
      name,
      categories,
    });
    return res.subscriber;
  }

  async removeSubscriber(email: string): Promise<boolean> {
    const res = await this.client.delete<{ success: boolean }>(`/api/subscribers?email=${encodeURIComponent(email)}`);
    return res.success;
  }
}
