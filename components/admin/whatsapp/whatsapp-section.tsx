"use client"

import React, { useState } from "react"
import { Users, FileText, Send, History } from "lucide-react"
import { CustomerList }    from "./customer-list"
import { TemplateManager } from "./template-manager"
import { SendCampaign }    from "./send-campaign"
import { CampaignHistory } from "./campaign-history"

type Page = "customers" | "templates" | "send" | "history"

const PAGES: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "customers", label: "Customers", icon: <Users  style={{ width: 15, height: 15 }} /> },
  { id: "templates", label: "Templates", icon: <FileText style={{ width: 15, height: 15 }} /> },
  { id: "send",      label: "Send",      icon: <Send   style={{ width: 15, height: 15 }} /> },
  { id: "history",   label: "History",   icon: <History style={{ width: 15, height: 15 }} /> },
]

export function WhatsAppSection() {
  const [page, setPage] = useState<Page>("customers")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 24, fontWeight: 700 }}>
          WhatsApp Automation
        </h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>
          Manage customers &amp; send bulk messages
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "1px solid rgba(201,168,76,0.12)",
        marginBottom: 24, overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {PAGES.map(p => {
          const active = page === p.id
          return (
            <button key={p.id} onClick={() => setPage(p.id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px",
              background: "none", border: "none", cursor: "pointer",
              color: active ? "#c9a84c" : "#888880",
              fontSize: 13, fontWeight: active ? 700 : 500,
              borderBottom: `2px solid ${active ? "#c9a84c" : "transparent"}`,
              marginBottom: -1,
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}>
              {p.icon}
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {page === "customers" && <CustomerList />}
      {page === "templates" && <TemplateManager />}
      {page === "send"      && <SendCampaign />}
      {page === "history"   && <CampaignHistory />}
    </div>
  )
}
