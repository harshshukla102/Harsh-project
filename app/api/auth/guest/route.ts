import { NextResponse } from "next/server";
import { createUser } from "@/db/users";
import { AUTH_COOKIE_NAME, hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    let name = "Guest Creator";

    try {
      const body = await request.json();
      if (body?.name && typeof body.name === "string" && body.name.trim().length > 0) {
        name = body.name.trim();
      }
    } catch {
      // Body is optional; fallback to default name
    }

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const guestEmail = `guest_${uniqueSuffix}@guest.local`;
    const randomSecret = crypto.randomUUID();
    const passwordHash = await hashPassword(randomSecret);

    const user = await createUser({
      name,
      email: guestEmail,
      passwordHash,
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email, isGuest: true },
      },
      { status: 201 },
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { error: "Failed to create guest session. Please try again." },
      { status: 500 },
    );
  }
}
