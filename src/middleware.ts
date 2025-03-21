import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and not accessing auth pages, redirect to login
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isPublicRoute =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("favicon.ico");

  if (!session && !isAuthRoute && !isApiRoute && !isPublicRoute) {
    const redirectUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect from translations page to main page if needed
  // Commented out to prevent redirect loop
  // if (session && req.nextUrl.pathname.startsWith("/translations")) {
  //   const redirectUrl = new URL("/", req.url);
  //   return NextResponse.redirect(redirectUrl);
  // }

  // For API routes, check for valid API key in header
  if (isApiRoute && !session) {
    const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
    const projectId = req.headers.get("project-id");

    if (!apiKey || !projectId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Here you would validate the API key against your database
    // This is a placeholder for the actual implementation
    const { data: validKey, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", apiKey)
      .eq("project_id", projectId)
      .single();

    if (error || !validKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
  }

  return res;
}

// Only run middleware on the following paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
