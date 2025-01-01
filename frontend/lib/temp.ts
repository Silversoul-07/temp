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
  import { getHeader } from "@/lib/apihelp";
  
  const API_URL = "http://localhost:3000/api";
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
  
  
  export async function getMedias(): Promise<any[]> {
    try {
      // const response = await axiosInstance.get("/media");
      // return response.data;
      return [];
    } catch (error) {
      // throw new Error("Failed to fetch media");
      console.error('Error fetching media:', error);
      return [];
    }
  }
  
  export async function uploadMedia({
    title,
    media,
    url,
  }: UploadMediaParams): Promise<any> {
    const formData = new FormData();
    formData.append("title", title);
  
    if (media) {
      formData.append("media", media);
    } else if (url) {
      formData.append("url", url);
    }
  
    try {
      const response = await axiosInstance.post("/upload", formData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to upload media");
    }
  }
  
  export async function fetchMedias(): Promise<Media[] > {
    const response = await axiosServer.get('/media');
    return response.data;
  }
  
  export async function fetchCollectionItems(title:string): Promise<Media[] > {
    const response = await axiosServer.get(`/collections/${title}/images`);
    return response.data;
  }
  
  export async function fetchCollectionInfo(title: string): Promise<CollectionInfo> {
    const Header = await getHeader();
    const response = await axiosServer.get(`/collections/${title}`, Header);
    return response.data;
  }
  
  export async function fetchAllCollections(num: number = 1): Promise<CollectionInfo[]> {
    const response = await axiosServer.get('/collections');
    return response.data;
  }
  
  
  
  export async function fetchMediaById(id: string): Promise<Media> {
      const response = await axiosServer.get<Media>(`/media/${id}`);
      return response.data;
  }
  
  
  export async function uploadImage(formData: FormData): Promise<any> {
    try {
      // const response = await axiosInstance.post('/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      // return response.data;
      return { id: 1 };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  export async function autheticateUser(username: string, password: string): Promise<Token> {
    try {
      const response = await axiosClient.post('/auth', { username, password });
  
      return response.data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
  
  export async function createUser(formdata:FormData): Promise<boolean> {
    try {
      const response = await axiosClient.post('/users', formdata);
      return response.status === 201;
    }
    catch(error){
      console.error('Error creating user:', error);
      throw error;
    }
  }
  

  export async function getSession(token: string): Promise<UserProfile> {
    try {
      const response = await axiosServer.get('/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
    
  }
  
  export async function addFollower(username: string): Promise<boolean> {
    try {
      const Header = await getHeader();
      const response = await axiosClient.post(`/users/${username}/followers`, {}, Header);
      return response.status === 200;
    } catch (error) {
      console.error('Error adding follower:', error);
      throw error;
    }
    
  }
  
  export async function removeFollower(username: string): Promise<boolean> {
    try {
      const Header = await getHeader();
      const response = await axiosClient.delete(`/users/${username}/followers`, Header);
      return response.status === 200;
    } catch (error) {
      console.error('Error removing follower:', error);
      throw error;
    } 
    
  }
  
  export async function addCollectionFollower(collection: string) {
    try{
      const Header = await getHeader();
      console.log('Header:', Header);
      const response = await axiosClient.post(`/collections/${collection}/followers`, {}, Header);
      return response.status === 200;
  
    }
    catch(error){
      console.error('Error adding collection follower:', error);
      throw error;
    }
    
  }
  
  export async function removeCollectionFollower(collection: string) {
    try{
      const Header = await getHeader();
      const response = await axiosClient.delete(`/collections/${collection}/followers`, Header);
      return response.status === 200;
  
    }
    catch(error){
      console.error('Error removing collection follower:', error);
      throw error;
    }
    
  }
  