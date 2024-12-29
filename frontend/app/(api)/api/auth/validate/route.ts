import { getUserFromToken } from "@/db/crud";
import { extractToken } from "@/lib/helper";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = await extractToken(request);
  if (!token) {
    return NextResponse.json({"message":"Invalid token"});
  }
  const session = await getUserFromToken(token);
  if (session) {
    return NextResponse.json({ session });
  } else {
    return NextResponse.json({"message":"Invalid token"});
  }
}