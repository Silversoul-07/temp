'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Maximize, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClient } from '@/lib/helper';

interface ImageViewProps {
  image: string;
  album?: string[];
  caption?: string;
}

export const ImageView: React.FC<ImageViewProps> = ({ 
  image,
  album,
  caption
}) => {
  const [isCaptionVisible, setIsCaptionVisible] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showScrollDown, setShowScrollDown] = useState(true);

  const toggleLightbox = () => {
    setIsLightboxOpen(!isLightboxOpen);
    setCurrentImageIndex(0);
  };

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setShowScrollDown(false);
    } else {
      setShowScrollDown(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderCaption = () => {
    if (!caption) return 'No caption available';
    return caption;
  };

  return (
    <>
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
          <div 
            className={cn(
              "md:w-full flex items-center justify-center p-4 transition-all duration-300",
              !isCaptionVisible ? "md:w-full" : "md:w-[76%]"
            )}
          >
            <div className="relative group">
              <img 
                src={useClient(image)} 
                alt="Detailed View" 
                className="max-h-[calc(100vh-200px)] w-auto object-contain cursor-pointer"
                onClick={() => toggleLightbox()}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-100 transition-opacity"
                onClick={() => toggleLightbox()}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {(album || caption) && (
            <div className="mx-4 md:w-[24%] bg-[#f1f1e7] dark:bg-[#1d1d1d] p-4 overflow-auto text-black dark:text-white rounded-lg lg:mr-6 ">
              {album && album.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Album</h3>
                  {/* Album thumbnails can be added here if needed */}
                </div>
              )}
              <h3 className="text-lg font-semibold">Caption</h3>
              <div className={`${isCaptionVisible ? 'block' : 'hidden'}`}>
                {renderCaption()}
              </div>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          onClick={() => setIsCaptionVisible(!isCaptionVisible)}
        >
          {isCaptionVisible ? <ChevronDown className="h-5 w-5" /> : <Info className="h-5 w-5" />}
        </Button>
      </div>

      {showScrollDown && (
        <div 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center 
          bg-blue-500 text-white rounded-full px-4 py-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ArrowDown className="h-6 w-6 mr-2" />
          <span>Scroll Down</span>
        </div>
      )}

      <Dialog open={isLightboxOpen} onOpenChange={toggleLightbox}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Viewer</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img 
              src={album ? album[currentImageIndex].replace('minio','localhost') : image.replace('minio','localhost')} 
              alt={`Image ${currentImageIndex + 1}`} 
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>
          {album && album.length > 1 && (
            <div className="flex justify-center space-x-4 mt-4">
              {album.map((_, index) => (
                <Button 
                  key={index} 
                  variant={currentImageIndex === index ? 'default' : 'outline'}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageView;