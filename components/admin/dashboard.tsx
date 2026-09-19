"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Star, UtensilsCrossed, LogOut, Menu, X, ChevronRight } from "lucide-react"
import { WhatsAppSection } from "./whatsapp/whatsapp-section"
import { ReviewsSection } from "./reviews/reviews-section"
import { MenuManager } from "./menu/menu-manager"

type Section = "whatsapp" | "reviews" | "menu"

const NAV: { id: Section; label: string; desc: string; icon: React.ReactNode; emoji: string }[] = [
  { id: "whatsapp", label: "WhatsApp",     desc: "Automation & Campaigns", emoji: "💬", icon: <MessageSquare style={{ width: 18, height: 18 }} /> },
  { id: "reviews",  label: "Reviews",      desc: "Customer Feedback",      emoji: "⭐", icon: <Star          style={{ width: 18, height: 18 }} /> },
  { id: "menu",     label: "Menu Manager", desc: "Items & Availability",   emoji: "🍽️", icon: <UtensilsCrossed style={{ width: 18, height: 18 }} /> },
]

export function AdminDashboard() {
  const router = useRouter()
  const [section, setSection]     = useState<Section>("whatsapp")
  const [sidebarOpen, setSidebar] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin/login")
    }
  }, [router])

  const logout = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("admin_auth")
    router.replace("/admin/login")
  }

  const active = NAV.find(n => n.id === section)!

  const changeSection = (s: Section) => {
    setSection(s)
    setSidebar(false)
  }

  return (
    <div style={{ display: "flex", minHeight: "100svh", background: "#0a0a0a" }}>

      {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        display: "none",
        position: "fixed", inset: "0 auto 0 0",
        width: 240,
        flexDirection: "column",
        borderRight: "1px solid rgba(201,168,76,0.12)",
        background: "rgba(12,12,12,0.99)",
        zIndex: 40,
      }} className="md-sidebar">
        <SidebarInner section={section} onChange={changeSection} logout={logout} />
      </aside>

      {/* ─── Mobile Sidebar Overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex" }}>
          {/* Backdrop */}
          <div
            onClick={() => setSidebar(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }}
          />
          {/* Drawer */}
          <aside style={{
            position: "relative", width: 260, height: "100%",
            background: "#0f0f0f",
            borderRight: "1px solid rgba(201,168,76,0.15)",
            display: "flex", flexDirection: "column",
            animation: "slideInLeft 0.22s ease",
          }}>
            <button
              onClick={() => setSidebar(false)}
              style={{
                position: "absolute", top: 14, right: 14,
                background: "rgba(255,255,255,0.06)", border: "none",
                borderRadius: 8, width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#888880",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
            <SidebarInner section={section} onChange={changeSection} logout={logout} />
          </aside>
        </div>
      )}

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100svh",
        // On desktop: offset by sidebar width
      }} className="main-offset">

        {/* Mobile Top Bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          height: 54,
          display: "flex", alignItems: "center", gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid rgba(201,168,76,0.12)",
          background: "rgba(10,10,10,0.98)",
          backdropFilter: "blur(12px)",
        }} className="mobile-header">
          <button
            onClick={() => setSidebar(true)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 8, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#c9a84c", flexShrink: 0,
            }}
          >
            <Menu style={{ width: 16, height: 16 }} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
              {active.emoji} {active.label}
            </p>
            <p style={{ color: "#888880", fontSize: 11, marginTop: 1 }}>{active.desc}</p>
          </div>

          <button
            onClick={logout}
            style={{
              background: "rgba(224,85,85,0.1)",
              border: "1px solid rgba(224,85,85,0.2)",
              borderRadius: 8, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#e05555", flexShrink: 0,
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        </header>

        {/* Section content */}
        <main style={{ flex: 1, padding: "20px 16px", paddingBottom: 80 }}>
          {section === "whatsapp" && <WhatsAppSection />}
          {section === "reviews"  && <ReviewsSection />}
          {section === "menu"     && <MenuManager />}
        </main>

        {/* Mobile Bottom Nav */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          height: 60,
          background: "rgba(8,8,8,0.98)",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          display: "flex",
          paddingBottom: "env(safe-area-inset-bottom)",
        }} className="mobile-bottom-nav">
          {NAV.map(item => {
            const active = section === item.id
            return (
              <button
                key={item.id}
                onClick={() => changeSection(item.id)}
                style={{
                  flex: 1, background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  color: active ? "#c9a84c" : "#555",
                  transition: "color 0.2s",
                  position: "relative",
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute", top: 0,
                    width: 32, height: 2, borderRadius: 2,
                    background: "#c9a84c",
                  }} />
                )}
                <span style={{ transform: active ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s" }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em" }}>
                  {item.label === "Menu Manager" ? "Menu" : item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .md-sidebar { display: flex !important; }
          .main-offset { margin-left: 240px; }
          .mobile-header { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .md-sidebar { display: none !important; }
          .main-offset { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

function SidebarInner({
  section, onChange, logout,
}: {
  section: Section
  onChange: (s: Section) => void
  logout: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{
        padding: "22px 20px 18px",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "rgba(201,168,76,0.12)",
          border: "1px solid rgba(201,168,76,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>☕</div>
        <div>
          <p className="font-serif" style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Cafe Admin
          </p>
          <p style={{ color: "#888880", fontSize: 11, marginTop: 2 }}>Management Portal</p>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(item => {
          const active = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{
                width: "100%", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px",
                borderRadius: 10, border: "none", cursor: "pointer",
                background: active ? "rgba(201,168,76,0.1)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active ? "#c9a84c" : "#888880",
                border: `1px solid ${active ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: active ? "#c9a84c" : "#e0d8cc", fontWeight: 600, fontSize: 13 }}>
                  {item.label}
                </p>
                <p style={{ color: "#666", fontSize: 11, marginTop: 1 }}>{item.desc}</p>
              </div>
              {active && (
                <ChevronRight style={{ width: 14, height: 14, color: "#c9a84c", flexShrink: 0 }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider + Logout */}
      <div style={{ padding: "10px 10px 20px", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <button
          onClick={logout}
          style={{
            width: "100%", textAlign: "left",
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: 10, border: "none", cursor: "pointer",
            background: "transparent", color: "#888880",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,85,85,0.08)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "#e05555"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent"
            ;(e.currentTarget as HTMLButtonElement).style.color = "#888880"
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "rgba(224,85,85,0.08)",
            border: "1px solid rgba(224,85,85,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LogOut style={{ width: 16, height: 16, color: "#e05555" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
