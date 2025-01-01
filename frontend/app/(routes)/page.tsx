import React from 'react';
import { Metadata } from 'next';
import { fetchTags, fetchMedias } from '@/lib/api';
import Masonry from "@/components/Masonry";

export const metadata: Metadata = {
  title: 'Home',
  description: 'A gallery of images',
};

export default async function HomePage() {
  const tags = await fetchTags();
  const medias = await fetchMedias(40, 1);

  return <Masonry initialImages={medias} fetchMore={fetchMedias} />;

}