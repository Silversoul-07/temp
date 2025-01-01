import { object, string } from "zod"
 
export const signInSchema = object({
  username: string({ required_error: "Username is required" })
    // .min(1, "Username is required")
    // .max(32, "Username must be less than 32 characters")
    .regex(/^[a-zA-Z0-9_]*$/, "Username must only contain letters, numbers, and underscores"),
  password: string({ required_error: "Password is required" })
    // .min(1, "Password is required")
    // .min(8, "Password must be more than 8 characters")
    // .max(32, "Password must be less than 32 characters")
    .regex(/^[a-zA-Z0-9_]*$/, "Password must only contain letters, numbers, and underscores"),
})