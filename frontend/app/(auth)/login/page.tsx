import AuthPage from "@/components/Auth";
import { Metadata } from "next";
import LogoutMsg from "@/components/Message";

export const metadata: Metadata = {
  title: "Login",
  description: "Authentication page",
};

type Props = {
  params: Promise<{ name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ params, searchParams }: Props) {
  const unauthorized = (await searchParams).unauthorized as string;
  return (
    <>
    <AuthPage mode={'login'} />;
    {unauthorized && <LogoutMsg />}
    </>
  )
}