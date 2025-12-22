import React, { useEffect, useMemo, useState } from "react";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://api.chalcack.com/api").replace(/\/$/, "");

function fmtPct(x) {
  if (x == null) return "-";
  return `${(x * 100).toFixed(1)}%`;
}

function PlatformBucketsTable({ title, row }) {
  const { totalUsers, buckets, rates } = row || {};
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ fontSize: 12, color: "#666" }}>Total users: {totalUsers ?? 0}</div>
      </div>

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: "8px 6px" }}>Bucket</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #eee", padding: "8px 6px" }}>Users</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #eee", padding: "8px 6px" }}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1 time", "one"],
            ["2 times", "two"],
            ["3 times", "three"],
            ["3+ times", "threePlus"],
          ].map(([label, key]) => (
            <tr key={key}>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f5f5f5" }}>{label}</td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f5f5f5", textAlign: "right" }}>
                {buckets?.[key] ?? 0}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #f5f5f5", textAlign: "right" }}>
                {fmtPct(rates?.[key] ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlatformUploadBucketsPanel() {
  // default range: this month to today-ish (set your own defaults)
  const [dateFrom, setDateFrom] = useState("2025-12-01");
  const [dateTo, setDateTo] = useState("2025-12-22");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  const url = useMemo(() => {
    const qs = new URLSearchParams({ dateFrom, dateTo });
    return `${API_BASE}/analytics/platform-upload-buckets?${qs.toString()}`;
  }, [dateFrom, dateTo]);

  async function fetchData() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Request failed (${res.status})`);
      }
      setData(json);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const results = data?.results || {};
  const android = results.android || { totalUsers: 0, buckets: {}, rates: {} };
  const ios = results.ios || { totalUsers: 0, buckets: {}, rates: {} };
  const unknown = results.unknown || { totalUsers: 0, buckets: {}, rates: {} };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Platform upload buckets</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>dateFrom</div>
          <input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>dateTo</div>
          <input value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="YYYY-MM-DD" />
        </div>

        <button onClick={fetchData} disabled={loading} style={{ height: 32 }}>
          {loading ? "Loading..." : "Refresh"}
        </button>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          Endpoint: <span style={{ fontFamily: "monospace" }}>/analytics/platform-upload-buckets</span>
        </div>
      </div>

      {err && (
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      <PlatformBucketsTable title="Android" row={android} />
      <PlatformBucketsTable title="iOS" row={ios} />
      <PlatformBucketsTable title="Unknown" row={unknown} />
    </div>
  );
}
