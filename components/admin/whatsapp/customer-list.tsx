"use client"

import React, { useEffect, useState } from "react"
import { Search, RefreshCw, Users, Phone, Download, FileText, ExternalLink } from "lucide-react"
import { getCustomers, getTemplates, type Customer, type Template } from "@/lib/supabase"
import { daysSince, formatDate, fillTemplate } from "@/lib/utils"

type Filter = "all" | "active" | "inactive"

export function CustomerList() {
  const [customers, setCustomers]   = useState<Customer[]>([])
  const [templates, setTemplates]   = useState<Template[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [filter, setFilter]         = useState<Filter>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [exported, setExported]     = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getCustomers(), getTemplates()]).then(([c, t]) => {
      setCustomers(c)
      setTemplates(t)
      if (t.length > 0 && !selectedTemplate) setSelectedTemplate(t[0].id)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const filtered = customers.filter(c => {
    const days = daysSince(c.last_visit)
    const matchF = filter === "all"
      || (filter === "active"   && days < 15)
      || (filter === "inactive" && days >= 15)
    const matchS = c.name.toLowerCase().includes(search.toLowerCase())
      || c.phone.includes(search)
    return matchF && matchS
  })

  const total    = customers.length
  const active   = customers.filter(c => daysSince(c.last_visit) < 15).length
  const inactive = customers.length - active

  // ── Export CSV for WARocket ──────────────────────────────────────────────
  const exportCSV = () => {
    const tmpl = templates.find(t => t.id === selectedTemplate)

    const rows: string[] = ["phone,message"]

    filtered.forEach(c => {
      const message = tmpl
        ? fillTemplate(tmpl.message, {
            name:      c.name,
            cafe_name: "Havana Jaipur",
            offer:     "10% off",
            date:      "this week",
            phone:     c.phone,
          })
        : `Hi ${c.name}! We miss you at Havana Jaipur. Come visit us soon! 🙏`

      // Escape commas/quotes in message
      const safeMsgage = `"${message.replace(/"/g, '""')}"`
      const phone      = `91${c.phone.replace(/\D/g, "")}`
      rows.push(`${phone},${safeMsgage}`)
    })

    const csv  = rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `havana-jaipur-whatsapp-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── How to use guide ── */}
      <div style={{
        background: "rgba(201,168,76,0.06)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: 16, padding: "16px 18px",
      }}>
        <p style={{ color: "#c9a84c", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          📋 How to send WhatsApp messages via WARocket
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { step: "1", text: "Install WARocket Chrome Extension", link: "https://chromewebstore.google.com/detail/warocket-senderrocket-sen/onohcnjmnndegfjgbfdfaeooceefedji" },
            { step: "2", text: "Select customers below & choose a message template" },
            { step: "3", text: "Click \"Export CSV\" — file will download automatically" },
            { step: "4", text: "Open WhatsApp Web → click WARocket extension → Upload CSV → Send!" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#c9a84c",
              }}>{s.step}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#d0c8c0", fontSize: 13 }}>{s.text}</span>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" style={{
                    color: "#c9a84c", fontSize: 11, display: "flex", alignItems: "center", gap: 3,
                    textDecoration: "none",
                  }}>
                    Install <ExternalLink style={{ width: 11, height: 11 }} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Template selector ── */}
      {templates.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 14, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Select Message Template
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {templates.map(t => (
              <label key={t.id} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: selectedTemplate === t.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
                border: `1.5px solid ${selectedTemplate === t.id ? "#c9a84c" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.15s",
              }}>
                <input
                  type="radio"
                  name="template"
                  value={t.id}
                  checked={selectedTemplate === t.id}
                  onChange={() => setSelectedTemplate(t.id)}
                  style={{ accentColor: "#c9a84c", marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <p style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 13 }}>{t.name}</p>
                  <p style={{ color: "#888880", fontSize: 12, marginTop: 2 }} className="line-clamp-2">{t.message}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { label: "TOTAL",    value: total,    color: "#c9a84c", bg: "rgba(201,168,76,0.07)"  },
          { label: "ACTIVE",   value: active,   color: "#4caf7d", bg: "rgba(76,175,125,0.07)"  },
          { label: "INACTIVE", value: inactive, color: "#e05555", bg: "rgba(224,85,85,0.07)"   },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.color}20`,
            borderRadius: 14, padding: "14px 12px", textAlign: "center",
          }}>
            <p style={{ color: s.color, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: "#888880", fontSize: 10, marginTop: 5, fontWeight: 700, letterSpacing: "0.1em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters + Search + Export ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, border: "1px solid rgba(201,168,76,0.1)" }}>
          {(["all","active","inactive"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: filter === f ? "rgba(201,168,76,0.18)" : "transparent",
              color: filter === f ? "#c9a84c" : "#888",
              fontSize: 12, fontWeight: 600, textTransform: "capitalize", transition: "all 0.15s",
            }}>{f}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
          <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#888" }} />
          <input className="input-base" style={{ paddingLeft: 32, height: 38, fontSize: 13 }}
            placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Refresh */}
        <button onClick={load} style={{
          width: 36, height: 36, borderRadius: 9, cursor: "pointer",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#888", flexShrink: 0,
        }}>
          <RefreshCw style={{ width: 14, height: 14, animation: loading ? "spin 0.8s linear infinite" : "none" }} />
        </button>

        {/* Export CSV button */}
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0 18px", height: 38, borderRadius: 10, cursor: "pointer",
            background: exported ? "rgba(76,175,125,0.15)" : "rgba(201,168,76,0.12)",
            color: exported ? "#4caf7d" : "#c9a84c",
            border: `1.5px solid ${exported ? "rgba(76,175,125,0.4)" : "#c9a84c"}`,
            fontSize: 13, fontWeight: 700, transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          {exported
            ? <><FileText style={{ width: 15, height: 15 }} /> Downloaded!</>
            : <><Download style={{ width: 15, height: 15 }} /> Export CSV ({filtered.length})</>
          }
        </button>
      </div>

      {/* ── Customer table / cards ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <RefreshCw style={{ width: 26, height: 26, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Users style={{ width: 40, height: 40, color: "#333", margin: "0 auto 12px" }} />
          <p style={{ color: "#888" }}>No customers found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="cust-table" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 130px 60px 110px 70px 90px",
              padding: "9px 16px",
              background: "rgba(201,168,76,0.05)",
              borderBottom: "1px solid rgba(201,168,76,0.1)",
            }}>
              {["Name","Phone","Visits","Last Visit","Inactive","Status"].map(h => (
                <span key={h} style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
              ))}
            </div>
            {filtered.map((c, i) => {
              const days       = daysSince(c.last_visit)
              const isInactive = days >= 15
              return (
                <div key={c.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 130px 60px 110px 70px 90px",
                  padding: "12px 16px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                  <span style={{ color: "#888", fontSize: 13 }}>+91 {c.phone}</span>
                  <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 14, textAlign: "center" }}>{c.visit_count}</span>
                  <span style={{ color: "#888", fontSize: 12 }}>{formatDate(c.last_visit)}</span>
                  <span style={{ color: isInactive ? "#e05555" : "#4caf7d", fontSize: 13, fontWeight: 600 }}>{days}d</span>
                  <span>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 99,
                      fontSize: 11, fontWeight: 700,
                      background: isInactive ? "rgba(224,85,85,0.12)" : "rgba(76,175,125,0.12)",
                      color: isInactive ? "#e05555" : "#4caf7d",
                    }}>{isInactive ? "Inactive" : "Active"}</span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Mobile cards */}
          <div className="cust-cards" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {filtered.map(c => {
              const days       = daysSince(c.last_visit)
              const isInactive = days >= 15
              return (
                <div key={c.id} style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <p style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 15 }}>{c.name}</p>
                      <p style={{ color: "#888", fontSize: 12, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone style={{ width: 11, height: 11 }} /> +91 {c.phone}
                      </p>
                    </div>
                    <span style={{
                      padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: isInactive ? "rgba(224,85,85,0.12)" : "rgba(76,175,125,0.12)",
                      color: isInactive ? "#e05555" : "#4caf7d",
                    }}>{isInactive ? "Inactive" : "Active"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Visits</p>
                      <p style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16 }}>{c.visit_count}</p>
                    </div>
                    <div>
                      <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Last Visit</p>
                      <p style={{ color: "#888", fontSize: 13 }}>{formatDate(c.last_visit)}</p>
                    </div>
                    <div>
                      <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Inactive</p>
                      <p style={{ color: isInactive ? "#e05555" : "#4caf7d", fontWeight: 700, fontSize: 13 }}>{days}d</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── WARocket link ── */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        flexWrap: "wrap",
      }}>
        <div>
          <p style={{ color: "#f5f0e8", fontSize: 13, fontWeight: 600 }}>Open WhatsApp Web + WARocket</p>
          <p style={{ color: "#888880", fontSize: 12, marginTop: 2 }}>
            Upload the downloaded CSV in WARocket extension to send all messages
          </p>
        </div>
        <a
          href="https://web.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10,
            background: "rgba(37,211,102,0.12)",
            border: "1px solid rgba(37,211,102,0.3)",
            color: "#25d366", fontSize: 13, fontWeight: 700,
            textDecoration: "none", flexShrink: 0,
          }}
        >
          <ExternalLink style={{ width: 14, height: 14 }} />
          Open WhatsApp Web
        </a>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .cust-table { display: none !important; }
          .cust-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
