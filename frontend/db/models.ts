import { ObjectId } from "mongodb";
// Define the User interface
export interface User {
    _id?: ObjectId;
    name: string;
    username: string;
    password: string;
    avatar?: string | null;
    bio?: string | null;
    collection_count: number;
    follower_count: number;
    following_count: number;
    created_at: Date;
}



// Define the Image interface
export interface Image {
    _id?: ObjectId;
    url: string;
    title: string;
    desc?: string;
    hash: string;
    tags: string[];
    user_id: ObjectId;
    created_at: Date;
}

// Models (interfaces)
export interface Collection {
    _id?: ObjectId;
    title: string;
    desc?: string;
    thumbnail?: string;
    user_id: ObjectId;
    image_count: number;
    follower_count: number;
    created_at: Date;
}

export interface Follow {
    follower_id: ObjectId;
    followed_id: ObjectId;
}

export interface ImageCollection {
    image_id: ObjectId;
    collection_id: ObjectId;
}

export interface CollectionFollower {
    collection_id: ObjectId;
    follower_id: ObjectId;
}
