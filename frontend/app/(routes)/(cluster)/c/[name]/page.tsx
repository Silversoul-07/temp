import Collection from "@/components/Collection";
import Gallery from "@/components/Gallery";
import { fetchCollectionInfo, fetchCollectionItems } from "@/lib/api";
import type { Metadata, ResolvingMetadata } from 'next'

// The redirect() and notFound() Next.js methods can also be used inside generateMetadata.

type Props = {
  params: Promise<{ name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const title = (await params).name

  return {
    title: title,
    description: "Collection page",
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const name = (await params).name
  const info = await fetchCollectionInfo(name)
  const media = await fetchCollectionItems('me', name)
  return (
    <div>
      <Collection info={info} />
      <Gallery media={media} />
    </div>
  )
}