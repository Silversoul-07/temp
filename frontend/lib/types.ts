export interface Media {
    id: number;
    title: string;
    url: string;
    created_at: string;
}
  
export interface UploadMediaParams {
    title: string
    media?: File
    url?: string
  }

// Explore Page TypeScript Schema
export interface ExploreItem {
    id: string;
    // name: string;
    title: string;
    // imageUrl: string;
    url: string;
    numImages: number;
  }

export interface CollectionData {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
}

export interface CollectionInfo{
  title: string;
  description: string;
  tags: string[];
  user: string;
  count: number;
  followers: number;
  is_following: boolean;
  is_owner: boolean;
}
  
export interface ExploreData {
    items: ExploreItem[];
  }

export interface Tags{
    tags: string[];
}
  
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  };

export interface Token{
  access_token: string;
  bearer: string;
  user: any;
}


export type Maybe<T> = T | undefined;
