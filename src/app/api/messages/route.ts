import { NextRequest, NextResponse } from "next/server";
import { getMessages, addMessage, deleteMessage, likeMessage } from "@/lib/messages";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const messages = await getMessages();
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, content } = body;

    if (!nickname || !nickname.trim()) {
      return NextResponse.json({ error: "请输入昵称" }, { status: 400 });
    }
    if (nickname.trim().length > 50) {
      return NextResponse.json({ error: "昵称最多50个字符" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "请输入留言内容" }, { status: 400 });
    }
    if (content.trim().length > 500) {
      return NextResponse.json({ error: "留言内容最多500个字符" }, { status: 400 });
    }

    const message = await addMessage({
      nickname: nickname.trim(),
      content: content.trim(),
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
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
    return NextResponse.json({ error: "缺少消息ID" }, { status: 400 });
  }

  const success = await deleteMessage(id);
  if (!success) {
    return NextResponse.json({ error: "消息不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "like") {
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少消息ID" }, { status: 400 });
    }

    const message = await likeMessage(id);
    if (!message) {
      return NextResponse.json({ error: "消息不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
