import { ObjectId } from "mongodb";
import clientPromise from "db/initDb";
import { hashPassword, comparePassword } from "@/db/utils";
import jwt from 'jsonwebtoken';
import { JWTPayload, UserSession } from "@/db/types";
import { User, Image, Follow } from "@/db/models";

const JWT_SECRET = process.env.JWT_SECRET as string;


export const  decodeToken = async (token: string): Promise<JWTPayload> => {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const client = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection<User>("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) });
    if (!user) {
        throw new Error("User not found");
    }
    return payload;
}

// Function to create a new user
export const createUser = async (userData: {
    name: string;
    username: string;
    password: string;
    avatar?: string;
    bio?: string;
}): Promise<void> => {
    try {
        const client = await clientPromise;
        const db = client.db("test"); // Use your database name
        const usersCollection = db.collection<User>("users");

        // Check if the username already exists
        const existingUser = await usersCollection.findOne({ username: userData.username });
        if (existingUser) {
            throw new Error("Username already exists.");
        }

        // Hash the password
        const hashedPassword = await hashPassword(userData.password);

        // Create the new user object
        const newUser: User = {
            name: userData.name,
            username: userData.username,
            password: hashedPassword,
            avatar: userData.avatar || null,
            bio: userData.bio || null,
            collection_count: 0,
            follower_count: 0,
            following_count: 0,
            created_at: new Date(),
        };

        // Insert the new user into the database
        const result = await usersCollection.insertOne(newUser);
        if (!result.acknowledged) {
            throw new Error("Failed to create user.");
        }
    } catch (error) {
        console.error("Error creating user:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
};

// Function to authenticate a user and generate JWT token
export const authenticateUser = async (username: string, password: string): Promise<string | null> => {
    const client = await clientPromise;
    const db = client.db("test"); // Use your database name
    const usersCollection = db.collection<User>("users");

    // Find the user by username
    const user = await usersCollection.findOne({ username });
    if (!user) {
        throw new Error("User not found.");
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password.");
    }

    // Create JWT payload
    const payload = {
        id: user._id?.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Token valid for 24 hours
    };

    // Sign the JWT token
    const JWT_SECRET = process.env.JWT_SECRET as string;
    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

    return token;

};

//Get user by username
export const getUserByUsername = async (username: string): Promise<User | null> => {
    try {
        const client = await clientPromise;
        const db = client.db("test"); // Use your database name
        const usersCollection = db.collection<User>("users");

        const user = await usersCollection.findOne({ username });
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

// Function to get session from JWT token
export const getUserFromToken = async (token: string): Promise<UserSession | null> => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Optionally, you can fetch fresh user data from the database
        // to ensure the session is up-to-date
        const client = await clientPromise;
        const db = client.db("test"); // Use the default database or specify one
        const usersCollection = db.collection<User>("users");

        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });
        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error("GetSession error:", error);
        return null;
    }
};

// Function to get the latest feed
export const getLatestFeed = async (num: number): Promise<Array<{ id: string; url: string; title: string; desc?: string }>> => {
    try {
        const client = await clientPromise;
        const db = client.db("test"); // Use your database name
        const imagesCollection = db.collection<Image>("images");

        const images = await imagesCollection.find({})
            .sort({ created_at: -1 })
            .limit(num)
            .project({ url: 1, title: 1, desc: 1 })
            .toArray();

        return images.map(image => ({
            id: image._id?.toString() || '',
            url: image.url,
            title: image.title,
            desc: image.desc,
        }));
    } catch (error) {
        console.error("Error fetching latest feed:", error);
        return [];
    }
};



// Add follower to a user
export const addFollower = async (username: string, userId: string): Promise<{ id: string }> => {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");
        const followCollection = db.collection("follow");

        const followedUser = await usersCollection.findOne({ username });
        if (!followedUser) {
            throw new Error("User not found");
        }

        const follow: Follow = {
            follower_id: new ObjectId(userId),
            followed_id: followedUser._id,
        };

        const result = await followCollection.insertOne(follow);

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { following_count: 1 } }
        );

        await usersCollection.updateOne(
            { _id: followedUser._id },
            { $inc: { follower_count: 1 } }
        );

        return { id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error adding follower:", error);
        throw error;
    }
};

// Remove follower from a user
export const removeFollower = async (username: string, userId: string): Promise<{ detail: string }> => {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");
        const followCollection = db.collection("follow");

        const followedUser = await usersCollection.findOne({ username });
        if (!followedUser) {
            throw new Error("User not found");
        }

        const result = await followCollection.deleteOne({
            follower_id: new ObjectId(userId),
            followed_id: followedUser._id,
        });

        if (result.deletedCount > 0) {
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { following_count: -1 } }
            );

            await usersCollection.updateOne(
                { _id: followedUser._id },
                { $inc: { follower_count: -1 } }
            );

            return { detail: "Follower removed" };
        }

        throw new Error("Follower not found");
    } catch (error) {
        console.error("Error removing follower:", error);
        throw error;
    }
};

