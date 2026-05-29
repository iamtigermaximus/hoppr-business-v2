"use client";
import styled from "styled-components";
import { Sidebar } from "@/components/dashboard/Sidebar";

const Main = styled.main`
  min-height: 100dvh; padding: 20px 24px 24px; background: var(--color-bg, #0a0a0a);
  @media (min-width: 768px) { padding-left: 264px; }
`;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <Main>
        <div style={{ maxWidth: "1200px" }}>{children}</div>
      </Main>
    </>
  );
}
