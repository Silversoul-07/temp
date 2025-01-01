'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart } from 'lucide-react';
import '@/styles/Masonry.css';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { toast } from 'sonner';

interface Image {
  id: number;
  url: string;
  title: string
  alt: string;
  liked: boolean;
}

const MenuWrapper = ({ children }: { children: React.ReactNode }) => {
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

interface MasonryProps {
  initialImages: Image[];
  fetchMore?:  (page:number, limit:number ) => Promise<Image[]>;
}

const Masonry: React.FC<MasonryProps> = ({ initialImages, fetchMore }) => {
  const limit = 3;
  const [images, setImages] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastImageRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    []
  );
  useEffect(() => {
    const resizeGridItem = (item: HTMLElement) => {
      const grid = document.querySelector('.masonry');
      const rowHeight = parseInt(window.getComputedStyle(grid!).getPropertyValue('grid-auto-rows'));
      const rowGap = parseInt(window.getComputedStyle(grid!).getPropertyValue('gap'));
      const img = item.querySelector('.lazy-image') as HTMLImageElement;

      if (img.complete) {
        const height = img.getBoundingClientRect().height;
        const spans = Math.floor((height + rowGap) / (rowHeight + rowGap));
        item.style.gridRowEnd = `span ${spans}`;
      } else {
        img.addEventListener('load', () => {
          const height = img.getBoundingClientRect().height;
          const spans = Math.floor((height + rowGap) / (rowHeight + rowGap));
          item.style.gridRowEnd = `span ${spans}`;
        });
      }
    };

    const allItems = document.querySelectorAll('.masonry-item');
    allItems.forEach(item => resizeGridItem(item as HTMLElement));
  }, [images]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      if (images.length === 0) {
        setImages(initialImages);
      } else if (fetchMore) {
        const newImages: Image[] = await fetchMore(limit, page);
        setImages(prev => [...prev, ...newImages]);
      }
      setLoading(false);
    };
  
    fetchImages();
  }, [page]);
  useEffect(() => {
    const lazyLoad = () => {
      const images = document.querySelectorAll('.lazy-image');
      images.forEach(img => {
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.onload = () => img.classList.add('loaded');
        }
      });
    };
    lazyLoad();
  }, [images]);

  const handleLike = (index: number) => {
    const newImages = [...images];
    if(newImages[index].liked === true){
      toast.error("Removed from favorites");
    }else{
      toast.success("Added to favorites");
    }
    newImages[index].liked = !newImages[index].liked;
    setImages(newImages);
  }

  return (
    <div className="masonry">
      {images.map((image, index) => {
        if (index === images.length - 1) {
          return (
            <div className="masonry-item relative group" key={index} ref={lastImageRef}>
              <MenuWrapper>
                <img
                  src={image.url}
                  data-src={image.url}
                  alt={image.alt}
                  className="lazy-image w-full"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div onClick={() => handleLike(image.id)}>
                <Heart className={`border-red-500 absolute top-2 right-2 w-6 h-6 hover:text-red-500 cursor-pointer ${image.liked ? 'fill-red-500 ' : ''}`} />          
                </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <img src="/api/placeholder/32/32" alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="text-white">
                      <div>Title</div>
                      <div>Username</div>
                    </div>
                  </div>
                </div>
              </MenuWrapper>
            </div>
          );
        }
        return (
          <div className="masonry-item relative group" key={index}>
            <MenuWrapper>
              <img
                src={image.url}
                data-src={image.url}
                alt={image.alt}
                className="lazy-image w-full"
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div onClick={() => handleLike(index)}>
                <Heart className={`border-red-500 absolute top-2 right-2 w-6 h-6 hover:text-red-500 cursor-pointer ${image.liked ? 'fill-red-500 stroke-red-500' : ''}`} />             
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <img src="/api/placeholder/32/32" alt="avatar" className="w-8 h-8 rounded-full" />
                  <div className="text-white">
                    <div>{image.title}</div>
                    <div>Username</div>
                  </div>
                </div>
              </div>
            </MenuWrapper>
          </div>
        );
      })}
      {loading && (
        <div className="col-span-full text-center py-4 text-gray-500">
          Loading...
          </div>
          )}
      {!loading && (
        <div className="col-span-full text-center py-4 text-gray-500">
        You've reached the end
      </div>
      )
      }
    </div>
  );
};

export default Masonry;