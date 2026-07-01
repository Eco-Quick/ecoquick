import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth — skip Supabase round-trip for faster load.
  // `/book/*` is included so a logged-out visitor can enter the booking wizard; the
  // page itself mints an anonymous session client-side (see useBookingAuth), and the
  // payment/convert API routes enforce real auth server-side.
  const publicRoutes = ["/", "/about", "/business", "/help", "/login", "/signup"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/book") ||
    (pathname.startsWith("/help") && !pathname.startsWith("/help/customer"));

  if (isPublicRoute && !request.cookies.getAll().some(c => c.name.startsWith("sb-"))) {
    // No Supabase session cookies — anonymous visitor, skip auth entirely
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = NextResponse.next({ request });
  let user: User | null = null;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh the session — must be called on every request when Supabase is configured
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    user = sessionUser;
  }

  const role = user?.user_metadata?.role as string | undefined;
  // Anonymous (guest) users have a session but no real account. Treat them like
  // logged-out visitors everywhere except the booking funnel.
  const isAnonymous = user?.is_anonymous === true;

  // Redirect logged-in users away from auth pages (guests excluded — they may
  // still want to sign in / sign up explicitly).
  if (user && !isAnonymous && (pathname === "/login" || pathname === "/signup")) {
    const dest = role === "admin" ? "/admin" : role === "driver" ? "/driver" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Redirect authenticated users away from public landing pages back to their area.
  // This prevents customers from seeing the landing navbar while still logged in.
  const publicLandingRoutes = ["/", "/about", "/business", "/help"];
  const isPublicLanding =
    publicLandingRoutes.includes(pathname) ||
    (pathname.startsWith("/help") && !pathname.startsWith("/help/customer"));
  if (user && !isAnonymous && isPublicLanding) {
    const dest = role === "admin" ? "/admin" : role === "driver" ? "/driver" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // `/book/*` is edge-public (handled above) so guests can enter and the page mints
  // the anonymous session. `/verify` is only reached after account creation, so it
  // still requires a session at the edge.
  if (pathname.startsWith("/verify") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Permanent-only customer routes — guests must finish creating an account first.
  const permanentCustomerRoutes = [
    "/dashboard",
    "/orders",
    "/account",
    "/impact",
    "/notifications",
    "/order",
    "/help/customer",
  ];
  const isPermanentCustomerRoute = permanentCustomerRoutes.some((r) => pathname.startsWith(r));
  if (isPermanentCustomerRoute && (!user || isAnonymous)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect driver routes
  if (pathname.startsWith("/driver") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect admin routes (layout enforces the admin role check)
  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
