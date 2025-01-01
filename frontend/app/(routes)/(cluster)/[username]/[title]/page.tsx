import Collection from "@/components/Collection";
import Gallery from "@/components/Gallery";
import Masonry from "@/components/Masonry";
import { fetchCollectionInfo, fetchCollectionItems } from "@/lib/api";
import type { Metadata, ResolvingMetadata } from 'next'

// The redirect() and notFound() Next.js methods can also be used inside generateMetadata.

type Props = {
  params: Promise<{ username:string, title: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const title = (await params).title

  return {
    title: title,
    description: "Collection page",
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const {title, username} = await params
  const info = await fetchCollectionInfo(title)
  const media = await fetchCollectionItems(username, title)
  return (
    <div>
      <Collection info={info} />
      <Masonry initialImages={media} />
    </div>
  )
}