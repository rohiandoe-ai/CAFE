"use client"

import React, { useEffect, useState } from "react"
import { RefreshCw, Clock } from "lucide-react"
import { getCampaigns, type Campaign } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: "#4caf7d", bg: "rgba(76,175,125,0.12)",  label: "Completed" },
  sending:   { color: "#c9a84c", bg: "rgba(201,168,76,0.12)", label: "Sending…"  },
  pending:   { color: "#888880", bg: "rgba(136,136,128,0.12)", label: "Pending"   },
  scheduled: { color: "#64b5f6", bg: "rgba(100,181,246,0.12)", label: "Scheduled" },
  failed:    { color: "#e05555", bg: "rgba(224,85,85,0.12)",   label: "Failed"    },
}

export function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading]     = useState(true)

  const load = () => {
    setLoading(true)
    getCampaigns().then(d => { setCampaigns(d); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "#888880", fontSize: 13 }}>
          <span style={{ color: "#c9a84c", fontWeight: 700 }}>{campaigns.length}</span> campaigns
        </p>
        <button onClick={load} style={{
          width: 34, height: 34, borderRadius: 8, cursor: "pointer",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#888",
        }}>
          <RefreshCw style={{ width: 14, height: 14, animation: loading ? "spin 0.8s linear infinite" : "none" }} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <RefreshCw style={{ width: 26, height: 26, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock style={{ width: 24, height: 24, color: "#555" }} />
          </div>
          <p style={{ color: "#888880" }}>No campaigns yet</p>
          <p style={{ color: "#555", fontSize: 13 }}>Sent campaigns will appear here</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hist-table" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: 14, overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 100px 60px 70px 100px",
              padding: "9px 16px",
              background: "rgba(201,168,76,0.05)",
              borderBottom: "1px solid rgba(201,168,76,0.1)",
            }}>
              {["Date","Template","Segment","Sent","Delivered","Status"].map(h => (
                <span key={h} style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {campaigns.map((c, i) => {
              const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.pending
              return (
                <div key={c.id} style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr 100px 60px 70px 100px",
                  padding: "13px 16px", alignItems: "center",
                  borderBottom: i < campaigns.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "#888", fontSize: 12 }}>{formatDate(c.created_at)}</span>
                  <span style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 13 }}>{c.template_name ?? "—"}</span>
                  <span style={{ color: "#888", fontSize: 12, textTransform: "capitalize" }}>{c.segment}</span>
                  <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 14, textAlign: "center" }}>{c.total_sent}</span>
                  <span style={{ color: "#4caf7d", fontWeight: 700, fontSize: 14, textAlign: "center" }}>{c.delivered_count}</span>
                  <span>
                    <span style={{
                      display: "inline-block", padding: "4px 10px", borderRadius: 99,
                      fontSize: 11, fontWeight: 700,
                      color: st.color, background: st.bg,
                    }}>{st.label}</span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Mobile cards */}
          <div className="hist-cards" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {campaigns.map(c => {
              const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.pending
              return (
                <div key={c.id} style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <p style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 14 }}>{c.template_name ?? "—"}</p>
                      <p style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{formatDate(c.created_at)}</p>
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: st.color, background: st.bg }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Segment</p>
                      <p style={{ color: "#888", fontSize: 13, textTransform: "capitalize" }}>{c.segment}</p>
                    </div>
                    <div>
                      <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sent</p>
                      <p style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16 }}>{c.total_sent}</p>
                    </div>
                    <div>
                      <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Delivered</p>
                      <p style={{ color: "#4caf7d", fontWeight: 700, fontSize: 16 }}>{c.delivered_count}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .hist-table { display: none !important; }
          .hist-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
