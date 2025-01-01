import { getUserClusterImages } from "@/db/crud";
import { extractToken } from "@/lib/helper";
import { getUserFromToken, getUserByUsername } from "@/db/crud";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string, title:string }> }) {
    const { username, title } = await params;
    let user_id;
    if (username === 'me') {
        const token = await extractToken(request);
        const user = await getUserFromToken(token);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        user_id = user._id;
    } else {
        const user = await getUserByUsername(username);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        user_id = user._id;
    }
    console.log(user_id, title);
    const images = await getUserClusterImages(user_id, title);
    return NextResponse.json(images);
}