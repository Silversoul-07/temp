import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { fetchTags, fetchMedias } from '@/lib/api';

type Props = {
  params: Promise<{ name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const title = (await searchParams).q  as string;

  return {
    title: title,
    description: "Collection page",
  }
}

export default async function HomePage({ params, searchParams }: Props) {

  const tags = await fetchTags();
  const medias = await fetchMedias();

  return <Gallery media={medias} tags={tags} />;
}