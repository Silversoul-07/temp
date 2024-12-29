import { Metadata, ResolvingMetadata } from "next";
import Profile from "@/components/Profile";
import { cookies } from 'next/headers'
import { getProfile, getUserCollections } from "@/lib/api";

type Props = {
  params: Promise<{ username: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const cookieStore = await cookies()
  const username = cookieStore.get('username')?.value as string;

  return {
    title: username,
    description: "Prodile page",
  }
}

const ProfilePage: React.FC = async () => {
  const username = 'me';
  const userData = await getProfile(username);
  const collectionItems = await getUserCollections(username);
  return (
    <Profile 
      userData={userData} 
      exploreItems={collectionItems} 
    />
  );
};

export default ProfilePage;