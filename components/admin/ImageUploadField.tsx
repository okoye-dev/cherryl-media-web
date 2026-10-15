"use client";

import { useRef, useState } from "react";
import { uploadImageFile } from "@/lib/upload";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  label = "Upload Photo",
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

      // Upload via backend S3 presigned URL with progress
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
    <div className="space-y-2">
      {label && (
        <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Selected photo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-300">
              {uploading ? (
                <span className="text-brand-red">
                  Uploading to storage... {progress > 0 ? `${progress}%` : ""}
                </span>
              ) : (
                "Photo selected"
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="rounded-lg px-2.5 py-1 text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
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
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-900/40 p-5 text-slate-300 transition-colors hover:border-brand-red hover:bg-slate-900/80 hover:text-white disabled:opacity-50"
        >
          <svg
            className="h-5 w-5 text-brand-red"
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
            <span className="block text-xs font-medium">
              Choose photo from device
            </span>
            <span className="block text-[0.68rem] text-slate-500">
              Select any photo or image file (JPG, PNG, WebP)
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
