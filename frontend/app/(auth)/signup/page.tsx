import AuthPage from "@/components/Auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup",
  description: "Authentication page",
};


export default function SignPage() {

  return <AuthPage mode='signup' />;
}