import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadImage, createCluster } from '@/lib/api';
import Image from 'next/image';

interface ImageData {
    image: File;
    title: string;
    desc?: string;
    tags?: string[];
    collection: string;
}

const ImageUploader = ({ onClose }: { onClose: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [metadata, setMetadata] = useState({
        title: '',
        desc: '',
        tags: '',
        collection: 'saved'
    });
    
    const router = useRouter();
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
        setMetadata(prev => ({
            ...prev,
            title: imageFile.name.split('.')[0]
        }));
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

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const imageData: ImageData = {
                image: file,
                title: metadata.title,
                desc: metadata.desc,
                tags: metadata.tags ? metadata.tags.split(',') : [],
                collection: metadata.collection
            };
            await uploadImage(imageData);
            onClose();
        } catch (error) {
            console.error('Upload failed', error);
            setLoading(false);
        }
    };

    const handleCreateCluster = async () => {
        if (!file) return;
        setLoading(true);
        try {
            await createCluster(file, metadata.title, metadata.desc);
            onClose();
        } catch (error) {
            console.error('Cluster creation failed', error);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div ref={uploaderRef} className="w-full max-w-md mt-10">
                <Card className="p-6 relative">
                    <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                    <Tabs defaultValue="image" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="image">Image</TabsTrigger>
                            <TabsTrigger value="cluster">Cluster</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="image">
                            <CardContent className="p-0">
                                {!file ? (
                                    <div {...getRootProps()}
                                        className={`min-h-[250px] border-2 border-dashed rounded-lg p-6 text-center 
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
                                            <p className="text-lg font-semibold text-gray-600">
                                                or
                                            </p>
                                            <Button onClick={open} className="w-full mt-4">
                                                Choose File
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative h-48 w-full">
                                            <Image 
                                                src={preview} 
                                                alt="Preview" 
                                                fill 
                                                className="object-contain rounded"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={metadata.title}
                                                    onChange={(e) => setMetadata(prev => ({
                                                        ...prev,
                                                        title: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="desc">Description</Label>
                                                <Textarea
                                                    id="desc"
                                                    className="resize-none"
                                                    value={metadata.desc}
                                                    onChange={(e) => setMetadata(prev => ({
                                                        ...prev,
                                                        desc: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                                <Input
                                                    id="tags"
                                                    value={metadata.tags}
                                                    onChange={(e) => setMetadata(prev => ({
                                                        ...prev,
                                                        tags: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="collection">Collection</Label>
                                                <Input
                                                    id="collection"
                                                    value={metadata.collection}
                                                    onChange={(e) => setMetadata(prev => ({
                                                        ...prev,
                                                        collection: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button variant="outline" onClick={() => {
                                                setFile(null);
                                                setPreview('');
                                            }}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleUpload} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Upload'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="cluster">
                            <CardContent className="p-0">
                                {!file ? (
                                    <div {...getRootProps()}
                                        className={`min-h-[250px] border-2 border-dashed rounded-lg p-6 text-center 
                                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                                        hover:border-blue-500 transition-colors`}>
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 flex items-center justify-center">
                                                <Image src="/assets/upload.png" alt="upload" width={50} height={50} />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-600">
                                                Upload thumbnail for cluster
                                            </p>
                                            <Button onClick={open} className="w-full mt-4">
                                                Choose File
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative h-48 w-full">
                                            <Image 
                                                src={preview} 
                                                alt="Preview" 
                                                fill 
                                                className="object-contain rounded"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor="cluster-title">Cluster Title</Label>
                                                <Input
                                                    id="cluster-title"
                                                    value={metadata.title}
                                                    onChange={(e) => setMetadata(prev => ({
                                                        ...prev,
                                                        title: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="cluster-desc">Cluster Description</Label>
                                                <Textarea
                                                    id="cluster-desc"
                                                    className="resize-none"
                                                    value={metadata.desc}
                                                    onChange={(e) => setMetadata(prev => ({
                                                        ...prev,
                                                        desc: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button variant="outline" onClick={() => {
                                                setFile(null);
                                                setPreview('');
                                            }}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreateCluster} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create Cluster'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default ImageUploader;