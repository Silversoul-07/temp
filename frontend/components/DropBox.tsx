'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/api';
import Image from 'next/image';

const DragAndDrop = ({ onClose }: { onClose: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const uploaderRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (e: MouseEvent) => {
        if (uploaderRef.current && !uploaderRef.current.contains(e.target as Node)) {
            onClose();
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const imageFile = acceptedFiles[0];
        setFile(imageFile);
        handleUpload(imageFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        noClick: true,
        noKeyboard: true
    });

    const handleUpload = async (file: File) => {
        console.log('Uploading file', file);
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const { id } = await uploadImage(formData);

            router.push(`/visual-search/${id}`);
            onClose();
        } catch (error) {
            console.error('Upload failed', error);
            setLoading(false);
        }
    };

    return (
        <div ref={uploaderRef} className="w-full max-w-md p-2 mx-auto">            
        <Card className="max-w-md p-4 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    &times;
                </button>
                <CardContent className="p-0">
                    <div {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                        hover:border-blue-500 transition-colors`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <Image src="/assets/upload.png" alt="upload" width={50} height={50} />
                            </div>
                            <p className="text-lg font-semibold text-gray-600">
                                Drag & drop an image
                            </p>
                            <p className="text-sm text-gray-600">
                                Upload to Visual Search
                            </p>
                            <Button
                                onClick={open}
                                disabled={loading}
                                className="w-full mt-4 rounded"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Choose File'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DragAndDrop;