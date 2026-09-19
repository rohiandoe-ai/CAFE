"use client"

import React, { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Copy, Loader2, X } from "lucide-react"
import { getTemplates, insertTemplate, updateTemplate, deleteTemplate, type Template } from "@/lib/supabase"
import { fillTemplate } from "@/lib/utils"

const CATEGORIES = ["We Miss You","Special Offer","Birthday","New Menu Item","Custom"]
const VARIABLES  = ["{name}","{cafe_name}","{offer}","{date}","{phone}"]
const PREVIEW_VARS = { name: "Rahul", cafe_name: "Havana Jaipur", offer: "10% off", date: "this Sunday", phone: "+91 98765 43210" }

const CAT_COLORS: Record<string, string> = {
  "We Miss You":   "#c9a84c",
  "Special Offer": "#4caf7d",
  "Birthday":      "#e05555",
  "New Menu Item": "#64b5f6",
  "Custom":        "#9b59b6",
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [tName, setTName]         = useState("")
  const [category, setCategory]   = useState(CATEGORIES[0])
  const [message, setMessage]     = useState("")

  const load = () => getTemplates().then(d => { setTemplates(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const reset = () => { setTName(""); setCategory(CATEGORIES[0]); setMessage(""); setEditId(null) }

  const handleSave = async () => {
    if (!tName.trim() || !message.trim()) return
    setSaving(true)
    if (editId) await updateTemplate(editId, { name: tName, category, message })
    else        await insertTemplate({ name: tName, category, message })
    await load(); setSaving(false); setShowForm(false); reset()
  }

  const handleEdit = (t: Template) => {
    setEditId(t.id); setTName(t.name); setCategory(t.category); setMessage(t.message)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return
    await deleteTemplate(id); load()
  }

  const handleDuplicate = async (t: Template) => {
    await insertTemplate({ name: t.name + " (copy)", category: t.category, message: t.message }); load()
  }

  const preview = fillTemplate(message, PREVIEW_VARS)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "#888880", fontSize: 13 }}>
          <span style={{ color: "#c9a84c", fontWeight: 700 }}>{templates.length}</span> templates
        </p>
        <button
          onClick={() => { reset(); setShowForm(true) }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10, cursor: "pointer",
            background: "rgba(201,168,76,0.12)", color: "#c9a84c",
            border: "1px solid rgba(201,168,76,0.3)", fontSize: 13, fontWeight: 700,
          }}
        >
          <Plus style={{ width: 15, height: 15 }} /> New Template
        </button>
      </div>

      {/* Form panel */}
      {showForm && (
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 15 }}>
              {editId ? "✏️ Edit Template" : "✨ New Template"}
            </p>
            <button onClick={() => { setShowForm(false); reset() }} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div style={{ display: "grid", gap: 16 }} className="tmpl-form-grid">
            {/* Left: inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input-base" placeholder="Template name *" value={tName} onChange={e => setTName(e.target.value)} />

              <select className="input-base" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              {/* Variable chips */}
              <div>
                <p style={{ color: "#888880", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>Insert variable:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {VARIABLES.map(v => (
                    <button key={v} onClick={() => setMessage(m => m + v)} style={{
                      padding: "4px 10px", borderRadius: 8, cursor: "pointer",
                      background: "rgba(201,168,76,0.1)", color: "#c9a84c",
                      fontSize: 12, fontFamily: "monospace", fontWeight: 600,
                      border: "1px solid rgba(201,168,76,0.2)",
                    } as React.CSSProperties}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  className="input-base"
                  rows={5}
                  placeholder="Write your message here…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{ resize: "none" }}
                />
                <p style={{ textAlign: "right", color: "#555", fontSize: 11, marginTop: 4 }}>
                  {message.length} chars
                </p>
              </div>
            </div>

            {/* Right: preview */}
            <div>
              <p style={{ color: "#888880", fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Live Preview
              </p>
              <div style={{
                background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 12, padding: "14px 16px", minHeight: 120,
              }}>
                {preview
                  ? <p style={{ color: "#f5f0e8", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{preview}</p>
                  : <p style={{ color: "#555", fontSize: 13 }}>Preview will appear here…</p>
                }
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-gold" onClick={handleSave} disabled={saving} style={{ flex: 1, height: 44, borderRadius: 10 }}>
              {saving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} /> : (editId ? "Update" : "Save Template")}
            </button>
            <button onClick={() => { setShowForm(false); reset() }} style={{
              padding: "0 20px", height: 44, borderRadius: 10, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#888", fontSize: 13,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Template list */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 style={{ width: 26, height: 26, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>📝</p>
          <p style={{ color: "#888" }}>No templates yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {templates.map(t => {
            const catColor = CAT_COLORS[t.category] ?? "#888"
            return (
              <div key={t.id} style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                {/* Color dot */}
                <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: catColor, flexShrink: 0, marginTop: 2 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 14 }}>{t.name}</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                      background: catColor + "20", color: catColor,
                    }}>{t.category}</span>
                  </div>
                  <p style={{ color: "#888", fontSize: 12, lineHeight: 1.5 }} className="line-clamp-2">{t.message}</p>
                </div>

                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <TBtn onClick={() => handleEdit(t)} color="#888"><Edit2 style={{ width: 13, height: 13 }} /></TBtn>
                  <TBtn onClick={() => handleDuplicate(t)} color="#888"><Copy style={{ width: 13, height: 13 }} /></TBtn>
                  <TBtn onClick={() => handleDelete(t.id)} color="#e05555"><Trash2 style={{ width: 13, height: 13 }} /></TBtn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) { .tmpl-form-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  )
}

function TBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 7, border: "none", cursor: "pointer",
      background: "rgba(255,255,255,0.04)", color,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = color + "22")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
    >{children}</button>
  )
}
