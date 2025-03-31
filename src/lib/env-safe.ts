/**
 * Safe environment variable access with fallbacks
 * This helps prevent runtime errors when environment variables are missing
 */

// Supabase configuration
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "";

// Validation function to check if required environment variables are set
export function validateEnv() {
  const requiredVars = [
    { name: "SUPABASE_URL", value: SUPABASE_URL },
    { name: "SUPABASE_ANON_KEY", value: SUPABASE_ANON_KEY },
  ];

  const missingVars = requiredVars.filter((v) => !v.value);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing required environment variables: ${missingVars.map((v) => v.name).join(", ")}`,
    );
    return false;
  }

  return true;
}

// Function to get environment variable with fallback
export function getEnv(name: string, fallback: string = ""): string {
  return process.env[name] || fallback;
}
