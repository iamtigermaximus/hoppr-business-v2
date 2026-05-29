"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Bar {
  id: string;
  name: string;
  address: string;
  claimStatus: string;
  updatedAt: string;
}

interface ClaimRequest {
  id: string;
  barName: string;
  barAddress: string;
  barCity: string | null;
  barType: string | null;
  status: string;
  createdAt: string;
  barId: string | null;
}

export default function AdminClaimsPage() {
  const [tab, setTab] = useState<"bars" | "suggestions">("bars");
  const [unclaimedBars, setUnclaimedBars] = useState<Bar[]>([]);
  const [recentlyClaimed, setRecentlyClaimed] = useState<Bar[]>([]);
  const [suggestions, setSuggestions] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [barsRes, suggestionsRes] = await Promise.all([
        fetch("/api/admin/bars?claimStatus=all"),
        fetch("/api/claim/suggest"),
      ]);

      if (barsRes.ok) {
        const bars: Bar[] = await barsRes.json();
        setUnclaimedBars(bars.filter((b) => b.claimStatus === "UNCLAIMED" || b.claimStatus === "PENDING"));
        setRecentlyClaimed(
          bars
            .filter((b) => b.claimStatus === "CLAIMED" || b.claimStatus === "VERIFIED")
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 20)
        );
      }
      if (suggestionsRes.ok) {
        setSuggestions(await suggestionsRes.json());
      }
    } catch (e) {
      console.error("Failed to load claims data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (barId: string, barName: string) => {
    setActionLoading(barId);
    try {
      await fetch(`/api/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId, action: "approve" }),
      });
      setUnclaimedBars((prev) => prev.filter((b) => b.id !== barId));
      setRecentlyClaimed((prev) => [{ id: barId, name: barName, address: "", claimStatus: "CLAIMED", updatedAt: new Date().toISOString() }, ...prev]);
    } catch (e) {
      console.error("Failed to approve claim", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (barId: string) => {
    setActionLoading(barId);
    try {
      await fetch(`/api/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId, action: "reject" }),
      });
      setUnclaimedBars((prev) => prev.filter((b) => b.id !== barId));
    } catch (e) {
      console.error("Failed to reject claim", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuggestionAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await fetch(`/api/claim/suggest`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: action === "approve" ? "APPROVED" : "REJECTED" } : s))
      );
    } catch (e) {
      console.error("Failed to process suggestion", e);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "var(--color-text-muted, #737373)", padding: "24px" }}>
        Loading claims...
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "8px",
        }}
      >
        Bar Claims
      </h1>
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        Review and manage bar claim requests and suggestions.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
        {[
          { key: "bars", label: `Bar Claims (${unclaimedBars.length})` },
          { key: "suggestions", label: `Suggestions (${suggestions.filter((s) => s.status === "PENDING").length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: tab === t.key ? "2px solid #7c3aed" : "2px solid transparent",
              background: "none",
              color: tab === t.key ? "#7c3aed" : "var(--color-text-muted, #737373)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bars" && (
        <>
          {/* Pending / Unclaimed bars */}
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary, #fff)", marginBottom: "12px" }}>
            Pending &amp; Unclaimed Bars
          </h2>
          {unclaimedBars.length === 0 && (
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginBottom: "24px" }}>
              No pending claims.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {unclaimedBars.map((bar) => (
              <div
                key={bar.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-card-border, #262626)",
                  background: "var(--color-card, #141414)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text-primary, #fff)" }}>
                    {bar.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted, #737373)", marginTop: "2px" }}>
                    {bar.address} &middot; Status:{" "}
                    <span
                      style={{
                        color: bar.claimStatus === "PENDING" ? "#f59e0b" : "#737373",
                        fontWeight: 600,
                      }}
                    >
                      {bar.claimStatus}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleApprove(bar.id, bar.name)}
                    disabled={actionLoading === bar.id}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#22c55e",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: actionLoading === bar.id ? "not-allowed" : "pointer",
                      opacity: actionLoading === bar.id ? 0.5 : 1,
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(bar.id)}
                    disabled={actionLoading === bar.id}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: actionLoading === bar.id ? "not-allowed" : "pointer",
                      opacity: actionLoading === bar.id ? 0.5 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recently claimed */}
          {recentlyClaimed.length > 0 && (
            <>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary, #fff)", marginBottom: "12px" }}>
                Recently Claimed
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentlyClaimed.map((bar) => (
                  <div
                    key={bar.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-card-border, #262626)",
                      background: "var(--color-card, #141414)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text-primary, #fff)" }}>
                        {bar.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-muted, #737373)", marginTop: "2px" }}>
                        Status:{" "}
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>{bar.claimStatus}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === "suggestions" && (
        <>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary, #fff)", marginBottom: "12px" }}>
            Bar Suggestions
          </h2>
          {suggestions.filter((s) => s.status === "PENDING").length === 0 && (
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px" }}>
              No pending suggestions.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {suggestions
              .filter((s) => s.status === "PENDING")
              .map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-card-border, #262626)",
                    background: "var(--color-card, #141414)",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text-primary, #fff)" }}>
                    {s.barName}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted, #737373)", marginTop: "2px" }}>
                    {s.barAddress}{s.barCity ? `, ${s.barCity}` : ""}{s.barType ? ` | Type: ${s.barType}` : ""}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted, #525252)", marginTop: "2px" }}>
                    Submitted {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                      onClick={() => handleSuggestionAction(s.id, "approve")}
                      disabled={actionLoading === s.id}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#22c55e",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: actionLoading === s.id ? "not-allowed" : "pointer",
                        opacity: actionLoading === s.id ? 0.5 : 1,
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleSuggestionAction(s.id, "reject")}
                      disabled={actionLoading === s.id}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: actionLoading === s.id ? "not-allowed" : "pointer",
                        opacity: actionLoading === s.id ? 0.5 : 1,
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
