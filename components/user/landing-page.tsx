"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Star } from "lucide-react"
import { ReviewTab } from "./review-tab"
import { getBusiness, type Business } from "@/lib/supabase"

type Tab = "review"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "review", label: "Review",  icon: <Star className="h-[18px] w-[18px]" /> },
]

const FALLBACK: Business = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "Havana Jaipur",
  location: "Jaipur, Rajasthan",
  google_review_url: "https://search.google.com/local/writereview?placeid=ChIJWfw4aTDJbTkR2uANiQm7B-Y",
  logo_url: null,
  admin_email: "admin@havanajaipur.com",
  admin_password: "admin123",
}

export function LandingPage() {
  const [tab, setTab]           = useState<Tab>("review")
  const [business, setBusiness] = useState<Business>(FALLBACK)
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2000)
    getBusiness()
      .then(d => { if (d) setBusiness(d) })
      .catch(console.error)
      .finally(() => { clearTimeout(timer); setReady(true) })
    return () => clearTimeout(timer)
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4" style={{ background: "#0a0a0a" }}>
        <div
          className="h-12 w-12 rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "#c9a84c",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p className="text-sm" style={{ color: "#888880" }}>Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: "#0a0a0a" }}>
      {/* Ambient */}
      <div
        aria-hidden
        style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* Content */}
      <main style={{ flex: 1, paddingBottom: 72, overflowY: "auto", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {tab === "review" && <ReviewTab business={business} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          height: 64,
          background: "rgba(8,8,8,0.97)",
          borderTop: "1px solid rgba(201,168,76,0.15)",
          backdropFilter: "blur(20px)",
          display: "flex",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: active ? "#c9a84c" : "#666",
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              {/* Top line indicator */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  width: active ? 36 : 0,
                  height: 2,
                  borderRadius: 2,
                  background: "#c9a84c",
                  transition: "width 0.25s ease",
                }}
              />
              <span style={{ transform: active ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s" }}>
                {t.icon}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
