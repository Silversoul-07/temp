import { addFollower, decodeToken, removeFollower } from "@/db/crud";
import { extractToken } from "@/lib/helper";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(req: NextRequest, res: NextResponse, { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    try {
        const token = await extractToken(req);
        const payload = await decodeToken(token);
        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }
        const result = await addFollower(username, payload.id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}

export async function DELETE(req: NextRequest, res: NextResponse, { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    try {
        const token = await extractToken(req);
        const payload = await decodeToken(token);
        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }
        const result = await removeFollower(username, payload.id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}