"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function ImageUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previews, setPreviews] = useState<File[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setMessage(null);
      setPreviews(acceptedFiles);

      let successCount = 0;
      let failCount = 0;

      for (const file of acceptedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/images", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        setMessage({
          type: "success",
          text: `${successCount} 张图片上传成功！${failCount > 0 ? ` ${failCount} 张失败。` : ""}`,
        });
        router.refresh();
      } else {
        setMessage({ type: "error", text: "所有图片上传失败，请重试" });
      }

      setUploading(false);
      setPreviews([]);
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    maxFiles: 10,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-[var(--accent)] bg-[var(--accent)]/5"
            : "border-[var(--border)] hover:border-[var(--muted)]"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-10 h-10 text-[var(--muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? "松开以上传图片"
                : uploading
                ? "上传中..."
                : "拖拽图片到此处"}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              支持 PNG、JPG、WebP、SVG（最多 10 张）
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress / previews */}
      {previews.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
          <span className="text-sm text-[var(--muted)]">
            正在上传 {previews.length} 张图片...
          </span>
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
