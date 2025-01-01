import { addFollowToCluster, decodeToken, removeFollowFromCluster } from "@/db/crud";
import { extractToken } from "@/lib/helper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse, { params }: { params: Promise<{ title: string }> }) {
    const title = (await params).title;

    try {
        const token = await extractToken(req);
        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }
        const payload = await decodeToken(token);
        const result = await addFollowToCluster(title, payload.id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}

export async function DELETE(req: NextRequest, res: NextResponse, { params }: { params: Promise<{ title: string }> }) {
    const title = (await params).title;

    try {
        const token = await extractToken(req);
        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }
        const payload = await decodeToken(token);
        const result = await removeFollowFromCluster(title, payload.id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}