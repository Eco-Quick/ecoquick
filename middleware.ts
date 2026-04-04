import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  const { pathname } = request.nextUrl;

  const role = user?.user_metadata?.role as string | undefined;

  // Redirect logged-in users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const dest = role === "driver" ? "/driver" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Redirect authenticated users away from public landing pages back to their area.
  // This prevents customers from seeing the landing navbar while still logged in.
  const publicLandingRoutes = ["/", "/about", "/business", "/help"];
  const isPublicLanding =
    publicLandingRoutes.includes(pathname) ||
    (pathname.startsWith("/help") && !pathname.startsWith("/help/customer"));
  if (user && isPublicLanding) {
    const dest = role === "driver" ? "/driver" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Protect customer routes
  const customerRoutes = [
    "/dashboard",
    "/orders",
    "/book",
    "/account",
    "/impact",
    "/notifications",
    "/order",
    "/help/customer",
  ];
  const isCustomerRoute = customerRoutes.some((r) => pathname.startsWith(r));
  if (isCustomerRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect driver routes
  if (pathname.startsWith("/driver") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
