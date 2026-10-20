import { BACKEND_URL } from "@/lib/backend-url";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const excludeId = searchParams.get("excludeId") || "";

  if (!slug) {
    return NextResponse.json({ error: "Slug required", available: false }, { status: 400 });
  }

  const backendUrl = BACKEND_URL;
  try {
    const res = await fetch(
      `${backendUrl}/api/articles/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${encodeURIComponent(excludeId)}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("check-slug proxy error:", err);
  }

  return NextResponse.json({
    slug,
    available: true,
  });
}
