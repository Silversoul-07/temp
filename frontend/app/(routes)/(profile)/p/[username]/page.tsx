import { Metadata, ResolvingMetadata } from "next";
import Profile from "@/components/Profile";
import { getProfile, getUserCollections } from "@/lib/api";
import NotFound from "@/components/Notfound";

type Props = {
  params: Promise<{ username: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { username } = await params;
   
  return {
    title: username,
    description: "Prodile page",
  }
}

const ProfilePage: React.FC<Props> = async ({ params, searchParams }: Props) => {
  const { username } = await params;
  const userData = await getProfile(username);

  if (!userData) {
    return <NotFound />
  }

  const collectionItems = await getUserCollections(username);

  return (
    <Profile 
      userData={userData} 
      exploreItems={collectionItems} 
    />
  );
};

export default ProfilePage;