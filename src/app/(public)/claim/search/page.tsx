"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, MapPin, Spinner } from "@phosphor-icons/react";

interface Bar {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
  claimStatus: string;
}

export default function ClaimSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [initiating, setInitiating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const searchBars = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/claim?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const initiateClaim = async (barId: string, barName: string) => {
    setInitiating(barId);
    setMessage(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId }),
      });
      if (res.ok) {
        setMessage({ text: `Claim request submitted for ${barName}! Our team will review it.`, type: "success" });
        setResults((prev) =>
          prev.map((b) => (b.id === barId ? { ...b, claimStatus: "PENDING" } : b))
        );
      } else {
        const err = await res.json();
        setMessage({ text: err.error || "Failed to submit claim", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setInitiating(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "48px 24px 64px",
        maxWidth: "640px",
        margin: "0 auto",
        background: "var(--color-bg, #0a0a0a)",
      }}
    >
      {/* Back link */}
      <Link
        href="/claim"
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "13px",
          textDecoration: "none",
          marginBottom: "24px",
          display: "inline-block",
        }}
      >
        &larr; Back
      </Link>

      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "8px",
        }}
      >
        Search for Your Bar
      </h1>
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        Search by name or city to find your bar on Hoppr.
      </p>

      {/* Search input */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder='e.g. "Bar Loose" or "Helsinki"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchBars(query)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid var(--color-card-border, #262626)",
            background: "var(--color-card, #141414)",
            color: "var(--color-text-primary, #fff)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={() => searchBars(query)}
          disabled={loading || !query.trim()}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#7c3aed",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {loading ? <Spinner size={16} /> : <MagnifyingGlass size={16} />}
          Search
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "13px",
            background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: message.type === "success" ? "#22c55e" : "#ef4444",
            border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length === 0 && (
        <div style={{ color: "var(--color-text-muted, #737373)", textAlign: "center", padding: "32px 0" }}>
          No bars found. Try a different search or{" "}
          <Link href="/claim/add" style={{ color: "#7c3aed" }}>
            add your bar
          </Link>
          .
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {results.map((bar) => (
          <div
            key={bar.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid var(--color-card-border, #262626)",
              background: "var(--color-card, #141414)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
              {bar.imageUrl && (
                <img
                  src={bar.imageUrl}
                  alt={bar.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text-primary, #fff)" }}>
                  {bar.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "2px" }}>
                  <MapPin size={12} /> {bar.address}
                </div>
              </div>
            </div>
            <button
              onClick={() => initiateClaim(bar.id, bar.name)}
              disabled={bar.claimStatus !== "UNCLAIMED" || initiating === bar.id}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: bar.claimStatus !== "UNCLAIMED" ? "not-allowed" : "pointer",
                opacity: bar.claimStatus !== "UNCLAIMED" ? 0.5 : 1,
                background:
                  bar.claimStatus === "CLAIMED"
                    ? "#22c55e"
                    : bar.claimStatus === "PENDING"
                    ? "#f59e0b"
                    : "#7c3aed",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {initiating === bar.id
                ? "..."
                : bar.claimStatus === "CLAIMED"
                ? "Claimed"
                : bar.claimStatus === "PENDING"
                ? "Pending"
                : "Claim"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
