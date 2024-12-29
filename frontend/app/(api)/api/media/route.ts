import { decodeToken, getLatestFeed, uploadImage, deleteImage } from "@/db/crud";
import { NextResponse, NextRequest } from "next/server";
import { uploadMedia } from "@/lib/minio";
import { extractToken } from "@/lib/helper";

export async function GET(request: NextRequest) {
    try {
        const num = request.nextUrl.searchParams.get('limit') as string;
        const feed = await getLatestFeed(parseInt(num || "100"));
        return NextResponse.json(feed);
    }
    catch (error: any) {
        console.error('Feed Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
      const token = await extractToken(request);
      console.log('Token:', token);
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
      const user_id = (await decodeToken(token)).id;
      const formData = await request.formData();
      const image = formData.get('image') as File;
      const title = formData.get('title') as string;
      const desc = formData.get('desc') as string | undefined;
      const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
      const collection = formData.get('collection') as string;
  
      if (!image || !title || !collection) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }
  
      const imageBuffer = await image.arrayBuffer();
      const imageUrl = await uploadMedia(Buffer.from(imageBuffer), image.name);
      const imageData = {
        url: imageUrl,
        title,
        desc,
        tags,
        collection,
        user_id,
      };
  
      const result = await uploadImage(imageData);
        return NextResponse.json(result);
    } catch (error: any) {
      console.error('Upload Error:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

//delete image by image id
export async function DELETE(request: NextRequest) {
    try {
        const token = await extractToken(request);
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }
        const user_id = (await decodeToken(token)).id;
        const { image_id } = await request.json();
        console.log('Delete image:', image_id);
        console.log('User:', user_id);
        const result = await deleteImage(image_id, user_id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}