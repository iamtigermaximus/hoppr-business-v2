"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MagnifyingGlass, Funnel, Upload, CaretDown, Buildings } from "@phosphor-icons/react";

interface Bar {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  imageUrl: string | null;
  isActive: boolean;
  claimStatus: string;
  createdAt: string;
  updatedAt: string;
}

type ClaimFilter = "all" | "CLAIMED" | "UNCLAIMED" | "VERIFIED";
type ActiveFilter = "all" | "active" | "inactive";

export default function AdminBarsPage() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/admin/bars")
      .then((r) => r.json())
      .then((data) => {
        setBars(data);
        setLoading(false);
      });
  }, []);

  const filteredBars = useMemo(() => {
    let result = bars;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.address && b.address.toLowerCase().includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q))
      );
    }

    if (claimFilter !== "all") {
      result = result.filter((b) => b.claimStatus === claimFilter);
    }

    if (activeFilter === "active") {
      result = result.filter((b) => b.isActive);
    } else if (activeFilter === "inactive") {
      result = result.filter((b) => !b.isActive);
    }

    return result;
  }, [bars, search, claimFilter, activeFilter]);

  // Bar counts for summary
  const counts = useMemo(() => {
    const claimed = bars.filter((b) => b.claimStatus === "CLAIMED").length;
    const unclaimed = bars.filter((b) => b.claimStatus === "UNCLAIMED").length;
    const verified = bars.filter((b) => b.claimStatus === "VERIFIED").length;
    const active = bars.filter((b) => b.isActive).length;
    const inactive = bars.filter((b) => !b.isActive).length;
    return { claimed, unclaimed, verified, active, inactive };
  }, [bars]);

  const statusBadge = (claimStatus: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      VERIFIED: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
      CLAIMED: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
      UNCLAIMED: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    };
    const c = colors[claimStatus] || { bg: "rgba(115,115,115,0.15)", color: "#737373" };
    return (
      <span style={{ background: c.bg, color: c.color, fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: 600, textTransform: "capitalize" }}>
        {claimStatus.toLowerCase()}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Buildings size={24} color="#7c3aed" weight="fill" /> Bars
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/admin/bars/import" style={{ padding: "10px 18px", background: "var(--color-card, #1a1a1a)", color: "var(--color-text-secondary, #737373)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Upload size={14} weight="fill" /> Import
          </Link>
          <Link href="/admin/bars/create" style={{ padding: "10px 18px", background: "#7c3aed", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "13px" }}>
            + Add Bar
          </Link>
        </div>
      </div>

      {/* Summary counts */}
      {!loading && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ padding: "4px 12px", background: "rgba(124,58,237,0.1)", color: "#7c3aed", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
            Total: {bars.length}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
            Verified: {counts.verified}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
            Claimed: {counts.claimed}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
            Unclaimed: {counts.unclaimed}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
            Active: {counts.active}
          </span>
          <span style={{ padding: "4px 12px", background: "rgba(115,115,115,0.1)", color: "#737373", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
            Inactive: {counts.inactive}
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <MagnifyingGlass size={16} color="#737373" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search bars by name, address, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              background: "var(--color-card, #1a1a1a)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "10px",
              color: "var(--color-text-primary, #fff)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: "10px 16px",
            background: showFilters ? "#7c3aed" : "var(--color-card, #1a1a1a)",
            color: showFilters ? "#fff" : "var(--color-text-secondary, #737373)",
            border: `1px solid ${showFilters ? "#7c3aed" : "var(--color-card-border, #262626)"}`,
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Funnel size={14} weight="fill" />
          Filters {showFilters && <CaretDown size={12} />}
        </button>
      </div>

      {/* Filter options */}
      {showFilters && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", padding: "16px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px" }}>
          <div>
            <label style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Claim Status</label>
            <select
              value={claimFilter}
              onChange={(e) => setClaimFilter(e.target.value as ClaimFilter)}
              style={{
                padding: "8px 12px",
                background: "var(--color-input-bg, #1a1a1a)",
                border: "1px solid var(--color-input-border, #262626)",
                borderRadius: "8px",
                color: "var(--color-text-primary, #fff)",
                fontSize: "13px",
                outline: "none",
                minWidth: "140px",
              }}
            >
              <option value="all">All Claims</option>
              <option value="CLAIMED">Claimed</option>
              <option value="UNCLAIMED">Unclaimed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
          <div>
            <label style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
              style={{
                padding: "8px 12px",
                background: "var(--color-input-bg, #1a1a1a)",
                border: "1px solid var(--color-input-border, #262626)",
                borderRadius: "8px",
                color: "var(--color-text-primary, #fff)",
                fontSize: "13px",
                outline: "none",
                minWidth: "140px",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginBottom: "12px" }}>
        {search || claimFilter !== "all" || activeFilter !== "all" ? (
          <>Showing {filteredBars.length} of {bars.length} bars</>
        ) : (
          <>{bars.length} bars</>
        )}
      </div>

      {/* Bar List */}
      {loading ? (
        <p style={{ color: "var(--color-text-muted, #737373)" }}>Loading...</p>
      ) : filteredBars.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px" }}>
          <Buildings size={40} color="#737373" style={{ marginBottom: "12px" }} />
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px", margin: 0 }}>
            {bars.length === 0 ? "No bars yet." : "No bars match your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredBars.map((bar) => (
            <div
              key={bar.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "12px",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                  {bar.name}
                </div>
                <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {bar.address && <span>{bar.address}</span>}
                  {bar.email && <span>{bar.email}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                {statusBadge(bar.claimStatus)}
                {bar.isActive ? (
                  <span style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Active</span>
                ) : (
                  <span style={{ background: "rgba(115,115,115,0.15)", color: "#737373", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Inactive</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
