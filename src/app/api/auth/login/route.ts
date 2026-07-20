import { NextRequest, NextResponse } from "next/server";
import { checkPassword } from "@/lib/password";
import { createSessionToken, COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  let valid: boolean;
  try {
    valid = password.length > 0 && checkPassword(password);
  } catch {
    return NextResponse.json(
      { error: "Server is missing LEE_APP_PASSWORD configuration." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return res;
}
