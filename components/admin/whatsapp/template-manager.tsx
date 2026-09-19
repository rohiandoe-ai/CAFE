"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Copy, Loader2 } from "lucide-react"
import { getTemplates, insertTemplate, updateTemplate, deleteTemplate, type Template } from "@/lib/supabase"
import { fillTemplate } from "@/lib/utils"

const CATEGORIES = ["We Miss You","Special Offer","Birthday","New Menu Item","Custom"]
const VARIABLES  = ["{name}","{cafe_name}","{offer}","{date}","{phone}"]

const PREVIEW_VARS = {
  name: "Rahul",
  cafe_name: "House of Paloma",
  offer: "10% off",
  date: "this Sunday",
  phone: "+91 98765 43210",
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const [name, setName]           = useState("")
  const [category, setCategory]   = useState(CATEGORIES[0])
  const [message, setMessage]     = useState("")

  const load = () => {
    getTemplates().then(data => { setTemplates(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setName(""); setCategory(CATEGORIES[0]); setMessage(""); setEditId(null) }

  const handleSave = async () => {
    if (!name.trim() || !message.trim()) return
    setSaving(true)
    if (editId) {
      await updateTemplate(editId, { name, category, message })
    } else {
      await insertTemplate({ name, category, message })
    }
    await load()
    setSaving(false)
    setShowForm(false)
    resetForm()
  }

  const handleEdit = (t: Template) => {
    setEditId(t.id); setName(t.name); setCategory(t.category); setMessage(t.message)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return
    await deleteTemplate(id)
    load()
  }

  const handleDuplicate = async (t: Template) => {
    await insertTemplate({ name: t.name + " (copy)", category: t.category, message: t.message })
    load()
  }

  const insertVar = (v: string) => setMessage(m => m + v)

  const preview = fillTemplate(message, PREVIEW_VARS)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "#888880" }}>{templates.length} templates</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
          style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="glass-card rounded-2xl p-5 space-y-4"
          style={{ borderColor: "rgba(201,168,76,0.2)" }}
        >
          <h3 className="font-semibold" style={{ color: "#f5f0e8" }}>
            {editId ? "Edit Template" : "New Template"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Left: Form */}
            <div className="space-y-3">
              <input
                className="input-base"
                placeholder="Template name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <select
                className="input-base"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Variables */}
              <div>
                <p className="mb-2 text-xs" style={{ color: "#888880" }}>Insert variable:</p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES.map(v => (
                    <button
                      key={v}
                      onClick={() => insertVar(v)}
                      className="rounded-lg px-2 py-1 text-xs font-mono"
                      style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="input-base resize-none"
                rows={5}
                placeholder="Write your message here…"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <p className="text-xs text-right" style={{ color: "#888880" }}>{message.length} chars</p>
            </div>

            {/* Right: Preview */}
            <div>
              <p className="mb-2 text-xs font-medium" style={{ color: "#888880" }}>Live Preview</p>
              <div
                className="rounded-2xl p-4 min-h-32"
                style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.1)" }}
              >
                {preview ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#f5f0e8" }}>{preview}</p>
                ) : (
                  <p className="text-sm" style={{ color: "#888880" }}>Preview will appear here…</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-gold flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editId ? "Update" : "Save Template")}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm() }}
              className="rounded-xl px-4 py-3 text-sm"
              style={{ color: "#888880", border: "1px solid rgba(201,168,76,0.1)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#c9a84c" }} />
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div
              key={t.id}
              className="glass-card rounded-xl p-4"
              style={{ borderColor: "rgba(201,168,76,0.15)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{ color: "#f5f0e8" }}>{t.name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}
                    >
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: "#888880" }}>{t.message}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#888880" }}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#888880" }}>
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: "#e05555" }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
