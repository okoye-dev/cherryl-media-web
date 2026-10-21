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
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
        // The backend only answers signed-in admins, so pass the caller's session along.
        headers: req.headers.get("authorization") ? { Authorization: req.headers.get("authorization") as string } : {},
      }
    );
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    if (res.status === 401 || res.status === 403) {
      // Pass a refusal through, so the admin screen can ask the person to sign in.
      const body = await res.json().catch(() => ({ error: "Sign in to continue." }));
      return NextResponse.json(body, { status: res.status });
    }
  } catch (err) {
    console.error("check-slug proxy error:", err);
  }

  return NextResponse.json({
    slug,
    available: true,
  });
}
