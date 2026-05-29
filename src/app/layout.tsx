import type { Metadata } from "next";
import { StyledComponentsRegistry } from "@/lib/registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hoppr Business — Bar Management Platform",
  description: "Manage your bars, promotions, passes, and analytics with Hoppr Business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
