import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiLimiter, authLimiter } from "@/lib/rate-limiter";

export default auth((req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  let rateLimitResult = null;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    rateLimitResult = authLimiter.consume(ip);
  } else if (pathname.startsWith("/api")) {
    const limiterKey = req.auth?.user?.id || ip;
    rateLimitResult = apiLimiter.consume(limiterKey);
  }

  if (rateLimitResult && !rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message:
          "Você excedeu o limite de requisições. Tente novamente mais tarde.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      },
    );
  }

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiRoute = pathname.startsWith("/api");

  if (!isAuthenticated && !isAuthRoute && !isApiRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const response = NextResponse.next();
  if (rateLimitResult) {
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString(),
    );
    response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/sse).*)"],
};
