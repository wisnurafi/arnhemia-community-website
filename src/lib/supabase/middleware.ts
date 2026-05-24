import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

// Routes that guests (logged-out visitors) are allowed to see. Anything not
// matched here gets bounced to /login. We keep the auth recovery flow
// (forgot/reset/callback) and the legal pages linked from the register form
// open so the sign-up flow stays usable end-to-end.
const PUBLIC_EXACT = new Set<string>(["/"]);
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot",
  "/reset",
  "/auth/",
  "/legal/",
  "/api/",
];
const AUTH_PAGES = ["/login", "/register"];
const MFA_PATH = "/login/mfa";

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Always call getUser() to refresh the auth cookie if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Logged-in users get bounced away from /login and /register, except the
  // MFA challenge page which is part of the login flow.
  if (
    user &&
    AUTH_PAGES.some((p) => pathname.startsWith(p)) &&
    !pathname.startsWith(MFA_PATH)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Logged-out users can only see the public whitelist. Everything else
  // bounces to /login with a redirect param so they land back on the page
  // they originally tried to open after signing in.
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user signed in but hasn't passed the MFA step, force them through it.
  if (user) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const needsMfa =
      aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2";
    if (
      needsMfa &&
      !pathname.startsWith(MFA_PATH) &&
      !pathname.startsWith("/auth/callback") &&
      pathname !== "/" &&
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/api/")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = MFA_PATH;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
