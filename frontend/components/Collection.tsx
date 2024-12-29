'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CollectionInfo } from '@/lib/types';
import Tags from '@/components/Tags';
import Link from 'next/link';
// import { addCollectionFollower, removeCollectionFollower } from '@/lib/api';

//pass data as props
type collectionProps = {
    info: CollectionInfo
}

const Collection: React.FC<collectionProps> = ({ info }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isFollowing, setIsFollowing] = useState(info.is_following);
    const [followers, setFollowers] = useState(info.followers);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const handleFollow = async () => {
        // await addCollectionFollower(info.title);
        setFollowers(followers + 1);
        setIsFollowing(true);
    }

    const handleUnfollow = async () => {
        // await removeCollectionFollower(info.title);
        setFollowers(followers - 1);
        setIsFollowing(false);
    }

    return (
        <div className="w-full max-w-lg mx-auto p-6 text-center">
            {/* Title */}
            <h1 className="text-4xl font-bold mb-4">{info.title}</h1>

            {/* Owner Info */}
            <div className="flex justify-center items-center space-x-1 mb-4 text-sm">
                <Link href={`/p/${info.user}`}>  
                <p className=" font-semibold">@{info.user}</p>
                </Link>
                <span>·</span>
                <p className="">{info.count} Images</p>
                <span>·</span>
                <p className="">{followers} Followers</p>
            </div>

            {/* Description and Tags */}
            {info.description && (
                <div className="mb-4 text-center">
                    <button onClick={toggleDescription} className="text-blue-500 text-sm mb-2">
                        {showFullDescription ? "Show less" : "Show more"}
                    </button>
                    {showFullDescription && (
                        <>
                            <p className="text-sm">
                                {info.description}
                            </p>
                            <div className='mx-auto'>
                            <Tags tags={info.tags} />   

                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex justify-center space-x-4">
                {isFollowing ? (
                    <Button variant="secondary" size="sm" className="rounded-full" onClick={handleUnfollow}>Unfollow</Button>
                ) : (
                    <Button variant="default" size="sm" className="rounded-full" onClick={handleFollow}>Follow</Button>
                )}
                <Button variant="default" size="sm" className="rounded-full">Share</Button>
            </div>

        </div>
    );
};

export default Collection;