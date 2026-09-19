"use client"

import React, { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, Save, X } from "lucide-react"
import { getMenuItems, insertMenuItem, updateMenuItem, deleteMenuItem, type MenuItem } from "@/lib/supabase"

const CATS = ["Coffee","Food","Desserts","Drinks","Other"]

type FormData = Omit<MenuItem, "id" | "cafe_id" | "created_at" | "updated_at">
const empty = (): FormData => ({
  name: "", description: "", price: 0, category: "Coffee",
  image_url: "", is_available: true, is_must_try: false,
  veg_nonveg: "veg", sort_order: 0,
})

export function MenuManager() {
  const [items, setItems]       = useState<MenuItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState<FormData>(empty())
  const [editId, setEditId]     = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [catFilter, setCatFilter] = useState("All")
  const [preview, setPreview]   = useState(false)

  const load = () => getMenuItems().then(d => { setItems(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const openEdit = (item: MenuItem) => {
    setForm({ name: item.name, description: item.description, price: item.price,
      category: item.category, image_url: item.image_url,
      is_available: item.is_available, is_must_try: item.is_must_try,
      veg_nonveg: item.veg_nonveg, sort_order: item.sort_order })
    setEditId(item.id); setShowForm(true); setPreview(false)
  }

  const openAdd = () => { setForm(empty()); setEditId(null); setShowForm(true); setPreview(false) }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) await updateMenuItem(editId, form)
    else await insertMenuItem(form)
    await load(); setSaving(false); setShowForm(false); setForm(empty()); setEditId(null)
  }

  const del = async (id: string) => {
    if (!confirm("Delete this item?")) return
    await deleteMenuItem(id); load()
  }

  const toggle = async (item: MenuItem) => {
    await updateMenuItem(item.id, { is_available: !item.is_available }); load()
  }

  const cats    = ["All", ...CATS]
  const filtered = items.filter(i => catFilter === "All" || i.category === catFilter)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 24, fontWeight: 700 }}>Menu Manager</h1>
          <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>{items.length} items</p>
        </div>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 10, cursor: "pointer",
          background: "rgba(201,168,76,0.12)", color: "#c9a84c",
          border: "1px solid rgba(201,168,76,0.3)", fontSize: 13, fontWeight: 700,
          transition: "all 0.15s",
        } as React.CSSProperties}>
          <Plus style={{ width: 16, height: 16 }} /> Add Item
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            flexShrink: 0, padding: "7px 14px", borderRadius: 99, cursor: "pointer",
            background: catFilter === c ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
            color: catFilter === c ? "#c9a84c" : "#888",
            border: `1px solid ${catFilter === c ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`,
            fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
          } as React.CSSProperties}>{c}</button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16 }} className="menu-grid">
        {/* Item list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
              <Loader2 style={{ width: 28, height: 28, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
              <p style={{ color: "#888" }}>No items</p>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                opacity: item.is_available ? 1 : 0.55,
                transition: "opacity 0.2s",
              }}>
                {/* Image */}
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                    🍴
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                      border: `1.5px solid ${item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555" }} />
                    </div>
                    <span style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                    {item.is_must_try && <span className="badge-must-try">★</span>}
                    {!item.is_available && <span style={{ color: "#e05555", fontSize: 10, fontWeight: 700 }}>Unavailable</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 3, alignItems: "center" }}>
                    <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 15 }}>₹{Number(item.price).toFixed(0)}</span>
                    <span style={{ color: "#555", fontSize: 11 }}>{item.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <ActionBtn onClick={() => toggle(item)} color={item.is_available ? "#4caf7d" : "#e05555"} title={item.is_available ? "Hide" : "Show"}>
                    {item.is_available ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                  </ActionBtn>
                  <ActionBtn onClick={() => openEdit(item)} color="#888" title="Edit">
                    <Edit2 style={{ width: 14, height: 14 }} />
                  </ActionBtn>
                  <ActionBtn onClick={() => del(item.id)} color="#e05555" title="Delete">
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </ActionBtn>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 18, padding: 20,
            display: "flex", flexDirection: "column", gap: 14,
            height: "fit-content",
          }}>
            {/* Form header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 16 }}>
                {editId ? "Edit Item" : "Add Item"}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPreview(p => !p)} style={{
                  padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: "rgba(201,168,76,0.1)", color: "#c9a84c", fontSize: 12, fontWeight: 600,
                }}>
                  {preview ? "Edit" : "Preview"}
                </button>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>

            {preview ? (
              /* Preview */
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 14, overflow: "hidden",
              }}>
                {form.image_url && (
                  <img src={form.image_url} alt={form.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, border: `1.5px solid ${form.veg_nonveg === "veg" ? "#4caf7d" : "#e05555"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: form.veg_nonveg === "veg" ? "#4caf7d" : "#e05555" }} />
                        </div>
                        <span style={{ color: "#f5f0e8", fontWeight: 700 }}>{form.name || "Item Name"}</span>
                        {form.is_must_try && <span className="badge-must-try">Must Try</span>}
                      </div>
                      <p style={{ color: "#888", fontSize: 13 }}>{form.description || "Description"}</p>
                    </div>
                    <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 18 }}>₹{Number(form.price).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Form fields */
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input-base" placeholder="Item name *" value={form.name} onChange={e => set("name", e.target.value)} />
                <textarea className="input-base" rows={2} placeholder="Description (optional)" value={form.description} onChange={e => set("description", e.target.value)} style={{ resize: "none" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 5, fontWeight: 600 }}>Price (₹)</label>
                    <input className="input-base" type="number" min={0} value={form.price}
                      onChange={e => set("price", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 5, fontWeight: 600 }}>Category</label>
                    <select className="input-base" value={form.category} onChange={e => set("category", e.target.value)}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <input className="input-base" placeholder="Image URL (optional)" value={form.image_url}
                  onChange={e => set("image_url", e.target.value)} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 5, fontWeight: 600 }}>Type</label>
                    <select className="input-base" value={form.veg_nonveg}
                      onChange={e => set("veg_nonveg", e.target.value as "veg" | "nonveg")}>
                      <option value="veg">🟢 Veg</option>
                      <option value="nonveg">🔴 Non-veg</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 5, fontWeight: 600 }}>Sort Order</label>
                    <input className="input-base" type="number" min={0} value={form.sort_order}
                      onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { key: "is_must_try" as const, label: "⭐ Must Try" },
                    { key: "is_available" as const, label: "✅ Available" },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input type="checkbox" checked={form[key] as boolean} onChange={e => set(key, e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: "#c9a84c", cursor: "pointer" }} />
                      <span style={{ color: "#f5f0e8", fontSize: 13, fontWeight: 500 }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button className="btn-gold" onClick={save} disabled={saving} style={{ height: 48, borderRadius: 12 }}>
              {saving
                ? <Loader2 style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite" }} />
                : <><Save style={{ width: 16, height: 16 }} /> {editId ? "Update Item" : "Save Item"}</>
              }
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .menu-grid { grid-template-columns: 1fr 380px !important; align-items: start; }
        }
      `}</style>
    </div>
  )
}

function ActionBtn({ onClick, color, title, children }: { onClick: () => void; color: string; title?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
      background: "rgba(255,255,255,0.04)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color, transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}22`)}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
    >{children}</button>
  )
}
