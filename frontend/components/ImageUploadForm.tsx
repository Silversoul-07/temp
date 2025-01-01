import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/api';

interface ImageUploadFormProps {
    file: File | null;
    onClose: () => void;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({ file, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState({
        title: '',
        desc: '',
        tags: '',
        collection: 'saved'
    });

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const imageData = {
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

    return (
        <div className="space-y-4">
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
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleUpload} disabled={loading || !file}>
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
    );
};

export default ImageUploadForm;

