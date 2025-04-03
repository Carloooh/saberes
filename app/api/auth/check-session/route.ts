import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // const userSessionCookie = req.headers.get("cookie")?.match(/userSession=([^;]*)/)?.[1];
  const userSessionCookie = req.cookies.get("userSession")?.value;

  if (!userSessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({ authenticated: true }, { status: 200 });
}
