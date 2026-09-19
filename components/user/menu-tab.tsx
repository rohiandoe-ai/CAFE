"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Search, X } from "lucide-react"
import { getMenuItems, subscribeToMenu, type MenuItem, type Business } from "@/lib/supabase"

export function MenuTab({ business }: { business: Business }) {
  const [items, setItems]     = useState<MenuItem[]>([])
  const [loading, setLoad]    = useState(true)
  const [category, setCat]    = useState("All")
  const [search, setSearch]   = useState("")

  const load = () => getMenuItems().then(d => { setItems(d); setLoad(false) })

  useEffect(() => {
    load()
    const unsub = subscribeToMenu(load)
    return () => { unsub() }
  }, [])

  const cats = ["All", ...Array.from(new Set(items.map(i => i.category)))]

  const filtered = items.filter(item => {
    const okCat    = category === "All" || item.category === category
    const okSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                     item.description?.toLowerCase().includes(search.toLowerCase())
    return okCat && okSearch
  })

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(10,10,10,0.96)", backdropFilter: "blur(12px)",
        padding: "20px 20px 0",
        borderBottom: "1px solid rgba(201,168,76,0.08)",
      }}>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 22, fontWeight: 700 }}>
          Our Menu
        </h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 2, marginBottom: 14 }}>
          {business.name} · {business.location}
        </p>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            width: 15, height: 15, color: "#888880",
          }} />
          <input
            className="input-base"
            style={{ paddingLeft: 36, paddingRight: search ? 36 : 14, height: 42 }}
            placeholder="Search menu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#888880",
                padding: 2,
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
          {cats.map(cat => (
            <button
              key={cat}
              onClick={() => setCat(cat)}
              style={{
                flexShrink: 0, borderRadius: 99,
                padding: "6px 14px",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
                border: `1.5px solid ${cat === category ? "#c9a84c" : "rgba(201,168,76,0.15)"}`,
                background: cat === category ? "#c9a84c" : "rgba(255,255,255,0.04)",
                color: cat === category ? "#0a0a0a" : "#888880",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: "12px 20px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <p style={{ color: "#888880" }}>No items found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ color: "#c9a84c", background: "none", border: "none", cursor: "pointer", marginTop: 8, fontSize: 13 }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="glass-card"
      style={{
        borderRadius: 16, overflow: "hidden",
        borderColor: "rgba(201,168,76,0.12)",
        opacity: item.is_available ? 1 : 0.55,
      }}
    >
      <div style={{ display: "flex", gap: 0 }}>
        {/* Image */}
        {item.image_url && (
          <div style={{ width: 90, flexShrink: 0 }}>
            <img
              src={item.image_url}
              alt={item.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, padding: "14px 14px 14px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1 }}>
              {/* Name + badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                {/* Veg/nonveg indicator */}
                <div style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: `1.5px solid ${item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555",
                  }} />
                </div>
                <span style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 15 }}>{item.name}</span>
                {item.is_must_try && (
                  <span className="badge-must-try">Must Try</span>
                )}
              </div>

              {item.description && (
                <p style={{ color: "#888880", fontSize: 12, lineHeight: 1.5 }}>
                  {item.description}
                </p>
              )}

              {!item.is_available && (
                <span style={{ color: "#e05555", fontSize: 11, fontWeight: 600, marginTop: 4, display: "block" }}>
                  Out of stock
                </span>
              )}
            </div>

            {/* Price */}
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16 }}>
                ₹{Number(item.price).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
