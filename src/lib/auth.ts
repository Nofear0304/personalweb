import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "@/types";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }
  return secret;
}

const SESSION_OPTIONS = {
  password: getSessionSecret(),
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
  return session;
}

export async function login(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return false;
  }

  if (password !== adminPassword) {
    return false;
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return true;
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}
