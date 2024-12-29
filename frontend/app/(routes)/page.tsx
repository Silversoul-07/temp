import React from 'react';
import { Metadata } from 'next';
import Gallery from '@/components/Gallery';
import { fetchTags, fetchMedias } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Home',
  description: 'A gallery of images',
};

export default async function HomePage() {
  const tags = await fetchTags();
  const medias = await fetchMedias();

  return <Gallery media={medias} tags={tags} />

}