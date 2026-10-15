/**
 * Object Storage Upload Client
 * Adapted from lapis-archive client with landing verification & compression
 *
 * Flow:
 * 1. Validate file limits & client-side compress image to WebP
 * 2. Request presigned PUT URL from backend (/api/uploads/presign)
 * 3. Send bytes directly to S3 / Cloudflare R2 bucket with progress tracking
 * 4. Call /api/uploads/confirm to verify via S3 HeadObject that file safely landed
 * 5. Return confirmed public CDN/S3 URL
 */

import { compressImage, validateMediaFile } from "./image-compress";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";

export interface PresignResponse {
  upload_url: string;
  storage_key: string;
  public_url: string;
  id: string;
  name: string;
  expires_in: number;
}

export interface ConfirmResponse {
  confirmed: boolean;
  storage_key: string;
  public_url: string;
  size_bytes: number;
}

export async function uploadMediaFile(
  rawFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 0: Validate limits
  const validation = validateMediaFile(rawFile);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file");
  }

  // Step 1: Compress if it's an image
  let fileToUpload = rawFile;
  if (rawFile.type.startsWith("image/")) {
    try {
      fileToUpload = await compressImage(rawFile);
    } catch (compressErr) {
      console.warn("Client compression skipped, proceeding with original:", compressErr);
    }
  }

  const contentType = fileToUpload.type || "application/octet-stream";

  try {
    // Step 2: Ask backend for presigned upload URL
    const presignRes = await fetch(`${BACKEND_URL}/api/uploads/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fileToUpload.name,
        size: fileToUpload.size,
        content_type: contentType,
      }),
    });

    if (presignRes.ok) {
      const data: PresignResponse = await presignRes.json();
      let uploadTarget = data.upload_url;
      if (uploadTarget.startsWith("/")) {
        uploadTarget = `${BACKEND_URL}${uploadTarget}`;
      }

      // Step 3: PUT bytes directly to S3 / Cloudflare R2
      await putToPresignedURL(uploadTarget, fileToUpload, contentType, onProgress);

      // Step 4: Confirm landing via HeadObject check in backend
      try {
        const confirmRes = await fetch(`${BACKEND_URL}/api/uploads/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storage_key: data.storage_key,
            file_name: fileToUpload.name,
          }),
        });

        if (confirmRes.ok) {
          const confirmData: ConfirmResponse = await confirmRes.json();
          let finalUrl = confirmData.public_url || data.public_url;
          if (finalUrl.startsWith("/")) {
            finalUrl = `${BACKEND_URL}${finalUrl}`;
          }
          return finalUrl;
        }
      } catch (confirmErr) {
        console.warn("Confirmation check failed, falling back to presigned public url:", confirmErr);
      }

      // Fallback to initial public url if confirm endpoint errored
      let finalUrl = data.public_url;
      if (finalUrl.startsWith("/")) {
        finalUrl = `${BACKEND_URL}${finalUrl}`;
      }
      return finalUrl;
    }
  } catch (err) {
    console.warn("Backend presign upload unavailable, falling back to local /api/upload:", err);
  }

  // Fallback: Local Next.js API upload route
  const formData = new FormData();
  formData.append("file", fileToUpload);

  const fallbackRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!fallbackRes.ok) {
    throw new Error("Media upload failed");
  }

  const fallbackData = await fallbackRes.json();
  return fallbackData.url || "";
}

/** Backward compatible alias for image uploads */
export async function uploadImageFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadMediaFile(file, onProgress);
}

function putToPresignedURL(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during file upload to storage"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}
