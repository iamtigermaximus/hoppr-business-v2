"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import styled from "styled-components";
import { House, Tag, Ticket, ChartBar, Gear, SignOut, List, X, Buildings, Scales, Sparkle, PaperPlaneTilt, Robot, Lightbulb, ShieldCheck, Users, Bell } from "@phosphor-icons/react";

const SidebarNav = styled.aside<{ $open: boolean }>`
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
  width: 240px; background: var(--color-bg, #0a0a0a);
  border-right: 1px solid var(--color-card-border, #262626);
  display: flex; flex-direction: column;
  padding: 20px 0;
  transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
  transition: transform 0.2s ease;
  @media (min-width: 768px) { transform: translateX(0); }
`;

const Logo = styled(Link)`
  padding: 0 20px 20px; border-bottom: 1px solid var(--color-card-border, #262626);
  margin-bottom: 16px; text-decoration: none;
  font-weight: 800; font-size: 16px; color: var(--color-text-primary, #fff);
  display: flex; align-items: center; gap: 8px;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 20px; margin: 2px 12px; border-radius: 10px;
  color: ${({ $active }) => ($active ? "#7c3aed" : "var(--color-text-secondary, #a3a3a3)")};
  background: ${({ $active }) => ($active ? "rgba(124,58,237,0.1)" : "transparent")};
  font-size: 13px; font-weight: ${({ $active }) => ($active ? 600 : 500)};
  text-decoration: none; transition: all 0.15s;
  &:hover { background: rgba(124,58,237,0.1); color: #7c3aed; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 40; background: rgba(0,0,0,0.5);
  @media (min-width: 768px) { display: none; }
`;

const MobileToggle = styled.button`
  position: fixed; top: 12px; left: 12px; z-index: 60;
  background: var(--color-card, #1a1a1a); border: 1px solid var(--color-card-border, #262626);
  border-radius: 10px; padding: 8px; cursor: pointer;
  @media (min-width: 768px) { display: none; }
`;

const navItems = [
  { href: "/dashboard", label: "Overview", icon: House, exact: true },
  { href: "/dashboard/campaigns", label: "AI Campaigns", icon: Sparkle },
  { href: "/dashboard/social", label: "Social", icon: PaperPlaneTilt },
  { href: "/dashboard/promotions", label: "Promotions", icon: Tag },
  { href: "/dashboard/passes", label: "Passes", icon: Ticket },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
  { href: "/dashboard/auto-pilot", label: "Auto-Pilot", icon: Robot },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  { href: "/dashboard/settings", label: "Settings", icon: Gear },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // Extract barSlug from pathname for bar-scoped nav items
  const segments = pathname.split("/").filter(Boolean);
  const barSlug =
    segments[0] === "dashboard" &&
    segments[1] &&
    !["campaigns", "social", "promotions", "passes", "analytics", "auto-pilot", "insights", "settings", "staff", "approvals"].includes(segments[1])
      ? segments[1]
      : null;

  return (
    <>
      <MobileToggle onClick={() => setOpen(!open)}>
        <List size={20} color="var(--color-text-primary, #fff)" />
      </MobileToggle>
      {open && <Overlay onClick={() => setOpen(false)} />}
      <SidebarNav $open={open}>
        <Logo href="/dashboard">
          <Buildings size={22} color="#7c3aed" weight="fill" /> Hoppr Business
        </Logo>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <NavItem key={href} href={href} $active={active} onClick={() => setOpen(false)}>
              <Icon size={18} weight={active ? "fill" : "regular"} /> {label}
            </NavItem>
          );
        })}
        {barSlug && (
          <>
            <NavItem
              href={`/dashboard/${barSlug}/staff`}
              $active={pathname.startsWith(`/dashboard/${barSlug}/staff`)}
              onClick={() => setOpen(false)}
            >
              <Users size={18} weight={pathname.startsWith(`/dashboard/${barSlug}/staff`) ? "fill" : "regular"} /> Staff
            </NavItem>
            <NavItem
              href={`/dashboard/${barSlug}/approvals`}
              $active={pathname.startsWith(`/dashboard/${barSlug}/approvals`)}
              onClick={() => setOpen(false)}
            >
              <Bell size={18} weight={pathname.startsWith(`/dashboard/${barSlug}/approvals`) ? "fill" : "regular"} /> Approvals
            </NavItem>
          </>
        )}
        {isAdmin && (
          <>
            <NavItem
              href="/admin/claims"
              $active={pathname.startsWith("/admin/claims")}
              onClick={() => setOpen(false)}
            >
              <Scales size={18} weight={pathname.startsWith("/admin/claims") ? "fill" : "regular"} /> Claims
            </NavItem>
            <NavItem
              href="/admin/compliance"
              $active={pathname.startsWith("/admin/compliance")}
              onClick={() => setOpen(false)}
            >
              <ShieldCheck size={18} weight={pathname.startsWith("/admin/compliance") ? "fill" : "regular"} /> Compliance
            </NavItem>
          </>
        )}
        <div style={{ marginTop: "auto", padding: "0 12px" }}>
          <NavItem
            as="button"
            href=""
            $active={false}
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "none",
              border: "none",
              width: "calc(100% - 24px)",
              cursor: "pointer",
              color: "#ef4444",
            }}
          >
            <SignOut size={18} /> Sign Out
          </NavItem>
        </div>
      </SidebarNav>
    </>
  );
}
