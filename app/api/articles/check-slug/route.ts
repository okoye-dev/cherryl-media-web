import { NextResponse } from "next/server";
import { CANONICAL_ARTICLES } from "@/lib/articles";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const excludeId = searchParams.get("excludeId") || "";

  if (!slug) {
    return NextResponse.json({ error: "Slug required", available: false }, { status: 400 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  try {
    const res = await fetch(
      `${backendUrl}/api/articles/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${encodeURIComponent(excludeId)}`,
      { cache: "no-store", signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline; fallback to canonical articles check
  }

  const exists = CANONICAL_ARTICLES.some(
    (a) => a.slug.toLowerCase() === slug.toLowerCase() && (!excludeId || a.id !== excludeId)
  );

  return NextResponse.json({
    slug,
    available: !exists,
  });
}
