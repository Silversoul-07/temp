import { getUserFromToken, getUserClusters, getUser } from "@/db/crud";
import { extractToken } from "@/lib/helper";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    let user_id;
    let username = (await params).username;
    if (username === 'me') {
        const token = await extractToken(request);
        const user = await getUserFromToken(token);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        user_id = user._id;
    } else {
        const user = await getUser(username);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        user_id = user._id;
    }
    const collections = await getUserClusters(user_id);
    return NextResponse.json(collections);
}