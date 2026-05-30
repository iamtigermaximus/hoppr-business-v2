import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as any).role;
  if (role === "SUPER_ADMIN") redirect("/admin");
  if (role === "BAR_MANAGER") redirect("/dashboard");
  redirect("/login");
}
