/**
 * Reading the backend for public pages. The backend can be asleep or restarting for a minute
 * (for example right after a deploy), so a failed read is tried again a few times.
 *
 * If it still fails while the site is running, this THROWS instead of returning nothing. That makes
 * Next keep showing the last good copy of the page. Returning an empty list instead would save an
 * empty page for everyone until the next refresh.
 * While the site is being built there is no earlier copy, so a failure there gives "nothing" and the
 * build carries on.
 */

const TRIES = 3;
const TIMEOUT_MS = 25000;
const WAIT_MS = [2000, 4000];

export function isBuilding(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs one read, trying again after a pause when it fails. Return null from `read` to mean "try again". */
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

/** GET a URL as JSON for a public page. A 404 gives `{ missing: true }` without retrying. */
export async function getJson<T>(what: string, url: string): Promise<{ data: T | null; missing: boolean } | null> {
  return readWithRetry(what, async (signal) => {
    const res = await fetch(url, { next: { revalidate: 30 }, signal });
    if (res.status === 404) return { data: null, missing: true };
    if (!res.ok) return null;
    return { data: (await res.json()) as T, missing: false };
  });
}
