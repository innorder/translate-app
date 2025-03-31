import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, validateEnv } from "./env-safe";

// Validate environment variables but don't throw errors in production
if (process.env.NODE_ENV !== "production") {
  if (!validateEnv()) {
    console.warn("⚠️ Supabase environment variables are missing or invalid");
    console.warn("The application may not function correctly");
  }
}

// Create a singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: any = null;

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;

  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    // Create a mock client that won't crash the app but will log errors
    supabaseInstance = {
      auth: {
        getSession: () =>
          Promise.resolve({
            data: { session: null },
            error: new Error("Supabase client not initialized"),
          }),
        getUser: () =>
          Promise.resolve({
            data: { user: null },
            error: new Error("Supabase client not initialized"),
          }),
        signInWithPassword: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase client not initialized"),
          }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: new Error("Supabase client not initialized"),
              }),
            limit: () =>
              Promise.resolve({
                data: null,
                error: new Error("Supabase client not initialized"),
              }),
            order: () =>
              Promise.resolve({
                data: null,
                error: new Error("Supabase client not initialized"),
              }),
            maybeSingle: () =>
              Promise.resolve({
                data: null,
                error: new Error("Supabase client not initialized"),
              }),
          }),
          in: () =>
            Promise.resolve({
              data: null,
              error: new Error("Supabase client not initialized"),
            }),
        }),
        insert: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase client not initialized"),
          }),
        update: () => ({
          eq: () =>
            Promise.resolve({
              data: null,
              error: new Error("Supabase client not initialized"),
            }),
        }),
        delete: () => ({
          eq: () =>
            Promise.resolve({
              data: null,
              error: new Error("Supabase client not initialized"),
            }),
        }),
      }),
    };
  }

  return supabaseInstance;
})();