export const getCollectionId = async (title: string): Promise<string|null> => {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const collections = db.collection("collections");

        const collection = await collections.findOne({ title });
        if (!collection) {
            return null;
        }

        return collection._id.toString();
    } catch (error) {
        console.error("Error fetching collection:", error);
        throw error;
    }
}

// Upload an image
export const uploadImage = async (imageData: {
    url: string;
    title: string;
    desc?: string;
    tags: string[];
    collection: string;
    user_id: string;
}): Promise<{ id: string }> => {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const images = db.collection("images");
        const imageCollection = db.collection("image_collection");

        const image = {
            ...imageData,
            created_at: new Date(),
        };

        const result = await images.insertOne(image);
        const imageId = result.insertedId.toString();
        let collectionId = await getCollectionId(imageData.collection);
        if (!collectionId) {
            // Create a new collection
            const newCollection = {
                title: imageData.collection,
                desc: "",
                thumbnail: imageData.url,
                user_id: imageData.user_id,
            };
            const collectionResult = await createCollection(newCollection);
            collectionId = collectionResult.id;
        }
        await imageCollection.insertOne({
            image_id: new ObjectId(imageId),
            collection_id: new ObjectId(collectionId),
        });

        // Update the collection count
        await db.collection("collections").updateOne(
            { _id: new ObjectId(collectionId) },
            { $inc: { image_count: 1 } }
        );

        return { id: imageId };
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// Get the latest images
export const getLatestImages = async (n: number): Promise<Array<{ id: string; url: string; title: string; desc?: string }>> => {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const imagesCollection = db.collection("images");

        const images = await imagesCollection
            .find({})
            .sort({ created_at: -1 })
            .limit(n)
            .toArray();

        return images.map(image => ({
            id: image._id?.toString() || "",
            url: image.url,
            title: image.title,
            desc: image.desc,
        }));
    } catch (error) {
        console.error("Error fetching latest images:", error);
        throw error;
    }
};

// Search for images by query
export const searchImages = async (query: string): Promise<Array<{ id: string; url: string; title: string; desc?: string }>> => {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const imagesCollection = db.collection("images");

        const images = await imagesCollection
            .find({ $text: { $search: query } })
            .toArray();

        return images.map(image => ({
            id: image._id?.toString() || "",
            url: image.url,
            title: image.title,
            desc: image.desc,
        }));
    } catch (error) {
        console.error("Error searching images:", error);
        throw error;
    }
};

export async function addFollowToCluster(username: string, userId: string): Promise<{ id: string }> {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");
        const followCollection = db.collection("follow");

        const followedUser = await usersCollection.findOne({ username });
        if (!followedUser) {
            throw new Error("User not found");
        }

        const follow: Follow = {
            follower_id: new ObjectId(userId),
            followed_id: followedUser._id,
        };

        const result = await followCollection.insertOne(follow);

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { following_count: 1 } }
        );

        await usersCollection.updateOne(
            { _id: followedUser._id },
            { $inc: { follower_count: 1 } }
        );

        return { id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error adding follower:", error);
        throw error;
    }
}

export async function removeFollowFromCluster(username: string, userId: string): Promise<{ detail: string }> {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");
        const followCollection = db.collection("follow");

        const followedUser = await usersCollection.findOne({ username });
        if (!followedUser) {
            throw new Error("User not found");
        }

        const result = await followCollection.deleteOne({
            follower_id: new ObjectId(userId),
            followed_id: followedUser._id,
        });

        if (result.deletedCount > 0) {
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { following_count: -1 } }
            );

            await usersCollection.updateOne(
                { _id: followedUser._id },
                { $inc: { follower_count: -1 } }
            );

            return { detail: "Follower removed" };
        }

        throw new Error("Follower not found");
    } catch (error) {
        console.error("Error removing follower:", error);
        throw error;
    }
}

export async function getMediaById(id: string){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const imagesCollection = db.collection("images");

        const image = await imagesCollection.findOne({ _id: new ObjectId(id) });
        return image;
    } catch (error) {
        console.error("Error fetching image:", error);
        return null;
    }
}

