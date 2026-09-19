"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Star, MessageCircle, UtensilsCrossed } from "lucide-react"
import { ReviewTab } from "./review-tab"
import { SocialTab } from "./social-tab"
import { MenuTab } from "./menu-tab"
import { getBusiness, type Business } from "@/lib/supabase"

type Tab = "review" | "social" | "menu"

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "review", label: "Review",  icon: <Star className="h-5 w-5" /> },
  { id: "social", label: "Social",  icon: <MessageCircle className="h-5 w-5" /> },
  { id: "menu",   label: "Menu",    icon: <UtensilsCrossed className="h-5 w-5" /> },
]

// Fallback so page never stays blank if Supabase isn't set up yet
const FALLBACK_BUSINESS: Business = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "House of Paloma",
  location: "Bandra West, Mumbai",
  google_review_url: "https://search.google.com/local/writereview?placeid=ChIJu6ZBnxTJ5zsRvHMC18xfZnQ",
  logo_url: null,
  admin_email: "admin@houseofpaloma.com",
  admin_password: "admin123",
}

export function LandingPage() {
  const [active, setActive]     = useState<Tab>("review")
  const [business, setBusiness] = useState<Business>(FALLBACK_BUSINESS)
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    getBusiness()
      .then(data => {
        if (data) setBusiness(data)
      })
      .catch(console.error)
      .finally(() => setLoaded(true))
  }, [])

  // Show a minimal spinner only for the first 1.5s max
  if (!loaded) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#c9a84c", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col" style={{ background: "#0a0a0a" }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
      />

      {/* Tab content */}
      <main className="flex-1 pb-nav overflow-y-auto">
        <AnimatePresence mode="wait">
          {active === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <ReviewTab business={business} />
            </motion.div>
          )}
          {active === "social" && (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <SocialTab business={business} />
            </motion.div>
          )}
          {active === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <MenuTab business={business} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t"
        style={{
          background: "rgba(10,10,10,0.97)",
          borderColor: "rgba(201,168,76,0.15)",
          backdropFilter: "blur(12px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-stretch h-16">
          {tabs.map(tab => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all"
                style={{ color: isActive ? "#c9a84c" : "#888880" }}
              >
                {isActive && (
                  <div
                    className="absolute top-0 h-0.5 w-12 rounded-full"
                    style={{ background: "#c9a84c" }}
                  />
                )}
                <span
                  className="transition-transform duration-200"
                  style={{ transform: isActive ? "scale(1.1)" : "scale(1)" }}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wide">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
