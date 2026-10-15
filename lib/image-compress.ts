/**
 * Client-Side Image Compression & Media Validation
 *
 * Compresses images before presigned S3/R2 upload to:
 * - Reduce upload bandwidth and mobile latency
 * - Normalize dimensions to editorial standards (max width 2048px)
 * - Output modern WebP format with high visual fidelity (quality 0.82)
 * - Enforce reasonable size limits on images and video
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const MEDIA_LIMITS = {
  maxImageSizeBytes: 20 * 1024 * 1024, // 20 MB max before compression
  maxVideoSizeBytes: 100 * 1024 * 1024, // 100 MB max for direct video
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime"],
};

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || "unknown"}). Please select a standard image (JPG, PNG, WebP) or video (MP4, WebM).`,
    };
  }

  if (isImage) {
    if (file.size > MEDIA_LIMITS.maxImageSizeBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Image size is too large (${mb}MB). Maximum allowed image upload is 20MB.`,
      };
    }
  }

  if (isVideo) {
    if (file.size > MEDIA_LIMITS.maxVideoSizeBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Video size is too large (${mb}MB). Maximum allowed direct video upload is 100MB. For larger videos, consider embedding via YouTube.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Compresses a single image File using the browser Canvas API.
 * Keeps aspect ratio, clamps maximum dimension, and converts to WebP.
 * For animated GIFs or SVGs, preserves the original file untouched.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 2048, maxHeight = 2048, quality = 0.82 } = options;

  // Don't compress non-image files, animated GIFs, or SVGs
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file); // On error fallback to original
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          resolve(file);
          return;
        }

        // Calculate proportional scale down
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw onto offscreen canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // High quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as modern WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Only use compressed if it actually saved bytes
            if (blob.size >= file.size && file.type === "image/webp") {
              resolve(file);
              return;
            }

            const cleanBase = file.name.replace(/\.[^/.]+$/, "");
            const compressedFile = new File([blob], `${cleanBase}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
