import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment, deleteComment, likeComment } from "@/lib/comments";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "缺少 slug 参数" }, { status: 400 });
  }

  const comments = await getComments(slug);
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, nickname, content } = body;

    if (!slug) {
      return NextResponse.json({ error: "缺少 slug 参数" }, { status: 400 });
    }
    if (!nickname || !nickname.trim()) {
      return NextResponse.json({ error: "请输入昵称" }, { status: 400 });
    }
    if (nickname.trim().length > 50) {
      return NextResponse.json({ error: "昵称最多50个字符" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "请输入评论内容" }, { status: 400 });
    }
    if (content.trim().length > 500) {
      return NextResponse.json({ error: "评论内容最多500个字符" }, { status: 400 });
    }

    const comment = await addComment({
      slug,
      nickname: nickname.trim(),
      content: content.trim(),
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "提交失败，请重试" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少评论ID" }, { status: 400 });
  }

  const success = await deleteComment(id);
  if (!success) {
    return NextResponse.json({ error: "评论不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "like") {
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少评论ID" }, { status: 400 });
    }

    const comment = await likeComment(id);
    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, comment });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
