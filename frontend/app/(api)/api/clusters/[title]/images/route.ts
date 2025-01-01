import { getImagesInCluster } from "@/db/crud";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ title: string }> }) {
    const title = (await params).title;
    const images = await getImagesInCluster(title);
    return NextResponse.json(images);
}