import { NextResponse,NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export async function GET(req: NextRequest) {
  const token = await getToken({ 
    req, 
    raw: true,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json({ token });
}
