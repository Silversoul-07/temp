import Explore from "@/components/Explore";
import { Metadata } from "next";
import { fetchClusters } from "@/lib/api";

export const metadata: Metadata = {
    title: 'Explore',
    description: 'A expore page',
}

export default async function ExplorePage(){
    
    const page = 1;
    const limit = 10;
    const { data } = await fetchClusters(page, limit);

    return <Explore items={data} />;

}