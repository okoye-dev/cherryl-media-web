/**
 * S3 Presigned Upload Client
 * Adapted from lapis-archive client
 *
 * Flow:
 * 1. Request presigned PUT URL from backend (/api/uploads/presign or /api/files/presign-upload)
 * 2. Send bytes directly to object storage via PUT with progress tracking
 * 3. Return public image URL for display in articles
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface PresignResponse {
  upload_url: string;
  storage_key: string;
  public_url: string;
  id: string;
  name: string;
  expires_in: number;
}

export async function uploadImageFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const contentType = file.type || "application/octet-stream";

  try {
    // Step 1: Ask backend for presigned upload URL
    const presignRes = await fetch(`${BACKEND_URL}/api/uploads/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        content_type: contentType,
      }),
    });

    if (presignRes.ok) {
      const data: PresignResponse = await presignRes.json();
      let uploadTarget = data.upload_url;
      if (uploadTarget.startsWith("/")) {
        uploadTarget = `${BACKEND_URL}${uploadTarget}`;
      }

      // Step 2: PUT file directly to S3 / Cloudflare R2 presigned URL
      await putToPresignedURL(uploadTarget, file, contentType, onProgress);

      // Return public CDN/Bucket URL
      let finalUrl = data.public_url;
      if (finalUrl.startsWith("/")) {
        finalUrl = `${BACKEND_URL}${finalUrl}`;
      }
      return finalUrl;
    }
  } catch (err) {
    console.warn("Backend presign upload unavailable, falling back to local:", err);
  }

  // Fallback: Local Next.js API upload route
  const formData = new FormData();
  formData.append("file", file);

  const fallbackRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!fallbackRes.ok) {
    throw new Error("Image upload failed");
  }

  const fallbackData = await fallbackRes.json();
  return fallbackData.url || "";
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

    xhr.addEventListener("error", () => reject(new Error("Direct upload failed")));

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}
