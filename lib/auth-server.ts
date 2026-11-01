import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Role } from "./mock-data";

const SESSION_SECRET = process.env.SESSION_SECRET || "mizan-pesantren-sec-key-2026-auth-secure";
const SESSION_COOKIE_NAME = "mizan_session";
const TOKEN_TTL_SECONDS = 86400 * 7;

export interface SessionPayload {
  userId: string;
  username: string;
  role: Role;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function createSessionToken(user: { id: string; username: string; role: Role }): string {
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadStr, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadStr)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    const payload: SessionPayload = JSON.parse(base64UrlDecode(payloadStr));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function verifyRequestAuth(req: Request | NextRequest, requiredRole?: Role | Role[]): {
  authorized: boolean;
  session: SessionPayload | null;
  message?: string;
} {
  let token: string | undefined;
  if ("cookies" in req && typeof (req as any).cookies?.get === "function") {
    token = (req as NextRequest).cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
    token = match ? decodeURIComponent(match[1]) : undefined;
  }

  const session = verifySessionToken(token);
  if (!session) {
    return { authorized: false, session: null, message: "Sesi tidak valid atau telah kedaluwarsa." };
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(session.role)) {
      return { authorized: false, session, message: "Akses ditolak: Anda tidak memiliki wewenang untuk aksi ini." };
    }
  }

  return { authorized: true, session };
}
