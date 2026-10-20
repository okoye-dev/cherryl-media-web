import type { IApiClient } from "../contracts/IApiClient";
import type { ISubscriberService, PostSubscriber } from "../contracts/ISubscriberService";

export class SubscriberService implements ISubscriberService {
  constructor(private readonly client: IApiClient) {}

  async getSubscribers(activeOnly = true): Promise<PostSubscriber[]> {
    const res = await this.client.get<{ subscribers: PostSubscriber[]; count: number }>("/api/subscribers", {
      activeOnly: activeOnly ? "true" : "false",
    });
    return Array.isArray(res.subscribers) ? res.subscribers : [];
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
