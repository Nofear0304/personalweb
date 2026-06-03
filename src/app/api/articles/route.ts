import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllArticles, createArticle, deleteArticle } from "@/lib/articles";

// GET /api/articles — List all articles
export async function GET() {
  const articles = getAllArticles();
  return NextResponse.json({ articles });
}

// POST /api/articles — Upload a new article (admin only)
export async function POST(request: NextRequest) {
  // Check auth
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

    if (!file.name.endsWith(".md")) {
      return NextResponse.json(
        { error: "只支持 Markdown (.md) 文件" },
        { status: 400 }
      );
    }

    const content = await file.text();
    const result = createArticle(file.name, content);

    if (result.success) {
      return NextResponse.json({ success: true, slug: result.slug });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "上传失败，请重试" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles?slug=xxx — Delete an article (admin only)
export async function DELETE(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "请指定文章 slug" }, { status: 400 });
  }

  const result = deleteArticle(slug);

  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
}
