"use client";

import { useRef, useState } from "react";
import { Btn } from "@/components/admin/ui";
import { uploadMediaWithProgress, type UploadProgressInfo } from "@/lib/upload";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  hasError?: boolean;
  onUploadStateChange?: (uploading: boolean) => void;
}

export default function ImageUploadField({
  value,
  onChange,
  label = "Upload Photo",
  description,
  required = false,
  hasError = false,
  onUploadStateChange,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<UploadProgressInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUploading =
    uploadInfo !== null &&
    uploadInfo.stage !== "idle" &&
    uploadInfo.stage !== "done" &&
    uploadInfo.stage !== "error";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Create temporary local thumbnail for instant visual feedback
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    onUploadStateChange?.(true);

    try {
      // Execute compression -> presign -> S3 PUT -> HeadObject landing confirmation
      const confirmedUrl = await uploadMediaWithProgress(file, (info) => {
        setUploadInfo(info);
      });

      if (confirmedUrl) {
        onChange(confirmedUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setErrorMessage(msg);
      setUploadInfo({ stage: "error", percent: 0, message: msg });
    } finally {
      onUploadStateChange?.(false);
      // Clean up object URL after a delay
      setTimeout(() => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }, 5000);
    }
  };

  const handleRemove = () => {
    setLocalPreview(null);
    setUploadInfo(null);
    setErrorMessage(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = localPreview || value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        {label && (
          <label className="block text-[0.7rem] font-medium text-zinc-400">
            {label}
            {required && <span className="text-brand-red ml-1">*</span>}
          </label>
        )}
      </div>

      {description && (
        <p className="text-xs leading-relaxed text-zinc-400">
          {description}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {displayImage ? (
        <div className="flex flex-col items-stretch gap-3 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-24 sm:w-36 rounded-lg border border-white/10 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt="Selected photograph"
              className="h-full w-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-[0.68rem] font-mono font-bold text-white">
                  {uploadInfo?.percent}%
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2 w-full">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                {isUploading ? (
                  <span className="font-medium text-amber-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    {uploadInfo?.message}
                  </span>
                ) : errorMessage ? (
                  <span className="font-medium text-red-400 flex items-center gap-1">
                    {errorMessage}
                  </span>
                ) : (
                  <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Uploaded and confirmed
                  </span>
                )}
                {isUploading && (
                  <span className="font-mono text-[0.68rem] text-zinc-400">
                    {uploadInfo?.percent}%
                  </span>
                )}
              </div>

              {/* Upload progress bar */}
              {isUploading && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-brand-red transition-all duration-200 ease-out"
                    style={{ width: `${uploadInfo?.percent || 0}%` }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 sm:flex">
              <Btn onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {errorMessage ? "Retry upload" : "Change photo"}
              </Btn>
              <Btn variant="ghost" onClick={handleRemove} disabled={isUploading}>
                Remove
              </Btn>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`flex min-h-20 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors disabled:opacity-50 ${
            hasError
              ? "border-red-500/80 bg-red-950/20 text-red-200"
              : "border-white/15 bg-[#1A1D24]/60 text-zinc-300 hover:border-brand-red hover:bg-[#1A1D24] hover:text-white"
          }`}
        >
          <svg
            className={`h-5 w-5 ${hasError ? "text-red-400" : "text-brand-red"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div className="text-left">
            <span className="block text-sm font-medium">
              {hasError ? "Image required, choose a photo" : "Choose a photo"}
            </span>
            <span className="block text-xs text-zinc-400">
              Compressed to WebP on upload
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
