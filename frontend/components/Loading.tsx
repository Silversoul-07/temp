import React from 'react';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
        </div>
    );
}