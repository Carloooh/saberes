import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userSessionCookie = req.headers.get("cookie")?.match(/userSession=([^;]*)/)?.[1];

  if (!userSessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({ authenticated: true }, { status: 200 });
}
