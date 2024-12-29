export interface JWTPayload {
    id: string;
    iat: number;
    exp: number;
}
// Define the User DTO (Data Transfer Object) without the password
export interface UserSession {
    name: string;
    username: string;
    avatar?: string | null;
}