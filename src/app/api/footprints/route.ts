import { NextRequest, NextResponse } from "next/server";
import { getVisitedCities, addCity, removeCity } from "@/lib/footprints";

export async function GET() {
  try {
    const cities = await getVisitedCities();
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, city, password } = body;

    // "verify" action: check password only, no data mutation
    if (action === "verify") {
      if (!password) {
        return NextResponse.json({ error: "请输入密码" }, { status: 400 });
      }
      const expectedPassword = process.env.FOOTPRINTS_ADMIN_PASSWORD || "123456";
      if (password !== expectedPassword) {
        return NextResponse.json({ error: "密码错误" }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    }

    if (!city || typeof city !== "string" || !city.trim()) {
      return NextResponse.json({ error: "请指定城市" }, { status: 400 });
    }

    const cityName = city.trim();

    if (action === "add") {
      if (!password) {
        return NextResponse.json({ error: "请输入密码" }, { status: 400 });
      }
      const result = await addCity(cityName, password);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }
      const cities = await getVisitedCities();
      return NextResponse.json({ success: true, cities });
    }

    if (action === "remove") {
      if (!password) {
        return NextResponse.json({ error: "请输入密码" }, { status: 400 });
      }
      const result = await removeCity(cityName, password);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }
      const cities = await getVisitedCities();
      return NextResponse.json({ success: true, cities });
    }

    return NextResponse.json({ error: `未知操作: ${action}` }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "操作失败，请重试" }, { status: 500 });
  }
}
