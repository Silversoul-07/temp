import { NextResponse, NextRequest } from "next/server";
import { createCollection, getClusters, deleteCollection } from "@/db/crud";
import { decodeToken } from "@/db/crud";
import { extractToken } from "@/lib/helper";
import { uploadMedia } from "@/lib/minio";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const token = await extractToken(request);
    if (!token) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }
    const user_id = (await decodeToken(token)).id;
    const image = formData.get('thumbnail') as File;
    const imageBuffer = await image.arrayBuffer();
    const imageUrl = await uploadMedia(Buffer.from(imageBuffer), image.name);
    const collectionData = {
        title: formData.get('title') as string,
        desc: formData.get('desc') as string || '',
        thumbnail: imageUrl,
        user_id: user_id,
    }
    const collection = await createCollection(collectionData);
    return NextResponse.json(collection);
}
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { data, total } = await getClusters(page, limit);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    });
}

export async function DELETE(request: NextRequest) {
    const token = await extractToken(request);
    if (!token) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }
    const user_id = (await decodeToken(token)).id;
    const { title } = await request.json();
    await deleteCollection(title, user_id);
    return NextResponse.json({message: "Collection deleted"});
}