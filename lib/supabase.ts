/**
 * Supabase Client Configuration & Auth Constants
 *
 * Provides configuration constants and endpoints for Supabase Auth,
 * using ES256 ECC token verification and JWKS key discovery.
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  jwksUrl: process.env.NEXT_PUBLIC_SUPABASE_JWKS_URL || "",
  jwtKeyId: process.env.NEXT_PUBLIC_SUPABASE_JWT_KEY_ID || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};
