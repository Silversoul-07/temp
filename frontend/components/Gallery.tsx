'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Bricks from 'bricks.js';
import { useClient } from '@/lib/helper';
import { Media } from '@/lib/types';
import { Heart, Bookmark, Search, Share2, Download, MoreHorizontal } from 'lucide-react';
import Tags from '@/components/Tags';
import NoResults from './Empty';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { fetchMedias } from '@/lib/api';
import { toast } from 'sonner';
type GalleryProps = {
  media: Media[];
  tags?: string[];
};

const MenuWrapper = ({ children }) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Download</ContextMenuItem>
        <ContextMenuItem>Share</ContextMenuItem>
        <ContextMenuItem>Report</ContextMenuItem>
        <ContextMenuItem>Hide</ContextMenuItem>
        <ContextMenuItem>Copy link</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const Gallery: React.FC<GalleryProps> = ({ media, tags }) => {
  const [items, setItems] = useState<Media[]>(media);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bricksInstanceRef = useRef<Bricks.Instance | null>(null);
  const limit = 20;

  // Initialize Bricks.js layout
  useEffect(() => {
    if (containerRef.current) {
      bricksInstanceRef.current = Bricks({
        container: containerRef.current,
        packed: 'data-packed',
        sizes: [
          { columns: 5, gutter: 4 },
        ],
        position: true

      });

      const images = containerRef.current.querySelectorAll('img');
      const loadImages = Array.from(images).map(
        img =>
          new Promise(resolve => {
            if (img.complete) resolve(true);
            else img.onload = () => resolve(true);
          })
      );

      Promise.all(loadImages).then(() => bricksInstanceRef.current?.pack());

      return () => bricksInstanceRef.current?.destroy();
    }
  }, []);

  // Repack Bricks layout when items change
  useEffect(() => {
    const images = containerRef.current?.querySelectorAll('img');
    if (images) {
      const allLoaded = Array.from(images).map(
        img =>
          new Promise(resolve => {
            if (img.complete) resolve(true);
            else img.onload = () => resolve(true);
          })
      );

      Promise.all(allLoaded).then(() => bricksInstanceRef.current?.pack());
    }
  }, [items]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        hasMore &&
        !isLoading
      ) {
        fetchMoreData();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, page]);

  // Fetch more items
  const fetchMoreData = async () => {
    setIsLoading(true);
    try {
      const newData: Media[] = await fetchMedias(limit, page + 1);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFavorite = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    toast('ent has been created', {
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo')
      },
    })
  };
  // IconButton Component
  const IconButton = ({
    Icon,
    onClick,
    label,
  }: {
    Icon: React.ComponentType<{ className: string }>;
    onClick: () => void;
    label: string;
  }) => (
    <button
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  if (!items?.length) return <NoResults />;

  return (
    <section className="w-full space-y-6 pb-8 md:pb-12">
      {tags && <Tags tags={tags} />}

      <div ref={containerRef}>
        {items.map(item => (
          <Link key={item.id} href={`/e/${item.id}`} className="block mb-4">
            <div className="bg-transparent rounded shadow overflow-hidden">
              <div>
                <MenuWrapper>
                  <div className="relative">
                    <button
                      onClick={(e) => handleFavorite(e, item.id)}
                      className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <img
                      src={useClient(item.url)}
                      alt={item.title}
                      className="w-[240px] h-auto"
                      loading="lazy"
                      onLoad={() => bricksInstanceRef.current?.pack()} // Trigger repack after each image loads
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <h3 className="text-white text-lg">{item.title}</h3>

                      <div className="flex space-x-2">
                        <IconButton Icon={Heart} onClick={() => { }} label="Like" />
                        <IconButton Icon={Bookmark} onClick={() => { }} label="Save" />
                        <IconButton Icon={Search} onClick={() => { }} label="Visual Search" />
                        <IconButton Icon={Share2} onClick={() => { }} label="Share" />
                        <IconButton Icon={Download} onClick={() => { }} label="Download" />
                        <IconButton Icon={MoreHorizontal} onClick={() => { }} label="More options" />
                      </div>
                    </div>
                  </div>
                </MenuWrapper>

              </div>
            </div>
          </Link>

        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="w-6 h-6 border-2 border-gray-600 rounded-full animate-spin border-t-transparent" />
        </div>
      )}
    </section>
  );
};

export default Gallery;
