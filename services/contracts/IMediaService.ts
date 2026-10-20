export interface IMediaService {
  uploadMediaFile(file: File, onProgress?: (progress: number) => void): Promise<string>;
  uploadImageFile(file: File, onProgress?: (progress: number) => void): Promise<string>;
}
