import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/env-safe";

/**
 * Health check endpoint to verify the application is running correctly
 * This can be used by monitoring tools to check if the app is healthy
 */
export async function GET() {
  const isEnvValid = validateEnv();

  // Check if we can connect to Supabase
  let supabaseStatus = "unknown";
  try {
    const { supabase } = await import("@/lib/supabase");
    const { error } = await supabase.auth.getSession();
    supabaseStatus = error ? "error" : "ok";
  } catch (error) {
    console.error("Supabase connection error:", error);
    supabaseStatus = "error";
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      envValid: isEnvValid,
      supabase: supabaseStatus,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
