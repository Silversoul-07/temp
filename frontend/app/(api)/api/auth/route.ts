import { authenticateUser, getUserFromToken } from "@/db/crud"
import { signInSchema } from "@/lib/zod"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
    
        const { username, password } = await signInSchema.parseAsync(body)

        const token = await authenticateUser(username, password)
        const result = {"token": token, "token_type": "Bearer"}
        return NextResponse.json(result, { status: 200 })
    }
    catch (error: any) {
        console.error("Error signing in:", error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}