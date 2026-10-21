import { BACKEND_URL } from "@/lib/backend-url";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const backendUrl = BACKEND_URL;
  try {
    const res = await fetch(
      `${backendUrl}/api/tags?q=${encodeURIComponent(q)}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) }
    );
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("tags proxy error:", err);
  }

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

  const matched = defaultSeeds.filter((s) => !q || s.toLowerCase().includes(q));
  return NextResponse.json({
    tags: matched.slice(0, 30),
  });
}
