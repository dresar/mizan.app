import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_SECRET = process.env.SESSION_SECRET || "mizan-pesantren-sec-key-2026-auth-secure";
const SESSION_COOKIE_NAME = "mizan_session";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function verifyEdgeToken(token: string | undefined): Promise<{ role: string; userId: string; username: string } | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadStr, signature] = parts;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(expectedSigBuffer)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature.length !== expectedSig.length) return null;
    let diff = 0;
    for (let i = 0; i < signature.length; i++) {
      diff |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    if (diff !== 0) return null;

    const payload = JSON.parse(base64UrlDecode(payloadStr));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/download") ||
    pathname.startsWith("/share") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.png" ||
    pathname === "/apple-icon.png" ||
    pathname === "/icon.png" ||
    pathname === "/logo.png" ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyEdgeToken(token);

  if (pathname === "/login" || pathname === "/") {
    if (session) {
      if (session.role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (session.role === "PENGASUHAN") {
        return NextResponse.redirect(new URL("/bk/dashboard", req.url));
      }
      if (session.role === "ORTU") {
        return NextResponse.redirect(new URL("/ortu/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/guru/dashboard", req.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "SUPER_ADMIN") {
      if (session.role === "PENGASUHAN") {
        return NextResponse.redirect(new URL("/bk/dashboard", req.url));
      }
      if (session.role === "ORTU") {
        return NextResponse.redirect(new URL("/ortu/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/guru/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/bk")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "PENGASUHAN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/guru/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/guru")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/santri")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/bk/:path*",
    "/guru/:path*",
    "/santri/:path*",
    "/login",
    "/api/admin/:path*"
  ]
};
