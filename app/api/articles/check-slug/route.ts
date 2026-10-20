import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const excludeId = searchParams.get("excludeId") || "";

  if (!slug) {
    return NextResponse.json({ error: "Slug required", available: false }, { status: 400 });
  }

  const backendUrl =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cherryl-media-engine.onrender.com"
      : "http://localhost:8080");
  try {
    const res = await fetch(
      `${backendUrl}/api/articles/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${encodeURIComponent(excludeId)}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
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
