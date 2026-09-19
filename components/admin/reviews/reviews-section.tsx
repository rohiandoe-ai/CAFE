"use client"

import React, { useEffect, useState } from "react"
import { Star, Download, RefreshCw } from "lucide-react"
import { getReviews, type Review } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"

export function ReviewsSection() {
  const [reviews, setReviews]         = useState<Review[]>([])
  const [loading, setLoading]         = useState(true)
  const [ratingFilter, setRatingF]    = useState(0)
  const [dateFrom, setDateFrom]       = useState("")
  const [dateTo, setDateTo]           = useState("")

  const load = () => {
    setLoading(true)
    getReviews().then(d => { setReviews(d); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const filtered = reviews.filter(r => {
    if (ratingFilter > 0 && r.rating !== ratingFilter) return false
    if (dateFrom && new Date(r.created_at) < new Date(dateFrom)) return false
    if (dateTo   && new Date(r.created_at) > new Date(dateTo + "T23:59:59")) return false
    return true
  })

  const avgRating  = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—"
  const thisMonth  = reviews.filter(r => {
    const d = new Date(r.created_at), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const mostCommon = (() => {
    if (!reviews.length) return "—"
    const c = [0,0,0,0,0,0]; reviews.forEach(r => c[r.rating]++)
    return c.indexOf(Math.max(...c.slice(1))) + "⭐"
  })()

  const exportCSV = () => {
    const rows = [
      ["Date","Name","Phone","Rating","Food","Service","Atmosphere","Copied"],
      ...filtered.map(r => [
        formatDate(r.created_at),
        r.customers?.name  ?? "—",
        r.customers?.phone ?? "—",
        r.rating,
        r.food_rating       ?? "—",
        r.service_rating    ?? "—",
        r.atmosphere_rating ?? "—",
        r.review_copied ? "Yes" : "No",
      ])
    ]
    const csv  = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = "reviews.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 24, fontWeight: 700 }}>Reviews</h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>All customer feedback</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="reviews-stats">
        {[
          { label: "Total Reviews",  value: reviews.length, color: "#c9a84c" },
          { label: "Average Rating", value: avgRating,      color: "#c9a84c" },
          { label: "This Month",     value: thisMonth,      color: "#4caf7d" },
          { label: "Most Common",    value: mostCommon,     color: "#f5f0e8" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: 14, padding: "16px 18px",
          }}>
            <p style={{ color: s.color, fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: "#888880", fontSize: 11, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {/* Star filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[0,5,4,3,2,1].map(n => (
            <button key={n} onClick={() => setRatingF(n)} style={{
              padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer",
              background: ratingFilter === n ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              color: ratingFilter === n ? "#c9a84c" : "#888",
              boxShadow: `0 0 0 1px ${ratingFilter === n ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`,
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
            } as React.CSSProperties}>{n === 0 ? "All" : `${n}⭐`}</button>
          ))}
        </div>

        {/* Date range */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 240 }}>
          <input type="date" className="input-base" style={{ flex: 1, height: 36, fontSize: 12, minWidth: 0 }}
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ color: "#555", fontSize: 13, flexShrink: 0 }}>—</span>
          <input type="date" className="input-base" style={{ flex: 1, height: 36, fontSize: 12, minWidth: 0 }}
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888" }}>
            <RefreshCw style={{ width: 14, height: 14, animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          </button>
          <button onClick={exportCSV} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 34,
            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 8, cursor: "pointer", color: "#c9a84c", fontSize: 13, fontWeight: 600,
          }}>
            <Download style={{ width: 14, height: 14 }} /> Export
          </button>
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <RefreshCw style={{ width: 28, height: 28, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <p style={{ color: "#888" }}>No reviews yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(r => <ReviewCard key={r.id} r={r} />)}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) {
          .reviews-stats { grid-template-columns: repeat(4,1fr) !important; }
        }
      `}</style>
    </div>
  )
}

function ReviewCard({ r }: { r: Review }) {
  const name  = r.customers?.name  ?? "Anonymous"
  const phone = r.customers?.phone ?? null
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(201,168,76,0.1)",
      borderRadius: 16, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Customer */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 15 }}>{name}</span>
            {phone && <span style={{ color: "#888", fontSize: 12 }}>+91 {phone}</span>}
          </div>

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} style={{
                width: 16, height: 16,
                color: s <= r.rating ? "#c9a84c" : "#2a2a2a",
                fill: s <= r.rating ? "#c9a84c" : "transparent",
              }} />
            ))}
            <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 14, marginLeft: 4 }}>{r.rating}.0</span>
          </div>

          {/* Sub ratings */}
          {(r.food_rating || r.service_rating || r.atmosphere_rating) && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {r.food_rating       && <span style={{ fontSize: 12, color: "#888" }}>Food: <b style={{ color: "#c9a84c" }}>{r.food_rating}⭐</b></span>}
              {r.service_rating    && <span style={{ fontSize: 12, color: "#888" }}>Service: <b style={{ color: "#c9a84c" }}>{r.service_rating}⭐</b></span>}
              {r.atmosphere_rating && <span style={{ fontSize: 12, color: "#888" }}>Atmos: <b style={{ color: "#c9a84c" }}>{r.atmosphere_rating}⭐</b></span>}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ color: "#888", fontSize: 12 }}>{formatDate(r.created_at)}</p>
          {r.review_copied && (
            <span style={{
              display: "inline-block", marginTop: 6, padding: "3px 10px", borderRadius: 99,
              background: "rgba(76,175,125,0.12)", color: "#4caf7d", fontSize: 11, fontWeight: 700,
            }}>✓ Copied</span>
          )}
        </div>
      </div>
    </div>
  )
}
