import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllImages, deleteImage } from "@/lib/images";
import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public/images/gallery");

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

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的图片格式，仅支持 PNG、JPG、GIF、WebP、SVG" },
        { status: 400 }
      );
    }

    // Sanitize filename
    const originalName = file.name;
    const safeFilename = originalName
      .replace(/[^a-zA-Z0-9一-鿿\-_\.]/g, "-")
      .toLowerCase();

    // Avoid overwriting: add timestamp if file exists
    let finalFilename = safeFilename;
    if (fs.existsSync(path.join(GALLERY_DIR, finalFilename))) {
      const ext = path.extname(safeFilename);
      const base = path.basename(safeFilename, ext);
      finalFilename = `${base}-${Date.now()}${ext}`;
    }

    // Ensure directory exists
    if (!fs.existsSync(GALLERY_DIR)) {
      fs.mkdirSync(GALLERY_DIR, { recursive: true });
    }

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(GALLERY_DIR, finalFilename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: finalFilename,
      url: `/images/gallery/${finalFilename}`,
    });
  } catch {
    return NextResponse.json(
      { error: "上传失败，请重试" },
      { status: 500 }
    );
  }
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

  const result = deleteImage(filename);

  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
}
