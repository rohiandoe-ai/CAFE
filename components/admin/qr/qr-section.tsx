"use client"

import React, { useRef, useState, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Save, Check, Loader2, RefreshCw } from "lucide-react"
import { getBusiness, updateBusiness } from "@/lib/supabase"

// ── Color presets ─────────────────────────────────────────────────────────────
const PRESETS = [
  { label: "Cafe",   fg: "#6b2d2d", bg: "#f5e6c8" },  // matches the image
  { label: "Gold",   fg: "#c9a84c", bg: "#0a0a0a" },
  { label: "White",  fg: "#ffffff", bg: "#1a1a1a" },
  { label: "Black",  fg: "#1a1a1a", bg: "#ffffff" },
  { label: "Green",  fg: "#2d6b3a", bg: "#e8f5e9" },
  { label: "Navy",   fg: "#1a2b5f", bg: "#eef2ff" },
]

const SIZES = [
  { label: "S", value: 160 },
  { label: "M", value: 220 },
  { label: "L", value: 300 },
]

type TemplateType = "cafe" | "minimal"

export function QRSection() {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [url,      setUrl]      = useState("")
  const [name,     setName]     = useState("House of Paloma")
  const [fg,       setFg]       = useState("#6b2d2d")
  const [bg,       setBg]       = useState("#f5e6c8")
  const [qrSize,   setQrSize]   = useState(220)
  const [template, setTemplate] = useState<TemplateType>("cafe")
  const [saved,    setSaved]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.origin)
    getBusiness()
      .then(b => { if (b) setName(b.name) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    await updateBusiness({ name })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  // ── Download: draws full Cafe template on a real Canvas ───────────────────
  const download = () => {
    const qrEl = canvasRef.current?.querySelector("canvas")
    if (!qrEl) return

    if (template === "cafe") {
      downloadCafeTemplate(qrEl, name, fg, bg)
    } else {
      downloadMinimal(qrEl, name, fg, bg)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>
          QR Generator
        </h1>
        <p style={{ color: "#888880", fontSize: 14, marginTop: 4 }}>
          Generate a branded QR poster — customers scan to leave a review
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2 style={{ width: 32, height: 32, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="qr-grid" style={{ display: "grid", gap: 24 }}>

          {/* ── LEFT: Controls ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Template picker */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20 }}>
              <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Template
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { id: "cafe",    label: "☕ Cafe Style",  desc: "Like the image" },
                  { id: "minimal", label: "⬛ Minimal",     desc: "Clean & simple"  },
                ] as { id: TemplateType; label: string; desc: string }[]).map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                    padding: "12px 10px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    background: template === t.id ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${template === t.id ? "#c9a84c" : "rgba(255,255,255,0.07)"}`,
                    transition: "all 0.15s",
                  }}>
                    <p style={{ color: template === t.id ? "#c9a84c" : "#d0c8c0", fontSize: 13, fontWeight: 700 }}>{t.label}</p>
                    <p style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Content</p>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888880", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Landing Page URL
                </label>
                <input className="input-base" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://your-site.vercel.app" style={{ fontSize: 13 }} />
                <p style={{ color: "#555", fontSize: 11, marginTop: 5 }}>📌 Scan → landing page → customer reviews</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888880", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Cafe / Bar Name
                </label>
                <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="House of Paloma" />
              </div>
              <button onClick={save} disabled={saving} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                background: saved ? "rgba(76,175,125,0.12)" : "rgba(201,168,76,0.08)",
                color: saved ? "#4caf7d" : "#c9a84c",
                border: `1px solid ${saved ? "rgba(76,175,125,0.3)" : "rgba(201,168,76,0.2)"}`,
                fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              } as React.CSSProperties}>
                {saving ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} /> Saving…</>
                  : saved ? <><Check style={{ width: 14, height: 14 }} /> Saved!</>
                  : <><Save style={{ width: 14, height: 14 }} /> Save name</>}
              </button>
            </div>

            {/* Colors */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20 }}>
              <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Colors</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => { setFg(p.fg); setBg(p.bg) }} title={p.label} style={{
                    width: 38, height: 38, borderRadius: 10, cursor: "pointer",
                    background: p.bg, border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    outline: fg === p.fg && bg === p.bg ? `2.5px solid #c9a84c` : "2.5px solid transparent",
                    outlineOffset: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: p.fg }} />
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "QR Color", val: fg, set: setFg },
                  { label: "Background", val: bg, set: setBg },
                ].map(c => (
                  <div key={c.label}>
                    <label style={{ display: "block", fontSize: 11, color: "#888880", marginBottom: 5, fontWeight: 600 }}>{c.label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, padding: "6px 10px" }}>
                      <input type="color" value={c.val} onChange={e => c.set(e.target.value)}
                        style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer" }} />
                      <span style={{ color: "#f5f0e8", fontSize: 12, fontFamily: "monospace" }}>{c.val.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20 }}>
              <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>QR Size</p>
              <div style={{ display: "flex", gap: 8 }}>
                {SIZES.map(s => (
                  <button key={s.label} onClick={() => setQrSize(s.value)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer",
                    background: qrSize === s.value ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                    color: qrSize === s.value ? "#c9a84c" : "#888",
                    border: `1.5px solid ${qrSize === s.value ? "#c9a84c" : "rgba(255,255,255,0.07)"}`,
                    fontSize: 15, fontWeight: 700, transition: "all 0.15s",
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview + Download ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <p style={{ color: "#888880", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Preview</p>

            {/* Cafe template preview */}
            {template === "cafe" ? (
              <div style={{
                width: 280, background: bg,
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "24px 20px 28px", gap: 0,
                position: "relative",
              }}>
                {/* Texture overlay */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 16,
                  background: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)",
                  pointerEvents: "none",
                }} />

                {/* ADD LOGO text */}
                <p style={{ color: fg + "88", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                  ADD LOGO
                </p>

                {/* Menu heading */}
                <p className="font-serif" style={{
                  color: fg, fontSize: 42, fontWeight: 800,
                  fontStyle: "italic", lineHeight: 1, marginBottom: 18,
                  textShadow: `1px 1px 0 ${fg}22`,
                }}>
                  {name.split(" ")[0]}
                </p>

                {/* QR */}
                <div
                  ref={canvasRef}
                  style={{
                    background: "#ffffff",
                    padding: 10, borderRadius: 8,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                    marginBottom: 18,
                  }}
                >
                  <QRCodeCanvas
                    value={url || " "}
                    size={qrSize}
                    bgColor="#ffffff"
                    fgColor={fg}
                    level="H"
                    marginSize={1}
                  />
                </div>

                {/* Scan Now */}
                <p style={{ color: fg, fontSize: 16, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>
                  Scan Now
                </p>

                {/* Coffee cup decoration */}
                <p style={{ fontSize: 28, marginTop: 4 }}>☕</p>
              </div>
            ) : (
              /* Minimal preview */
              <div style={{
                background: bg, padding: 24, borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                border: `2px solid ${fg}22`,
              }}>
                <div ref={canvasRef}>
                  <QRCodeCanvas
                    value={url || " "}
                    size={qrSize}
                    bgColor={bg}
                    fgColor={fg}
                    level="H"
                    marginSize={1}
                  />
                </div>
                <p style={{ color: fg, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, textAlign: "center" }}>
                  {name}
                </p>
              </div>
            )}

            {/* Download */}
            <button className="btn-gold" onClick={download} disabled={!url}
              style={{ width: "100%", maxWidth: 300, height: 52, fontSize: 15, borderRadius: 14, boxShadow: "0 0 24px rgba(201,168,76,0.2)" }}>
              <Download style={{ width: 18, height: 18 }} />
              Download PNG
            </button>

            <button onClick={() => { setFg("#6b2d2d"); setBg("#f5e6c8"); setQrSize(220); setTemplate("cafe") }} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: 13,
            }}>
              <RefreshCw style={{ width: 13, height: 13 }} /> Reset
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) { .qr-grid { grid-template-columns: 1fr 320px !important; align-items: start; } }
      `}</style>
    </div>
  )
}

// ── Canvas download: Cafe Menu template ──────────────────────────────────────
function downloadCafeTemplate(qrEl: HTMLCanvasElement, name: string, fg: string, bg: string) {
  const W = 500, H = 800
  const out = document.createElement("canvas")
  out.width = W; out.height = H
  const ctx = out.getContext("2d")
  if (!ctx) return

  // Background fill
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle texture (diagonal lines)
  ctx.strokeStyle = "rgba(0,0,0,0.04)"
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 8) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }

  // Outer border frame
  ctx.strokeStyle = fg + "55"
  ctx.lineWidth = 3
  const r = 24
  roundRect(ctx, 16, 16, W - 32, H - 32, r)
  ctx.stroke()

  // Inner decorative border
  ctx.strokeStyle = fg + "30"
  ctx.lineWidth = 1.5
  roundRect(ctx, 24, 24, W - 48, H - 48, r - 4)
  ctx.stroke()

  // "ADD LOGO" text
  ctx.fillStyle = fg + "66"
  ctx.font = "bold 16px Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.letterSpacing = "4px"
  ctx.fillText("ADD LOGO", W / 2, 80)
  ctx.letterSpacing = "0px"

  // Decorative line under ADD LOGO
  ctx.strokeStyle = fg + "44"
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W / 2 - 60, 90); ctx.lineTo(W / 2 + 60, 90); ctx.stroke()

  // "Menu" big heading (italic serif)
  ctx.fillStyle = fg
  ctx.font = "italic bold 86px Georgia, serif"
  ctx.textAlign = "center"
  ctx.fillText("Menu", W / 2, 185)

  // Underline for Menu
  ctx.strokeStyle = fg + "55"
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(W / 2 - 100, 196); ctx.lineTo(W / 2 + 100, 196); ctx.stroke()

  // QR Code block (white bg, centered)
  const qrSize = 280
  const qx = (W - qrSize) / 2
  const qy = 230

  // White QR background with shadow
  ctx.shadowColor = "rgba(0,0,0,0.2)"
  ctx.shadowBlur  = 16
  ctx.fillStyle = "#ffffff"
  roundRect(ctx, qx - 14, qy - 14, qrSize + 28, qrSize + 28, 12)
  ctx.fill()
  ctx.shadowBlur = 0

  // Draw actual QR
  ctx.drawImage(qrEl, qx, qy, qrSize, qrSize)

  // "Scan Now" text
  ctx.fillStyle = fg
  ctx.font = "600 28px Georgia, serif"
  ctx.textAlign = "center"
  ctx.letterSpacing = "2px"
  ctx.fillText("Scan Now", W / 2, qy + qrSize + 60)
  ctx.letterSpacing = "0px"

  // Decorative dots row
  ctx.fillStyle = fg + "66"
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.arc(W / 2 + i * 16, qy + qrSize + 82, i === 0 ? 4 : 3, 0, Math.PI * 2); ctx.fill()
  }

  // Coffee cup emoji area (drawn as text)
  ctx.font = "48px Arial"
  ctx.textAlign = "center"
  ctx.fillText("☕", W / 2 + 120, H - 80)

  // Coffee beans dots (decorative)
  ctx.fillStyle = fg + "55"
  ctx.font = "22px Arial"
  ctx.fillText("✦", 50,  H - 120)
  ctx.fillText("✦", 430, H - 160)
  ctx.fillText("✦", 60,  H - 200)

  // Cafe name at bottom
  ctx.fillStyle = fg + "99"
  ctx.font = "500 18px Georgia, serif"
  ctx.textAlign = "center"
  ctx.fillText(name, W / 2, H - 40)

  const a = document.createElement("a")
  a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-menu-qr.png`
  a.href = out.toDataURL("image/png")
  a.click()
}

// ── Canvas download: Minimal template ────────────────────────────────────────
function downloadMinimal(qrEl: HTMLCanvasElement, name: string, fg: string, bg: string) {
  const pad = 52, labelH = 64
  const qs  = qrEl.width
  const W   = qs + pad * 2, H = qs + pad * 2 + labelH
  const out = document.createElement("canvas")
  out.width = W; out.height = H
  const ctx = out.getContext("2d")
  if (!ctx) return

  ctx.fillStyle = bg
  roundRect(ctx, 0, 0, W, H, 28); ctx.fill()

  ctx.strokeStyle = fg + "44"; ctx.lineWidth = 2
  roundRect(ctx, 10, 10, W - 20, H - 20, 22); ctx.stroke()

  ctx.drawImage(qrEl, pad, pad, qs, qs)

  ctx.fillStyle = fg
  ctx.font = "700 24px Georgia, serif"
  ctx.textAlign = "center"
  ctx.fillText(name, W / 2, qs + pad + 42)

  const a = document.createElement("a")
  a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-qr.png`
  a.href = out.toDataURL("image/png")
  a.click()
}

// ── Helper: rounded rect path ─────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
}
