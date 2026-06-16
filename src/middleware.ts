import { NextResponse, type NextRequest } from "next/server";
import PocketBase from "pocketbase";
import { AUTH_COOKIE_NAME, POCKETBASE_URL } from "@/lib/pocketbase/config";

const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  const pb = new PocketBase(POCKETBASE_URL);
  pb.autoCancellation(false);

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (authCookie?.value) {
    pb.authStore.loadFromCookie(`${AUTH_COOKIE_NAME}=${authCookie.value}`);
  }

  let isAuthenticated = pb.authStore.isValid;

  if (isAuthenticated) {
    try {
      await pb.collection("users").authRefresh();
      isAuthenticated = pb.authStore.isValid;
    } catch {
      pb.authStore.clear();
      isAuthenticated = false;
    }
  }

  const response = NextResponse.next();

  if (pb.authStore.isValid) {
    response.headers.set(
      "set-cookie",
      pb.authStore.exportToCookie({
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      })
    );
  } else if (authCookie?.value) {
    response.cookies.delete(AUTH_COOKIE_NAME);
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url)
    );
  }

  if (isPublicPath) {
    if (isAuthenticated && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
