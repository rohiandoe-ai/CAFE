"use client"

import React, { useRef, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Save, Check, Loader2, RefreshCw } from "lucide-react"
import { getBusiness, updateBusiness } from "@/lib/supabase"
import { useEffect } from "react"

const PRESETS = [
  { label: "Gold",    fg: "#c9a84c", bg: "#0a0a0a" },
  { label: "White",   fg: "#ffffff", bg: "#0a0a0a" },
  { label: "Black",   fg: "#0a0a0a", bg: "#ffffff" },
  { label: "Green",   fg: "#4caf7d", bg: "#0a0a0a" },
  { label: "Purple",  fg: "#9b59b6", bg: "#0a0a0a" },
  { label: "Red",     fg: "#e05555", bg: "#0a0a0a" },
]

const SIZES = [
  { label: "Small",  value: 180 },
  { label: "Medium", value: 250 },
  { label: "Large",  value: 320 },
]

export function QRSection() {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [url,     setUrl]     = useState("https://search.google.com/local/writereview?placeid=ChIJu6ZBnxTJ5zsRvHMC18xfZnQ")
  const [name,    setName]    = useState("House of Paloma")
  const [fg,      setFg]      = useState("#c9a84c")
  const [bg,      setBg]      = useState("#0a0a0a")
  const [size,    setSize]    = useState(250)
  const [style,   setStyle]   = useState<"rounded" | "square">("rounded")
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)

  // Load from Supabase on mount
  useEffect(() => {
    getBusiness().then(b => {
      if (b) { setUrl(b.google_review_url); setName(b.name) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    await updateBusiness({ name, google_review_url: url })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const download = () => {
    const source = canvasRef.current?.querySelector("canvas")
    if (!source) return

    const pad    = 48
    const labelH = 56
    const qSize  = source.width
    const W      = qSize + pad * 2
    const H      = qSize + pad * 2 + labelH

    const out = document.createElement("canvas")
    out.width  = W
    out.height = H
    const ctx  = out.getContext("2d")
    if (!ctx) return

    // Background
    if (style === "rounded") {
      const r = 32
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.moveTo(r, 0); ctx.arcTo(W, 0, W, H, r); ctx.arcTo(W, H, 0, H, r)
      ctx.arcTo(0, H, 0, 0, r); ctx.arcTo(0, 0, W, 0, r); ctx.closePath(); ctx.fill()
    } else {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    }

    // Border
    ctx.strokeStyle = fg + "55"; ctx.lineWidth = 3
    if (style === "rounded") {
      const r = 28; ctx.beginPath()
      ctx.moveTo(r + 12, 12); ctx.arcTo(W - 12, 12, W - 12, H - 12, r)
      ctx.arcTo(W - 12, H - 12, 12, H - 12, r); ctx.arcTo(12, H - 12, 12, 12, r)
      ctx.arcTo(12, 12, W - 12, 12, r); ctx.closePath(); ctx.stroke()
    } else {
      ctx.strokeRect(12, 12, W - 24, H - 24)
    }

    // QR
    ctx.drawImage(source, pad, pad, qSize, qSize)

    // Label
    ctx.fillStyle = fg
    ctx.font = "600 22px Georgia, serif"
    ctx.textAlign = "center"
    ctx.fillText(name, W / 2, qSize + pad + 36)

    const a    = document.createElement("a")
    a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-qr.png`
    a.href     = out.toDataURL("image/png")
    a.click()
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>QR Generator</h1>
        <p style={{ color: "#888880", fontSize: 14, marginTop: 4 }}>
          Create a branded QR code for your review page
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2 style={{ width: 32, height: 32, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr" }} className="qr-grid">
          {/* ── Left: Controls ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* URL + Name */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 18, padding: 20,
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <p style={{ color: "#c9a84c", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Content
              </p>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888880", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Google Review URL
                </label>
                <input
                  className="input-base"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  style={{ fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888880", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Bar / Cafe Name
                </label>
                <input
                  className="input-base"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="House of Paloma"
                />
              </div>

              {/* Save to DB */}
              <button
                onClick={save}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                  background: saved ? "rgba(76,175,125,0.12)" : "rgba(201,168,76,0.1)",
                  color: saved ? "#4caf7d" : "#c9a84c",
                  border: `1px solid ${saved ? "rgba(76,175,125,0.3)" : "rgba(201,168,76,0.2)"}`,
                  fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                } as React.CSSProperties}
              >
                {saving
                  ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} /> Saving…</>
                  : saved
                    ? <><Check style={{ width: 14, height: 14 }} /> Saved to database!</>
                    : <><Save style={{ width: 14, height: 14 }} /> Save to database</>
                }
              </button>
            </div>

            {/* Color Presets */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 18, padding: 20,
            }}>
              <p style={{ color: "#c9a84c", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Color Theme
              </p>

              {/* Presets */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setFg(p.fg); setBg(p.bg) }}
                    title={p.label}
                    style={{
                      width: 36, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
                      background: p.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      outline: (fg === p.fg && bg === p.bg) ? `2px solid ${p.fg}` : "2px solid transparent",
                      outlineOffset: 2, transition: "outline 0.15s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: p.fg }} />
                  </button>
                ))}
              </div>

              {/* Custom colors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#888880", marginBottom: 5, fontWeight: 600 }}>QR Color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, padding: "6px 10px" }}>
                    <input type="color" value={fg} onChange={e => setFg(e.target.value)}
                      style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }} />
                    <span style={{ color: "#f5f0e8", fontSize: 12, fontFamily: "monospace" }}>{fg.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#888880", marginBottom: 5, fontWeight: 600 }}>Background</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, padding: "6px 10px" }}>
                    <input type="color" value={bg} onChange={e => setBg(e.target.value)}
                      style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }} />
                    <span style={{ color: "#f5f0e8", fontSize: 12, fontFamily: "monospace" }}>{bg.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Size + Style */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 14,
            }}>
              <p style={{ color: "#c9a84c", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Style & Size
              </p>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#888880", marginBottom: 8, fontWeight: 600 }}>Frame Style</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["rounded","square"] as const).map(s => (
                    <button key={s} onClick={() => setStyle(s)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 9, cursor: "pointer",
                      background: style === s ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                      color: style === s ? "#c9a84c" : "#888",
                      border: `1px solid ${style === s ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.07)"}`,
                      fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.15s",
                    } as React.CSSProperties}>
                      {s === "rounded" ? "🔵 Rounded" : "⬜ Square"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#888880", marginBottom: 8, fontWeight: 600 }}>QR Size</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {SIZES.map(s => (
                    <button key={s.label} onClick={() => setSize(s.value)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 9, cursor: "pointer",
                      background: size === s.value ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                      color: size === s.value ? "#c9a84c" : "#888",
                      border: `1px solid ${size === s.value ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.07)"}`,
                      fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    } as React.CSSProperties}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Preview + Download ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            {/* Preview card */}
            <div style={{
              width: "100%", maxWidth: 360,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 18, padding: 24,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
            }}>
              <p style={{ color: "#888880", fontSize: 12, fontWeight: 600, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Live Preview
              </p>

              {/* QR */}
              <div
                ref={canvasRef}
                style={{
                  background: bg,
                  padding: 20,
                  borderRadius: style === "rounded" ? 16 : 4,
                  border: `2px solid ${fg}22`,
                  boxShadow: `0 0 32px ${fg}22`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                  transition: "all 0.3s",
                }}
              >
                <QRCodeCanvas
                  value={url || " "}
                  size={size}
                  bgColor={bg}
                  fgColor={fg}
                  level="H"
                  marginSize={1}
                />
                <p style={{
                  color: fg, fontFamily: "Georgia, serif",
                  fontSize: Math.max(14, size / 14),
                  fontWeight: 700, textAlign: "center",
                  maxWidth: size, wordBreak: "break-word",
                }}>
                  {name}
                </p>
              </div>
            </div>

            {/* Download button */}
            <button
              className="btn-gold"
              onClick={download}
              disabled={!url}
              style={{
                width: "100%", maxWidth: 360, height: 52,
                fontSize: 15, borderRadius: 14,
                boxShadow: "0 0 24px rgba(201,168,76,0.2)",
              }}
            >
              <Download style={{ width: 18, height: 18 }} />
              Download QR as PNG
            </button>

            {/* Reset */}
            <button
              onClick={() => { setFg("#c9a84c"); setBg("#0a0a0a"); setSize(250); setStyle("rounded") }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer",
                color: "#888880", fontSize: 13,
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
              Reset to defaults
            </button>

            {/* Tips */}
            <div style={{
              width: "100%", maxWidth: 360,
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: 14, padding: "14px 16px",
            }}>
              <p style={{ color: "#c9a84c", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>💡 Tips</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4 }}>
                {[
                  "Print and place on every table",
                  "Frame it at the bar counter",
                  "Add to bill folders & menus",
                  "High contrast = better scanning",
                ].map(tip => (
                  <li key={tip} style={{ color: "#888880", fontSize: 12, display: "flex", gap: 6 }}>
                    <span style={{ color: "#c9a84c", flexShrink: 0 }}>·</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) {
          .qr-grid { grid-template-columns: 1fr 1fr !important; align-items: start; }
        }
      `}</style>
    </div>
  )
}
