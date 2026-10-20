export interface PostSubscriber {
  id: string;
  email: string;
  name: string;
  categories: string[];
  active: boolean;
  createdAt: string;
}

export interface ISubscriberService {
  getSubscribers(activeOnly?: boolean): Promise<PostSubscriber[]>;
  addSubscriber(email: string, name?: string, categories?: string[]): Promise<PostSubscriber>;
  removeSubscriber(email: string): Promise<boolean>;
}
