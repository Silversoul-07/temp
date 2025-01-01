import { getCollectionInfo } from "@/db/crud";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ title: string }> }) {
    const title = (await params).title;
    const collection = await getCollectionInfo(title);
    return NextResponse.json(collection);
}