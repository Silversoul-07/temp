import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
const NoResults: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-black dark:text-white">
            <div className="flex flex-col items-center justify-center h-full p-4 pb-20 sm:px-8">
                <img src="/assets/empty.svg" alt="No results found" className="size-[400px]" />
                <h1 className="text-4xl font-bold">Nothing to see here</h1>
                <p className="mt-4 text-lg text-center">

                    Create a new collection to get started
                    <span role="img" aria-label="emoji">🚀</span>
                </p>
                <Button
                    className="mt-6 rounded" asChild>
                    <Link href="/create?type=collection">

                        Create new
                    </Link>

                </Button>
            </div>

        </div>
    );
};

export default NoResults;