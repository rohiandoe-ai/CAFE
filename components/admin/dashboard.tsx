"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Star, UtensilsCrossed, LogOut, Menu, X } from "lucide-react"
import { WhatsAppSection } from "./whatsapp/whatsapp-section"
import { ReviewsSection } from "./reviews/reviews-section"
import { MenuManager } from "./menu/menu-manager"

type Section = "whatsapp" | "reviews" | "menu"

const navItems: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "whatsapp", label: "WhatsApp",     icon: <MessageSquare className="h-5 w-5" />, desc: "Automation & Campaigns" },
  { id: "reviews",  label: "Reviews",      icon: <Star className="h-5 w-5" />,          desc: "Customer Feedback" },
  { id: "menu",     label: "Menu Manager", icon: <UtensilsCrossed className="h-5 w-5" />, desc: "Items & Availability" },
]

export function AdminDashboard() {
  const router  = useRouter()
  const [section, setSection]       = useState<Section>("whatsapp")
  const [sidebarOpen, setSidebar]   = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!sessionStorage.getItem("admin_auth")) {
        router.replace("/admin/login")
      }
    }
  }, [router])

  const logout = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("admin_auth")
    router.replace("/admin/login")
  }

  const active = navItems.find(n => n.id === section)!

  return (
    <div className="flex min-h-svh" style={{ background: "#0a0a0a" }}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r z-40"
        style={{ background: "rgba(10,10,10,0.98)", borderColor: "rgba(201,168,76,0.15)" }}
      >
        <SidebarContent
          section={section}
          setSection={s => { setSection(s); setSidebar(false) }}
          logout={logout}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setSidebar(false)}
          />
          <aside
            className="relative w-64 flex flex-col border-r h-full"
            style={{ background: "#0f0f0f", borderColor: "rgba(201,168,76,0.15)" }}
          >
            <button
              onClick={() => setSidebar(false)}
              className="absolute top-4 right-4"
              style={{ color: "#888880" }}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              section={section}
              setSection={s => { setSection(s); setSidebar(false) }}
              logout={logout}
            />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-svh">
        {/* Top bar (mobile) */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 border-b px-4 h-14 md:hidden"
          style={{ background: "rgba(10,10,10,0.98)", borderColor: "rgba(201,168,76,0.15)" }}
        >
          <button onClick={() => setSidebar(true)} style={{ color: "#c9a84c" }}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold" style={{ color: "#f5f0e8" }}>{active.label}</span>
        </header>

        {/* Section content */}
        <main className="flex-1 p-4 md:p-6">
          {section === "whatsapp" && <WhatsAppSection />}
          {section === "reviews"  && <ReviewsSection />}
          {section === "menu"     && <MenuManager />}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  section,
  setSection,
  logout,
}: {
  section: Section
  setSection: (s: Section) => void
  logout: () => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: "rgba(201,168,76,0.15)" }}
        >
          <span style={{ color: "#c9a84c", fontSize: "1rem" }}>☕</span>
        </div>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: "#f5f0e8" }}>Cafe Admin</p>
          <p className="text-xs" style={{ color: "#888880" }}>Management Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
              style={{
                background: isActive ? "rgba(201,168,76,0.12)" : "transparent",
                color: isActive ? "#c9a84c" : "#888880",
              }}
            >
              {item.icon}
              <div>
                <p className="text-sm font-medium" style={{ color: isActive ? "#c9a84c" : "#f5f0e8" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "#888880" }}>{item.desc}</p>
              </div>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "#c9a84c" }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-red-500/10"
          style={{ color: "#888880" }}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </>
  )
}
