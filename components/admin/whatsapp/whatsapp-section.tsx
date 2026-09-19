"use client"

import React, { useState } from "react"
import { Users, FileText, Send, History } from "lucide-react"
import { CustomerList } from "./customer-list"
import { TemplateManager } from "./template-manager"
import { SendCampaign } from "./send-campaign"
import { CampaignHistory } from "./campaign-history"

type Page = "customers" | "templates" | "send" | "history"

const pages: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "customers",  label: "Customers",  icon: <Users className="h-4 w-4" /> },
  { id: "templates",  label: "Templates",  icon: <FileText className="h-4 w-4" /> },
  { id: "send",       label: "Send",       icon: <Send className="h-4 w-4" /> },
  { id: "history",    label: "History",    icon: <History className="h-4 w-4" /> },
]

export function WhatsAppSection() {
  const [page, setPage] = useState<Page>("customers")

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>WhatsApp Automation</h1>
        <p className="mt-1 text-sm" style={{ color: "#888880" }}>Manage customers & send bulk messages</p>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {pages.map(p => (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: page === p.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              color: page === p.id ? "#c9a84c" : "#888880",
              border: `1px solid ${page === p.id ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)"}`,
            }}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      {page === "customers" && <CustomerList />}
      {page === "templates" && <TemplateManager />}
      {page === "send"      && <SendCampaign />}
      {page === "history"   && <CampaignHistory />}
    </div>
  )
}
