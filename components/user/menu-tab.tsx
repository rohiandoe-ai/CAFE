"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"
import { Search } from "lucide-react"
import { getMenuItems, subscribeToMenu, type MenuItem, type Business } from "@/lib/supabase"

const CATEGORIES = ["All", "Coffee", "Food", "Desserts", "Drinks"]

export function MenuTab({ business }: { business: Business }) {
  const [items, setItems]       = useState<MenuItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState("All")
  const [search, setSearch]     = useState("")
  const catRef = useRef<HTMLDivElement>(null)

  const loadItems = () => {
    getMenuItems().then(data => {
      setItems(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadItems()
    const unsub = subscribeToMenu(loadItems)
    return () => { unsub() }
  }, [])

  const filtered = items.filter(item => {
    const matchCat = category === "All" || item.category === category
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Get unique categories from DB
  const dbCategories = ["All", ...Array.from(new Set(items.map(i => i.category)))]

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>Our Menu</h1>
        <p className="mt-1 text-sm" style={{ color: "#888880" }}>{business?.name ?? "House of Paloma"}</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#888880" }} />
          <input
            className="input-base pl-10"
            placeholder="Search menu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div ref={catRef} className="flex gap-2 overflow-x-auto px-5 pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {dbCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all"
            style={{
              background: category === cat ? "#c9a84c" : "rgba(255,255,255,0.05)",
              color: category === cat ? "#0a0a0a" : "#888880",
              border: `1px solid ${category === cat ? "#c9a84c" : "rgba(201,168,76,0.15)"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-3 px-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-3">🍽️</span>
          <p style={{ color: "#888880" }}>No items found</p>
        </div>
      ) : (
        <div className="space-y-3 px-5">
          {filtered.map((item, i) => (
            <MenuItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl overflow-hidden"
      style={{
        borderColor: "rgba(201,168,76,0.15)",
        opacity: item.is_available ? 1 : 0.5,
      }}
    >
      {/* Image */}
      {item.image_url && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Name row */}
            <div className="flex items-center gap-2">
              {/* Veg/Non-veg dot */}
              <div
                className="mt-0.5 h-3 w-3 shrink-0 rounded-sm border flex items-center justify-center"
                style={{ borderColor: item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555" }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555" }}
                />
              </div>
              <h3 className="font-semibold" style={{ color: "#f5f0e8" }}>{item.name}</h3>
              {item.is_must_try && (
                <span className="badge-must-try">Must Try</span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "#888880" }}>
                {item.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="shrink-0 text-right">
            <p className="font-bold text-lg" style={{ color: "#c9a84c" }}>
              ₹{Number(item.price).toFixed(0)}
            </p>
            {!item.is_available && (
              <span className="text-xs" style={{ color: "#e05555" }}>Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
