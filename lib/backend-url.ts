// The one place that decides where the backend engine lives.
// Set NEXT_PUBLIC_BACKEND_URL in every environment (local and deployed).
const PRODUCTION_BACKEND = "https://cherryl-media-engine.onrender.com";
const LOCAL_BACKEND = "http://localhost:8080";

const isProduction = process.env.NODE_ENV === "production";
const configured = process.env.NEXT_PUBLIC_BACKEND_URL;

// A production build must never point at localhost, even if the host's env says so.
export const BACKEND_URL: string =
  configured && !(isProduction && /localhost|127\.0\.0\.1/.test(configured))
    ? configured.replace(/\/+$/, "")
    : isProduction
      ? PRODUCTION_BACKEND
      : LOCAL_BACKEND;

export function getBackendUrl(): string {
  return BACKEND_URL;
}
