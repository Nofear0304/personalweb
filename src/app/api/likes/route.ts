import { NextRequest, NextResponse } from "next/server";
import { getLikes, likeContent } from "@/lib/likes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "article" | "note";
  const slug = searchParams.get("slug");

  if (!type || !slug) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  if (type !== "article" && type !== "note") {
    return NextResponse.json({ error: "类型无效" }, { status: 400 });
  }

  const likes = await getLikes(type, slug);
  return NextResponse.json({ likes });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, slug } = body;

    if (!type || !slug) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    if (type !== "article" && type !== "note") {
      return NextResponse.json({ error: "类型无效" }, { status: 400 });
    }

    const likes = await likeContent(type, slug);
    return NextResponse.json({ success: true, likes });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
