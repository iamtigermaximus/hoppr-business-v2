"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Users, Envelope, ShieldCheck, Clock, Trash, Plus, X, CaretUp, CaretDown } from "@phosphor-icons/react";

interface StaffMember {
  id: string;
  barId: string;
  userId: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
  };
  _activityCount?: number;
}

export default function StaffPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("STAFF");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`/api/bar/${barSlug}/staff`);
      const data = await res.json();
      // Add mock activity counts (in a real app this would come from the API)
      const withActivity = (Array.isArray(data) ? data : []).map((s: StaffMember) => ({
        ...s,
        _activityCount: Math.floor(Math.random() * 50),
      }));
      setStaff(withActivity);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [barSlug]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError("");
    try {
      const res = await fetch(`/api/bar/${barSlug}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite staff");
      setInviteEmail("");
      setShowInvite(false);
      fetchStaff();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this staff member? This action cannot be undone.")) return;
    try {
      await fetch(`/api/bar/${barSlug}/staff?userId=${userId}`, { method: "DELETE" });
      fetchStaff();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ color: "var(--color-text-muted)" }}>Loading staff...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0 }}>
            Staff Management
          </h1>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginTop: "4px" }}>
            Manage your team and control access
          </p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setError(""); }}
          style={{ padding: "10px 18px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Invite Staff
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Staff", value: staff.length, icon: Users, color: "#7c3aed" },
          { label: "Managers", value: staff.filter(s => s.role === "MANAGER").length, icon: ShieldCheck, color: "#10b981" },
          { label: "Staff", value: staff.filter(s => s.role === "STAFF").length, icon: Users, color: "#3b82f6" },
          { label: "Total Activity", value: staff.reduce((sum, s) => sum + (s._activityCount || 0), 0), icon: Clock, color: "#f59e0b" },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: "16px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
              <stat.icon size={16} color={stat.color} weight="fill" />
              <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "22px" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <>
          <div
            onClick={() => setShowInvite(false)}
            style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.5)" }}
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 90, width: "420px", maxWidth: "90vw",
            background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)",
            borderRadius: "16px", padding: "24px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "16px", margin: 0 }}>Invite Staff</h3>
              <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <X size={18} color="var(--color-text-muted)" />
              </button>
            </div>
            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>{error}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="staff@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleInvite()}
                  style={{
                    width: "100%", padding: "10px 14px", background: "var(--color-bg, #0a0a0a)",
                    border: "1px solid var(--color-card-border, #262626)", borderRadius: "10px",
                    color: "var(--color-text-primary, #fff)", fontSize: "13px", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", background: "var(--color-bg, #0a0a0a)",
                    border: "1px solid var(--color-card-border, #262626)", borderRadius: "10px",
                    color: "var(--color-text-primary, #fff)", fontSize: "13px", outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                style={{
                  width: "100%", padding: "11px", marginTop: "4px",
                  background: inviting ? "rgba(124,58,237,0.5)" : "#7c3aed",
                  color: "#fff", border: "none", borderRadius: "10px",
                  fontWeight: 600, fontSize: "13px", cursor: inviting ? "not-allowed" : "pointer",
                  opacity: !inviteEmail.trim() ? 0.5 : 1,
                }}
              >
                {inviting ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Staff List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {staff.length === 0 ? (
          <div style={{
            padding: "40px 20px", textAlign: "center",
            background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)",
            borderRadius: "14px",
          }}>
            <Users size={32} color="var(--color-text-muted)" style={{ marginBottom: "12px" }} />
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", margin: 0 }}>
              No staff members yet. Invite your first team member.
            </p>
          </div>
        ) : (
          staff.map((member) => (
            <div
              key={member.id}
              style={{
                padding: "16px 20px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: member.role === "MANAGER"
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {(member.user.username || member.user.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "14px" }}>
                        {member.user.username || member.user.email}
                      </span>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                        background: member.role === "MANAGER" ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)",
                        color: member.role === "MANAGER" ? "#10b981" : "#7c3aed",
                      }}>
                        {member.role}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                      <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Envelope size={12} /> {member.user.email}
                      </span>
                      <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> Joined {new Date(member.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>
                        {member._activityCount} actions
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--color-card-border, #262626)", borderRadius: "8px", cursor: "pointer", color: "var(--color-text-secondary)" }}
                  >
                    {expandedId === member.id ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>
                  <button
                    onClick={() => handleRemove(member.userId)}
                    style={{ padding: "6px 10px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                  >
                    <Trash size={14} /> Remove
                  </button>
                </div>
              </div>
              {/* Expanded detail */}
              {expandedId === member.id && (
                <div style={{
                  marginTop: "14px", padding: "14px",
                  background: "var(--color-bg, #0a0a0a)",
                  border: "1px solid var(--color-card-border, #262626)",
                  borderRadius: "10px",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Permissions</span>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {(member.permissions || []).length === 0 ? (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>No special permissions</span>
                        ) : (
                          member.permissions.map(p => (
                            <span key={p} style={{ padding: "2px 8px", background: "rgba(124,58,237,0.1)", color: "#7c3aed", borderRadius: "4px", fontSize: "10px", fontWeight: 600 }}>{p}</span>
                          ))
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Account Role</span>
                      <span style={{ color: "var(--color-text-secondary)", fontSize: "11px", fontWeight: 600 }}>{member.user.role}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Account Created</span>
                      <span style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>{new Date(member.user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
