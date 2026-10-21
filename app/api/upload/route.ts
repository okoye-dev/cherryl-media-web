import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { BACKEND_URL } from "@/lib/backend-url";

/** Only a signed-in admin may save files here. The backend decides who that is. */
async function isAdmin(req: Request): Promise<boolean> {
  const authorization = req.headers.get("authorization");
  if (!authorization) return false;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const user = await res.json();
    return user?.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, safeName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${safeName}`,
      name: file.name,
      size: file.size,
    });
  } catch {
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
