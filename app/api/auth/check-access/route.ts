import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { path, userType, userId } = await request.json();

    // Get the user session from cookies
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get("userSession");

    if (!userSessionCookie) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie.value);
    } catch (error) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    // Verify that the user in the session matches the requested user
    if (userSession.rut_usuario !== userId) {
      return NextResponse.json({ isValid: false }, { status: 403 });
    }

    // Implement your access control logic here
    // For example, check if a teacher has access to a specific course

    // For now, we'll just return true
    return NextResponse.json({ isValid: true });
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json(
      { isValid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
