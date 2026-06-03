import { NextRequest, NextResponse } from "next/server";
import { login, logout } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    }

    const success = await login(password);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: "请求格式错误" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ success: true });
}
