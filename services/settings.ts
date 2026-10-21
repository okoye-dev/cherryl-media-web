import { request } from "./api-client";
import { readWithRetry } from "@/lib/fetch-retry";
import { mergeCopy, type EditorialCopy } from "@/config/editorial-copy";

type Reply = { editorial_copy?: Partial<EditorialCopy> };

export async function fetchEditorialCopy(): Promise<EditorialCopy> {
  const read = () => request<Reply>("/api/settings", { next: { revalidate: 60 }, timeoutMs: 25000 });
  let data: Reply | null = null;
  if (typeof window === "undefined") {
    data = await readWithRetry<Reply>("fetchEditorialCopy", async () => {
      const res = await read();
      return res && res.editorial_copy ? res : null;
    });
  } else {
    try {
      data = await read();
    } catch {
      data = null;
    }
  }
  return mergeCopy(data?.editorial_copy);
}

export async function patchEditorialCopy(
  changes: Partial<{ [K in keyof EditorialCopy]: Partial<EditorialCopy[K]> }>
): Promise<EditorialCopy> {
  const res = await request<Reply>("/api/settings/editorial-copy", {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return mergeCopy(res.editorial_copy);
}
