"use client"

import { useEffect, useState } from "react"
import { Star, Download, RefreshCw, Filter } from "lucide-react"
import { getReviews, type Review } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"

export function ReviewsSection() {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [ratingFilter, setRatingFilter] = useState(0)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo]     = useState("")

  const load = () => {
    setLoading(true)
    getReviews().then(data => { setReviews(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = reviews.filter(r => {
    if (ratingFilter > 0 && r.rating !== ratingFilter) return false
    if (dateFrom && new Date(r.created_at) < new Date(dateFrom)) return false
    if (dateTo   && new Date(r.created_at) > new Date(dateTo + "T23:59:59")) return false
    return true
  })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—"

  const thisMonth = reviews.filter(r => {
    const d = new Date(r.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const mostCommon = (() => {
    if (!reviews.length) return "—"
    const counts = [0,0,0,0,0,0]
    reviews.forEach(r => counts[r.rating]++)
    return counts.indexOf(Math.max(...counts.slice(1))) + "⭐"
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
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = "reviews.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>Reviews</h1>
        <p className="mt-1 text-sm" style={{ color: "#888880" }}>All customer feedback</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Reviews",      value: reviews.length, color: "#c9a84c" },
          { label: "Average Rating",     value: avgRating,      color: "#c9a84c" },
          { label: "This Month",         value: thisMonth,      color: "#4caf7d" },
          { label: "Most Common",        value: mostCommon,     color: "#f5f0e8" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "#888880" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          {[0,5,4,3,2,1].map(n => (
            <button
              key={n}
              onClick={() => setRatingFilter(n)}
              className="rounded-xl px-3 py-1.5 text-sm transition-all"
              style={{
                background: ratingFilter === n ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                color: ratingFilter === n ? "#c9a84c" : "#888880",
                border: `1px solid ${ratingFilter === n ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)"}`,
              }}
            >
              {n === 0 ? "All" : `${n}⭐`}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4" style={{ color: "#888880" }} />
          <input type="date" className="input-base py-1.5 text-xs w-36" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ color: "#888880" }}>–</span>
          <input type="date" className="input-base py-1.5 text-xs w-36" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={load} style={{ color: "#888880" }}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
            style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "#c9a84c" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="text-4xl">⭐</span>
          <p style={{ color: "#888880" }}>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review: r }: { review: Review }) {
  const customerName  = r.customers?.name  ?? "Anonymous"
  const customerPhone = r.customers?.phone ?? null

  return (
    <div className="glass-card rounded-2xl p-5" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm" style={{ color: "#f5f0e8" }}>
              {customerName}
            </p>
            {customerPhone && (
              <span className="text-xs" style={{ color: "#888880" }}>
                +91 {customerPhone}
              </span>
            )}
          </div>
          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(s => (
              <Star
                key={s}
                className="h-4 w-4"
                style={{ color: s <= r.rating ? "#c9a84c" : "#333", fill: s <= r.rating ? "#c9a84c" : "transparent" }}
              />
            ))}
            <span className="ml-1 text-sm font-bold" style={{ color: "#c9a84c" }}>{r.rating}.0</span>
          </div>
          {/* Sub ratings */}
          {(r.food_rating || r.service_rating || r.atmosphere_rating) && (
            <div className="flex gap-3 text-xs" style={{ color: "#888880" }}>
              {r.food_rating       && <span>Food: {r.food_rating}⭐</span>}
              {r.service_rating    && <span>Service: {r.service_rating}⭐</span>}
              {r.atmosphere_rating && <span>Atmos: {r.atmosphere_rating}⭐</span>}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs" style={{ color: "#888880" }}>{formatDate(r.created_at)}</p>
          {r.review_copied && (
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs"
              style={{ background: "rgba(76,175,125,0.15)", color: "#4caf7d" }}
            >
              ✓ Copied
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
