export interface PostSubscriber {
  id: string;
  email: string;
  name: string;
  categories: string[];
  active: boolean;
  createdAt: string;
}

export interface SubscribersPage {
  subscribers: PostSubscriber[];
  count: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ISubscriberService {
  getSubscribers(activeOnly?: boolean, page?: number, pageSize?: number): Promise<SubscribersPage>;
  addSubscriber(email: string, name?: string, categories?: string[]): Promise<PostSubscriber>;
  removeSubscriber(email: string): Promise<boolean>;
}
