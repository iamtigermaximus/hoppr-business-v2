"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }
    const role = (session.user as any)?.role;
    if (role === "SUPER_ADMIN") router.push("/admin");
    else if (role === "BAR_MANAGER") router.push("/dashboard");
    else router.push("/login");
  }, [session, status, router]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <div style={{ color: "#737373" }}>Loading...</div>
    </div>
  );
}
