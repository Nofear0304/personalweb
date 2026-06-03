"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Button from "@/components/ui/Button";

export default function ArticleUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/articles", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          setMessage({ type: "success", text: `文章「${data.slug}」上传成功！` });
          router.refresh();
        } else {
          setMessage({ type: "error", text: data.error || "上传失败" });
        }
      } catch {
        setMessage({ type: "error", text: "网络错误，请重试" });
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/markdown": [".md"],
      "text/plain": [".md"],
    },
    maxFiles: 1,
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? "松开以上传文件"
                : uploading
                ? "上传中..."
                : "拖拽 Markdown 文件到此处"}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              或点击选择 .md 文件
            </p>
          </div>
        </div>
      </div>

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
