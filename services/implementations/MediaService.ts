import type { IApiClient } from "../contracts/IApiClient";
import type { IMediaService } from "../contracts/IMediaService";
import { uploadMediaFile as legacyUploadMedia, uploadImageFile as legacyUploadImage } from "@/lib/upload";

export class MediaService implements IMediaService {
  constructor(private readonly client: IApiClient) {}

  async uploadMediaFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return legacyUploadMedia(file, onProgress);
  }

  async uploadImageFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return legacyUploadImage(file, onProgress);
  }
}
