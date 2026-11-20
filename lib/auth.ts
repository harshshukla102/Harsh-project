import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "auth_token";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-at-least-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export type AuthUserSession = {
  userId: string;
  email: string;
  name: string;
};

/**
 * Hash a plain text password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT containing user information using jose.
 */
export async function signToken(payload: AuthUserSession): Promise<string> {
  return new SignJWT({
    sub: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify a JWT and extract user session.
 */
export async function verifyToken(token: string): Promise<AuthUserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieve current logged-in user from request cookies (Server Components, Server Actions, Route Handlers).
 */
export async function getSessionUser(): Promise<AuthUserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
