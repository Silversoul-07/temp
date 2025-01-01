import { NextResponse } from 'next/server';
import { createUser, getUserFromToken, updateUser } from '@/db/crud'; // Adjust the import path as needed
import { extractToken } from '@/lib/helper';
import { uploadMedia } from '@/lib/minio';

// Define the structure of the incoming request
interface SignupRequest {
  name: string;
  username: string;
  password: string;
  avatar?: string;
  bio?: string;
}

// Define the structure of the response
interface SignupResponse {
  success: boolean;
  message: string;
}

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const body: SignupRequest = await request.json();

    const { name, username, password, avatar, bio } = body;

    // Basic validation
    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Create the new user using the server-side `createUser` function
    const newUser = await createUser({
      name,
      username,
      password,
      avatar: avatar || undefined,
      bio: bio || undefined,
    });

      return NextResponse.json(
        {
          success: true,
          message: 'User created successfully.',
        },
        { status: 201 }
      );
    }
   catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

//update user

export async function PUT(request: Request) {
  try {
    // Parse the token and validate the user
    const token = await extractToken(request);
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data using formidable
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const bio = formData.get('bio') as string;
    const avatar = formData.get('avatar') as File;

    // Handle avatar upload
    let imageUrl = null;
    if (avatar) {
      const avatarBuffer = await avatar.arrayBuffer();
      imageUrl = await uploadMedia(Buffer.from(avatarBuffer), avatar.name);
    }

    // Update user
    const updatedUser = await updateUser({
      name,
      username,
      password,
      avatar: imageUrl,
      bio,
      user_id: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User updated successfully.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}