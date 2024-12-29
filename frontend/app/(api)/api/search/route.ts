import { searchImages } from "@/db/crud";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ query: string }> }) {
    const query = (await params).query;
    const images = await searchImages(query);
    return NextResponse.json(images);
}