import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createCluster } from '@/lib/api';

interface ClusterCreationFormProps {
    file: File | null;
    onClose: () => void;
}

const ClusterCreationForm: React.FC<ClusterCreationFormProps> = ({ file, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState({
        title: '',
        desc: ''
    });

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
        <div className="space-y-4">
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
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleCreateCluster} disabled={loading || !file}>
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
    );
};

export default ClusterCreationForm;

