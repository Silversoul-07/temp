import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Tags({tags}: {tags: string[]}) {
    return (
        <div className="flex gap-3 overflow-x-auto whitespace-nowrap no-scroll pb-6">
        {tags?.map((tag, index) => (
          <Link key={tag} href={`/search?q=${tag}`} >
            <Button
              variant="outline"
              className="px-4 min-h-[45px] rounded-sm hover:opacity-80 transition-opacity"
            >
              {tag}
            </Button>
          </Link>
        ))}
      </div>
    )
    
}

// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { useRef } from 'react'

// export default function Tags({tags}: {tags: string[]}) {
//     const scrollRef = useRef<HTMLDivElement>(null);

//     const scrollLeft = () => {
//         scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
//     };

//     const scrollRight = () => {
//         scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
//     };

//     return (
//         <div className="flex items-center">
//             <Button onClick={scrollLeft} className="hidden md:block">←</Button>
//             <div ref={scrollRef} className="flex gap-3 overflow-x-hidden whitespace-nowrap pb-6">
//                 {tags?.map((tag) => (
//                   <Link key={tag} href={`/search?q=${tag}`} >
//                     <Button
//                       variant="outline"
//                       className="px-4 min-h-[45px] rounded-sm hover:opacity-80 transition-opacity"
//                     >
//                       {tag}
//                     </Button>
//                   </Link>
//                 ))}
//             </div>
//             <Button onClick={scrollRight} className="hidden md:block">→</Button>
//         </div>
//     )
// }
