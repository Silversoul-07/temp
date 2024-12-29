import { getMediaById } from "@/db/crud";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const media = await getMediaById(id);
    if (media) {
        return NextResponse.json(media);
    }
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
}