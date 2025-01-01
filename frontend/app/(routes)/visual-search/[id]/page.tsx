import React from 'react';
import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { fetchMediaById, fetchMedias } from '@/lib/api';
import VisualSearch from '@/components/VisualSearch';
import { shuffleArray } from '@/lib/helper'; //temporarily added

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
    title: 'Visual Search',
    description: 'A gallery of images',
};

export default async function VisualSearchPage({ params, searchParams }: Props) {
  const { id } = (await params);
  const image = await fetchMediaById(id);

  if (!image) {
    notFound();
  }

  const medias: any[] = await fetchMedias();
  const items = Array(150).fill(medias).flat();
  shuffleArray(items);
  return <VisualSearch image={image} items={items} />;
}
