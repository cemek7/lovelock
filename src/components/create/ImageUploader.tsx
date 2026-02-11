"use client";

import { useCallback, useState } from "react";
import { validateImageFile } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void;
  preview: string | null;
}

export default function ImageUploader({ onImageSelected, preview }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
          dragOver
            ? "border-white/30 bg-white/[0.04]"
            : preview
              ? "border-white/10 bg-white/[0.02]"
              : "border-white/10 bg-white/[0.02] hover:border-white/20"
        }`}
        onClick={() => document.getElementById("image-input")?.click()}
      >
        {preview ? (
          <div className="relative w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Selected photo"
              className="mx-auto max-h-[280px] rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-xs text-white/30">
              Click or drag to change
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/50">
              Drop your photo here or click to browse
            </p>
            <p className="mt-1 text-xs text-white/20">
              JPEG, PNG, or WebP — max 5MB
            </p>
          </>
        )}

        <input
          id="image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-love-400">{error}</p>
      )}
    </div>
  );
}
