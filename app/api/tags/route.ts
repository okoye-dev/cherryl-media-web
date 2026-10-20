import { NextResponse } from "next/server";
import { CANONICAL_ARTICLES } from "@/lib/articles";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  try {
    const res = await fetch(
      `${backendUrl}/api/tags?q=${encodeURIComponent(q)}`,
      { cache: "no-store", signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline; fallback to canonical articles
  }

  const allTags = new Set<string>();
  for (const art of CANONICAL_ARTICLES) {
    if (Array.isArray(art.tags)) {
      for (const t of art.tags) {
        if (!q || t.toLowerCase().includes(q)) {
          allTags.add(t);
        }
      }
    }
  }

  // Common default tags for newsroom if set is small
  const defaultSeeds = [
    "Nigeria",
    "Abuja",
    "Lagos",
    "Economy",
    "Governance",
    "Energy Transition",
    "Infrastructure",
    "Policy",
    "Fintech",
    "Education Reform",
    "Hospitality",
    "Culture & Arts",
    "Youth Innovation",
    "SME Growth",
  ];
  for (const s of defaultSeeds) {
    if (!q || s.toLowerCase().includes(q)) {
      allTags.add(s);
    }
  }

  return NextResponse.json({
    tags: Array.from(allTags).slice(0, 30),
  });
}
