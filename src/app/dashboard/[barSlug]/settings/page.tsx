"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CaretDown, CaretRight, Plus, Minus, FloppyDisk } from "@phosphor-icons/react";

const barTypes = [
  "BAR", "NIGHTCLUB", "LOUNGE", "PUB", "SPORTS_BAR",
  "WINE_BAR", "COCKTAIL_BAR", "BEER_GARDEN", "ROOFTOP", "SPEAKEASY",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface SectionState {
  general: boolean;
  hours: boolean;
  media: boolean;
  notifications: boolean;
}

export default function BarSettingsPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // General
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [barType, setBarType] = useState("");

  // Opening Hours
  const [hours, setHours] = useState<Record<string, { open: string; close: string }>>(
    Object.fromEntries(days.map((d) => [d, { open: "", close: "" }]))
  );

  // Media
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([""]);
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  // Notifications
  const [notifNewApprovals, setNotifNewApprovals] = useState(true);
  const [notifPromoPublished, setNotifPromoPublished] = useState(true);
  const [notifPassSold, setNotifPassSold] = useState(true);
  const [notifAutoPilot, setNotifAutoPilot] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);

  // Collapse state
  const [sections, setSections] = useState<SectionState>({
    general: true,
    hours: false,
    media: false,
    notifications: false,
  });

  useEffect(() => {
    fetch(`/api/bar/${barSlug}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setName(data.name || "");
        setDescription(data.description || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setWebsite(data.website || "");
        setBarType(data.barType || "");

        if (data.hours && typeof data.hours === "object") {
          const h: Record<string, { open: string; close: string }> = {};
          for (const d of days) {
            const dayData = (data.hours as any)[d];
            h[d] = { open: dayData?.open || "", close: dayData?.close || "" };
          }
          setHours(h);
        }

        setCoverImageUrl(data.coverImageUrl || "");
        setLogoUrl(data.logoUrl || "");
        setGalleryImages(data.galleryImages?.length ? data.galleryImages : [""]);

        if (data.socialLinks && typeof data.socialLinks === "object") {
          setInstagram((data.socialLinks as any).instagram || "");
          setFacebook((data.socialLinks as any).facebook || "");
          setTiktok((data.socialLinks as any).tiktok || "");
        }

        if (data.notificationPrefs && typeof data.notificationPrefs === "object") {
          const np = data.notificationPrefs as any;
          setNotifNewApprovals(np.newApprovals !== undefined ? np.newApprovals : true);
          setNotifPromoPublished(np.promotionPublished !== undefined ? np.promotionPublished : true);
          setNotifPassSold(np.passSold !== undefined ? np.passSold : true);
          setNotifAutoPilot(np.autoPilotTriggered !== undefined ? np.autoPilotTriggered : false);
          setNotifWeeklyReport(np.weeklyReport !== undefined ? np.weeklyReport : true);
        }

        setLoading(false);
      });
  }, [barSlug]);

  const toggleSection = (key: keyof SectionState) => {
    setSections((s) => ({ ...s, [key]: !s[key] }));
  };

  const dayHoursChanged = (day: string, field: "open" | "close", value: string) => {
    setHours((h) => ({
      ...h,
      [day]: { ...h[day], [field]: value },
    }));
  };

  const addGalleryImage = () => setGalleryImages([...galleryImages, ""]);
  const removeGalleryImage = (i: number) => {
    if (galleryImages.length === 1) return;
    setGalleryImages(galleryImages.filter((_, idx) => idx !== i));
  };
  const updateGalleryImage = (i: number, val: string) => {
    const g = [...galleryImages];
    g[i] = val;
    setGalleryImages(g);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const socialLinks: Record<string, string> = {};
    if (instagram) socialLinks.instagram = instagram;
    if (facebook) socialLinks.facebook = facebook;
    if (tiktok) socialLinks.tiktok = tiktok;

    const notificationPrefs = {
      newApprovals: notifNewApprovals,
      promotionPublished: notifPromoPublished,
      passSold: notifPassSold,
      autoPilotTriggered: notifAutoPilot,
      weeklyReport: notifWeeklyReport,
    };

    const res = await fetch(`/api/bar/${barSlug}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        address,
        phone,
        email,
        website,
        barType: barType || null,
        coverImageUrl: coverImageUrl || null,
        logoUrl: logoUrl || null,
        galleryImages: galleryImages.filter((g) => g.trim() !== ""),
        hours,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        notificationPrefs,
      }),
    });

    if (res.ok) {
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to save settings");
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--color-input-bg, #1a1a1a)",
    border: "1px solid var(--color-input-border, #262626)",
    borderRadius: "10px", color: "var(--color-text-primary, #fff)",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px",
    fontWeight: 600, marginBottom: "4px", display: "block",
  };
  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "14px 16px", cursor: "pointer", userSelect: "none",
    background: "var(--color-card, #1a1a1a)",
    border: "1px solid var(--color-card-border, #262626)",
    borderRadius: "12px", marginBottom: "8px",
    color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px",
  };
  const sectionBodyStyle: React.CSSProperties = {
    padding: "16px",
    background: "var(--color-card, #1a1a1a)",
    border: "1px solid var(--color-card-border, #262626)",
    borderRadius: "12px", marginBottom: "12px",
    display: "flex", flexDirection: "column", gap: "14px",
  };

  if (loading) {
    return <p style={{ color: "var(--color-text-muted, #737373)" }}>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0 }}>
          Bar Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 20px", background: "#7c3aed", color: "#fff",
            border: "none", borderRadius: "10px", fontWeight: 600,
            fontSize: "13px", cursor: "pointer", display: "flex",
            alignItems: "center", gap: "6px",
          }}
        >
          <FloppyDisk size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {success && (
        <p style={{ color: "#10b981", fontSize: "13px", marginBottom: "12px", fontWeight: 600 }}>{success}</p>
      )}
      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>{error}</p>
      )}

      {/* General Section */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection("general")}>
        {sections.general ? <CaretDown size={16} /> : <CaretRight size={16} />}
        General
      </div>
      {sections.general && (
        <div style={sectionBodyStyle}>
          <div>
            <label style={labelStyle}>Bar Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div>
            <label style={labelStyle}>Bar Type</label>
            <select style={inputStyle} value={barType} onChange={(e) => setBarType(e.target.value)}>
              <option value="">Select type...</option>
              {barTypes.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 ..." />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="bar@example.com" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </div>
        </div>
      )}

      {/* Opening Hours Section */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection("hours")}>
        {sections.hours ? <CaretDown size={16} /> : <CaretRight size={16} />}
        Opening Hours
      </div>
      {sections.hours && (
        <div style={sectionBodyStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Day</div>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Open</div>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Close</div>
          </div>
          {days.map((day) => (
            <div key={day} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-primary, #fff)", fontSize: "13px", fontWeight: 500 }}>{day}</span>
              <input
                type="time"
                style={inputStyle}
                value={hours[day].open}
                onChange={(e) => dayHoursChanged(day, "open", e.target.value)}
              />
              <input
                type="time"
                style={inputStyle}
                value={hours[day].close}
                onChange={(e) => dayHoursChanged(day, "close", e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Media Section */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection("media")}>
        {sections.media ? <CaretDown size={16} /> : <CaretRight size={16} />}
        Media
      </div>
      {sections.media && (
        <div style={sectionBodyStyle}>
          <div>
            <label style={labelStyle}>Cover Image URL</label>
            <input style={inputStyle} value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input style={inputStyle} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label style={labelStyle}>Gallery Images</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {galleryImages.map((url, i) => (
                <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    style={inputStyle}
                    value={url}
                    onChange={(e) => updateGalleryImage(i, e.target.value)}
                    placeholder="https://..."
                  />
                  <button type="button" onClick={() => removeGalleryImage(i)}
                    style={{ padding: "6px", background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addGalleryImage}
              style={{ marginTop: "6px", padding: "6px 12px", background: "transparent", color: "var(--color-text-secondary, #a3a3a3)", border: "1px dashed var(--color-card-border, #262626)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Plus size={12} /> Add Image
            </button>
          </div>

          <div>
            <label style={labelStyle}>Social Links</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "block", marginBottom: "4px" }}>Instagram</span>
                <input style={inputStyle} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "block", marginBottom: "4px" }}>Facebook</span>
                <input style={inputStyle} value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "block", marginBottom: "4px" }}>TikTok</span>
                <input style={inputStyle} value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="https://tiktok.com/..." />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection("notifications")}>
        {sections.notifications ? <CaretDown size={16} /> : <CaretRight size={16} />}
        Notifications
      </div>
      {sections.notifications && (
        <div style={sectionBodyStyle}>
          {[
            { label: "New content approvals", value: notifNewApprovals, setter: setNotifNewApprovals },
            { label: "Promotion published", value: notifPromoPublished, setter: setNotifPromoPublished },
            { label: "Pass sold", value: notifPassSold, setter: setNotifPassSold },
            { label: "Auto-pilot triggered", value: notifAutoPilot, setter: setNotifAutoPilot },
            { label: "Weekly report", value: notifWeeklyReport, setter: setNotifWeeklyReport },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
              <span style={{ color: "var(--color-text-primary, #fff)", fontSize: "13px" }}>{item.label}</span>
              <button
                type="button"
                onClick={() => item.setter(!item.value)}
                style={{
                  width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                  background: item.value ? "#7c3aed" : "#525252",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <span style={{
                  position: "absolute", top: "2px", left: item.value ? "22px" : "2px",
                  width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
