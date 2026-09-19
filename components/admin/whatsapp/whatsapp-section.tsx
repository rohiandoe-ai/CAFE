"use client"

import React from "react"
import { CustomerList } from "./customer-list"

export function WhatsAppSection() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 24, fontWeight: 700 }}>
          WhatsApp
        </h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>
          Export customer numbers &amp; messages as CSV for WARocket
        </p>
      </div>
      <CustomerList />
    </div>
  )
}
