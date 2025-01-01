'use server';
import { cookies } from "next/headers";

export async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value as string;
}

export async function getHeader() {
    const token = await getToken(); // Ensure this function retrieves the token correctly
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  import { 
    UploadMediaParams, 
    Media,
    ExploreItem,
    Tags,
    UserProfile,
    Token,
    CollectionInfo
   } from "@/lib/types";
  import axios from "axios";
  
  const API_URL = "http://backend:8000/api";
  const CLIENT_API = "http://localhost:8000/api";
  const SERVER_API = "http://backend:8000/api";
  
  const axiosInstance = axios.create({
    baseURL: API_URL,
  });
  
  const axiosServer = axios.create({
    baseURL: SERVER_API,
  });
  
  const axiosClient = axios.create({
    baseURL: CLIENT_API,
  });


