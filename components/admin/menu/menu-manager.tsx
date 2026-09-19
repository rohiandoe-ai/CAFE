"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, Save, X } from "lucide-react"
import { getMenuItems, insertMenuItem, updateMenuItem, deleteMenuItem, type MenuItem } from "@/lib/supabase"

const CATEGORIES = ["Coffee","Food","Desserts","Drinks","Other"]

const emptyForm = (): Omit<MenuItem, "id" | "cafe_id" | "created_at" | "updated_at"> => ({
  name: "", description: "", price: 0, category: "Coffee",
  image_url: "", is_available: true, is_must_try: false,
  veg_nonveg: "veg", sort_order: 0,
})

export function MenuManager() {
  const [items, setItems]       = useState<MenuItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState(emptyForm())
  const [editId, setEditId]     = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [catFilter, setCatFilter] = useState("All")
  const [preview, setPreview]   = useState(false)

  const load = () => {
    getMenuItems().then(data => { setItems(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  type FormType = Omit<MenuItem, "id" | "cafe_id" | "created_at" | "updated_at">

  const set = <K extends keyof FormType>(k: K, v: FormType[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name, description: item.description, price: item.price,
      category: item.category, image_url: item.image_url,
      is_available: item.is_available, is_must_try: item.is_must_try,
      veg_nonveg: item.veg_nonveg, sort_order: item.sort_order,
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await updateMenuItem(editId, form)
    } else {
      await insertMenuItem(form)
    }
    await load()
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm())
    setEditId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return
    await deleteMenuItem(id)
    load()
  }

  const toggleAvailability = async (item: MenuItem) => {
    await updateMenuItem(item.id, { is_available: !item.is_available })
    load()
  }

  const categories = ["All", ...CATEGORIES]
  const filtered = items.filter(i => catFilter === "All" || i.category === catFilter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>Menu Manager</h1>
          <p className="mt-0.5 text-sm" style={{ color: "#888880" }}>{items.length} items</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm()); setEditId(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
          style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm transition-all"
            style={{
              background: catFilter === c ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              color: catFilter === c ? "#c9a84c" : "#888880",
              border: `1px solid ${catFilter === c ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)"}`,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Item List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#c9a84c" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <span className="text-3xl">🍽️</span>
              <p style={{ color: "#888880" }}>No items</p>
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className="glass-card rounded-xl p-4 transition-all"
                style={{
                  borderColor: "rgba(201,168,76,0.15)",
                  opacity: item.is_available ? 1 : 0.6,
                }}
              >
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-sm shrink-0"
                        style={{ background: item.veg_nonveg === "veg" ? "#4caf7d" : "#e05555" }}
                      />
                      <p className="font-semibold text-sm truncate" style={{ color: "#f5f0e8" }}>{item.name}</p>
                      {item.is_must_try && (
                        <span className="badge-must-try shrink-0">★</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>₹{Number(item.price).toFixed(0)}</span>
                      <span className="text-xs" style={{ color: "#888880" }}>{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className="p-1.5 rounded-lg"
                      style={{ color: item.is_available ? "#4caf7d" : "#e05555" }}
                      title={item.is_available ? "Mark unavailable" : "Mark available"}
                    >
                      {item.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg" style={{ color: "#888880" }}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg" style={{ color: "#e05555" }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Form + Preview */}
        {showForm && (
          <div className="glass-card rounded-2xl p-5 space-y-4 h-fit" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "#f5f0e8" }}>
                {editId ? "Edit Item" : "Add Item"}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(p => !p)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}
                >
                  {preview ? "Edit" : "Preview"}
                </button>
                <button onClick={() => setShowForm(false)} style={{ color: "#888880" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {preview ? (
              /* Live Preview */
              <div className="glass-card rounded-2xl overflow-hidden" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
                {form.image_url && (
                  <div className="h-40 overflow-hidden">
                    <img src={form.image_url} alt={form.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: form.veg_nonveg === "veg" ? "#4caf7d" : "#e05555" }}
                        />
                        <p className="font-semibold" style={{ color: "#f5f0e8" }}>{form.name || "Item Name"}</p>
                        {form.is_must_try && <span className="badge-must-try">Must Try</span>}
                      </div>
                      <p className="mt-1 text-sm" style={{ color: "#888880" }}>{form.description || "Description"}</p>
                    </div>
                    <p className="font-bold text-lg" style={{ color: "#c9a84c" }}>₹{Number(form.price).toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <div className="space-y-3">
                <input className="input-base" placeholder="Item name *" value={form.name} onChange={e => set("name", e.target.value)} />
                <textarea className="input-base resize-none" rows={2} placeholder="Description" value={form.description} onChange={e => set("description", e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: "#888880" }}>Price (₹)</label>
                    <input className="input-base" type="number" min={0} value={form.price} onChange={e => set("price", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: "#888880" }}>Category</label>
                    <select className="input-base" value={form.category} onChange={e => set("category", e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <input className="input-base" placeholder="Image URL (optional)" value={form.image_url} onChange={e => set("image_url", e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: "#888880" }}>Type</label>
                    <select className="input-base" value={form.veg_nonveg} onChange={e => set("veg_nonveg", e.target.value as "veg" | "nonveg")}>
                      <option value="veg">🟢 Veg</option>
                      <option value="nonveg">🔴 Non-veg</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: "#888880" }}>Sort Order</label>
                    <input className="input-base" type="number" min={0} value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_must_try} onChange={e => set("is_must_try", e.target.checked)} className="accent-yellow-500" />
                    <span className="text-sm" style={{ color: "#f5f0e8" }}>Must Try</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_available} onChange={e => set("is_available", e.target.checked)} className="accent-green-500" />
                    <span className="text-sm" style={{ color: "#f5f0e8" }}>Available</span>
                  </label>
                </div>
              </div>
            )}

            <button className="btn-gold" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {editId ? "Update" : "Save Item"}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
