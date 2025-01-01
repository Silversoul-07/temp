import { Card, CardContent } from '@/components/ui/card';
import { useClient } from '@/lib/helper';
import Image from 'next/image';
import Link from 'next/link';

type Image = {
  id: number;
  url: string;
  title: string;
  desc: string;
};

type VisualSearchProps = {
  image: Image;
  items: Image[];
};

export default function VisualSearch({ image, items }: VisualSearchProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Featured Image Section */}
        <div className="lg:w-2/5 shrink-0">
          <div className="sticky top-20">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <div className="aspect-w-4 aspect-h-3 relative">
                <img 
                  src={useClient(image.url)}
                  alt={image.title}
                  
                  className="object-cover transition-transform hover:scale-105 duration-300" 
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <h1 className="text-2xl font-bold">{image.title}</h1>
              <p className="text-muted-foreground">{image.desc}</p>
              <Link 
                href="/home" 
                className="inline-block text-primary hover:text-primary/80 underline-offset-4 hover:underline"
              >
                View source
              </Link>
            </div>
          </div>
        </div>

        {/* Masonry Grid Section */}
        <div className="lg:w-3/5">
          <h2 className="text-xl font-semibold mb-6">Similar images</h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {items.map((item, index) => (
              <div key={index} className="break-inside-avoid">
                <Link 
                  href={`/visual-search/${item.id}`} 
                  className="block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative group">
                    <Image
                      src={item.url}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4">
                        <h3 className="text-white text-sm font-medium truncate">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}