export async function createCollection(collectionData: {
    title: string;
    desc?: string;
    thumbnail?: string;
    user_id?: string;
}): Promise<{ id: string }> {
    try {
        if (!collectionData.user_id) {
            throw new Error("Unauthorized");
        }
        if (!collectionData.title){
            throw new Error("Collection title is required");
        }
        const client = await clientPromise;
        const db = client.db("test");
        const collectionsCollection = db.collection("collections");

        const user_id = new ObjectId(collectionData.user_id);
        delete collectionData.user_id;
        const collection = {
            ...collectionData,
            image_count: 0,
            follower_count: 0,
            user_id,
            created_at: new Date(),
        };

        const result = await collectionsCollection.insertOne(collection);
        return { id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error creating collection:", error);
        throw error;
    }
}

// export async function getAllCollections(){
//     try {
//         const client = await clientPromise;
//         const db = client.db("test");
//         const collectionsCollection = db.collection("collections");

//         const collections = await collectionsCollection.find({}).toArray();
//         return collections;
//     } catch (error) {
//         console.error("Error fetching collections:", error);
//         return [];
//     }
// }

export async function getClusters(page: number, limit: number){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const collectionsCollection = db.collection("collections");

        const total = await collectionsCollection.countDocuments();

        const collections = await collectionsCollection.find({})
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        return {
            data: collections,
            total,
        };
    } catch (error) {
        console.error("Error fetching collections:", error);
        return { data: [], total: 0 };
    }
}

export async function getCollectionInfo(title: string){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const collectionsCollection = db.collection("collections");

        const collection = await collectionsCollection.findOne({ title });
        return collection;
    } catch (error) {
        console.error("Error fetching collection:", error);
        return null;
    }
    
}

export async function getImagesInCluster(title: string){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const collectionsCollection = db.collection("collections");

        const collection = await collectionsCollection.findOne({ title });
        if (!collection) {
            throw new Error("Collection not found");
        }

        const imageCollection = db.collection("image_collection");
        const image_ids = await imageCollection.find({ collection_id: collection._id }).toArray();
        const imagesCollection = db.collection("images");
        const images = await imagesCollection.find({ _id: { $in: image_ids.map(image => image.image_id) } }).toArray();
        return images;
    } catch (error) {
        console.error("Error fetching images in collection:", error);
        return [];
    }
}

export async function getUserClusters(user_id: string){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const collectionsCollection = db.collection("collections");

        const collections = await collectionsCollection.find({ user_id: new ObjectId(user_id) }).toArray();
        return collections;
    } catch (error) {
        console.error("Error fetching user collections:", error);
        return [];
    }
}

export async function getUser(user_id: string){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function getUserCollections(username: string){
    try {
        if (!username) {
            throw new Error("Username is required");
        }
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ username });
        if (!user) {
            throw new Error("User not found");
        }

        const collectionsCollection = db.collection("collections");
        const collections = await collectionsCollection.find({ user_id: user._id }).toArray();
        return collections;
    } catch (error) {
        console.error("Error fetching user collections:", error);
        return [];
    }
}


export async function deleteImage(image_id: string, user_id: string){
    try {
        if (!image_id) {
            throw new Error("Image ID is required");
        }
        const client = await clientPromise;
        const db = client.db("test");
        const imagesCollection = db.collection("images");

        const image = await imagesCollection.findOne({ _id: new ObjectId(image_id) });
        if (!image) {
            throw new Error("Image not found");
        }

        if (image.user_id !== user_id) {
            throw new Error("Unauthorized");
        }

        const result = await imagesCollection.deleteOne({ _id: new ObjectId(image_id) });
        return { detail: "Image deleted" };
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}

export async function deleteCollection(title: string, user_id: string){
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const collectionsCollection = db.collection("collections");

        const collection = await collectionsCollection.findOne({ title });
        if (!collection) {
            throw new Error("Collection not found");
        }

        if (collection.user_id !== user_id) {
            throw new Error("Unauthorized");
        }

        const result = await collectionsCollection.deleteOne({ title });
        
        // Delete images in the collection
        const imageCollectionCollection = db.collection("image_collection");
        //delete in image_collection and images
        const images = await imageCollectionCollection.find({ collection_id: collection._id }).toArray();
        await imageCollectionCollection.deleteMany({ collection_id: collection._id });
        const imagesCollection = db.collection("images");
        for (const image of images) {
            await imagesCollection.deleteOne({ _id: image.image_id });
        }
        return { detail: "Collection deleted" };
    } catch (error) {
        console.error("Error deleting collection:", error);
        throw error;
    }
}

export async function updateUser(userData: {
    name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    password?: string;
    user_id: string;
}): Promise<{ detail: string }> {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ _id: new ObjectId(userData.user_id) });
        if (!user) {
            throw new Error("User not found");
        }

        if (user.username !== userData.username) {
            throw new Error("Unauthorized");
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userData.user_id) },
            {
                $set: {
                    username: userData.username? userData.username : user.username,
                    name: userData.name ? userData.name : user.name,
                    avatar: userData.avatar ? userData.avatar : user.avatar,
                    bio: userData.bio ? userData.bio : user.bio,
                    password: userData.password ? await hashPassword(userData.password) : user.password,
                },
            }
        );

        return { detail: "User updated" };
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
} 