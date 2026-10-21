import { BACKEND_URL } from "@/lib/backend-url";
import { authedFetch } from "@/lib/auth-gate";
import { compressImage, validateMediaFile } from "@/lib/image-compress";

interface PresignResponse {
  upload_url: string;
  storage_key: string;
  public_url: string;
  already_exists?: boolean;
}

interface ConfirmResponse {
  public_url: string;
}

export type UploadStage = "idle" | "compressing" | "requesting_url" | "uploading" | "confirming" | "done" | "error";

export interface UploadProgressInfo {
  stage: UploadStage;
  percent: number;
  message: string;
}

const absolute = (url: string) => (url.startsWith("/") ? `${BACKEND_URL}${url}` : url);

const postJson = (path: string, body: unknown) =>
  authedFetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

function putToPresignedUrl(url: string, file: File, contentType: string, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during file upload to storage")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

/** Presigned upload straight to storage. Returns the public URL, or null when the backend cannot presign. */
async function uploadViaPresign(
  file: File,
  contentType: string,
  notify: (stage: UploadStage, percent: number, message: string) => void
): Promise<string | null> {
  notify("requesting_url", 20, "Requesting Cloudflare R2 / S3 presigned URL...");
  const presignRes = await postJson("/api/uploads/presign", { name: file.name, size: file.size, content_type: contentType });
  if (!presignRes.ok) return null;

  const data: PresignResponse = await presignRes.json();
  if (data.already_exists) {
    notify("done", 100, "Asset already confirmed in S3 storage");
    return absolute(data.public_url);
  }

  notify("uploading", 25, "Uploading bytes directly to bucket...");
  await putToPresignedUrl(absolute(data.upload_url), file, contentType, (p) => {
    notify("uploading", Math.round(25 + p * 0.6), `Uploading to storage: ${p}%`);
  });

  notify("confirming", 90, "Verifying S3 / Cloudflare R2 landing...");
  try {
    const confirmRes = await postJson("/api/uploads/confirm", { storage_key: data.storage_key, file_name: file.name });
    if (confirmRes.ok) {
      const confirmed: ConfirmResponse = await confirmRes.json();
      notify("done", 100, "Landed & verified in storage");
      return absolute(confirmed.public_url || data.public_url);
    }
  } catch (err) {
    console.warn("Confirmation check failed, falling back to presigned public url:", err);
  }

  notify("done", 100, "Upload completed");
  return absolute(data.public_url);
}

async function uploadViaLocalRoute(file: File, notify: (stage: UploadStage, percent: number, message: string) => void): Promise<string> {
  notify("uploading", 50, "Uploading to local server...");
  const formData = new FormData();
  formData.append("file", file);

  const res = await authedFetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    notify("error", 0, "Upload failed");
    throw new Error("Media upload failed");
  }
  const data = await res.json();
  notify("done", 100, "Uploaded to local storage");
  return data.url || "";
}

export async function uploadMediaWithProgress(rawFile: File, onProgress?: (info: UploadProgressInfo) => void): Promise<string> {
  const notify = (stage: UploadStage, percent: number, message: string) => onProgress?.({ stage, percent, message });

  const validation = validateMediaFile(rawFile);
  if (!validation.valid) {
    const errorMsg = validation.error || "Invalid file";
    notify("error", 0, errorMsg);
    throw new Error(errorMsg);
  }

  let file = rawFile;
  if (rawFile.type.startsWith("image/")) {
    notify("compressing", 10, "Compressing image to WebP...");
    try {
      file = await compressImage(rawFile);
    } catch (err) {
      console.warn("Client compression skipped, proceeding with original:", err);
    }
  }

  try {
    const url = await uploadViaPresign(file, file.type || "application/octet-stream", notify);
    if (url !== null) return url;
  } catch (err) {
    console.warn("Backend presign upload unavailable, falling back to local /api/upload:", err);
  }

  return uploadViaLocalRoute(file, notify);
}

export function uploadMediaFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return uploadMediaWithProgress(file, (info) => onProgress?.(info.percent));
}
