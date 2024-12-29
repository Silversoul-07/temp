import { NextRequest } from "next/server";

export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//function takes a url say minio:9000/xyz this function should return localhost:9000/xyz sometimes url may not contain minio
export function useClient(url: string) {
    if (url === null) {
        return 'https://via.placeholder.com/150';
    }
    if (url.includes('minio')) {
        return url.replace('minio', 'localhost');
    }
    return url;
}   

export async function extractToken(request: NextRequest){
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null
        }
        const token = authHeader.split(' ')[1];
        return token;
}

