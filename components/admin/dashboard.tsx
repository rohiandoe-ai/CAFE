"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Star, QrCode, LogOut, Menu, X, ChevronRight } from "lucide-react"
import { ReviewsSection } from "./reviews/reviews-section"
import { QRSection } from "./qr/qr-section"

type Section = "reviews" | "qr"

const NAV: { id: Section; label: string; desc: string; icon: React.ReactNode; emoji: string }[] = [
  { id: "reviews",  label: "Reviews",   desc: "Customer Feedback",      emoji: "⭐", icon: <Star            style={{ width: 18, height: 18 }} /> },
  { id: "qr",       label: "QR Code",   desc: "Generate & Download",    emoji: "📱", icon: <QrCode          style={{ width: 18, height: 18 }} /> },
]

export function AdminDashboard() {
  const router = useRouter()
  const [section, setSection]     = useState<Section>("reviews")
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

  const go = (s: Section) => { setSection(s); setSidebar(false) }
  const active = NAV.find(n => n.id === section)!

  return (
    <div style={{ display: "flex", minHeight: "100svh", background: "#0a0a0a" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="admin-sidebar" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 250,
        flexDirection: "column",
        borderRight: "1px solid rgba(201,168,76,0.1)",
        background: "rgba(10,10,10,0.99)",
        zIndex: 40, display: "none",
      }}>
        <SidebarInner section={section} onChange={go} logout={logout} />
      </aside>

      {/* ── Mobile Drawer ── */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex" }}>
          <div onClick={() => setSidebar(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)" }} />
          <aside style={{
            position: "relative", width: 270, height: "100%",
            background: "#0d0d0d", borderRight: "1px solid rgba(201,168,76,0.15)",
            display: "flex", flexDirection: "column",
            animation: "slideIn 0.22s cubic-bezier(.4,0,.2,1)",
          }}>
            <button
              onClick={() => setSidebar(false)}
              style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#888",
              }}
            ><X style={{ width: 15, height: 15 }} /></button>
            <SidebarInner section={section} onChange={go} logout={logout} />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="admin-main" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100svh" }}>

        {/* Mobile Top Bar */}
        <header className="admin-topbar" style={{
          position: "sticky", top: 0, zIndex: 30, height: 56,
          display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
          background: "rgba(10,10,10,0.98)", borderBottom: "1px solid rgba(201,168,76,0.1)",
          backdropFilter: "blur(16px)",
        }}>
          <button onClick={() => setSidebar(true)} style={{
            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 9, width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#c9a84c", flexShrink: 0,
          }}>
            <Menu style={{ width: 17, height: 17 }} />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 15, lineHeight: 1 }}>{active.emoji} {active.label}</p>
            <p style={{ color: "#888880", fontSize: 11, marginTop: 2 }}>{active.desc}</p>
          </div>
          <button onClick={logout} style={{
            background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.18)",
            borderRadius: 9, width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#e05555", flexShrink: 0,
          }}>
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "20px 16px", paddingBottom: 76, overflowX: "hidden" }}>
          {section === "reviews"  && <ReviewsSection />}
          {section === "qr"       && <QRSection />}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="admin-bottom-nav" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          height: 62, background: "rgba(8,8,8,0.98)",
          borderTop: "1px solid rgba(201,168,76,0.1)",
          display: "flex", paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {NAV.map(item => {
            const isActive = section === item.id
            return (
              <button key={item.id} onClick={() => go(item.id)} style={{
                flex: 1, background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                color: isActive ? "#c9a84c" : "#555",
                transition: "color 0.2s", position: "relative",
              }}>
                {isActive && <div style={{
                  position: "absolute", top: 0, width: 28, height: 2,
                  borderRadius: 2, background: "#c9a84c",
                }} />}
                <span style={{ transform: isActive ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s" }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.03em" }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes spin    { to   { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .admin-sidebar     { display: flex !important; }
          .admin-main        { margin-left: 250px; }
          .admin-topbar      { display: none !important; }
          .admin-bottom-nav  { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function SidebarInner({ section, onChange, logout }: {
  section: Section; onChange: (s: Section) => void; logout: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", paddingTop: 0 }}>
      {/* Brand */}
      <div style={{
        padding: "24px 18px 20px",
        borderBottom: "1px solid rgba(201,168,76,0.09)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: "#ffffff",
          border: "1.5px solid rgba(201,168,76,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 14px rgba(201,168,76,0.15)", overflow: "hidden",
          padding: 3,
        }}>
          <img src="/havana-logo.png" alt="Havana Cafe Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div>
          <p className="font-serif" style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>Cafe Admin</p>
          <p style={{ color: "#666", fontSize: 11, marginTop: 3 }}>Management Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px 6px", overflowY: "auto" }}>
        <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 8px 10px" }}>
          Navigation
        </p>
        {NAV.map(item => {
          const active = section === item.id
          return (
            <button key={item.id} onClick={() => onChange(item.id)} style={{
              width: "100%", textAlign: "left", marginBottom: 3,
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px", borderRadius: 11, border: "none", cursor: "pointer",
              background: active ? "rgba(201,168,76,0.11)" : "transparent",
              transition: "background 0.15s",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: active ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.06)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active ? "#c9a84c" : "#666",
                transition: "all 0.15s",
              }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: active ? "#c9a84c" : "#d0c8c0", fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>
                  {item.label}
                </p>
                <p style={{ color: "#555", fontSize: 11, marginTop: 1 }}>{item.desc}</p>
              </div>
              {active && <ChevronRight style={{ width: 13, height: 13, color: "#c9a84c", flexShrink: 0 }} />}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px 10px 20px", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <button onClick={logout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 11,
          padding: "10px 12px", borderRadius: 11, border: "none", cursor: "pointer",
          background: "transparent", color: "#888",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.background = "rgba(224,85,85,0.08)"; b.style.color = "#e05555" }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.background = "transparent"; b.style.color = "#888" }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LogOut style={{ width: 15, height: 15, color: "#e05555" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
