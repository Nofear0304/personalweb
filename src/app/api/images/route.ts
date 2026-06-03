import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllImages, deleteImage } from "@/lib/images";

// GET /api/images — List all images
export async function GET() {
  const images = getAllImages();
  return NextResponse.json({ images });
}

// POST /api/images — Upload a new image (admin only)
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "图片上传在 serverless 模式下暂不支持。请将图片放入 public/images/gallery/ 目录并重新部署。" },
    { status: 501 }
  );
}

// DELETE /api/images?file=xxx — Delete an image (admin only)
export async function DELETE(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("file");

  if (!filename) {
    return NextResponse.json({ error: "请指定文件名" }, { status: 400 });
  }

  return NextResponse.json(
    { error: "图片删除在 serverless 模式下暂不支持。请从 public/images/gallery/ 目录中删除图片并重新部署。" },
    { status: 501 }
  );
}
