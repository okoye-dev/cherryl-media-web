import { ApiClient } from "./implementations/ApiClient";
import { ArticleService } from "./implementations/ArticleService";
import { SectionService } from "./implementations/SectionService";
import { SettingsService } from "./implementations/SettingsService";
import { MediaService } from "./implementations/MediaService";
import { AuthService } from "./implementations/AuthService";
import { SubscriberService } from "./implementations/SubscriberService";

import type { IApiClient } from "./contracts/IApiClient";
import type { IArticleService } from "./contracts/IArticleService";
import type { ISectionService } from "./contracts/ISectionService";
import type { ISettingsService } from "./contracts/ISettingsService";
import type { IMediaService } from "./contracts/IMediaService";
import type { IAuthService } from "./contracts/IAuthService";
import type { ISubscriberService } from "./contracts/ISubscriberService";

import { getBackendUrl } from "@/lib/backend-url";
export { getBackendUrl };

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cherryl_newsroom_token");
}

export class ServiceContainer {
  public readonly client: IApiClient;
  public readonly articles: IArticleService;
  public readonly sections: ISectionService;
  public readonly settings: ISettingsService;
  public readonly media: IMediaService;
  public readonly auth: IAuthService;
  public readonly subscribers: ISubscriberService;

  constructor(baseUrl: string = getBackendUrl()) {
    const apiClient = new ApiClient(baseUrl, { tokenProvider: getStoredToken });
    this.client = apiClient;
    this.articles = new ArticleService(apiClient);
    this.sections = new SectionService(apiClient);
    this.settings = new SettingsService(apiClient);
    this.media = new MediaService(apiClient);
    this.auth = new AuthService(apiClient);
    this.subscribers = new SubscriberService(apiClient);
  }
}

// Global default singleton container
export const container = new ServiceContainer();

// Convenience service singletons
export const articleService = container.articles;
export const sectionService = container.sections;
export const settingsService = container.settings;
export const mediaService = container.media;
export const authService = container.auth;
export const subscriberService = container.subscribers;
