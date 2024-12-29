import { getUserByUsername, getUserFromToken } from "@/db/crud";
import { NextResponse, NextRequest } from "next/server";

// GET request handler
export async function GET(request: NextRequest,{ params }: { params: Promise<{ username: string }> }
) {
    let user;
  const username = (await params).username;
  if (username === 'me'){
    // ger authorization token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing or malformed.' },
        { status: 401 }
      );
    }
    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    user = await getUserFromToken(token);
    if(!user){
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    user.is_owner = true;
  }
  else{
    user = await getUserByUsername(username);
    user.is_following = false;
  }

  if (user) {
    return NextResponse.json(user);
  }

  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
