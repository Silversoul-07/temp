import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import ImageView from '@/components/View';
import { fetchMediaById, fetchMedias } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Pending improve ImageView component
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {

  return {
    title: "Image",
    description: "Collection page",
  }
}

export default async function ImageViewPage({ params, searchParams }: Props) {
  const { id } = (await params);
  const image = await fetchMediaById(id);
  const medias = await fetchMedias();

  if (!image) {
    notFound();
  }
  
  return (
    <>
        <ImageView image={image.url} caption={image.title || "Dummy Caption"}/>
        <Gallery media={medias} />;
    </>
  )
}
