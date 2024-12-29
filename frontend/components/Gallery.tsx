import React from 'react';
import Link from 'next/link';
import { useClient } from '@/lib/helper';
import { Media } from '@/lib/types';
import '@/styles/app.css';
import Tags from '@/components/Tags';
import NoResults from './Empty';

type GalleryProps = {
  media: Media[];
  tags?: string[];
};

const Gallery: React.FC<GalleryProps> = ({media, tags}) => {
  if (!media || media.length === 0) {
    return <NoResults />;
  }
  return (
    <section className="w-full space-y-6 pb-8 md:pb-12">
      <div className="gallery-container max-w-[1300px] mx-auto">
        {tags && <Tags tags={tags} />}
        <div className="gallery">
          {media?.map((item) => (
            <Link key={item.id} href={`/e/${item.id}`}>
              <div 
                key={item.id} 
                className="gallery-item"
              >
                <div className="image-wrapper">
                  <img 
                  src={useClient(item.url)} 
                  alt={item.title} 
                  className="gallery-image cursor-pointer"
                  loading='eager' 
                  />
                  <div className="overlay">
                    <h3>{item.title}</h3>
                  </div>
                </div>
              </div>
            </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;