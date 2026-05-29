"use client";
import { useState } from "react";
import { InstagramLogo, FacebookLogo, TiktokLogo, PaperPlaneTilt, Clock, Calendar } from "@phosphor-icons/react";

const platforms = [
  { key: "INSTAGRAM", label: "Instagram", icon: InstagramLogo, color: "#e1306c" },
  { key: "FACEBOOK", label: "Facebook", icon: FacebookLogo, color: "#1877f2" },
  { key: "TIKTOK", label: "TikTok", icon: TiktokLogo, color: "#ff0050" },
];

export function SocialPublisher({ barId }: { barId: string }) {
  const [platform, setPlatform] = useState("INSTAGRAM");
  const [content, setContent] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"create" | "queue">("create");
  const [loaded, setLoaded] = useState(false);

  // Fetch existing posts on mount
  useState(() => {
    if (!loaded) {
      setLoaded(true);
      fetch(`/api/bar/${barId}/social`)
        .then((r) => r.json())
        .then((d) => setPosts(Array.isArray(d) ? d : []));
    }
  });

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/bar/${barId}/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        content,
        scheduledFor:
          schedule && scheduledTime
            ? new Date(scheduledTime).toISOString()
            : null,
      }),
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
      setSchedule(false);
      setScheduledTime("");
    }
    setSaving(false);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "#737373",
      SCHEDULED: "#3b82f6",
      PUBLISHED: "#10b981",
      FAILED: "#ef4444",
    };
    return (
      <span
        style={{
          background: `${colors[status]}20`,
          color: colors[status],
          fontSize: "10px",
          padding: "3px 8px",
          borderRadius: "4px",
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "4px",
        }}
      >
        Social Media
      </h1>
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "13px",
          marginBottom: "20px",
        }}
      >
        Create and schedule social media posts
      </p>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "var(--color-card, #1a1a1a)",
          border: "1px solid var(--color-card-border, #262626)",
          borderRadius: "10px",
          padding: "3px",
          marginBottom: "20px",
          width: "fit-content",
        }}
      >
        {["create", "queue"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              background: tab === t ? "#7c3aed" : "transparent",
              color:
                tab === t
                  ? "#fff"
                  : "var(--color-text-muted, #737373)",
            }}
          >
            {t === "create" ? "Create Post" : `Queue (${posts.length})`}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Platform picker */}
          <div>
            <div
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Platform
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlatform(p.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    border:
                      platform === p.key
                        ? `1px solid ${p.color}`
                        : "1px solid var(--color-card-border, #262626)",
                    background:
                      platform === p.key
                        ? `${p.color}15`
                        : "var(--color-card, #1a1a1a)",
                    color:
                      platform === p.key
                        ? p.color
                        : "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <p.icon size={18} weight="fill" /> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <div
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Post content
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post... Use emojis, hashtags, and mentions!"
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "14px",
                borderRadius: "12px",
                resize: "vertical",
                background: "var(--color-input-bg, #1a1a1a)",
                border: "1px solid var(--color-input-border, #262626)",
                color: "var(--color-text-primary, #fff)",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <div
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "11px",
                marginTop: "4px",
                textAlign: "right",
              }}
            >
              {content.length} characters
            </div>
          </div>

          {/* Schedule toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: "13px",
              }}
            >
              <input
                type="checkbox"
                checked={schedule}
                onChange={(e) => setSchedule(e.target.checked)}
                style={{ accentColor: "#7c3aed" }}
              />
              <Clock size={16} /> Schedule for later
            </label>
            {schedule && (
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--color-input-bg)",
                  border: "1px solid var(--color-input-border)",
                  color: "var(--color-text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || !content.trim()}
            style={{
              padding: "12px 24px",
              background: content.trim()
                ? "#7c3aed"
                : "var(--color-card-border)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: content.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "fit-content",
            }}
          >
            <PaperPlaneTilt size={16} />{" "}
            {schedule ? "Schedule Post" : "Save as Draft"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {posts.length === 0 && (
            <p
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "14px",
              }}
            >
              No posts yet. Create your first one!
            </p>
          )}
          {posts.map((p: any) => {
            const plat = platforms.find((pl) => pl.key === p.platform);
            const PlatIcon = plat?.icon || InstagramLogo;
            return (
              <div
                key={p.id}
                style={{
                  padding: "14px 18px",
                  background: "var(--color-card, #1a1a1a)",
                  border: "1px solid var(--color-card-border, #262626)",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <PlatIcon
                      size={16}
                      color={plat?.color || "#737373"}
                      weight="fill"
                    />
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {p.platform}
                    </span>
                    {statusBadge(p.status)}
                  </div>
                  {p.scheduledFor && (
                    <span
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={12} />{" "}
                      {new Date(p.scheduledFor).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    color: "var(--color-text-primary, #fff)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {p.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
