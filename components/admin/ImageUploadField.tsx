"use client";

import { useRef, useState } from "react";
import { uploadImageFile } from "@/lib/upload";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  hasError?: boolean;
}

export default function ImageUploadField({
  value,
  onChange,
  label = "Upload Photo",
  description,
  required = false,
  hasError = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      setProgress(0);

      // Upload via backend S3/R2 presigned URL with progress
      const finalUrl = await uploadImageFile(file, (p) => setProgress(p));
      if (finalUrl) {
        onChange(finalUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        {label && (
          <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
            {label}
            {required && <span className="text-brand-red ml-1">*</span>}
          </label>
        )}
      </div>

      {description && (
        <p className="text-[0.72rem] text-zinc-400 leading-relaxed">
          {description}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-[#1A1D24] p-3">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Selected photo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-200">
              {uploading ? (
                <span className="text-brand-red font-semibold">
                  Uploading to storage... {progress > 0 ? `${progress}%` : ""}
                </span>
              ) : (
                "Photo uploaded & verified"
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-white/15 bg-zinc-800 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`flex w-full items-center justify-center gap-3.5 rounded-xl border-2 border-dashed p-5 transition-colors disabled:opacity-50 ${
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
            <span className="block text-xs font-semibold">
              {hasError ? "⚠️ Image required — choose photo" : "Choose photo from device"}
            </span>
            <span className="block text-[0.68rem] text-zinc-400">
              Select JPG, PNG, or WebP (Cloudflare R2 storage)
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
