// A failed read is retried, because the backend can be asleep for a minute after a deploy.
// If it still fails while the site runs this throws, so Next keeps the last good page instead of saving an empty one.
// During a build there is no earlier page, so a failure there returns nothing and the build carries on.
const TRIES = 3;
const TIMEOUT_MS = 25000;
const WAIT_MS = [2000, 4000];

function isBuilding(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function readWithRetry<T>(what: string, read: (signal: AbortSignal) => Promise<T | null>): Promise<T | null> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < TRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const result = await read(controller.signal);
      if (result !== null) return result;
      lastError = new Error("the backend did not answer properly");
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < TRIES - 1) await sleep(WAIT_MS[attempt] ?? 4000);
  }
  if (isBuilding()) {
    console.warn(`${what}: backend unavailable while building`, lastError);
    return null;
  }
  throw new Error(`${what}: the backend did not answer after ${TRIES} tries. Keeping the last good page.`);
}

export async function getJson<T>(what: string, url: string): Promise<{ data: T | null; missing: boolean } | null> {
  return readWithRetry(what, async (signal) => {
    const res = await fetch(url, { next: { revalidate: 30 }, signal });
    if (res.status === 404) return { data: null, missing: true };
    if (!res.ok) return null;
    return { data: (await res.json()) as T, missing: false };
  });
}
