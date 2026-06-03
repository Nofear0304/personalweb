import { NextResponse } from "next/server";
import { incrementVisitCount } from "@/lib/stats";

export async function POST() {
  try {
    const count = incrementVisitCount();
    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
