import { NextResponse } from 'next/server';

export async function GET() {
    const tags = Array.from({ length: 15 }, () => Math.random().toString(36).substring(2, 15));
    return NextResponse.json({ tags });
}