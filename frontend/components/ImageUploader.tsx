import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadImage, createCluster } from '@/lib/api';
import Image from 'next/image';
import ImageUploadForm from './ImageUploadForm';
import ClusterCreationForm from './ClusterCreationForm';

interface ImageData {
    image: File;
    title: string;
    desc?: string;
    tags?: string[];
    collection: string;
}

const ImageUploader = ({ onClose }: { onClose: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const uploaderRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (e: MouseEvent) => {
        if (uploaderRef.current && !uploaderRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const imageFile = acceptedFiles[0];
        setFile(imageFile);
        setPreview(URL.createObjectURL(imageFile));
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        maxSize: 5 * 1024 * 1024,
        noClick: true,
        noKeyboard: true
    });

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <Card className="w-full max-w-4xl relative" ref={uploaderRef}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 z-10"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
                {/* <Tabs defaultValue="image" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="image">Upload Image</TabsTrigger>
                        <TabsTrigger value="cluster">Create Cluster</TabsTrigger>
                    </TabsList> */}
                    
                    {/* <TabsContent value="image"> */}
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div {...getRootProps()}
                                    className={`min-h-[250px] border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center
                                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                                    hover:border-blue-500 transition-colors`}>
                                    <input {...getInputProps()} />
                                    {file ? (
                                        <div className="relative h-48 w-full">
                                            <Image 
                                                src={preview} 
                                                alt="Preview" 
                                                fill 
                                                className="object-contain rounded"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 flex items-center justify-center mb-4">
                                                <Image src="/assets/upload.png" alt="upload" width={50} height={50} />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-600 mb-2">
                                                Drag & drop an image
                                            </p>
                                            <p className="text-lg font-semibold text-gray-600 mb-4">
                                                or
                                            </p>
                                            <Button onClick={open}>
                                                Choose File
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <ImageUploadForm file={file} onClose={onClose} />
                            </div>
                        </CardContent>
                    {/* </TabsContent>

                    <TabsContent value="cluster">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div {...getRootProps()}
                                    className={`min-h-[250px] border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center
                                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                                    hover:border-blue-500 transition-colors`}>
                                    <input {...getInputProps()} />
                                    {file ? (
                                        <div className="relative h-48 w-full">
                                            <Image 
                                                src={preview} 
                                                alt="Preview" 
                                                fill 
                                                className="object-contain rounded"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 flex items-center justify-center mb-4">
                                                <Image src="/assets/upload.png" alt="upload" width={50} height={50} />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-600 mb-2">
                                                Upload thumbnail for cluster
                                            </p>
                                            <Button onClick={open}>
                                                Choose File
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <ClusterCreationForm file={file} onClose={onClose} />
                            </div>
                        </CardContent>
                    </TabsContent>
                </Tabs> */}
            </Card>
        </div>
    );
};

export default ImageUploader;

