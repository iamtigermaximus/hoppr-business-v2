"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, XCircle, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

interface ImportResult {
  success: boolean;
  created: number;
  errors: string[];
  bars: { name: string; address: string }[];
}

export default function BarImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const rows = lines.map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
      setPreview(rows.slice(0, 6)); // Show first 5 data rows + header
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length < 2) {
        setError("CSV file must have a header row and at least one data row.");
        setLoading(false);
        return;
      }

      // Parse header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
      const nameIdx = headers.findIndex((h) => h === "name" || h === "bar_name" || h === "barname");
      const addrIdx = headers.findIndex((h) => h === "address" || h === "addr" || h === "location");
      const phoneIdx = headers.findIndex((h) => h === "phone" || h === "phone_number" || h === "phonenumber");
      const emailIdx = headers.findIndex((h) => h === "email" || h === "email_address");
      const websiteIdx = headers.findIndex((h) => h === "website" || h === "url" || h === "web");
      const latIdx = headers.findIndex((h) => h === "latitude" || h === "lat");
      const lngIdx = headers.findIndex((h) => h === "longitude" || h === "lng" || h === "lon" || h === "long");
      const descIdx = headers.findIndex((h) => h === "description" || h === "desc");

      if (nameIdx < 0) {
        setError("CSV must have a 'name' column.");
        setLoading(false);
        return;
      }

      let created = 0;
      const errors: string[] = [];
      const bars: { name: string; address: string }[] = [];

      // Process data rows (skip header)
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const name = cells[nameIdx];
        const address = addrIdx >= 0 ? cells[addrIdx] || "" : "";

        if (!name) {
          errors.push(`Row ${i + 1}: missing name`);
          continue;
        }

        try {
          const body: Record<string, unknown> = { name, address };
          if (phoneIdx >= 0 && cells[phoneIdx]) body.phone = cells[phoneIdx];
          if (emailIdx >= 0 && cells[emailIdx]) body.email = cells[emailIdx];
          if (websiteIdx >= 0 && cells[websiteIdx]) body.website = cells[websiteIdx];
          if (descIdx >= 0 && cells[descIdx]) body.description = cells[descIdx];
          if (latIdx >= 0 && cells[latIdx]) body.latitude = parseFloat(cells[latIdx]) || 0;
          if (lngIdx >= 0 && cells[lngIdx]) body.longitude = parseFloat(cells[lngIdx]) || 0;

          const res = await fetch("/api/admin/bars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            created++;
            bars.push({ name, address });
          } else {
            const err = await res.json();
            errors.push(`Row ${i + 1} (${name}): ${err.error || "Failed to create"}`);
          }
        } catch (err: any) {
          errors.push(`Row ${i + 1} (${name}): ${err.message || "Unknown error"}`);
        }
      }

      setResult({ success: errors.length === 0, created, errors, bars });
    } catch (err: any) {
      setError(err.message || "Failed to process CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Link href="/admin/bars" style={{ color: "var(--color-text-muted, #737373)", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Upload size={24} color="#7c3aed" weight="fill" />
          Import Bars
        </h1>
      </div>

      <div style={{ maxWidth: "680px" }}>
        <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px", marginBottom: "24px" }}>
          Upload a CSV file to bulk-create bars. The CSV should have a header row with at least a <strong>name</strong> column.
          Optional columns: address, phone, email, website, description, latitude, longitude.
        </p>

        {/* File Upload */}
        <div style={{ padding: "32px", background: "var(--color-card, #1a1a1a)", border: "2px dashed var(--color-card-border, #262626)", borderRadius: "14px", textAlign: "center", marginBottom: "20px" }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="csv-upload"
          />
          <label htmlFor="csv-upload" style={{ cursor: "pointer", display: "block" }}>
            <Upload size={32} color="#7c3aed" style={{ marginBottom: "12px" }} />
            <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
              {file ? file.name : "Click to select a CSV file"}
            </div>
            <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px" }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Only .csv files accepted"}
            </div>
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px", marginBottom: "20px" }}>
            <h3 style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary, #fff)", marginBottom: "12px" }}>Preview (first {preview.length} rows)</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {preview[0].map((h, i) => (
                      <th key={i} style={{ padding: "8px 12px", textAlign: "left", color: "var(--color-text-muted, #737373)", fontWeight: 600, borderBottom: "1px solid var(--color-card-border, #262626)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: "6px 12px", color: "var(--color-text-primary, #fff)", borderBottom: "1px solid var(--color-card-border, #262626)" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#ef4444", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <XCircle size={18} weight="fill" /> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ padding: "20px", background: result.success ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${result.success ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`, borderRadius: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              {result.success ? <CheckCircle size={20} color="#10b981" weight="fill" /> : <XCircle size={20} color="#f59e0b" weight="fill" />}
              <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary, #fff)" }}>
                {result.success ? "All bars imported!" : `Imported ${result.created} bar(s) with errors`}
              </span>
            </div>
            {result.errors.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginBottom: "8px" }}>Errors ({result.errors.length}):</p>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i} style={{ color: "#ef4444", fontSize: "11px", marginBottom: "4px" }}>{err}</li>
                  ))}
                  {result.errors.length > 10 && <li style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>...and {result.errors.length - 10} more</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || loading}
          style={{
            width: "100%",
            padding: "14px",
            background: file && !loading ? "#7c3aed" : "var(--color-card-border, #262626)",
            color: file && !loading ? "#fff" : "var(--color-text-muted, #737373)",
            border: "none",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: file && !loading ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Upload size={18} weight="fill" />
          {loading ? "Importing..." : "Import Bars"}
        </button>
      </div>
    </div>
  );
}
