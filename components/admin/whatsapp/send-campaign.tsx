"use client"

import React, { useEffect, useState } from "react"
import { Send, Users, FileText, Calendar, Loader2, Check, ChevronRight } from "lucide-react"
import { getCustomers, getTemplates, insertCampaign, type Template, type Customer } from "@/lib/supabase"
import { fillTemplate, daysSince } from "@/lib/utils"

const SEGMENTS = [
  { id: "all",        label: "All Customers",     desc: "Everyone in your list" },
  { id: "inactive15", label: "Inactive 15+ days", desc: "Haven't visited in 15 days" },
  { id: "inactive30", label: "Inactive 30+ days", desc: "Haven't visited in 30 days" },
  { id: "new",        label: "Never Returned",    desc: "Only 1 visit so far" },
]

type Step = 1 | 2 | 3

const STEP_LABELS = ["Select Segment", "Choose Template", "Preview & Send"]

export function SendCampaign() {
  const [step, setStep]             = useState<Step>(1)
  const [customers, setCustomers]   = useState<Customer[]>([])
  const [templates, setTemplates]   = useState<Template[]>([])
  const [segment, setSegment]       = useState("all")
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [scheduleDate, setDate]     = useState("")
  const [scheduleTime, setTime]     = useState("")
  const [sending, setSending]       = useState(false)
  const [sent, setSent]             = useState(false)

  useEffect(() => {
    getCustomers().then(setCustomers)
    getTemplates().then(setTemplates)
  }, [])

  const filteredCustomers = customers.filter(c => {
    if (segment === "all")        return true
    if (segment === "inactive15") return daysSince(c.last_visit) >= 15
    if (segment === "inactive30") return daysSince(c.last_visit) >= 30
    if (segment === "new")        return c.visit_count === 1
    return true
  })

  const selectedTemplate = templates.find(t => t.id === templateId)
  const previewMessage   = selectedTemplate
    ? fillTemplate(selectedTemplate.message, { name: "Customer", cafe_name: "Havana Jaipur", offer: "10% off", date: "this weekend", phone: "" })
    : ""

  const handleSend = async () => {
    if (!templateId || filteredCustomers.length === 0) return
    setSending(true)
    const scheduledAt = scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      : undefined
    await insertCampaign({ template_id: templateId, template_name: selectedTemplate?.name, segment, total_sent: filteredCustomers.length, scheduled_at: scheduledAt })
    setSending(false); setSent(true)
    setTimeout(() => { setSent(false); setStep(1); setSegment("all"); setTemplateId(null) }, 3000)
  }

  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(76,175,125,0.12)", border: "1px solid rgba(76,175,125,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check style={{ width: 28, height: 28, color: "#4caf7d" }} />
        </div>
        <p style={{ color: "#f5f0e8", fontSize: 18, fontWeight: 700 }}>Campaign Created!</p>
        <p style={{ color: "#888880", fontSize: 14 }}>{filteredCustomers.length} recipients queued</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Step progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {[1,2,3].map((s, i) => {
          const done = step > s
          const curr = step === s
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: done ? "#c9a84c" : curr ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${done || curr ? "#c9a84c" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: done ? "#0a0a0a" : curr ? "#c9a84c" : "#555",
                  transition: "all 0.3s",
                }}>
                  {done ? <Check style={{ width: 14, height: 14 }} /> : s}
                </div>
                <span style={{ fontSize: 10, color: curr ? "#c9a84c" : "#555", fontWeight: curr ? 700 : 400, whiteSpace: "nowrap" }}>
                  {STEP_LABELS[i]}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: 2, marginBottom: 16, marginLeft: 4, marginRight: 4,
                  background: step > s ? "#c9a84c" : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s",
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* STEP 1: Segment */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SEGMENTS.map(s => {
            const count = s.id === segment ? filteredCustomers.length : null
            return (
              <button key={s.id} onClick={() => setSegment(s.id)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: segment === s.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.025)",
                border: `1.5px solid ${segment === s.id ? "#c9a84c" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.15s",
              }}>
                <div>
                  <p style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 14 }}>{s.label}</p>
                  <p style={{ color: "#888880", fontSize: 12, marginTop: 2 }}>{s.desc}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users style={{ width: 16, height: 16, color: "#888" }} />
                  <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: "right" }}>
                    {count !== null ? count : "–"}
                  </span>
                </div>
              </button>
            )
          })}

          <p style={{ textAlign: "center", color: "#c9a84c", fontSize: 13, fontWeight: 600, padding: "4px 0" }}>
            <strong>{filteredCustomers.length}</strong> customers selected
          </p>

          <button className="btn-gold" onClick={() => setStep(2)} style={{ height: 50, borderRadius: 12 }}>
            Next <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {/* STEP 2: Template */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {templates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <FileText style={{ width: 36, height: 36, color: "#555", margin: "0 auto 12px" }} />
              <p style={{ color: "#888" }}>No templates yet — create one first</p>
            </div>
          ) : (
            templates.map(t => (
              <button key={t.id} onClick={() => setTemplateId(t.id)} style={{
                display: "block", padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: templateId === t.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.025)",
                border: `1.5px solid ${templateId === t.id ? "#c9a84c" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.15s",
              }}>
                <p style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.name}</p>
                <p style={{ color: "#888", fontSize: 12 }} className="line-clamp-2">{t.message}</p>
              </button>
            ))
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, height: 48, borderRadius: 12, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#888", fontSize: 14,
            }}>Back</button>
            <button className="btn-gold" onClick={() => setStep(3)} disabled={!templateId}
              style={{ flex: 2, height: 48, borderRadius: 12 }}>
              Next <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview & Send */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Message preview */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 14, padding: 16,
          }}>
            <p style={{ color: "#888880", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Message Preview
            </p>
            <p style={{ color: "#f5f0e8", fontSize: 13, lineHeight: 1.65 }}>{previewMessage}</p>
          </div>

          {/* Recipients */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 12, padding: "12px 16px",
          }}>
            <span style={{ color: "#888880", fontSize: 13 }}>Recipients</span>
            <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 18 }}>{filteredCustomers.length}</span>
          </div>

          {/* Schedule (optional) */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: 16,
          }}>
            <p style={{ color: "#888880", fontSize: 12, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar style={{ width: 14, height: 14 }} /> Schedule (optional)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input type="date" className="input-base" style={{ height: 40, fontSize: 13 }}
                value={scheduleDate} onChange={e => setDate(e.target.value)} />
              <input type="time" className="input-base" style={{ height: 40, fontSize: 13 }}
                value={scheduleTime} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, height: 50, borderRadius: 12, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#888", fontSize: 14,
            }}>Back</button>
            <button className="btn-gold" onClick={handleSend} disabled={sending} style={{ flex: 2, height: 50, borderRadius: 12 }}>
              {sending
                ? <Loader2 style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite" }} />
                : scheduleDate
                  ? <><Calendar style={{ width: 16, height: 16 }} /> Schedule</>
                  : <><Send style={{ width: 16, height: 16 }} /> Send Now</>
              }
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
