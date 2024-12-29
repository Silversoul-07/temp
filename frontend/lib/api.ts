import axios from "axios";
import { getToken } from "@/lib/apihelp";

// Create an Axios instance (optional but recommended)
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Error fetching token:", error);
      return config; // Proceed without setting the token
    }
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);


export async function fetchTags() {
    const response = await apiClient.get(`/media/tags`);
    return response.data.tags;
}

 export async function fetchMedias() {
    const response = await apiClient.get(`/media?limit=10`);
    return response.data;
  }

  export async function getProfile(username: string) {     
      try{
        const response = await apiClient.get(`/users/${username}`);
        return response.data;
      }
      catch(error){
        return null;
      }
  }

  export async function fetchMediaById(id: string) {
    try {
      const response = await apiClient.get(`/media/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching media:', error);
      return null;
    }
  }
  

  export async function getUserCollections(username: string){
    try {
      const response = await apiClient.get(`/users/${username}/cluster`);
      return response.data;
    } catch (error) {
      console.log('Error fetching user collections:', error);
      return [];
    }
  }

  interface ImageData {
    image: File;
    title: string;
    desc?: string;
    tags?: string[];
    collection: string;
  }

  interface UploadedImageData {
    url: string;
    title: string;
    desc?: string;
    tags: string[];
    collection: string;
  }
  
  export const uploadImage = async (imageData: ImageData): Promise<UploadedImageData> => {
    // Validate image input
    if (!(imageData.image instanceof File || imageData.image instanceof Blob)) {
      throw new Error('Image must be a File or Blob object');
    }
  
    const formData = new FormData();
    
    // Append image as blob/file
    formData.append('image', imageData.image);
    formData.append('title', imageData.title);
    if (imageData.desc) formData.append('desc', imageData.desc);
    if (imageData.tags) formData.append('tags', JSON.stringify(imageData.tags));
    formData.append('collection', imageData.collection);
  
    const response = await apiClient.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    return response.data;
  };

  export const addFollower = async (username: string) => {
    try {
      await apiClient.post(`/users/${username}/followers`);
    } catch (error) {
      console.error('Error adding follower:', error);
    }
  }

  export const removeFollower = async (username: string) => {
    try {
      await apiClient.delete(`/users/${username}/followers`);
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  }

  export const fetchClusters = async (page: number, limit: number = 10) => {
    try {
      const response = await apiClient.get(`/clusters?page=${page}&limit=${limit}`);
      return response.data;
    }
    catch(error){
      console.log('Error fetching clusters:', error);
      return [];
    }
  }

  export const fetchCollectionInfo = async (title: string) => {
    try {
      const response = await apiClient.get(`/clusters/${title}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collection:', error);
      return null;
    }
  }

  export const fetchCollectionItems = async (username: string) => {
    try {
      const response = await apiClient.get(`/users/${username}/collections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collection items:', error);
      return [];
    }
  }
  export const signIn = async (username: string, password: string) => {
      const response = await apiClient.post('/auth', {
          username,
          password,
      });


      return response.data;
};

export const createCluster = async (thumbnail: File, title: string, desc?: string) => {
  try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('desc', desc || '');
      formData.append('thumbnail', thumbnail);

      const response = await apiClient.post('/clusters', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      return response.data;
  } catch (error) {
      console.error('Error creating cluster:', error);
      throw new Error(error.response?.data?.message || 'Internal Server Error');
  }
};

export async function addClusterFollower(username: string) {
  try {
    await apiClient.post(`/clusters/${username}/followers`);
  } catch (error) {
    console.error('Error adding cluster follower:', error);
  }
}

export async function removeClusterFollower(username: string) {
  try {
    await apiClient.delete(`/clusters/${username}/followers`);
  } catch (error) {
    console.error('Error removing cluster follower:', error);
  }
}

export async function updateUserData(formData: FormData) {
  try {
    const response = await apiClient.put('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}