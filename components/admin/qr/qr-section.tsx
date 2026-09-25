"use client"

import React, { useRef, useState, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Save, Check, Loader2, RefreshCw } from "lucide-react"
import { getBusiness, updateBusiness } from "@/lib/supabase"

const BG_IMAGE_URL = "/cafe-bg.jpg"

const PRESETS = [
  { label: "Cafe", fg: "#6b2d2d", bg: "#f5e6c8" },
  { label: "Gold", fg: "#c9a84c", bg: "#0a0a0a" },
  { label: "White", fg: "#ffffff", bg: "#1a1a1a" },
  { label: "Black", fg: "#1a1a1a", bg: "#ffffff" },
  { label: "Green", fg: "#2d6b3a", bg: "#e8f5e9" },
  { label: "Navy", fg: "#1a2b5f", bg: "#eef2ff" },
]

const SIZES = [
  { label: "S", value: 160 },
  { label: "M", value: 220 },
  { label: "L", value: 300 },
]

type TemplateType = "cafe" | "minimal"

export function QRSection() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const bgImgRef = useRef<HTMLImageElement | null>(null)
  const logoImgRef = useRef<HTMLImageElement | null>(null)

  const [url, setUrl] = useState("")
  const [name, setName] = useState("Havana Jaipur")
  const [fg, setFg] = useState("#6b2d2d")
  const [bg, setBg] = useState("#f5e6c8")
  const [qrSize, setQrSize] = useState(220)
  const [template, setTemplate] = useState<TemplateType>("cafe")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bgLoaded, setBgLoaded] = useState(false)

  // Pre-load the background image and logo once
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => { bgImgRef.current = img; setBgLoaded(true) }
    img.onerror = () => setBgLoaded(false)
    img.src = BG_IMAGE_URL

    const logo = new Image()
    logo.crossOrigin = "anonymous"
    logo.onload = () => { logoImgRef.current = logo }
    logo.src = "/havana-logo.png"
  }, [])

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

  const download = () => {
    const qrEl = canvasRef.current?.querySelector("canvas")
    if (!qrEl) return
    if (template === "cafe") {
      downloadCafeTemplate(previewRef.current, qrEl, name, fg, bgImgRef.current, logoImgRef.current)
    } else {
      downloadMinimal(previewRef.current, qrEl, name, fg, bg)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>QR Generator</h1>
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

            {/* Template */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20 }}>
              <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Template
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { id: "cafe", label: "Cafe Style", desc: "With texture bg" },
                  { id: "minimal", label: "⬛ Minimal", desc: "Clean & simple" },
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
                <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="Havana Jaipur" />
                <p style={{ color: "#555", fontSize: 11, marginTop: 5 }}>✏️ Name changes live in preview</p>
              </div>
              <button onClick={save} disabled={saving} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                background: saved ? "rgba(76,175,125,0.12)" : "rgba(201,168,76,0.08)",
                color: saved ? "#4caf7d" : "#c9a84c",
                border: `1px solid ${saved ? "rgba(76,175,125,0.3)" : "rgba(201,168,76,0.2)"}`,
                fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              } as React.CSSProperties}>
                {saving
                  ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} /> Saving…</>
                  : saved ? <><Check style={{ width: 14, height: 14 }} /> Saved!</>
                    : <><Save style={{ width: 14, height: 14 }} /> Save name</>}
              </button>
            </div>

            {/* Colors — only shown for minimal */}
            {template === "minimal" && (
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20 }}>
                <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Colors</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => { setFg(p.fg); setBg(p.bg) }} title={p.label} style={{
                      width: 38, height: 38, borderRadius: 10, cursor: "pointer",
                      background: p.bg, border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      outline: fg === p.fg && bg === p.bg ? "2.5px solid #c9a84c" : "2.5px solid transparent",
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
            )}

            {/* Cafe color: only QR color picker */}
            {template === "cafe" && (
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 18, padding: 20 }}>
                <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>QR Color</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {["#6b2d2d", "#1a1a1a", "#1a2b5f", "#2d6b3a", "#c9a84c", "#9b59b6"].map(c => (
                    <button key={c} onClick={() => setFg(c)} style={{
                      width: 34, height: 34, borderRadius: 8, cursor: "pointer",
                      background: c, border: "none",
                      outline: fg === c ? "2.5px solid #c9a84c" : "2.5px solid transparent",
                      outlineOffset: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, padding: "6px 10px", width: "fit-content" }}>
                  <input type="color" value={fg} onChange={e => setFg(e.target.value)}
                    style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer" }} />
                  <span style={{ color: "#f5f0e8", fontSize: 12, fontFamily: "monospace" }}>Custom: {fg.toUpperCase()}</span>
                </div>
              </div>
            )}

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
            <p style={{ color: "#888880", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Live Preview
            </p>

            {template === "cafe" ? (
              /* ── Cafe template preview ── */
              <div
                ref={previewRef}
                style={{
                  width: 280,
                  backgroundImage: bgLoaded ? `url(${BG_IMAGE_URL})` : "none",
                  backgroundColor: "#f5e6c8",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "28px 20px 32px", gap: 0,
                  position: "relative",
                }}
              >
                {/* Overlay to soften bg image */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(245,230,200,0.18)",
                  pointerEvents: "none",
                }} />

                {/* Outer border */}
                <div style={{
                  position: "absolute", inset: 10,
                  border: `1.5px solid ${fg}55`,
                  borderRadius: 10, pointerEvents: "none",
                }} />

                {/* Cafe name (replaces ADD LOGO) */}
                <p
                  data-ref="cafe-name"
                  className="font-serif"
                  style={{
                    position: "relative", zIndex: 1,
                    color: fg, fontSize: 15, fontWeight: 800,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    marginBottom: 6, textAlign: "center",
                  }}
                >
                  {name}
                </p>

                {/* "Menu" heading */}
                <p
                  data-ref="cafe-menu"
                  className="font-serif"
                  style={{
                    position: "relative", zIndex: 1,
                    color: fg, fontSize: 46, fontWeight: 800,
                    fontStyle: "italic", lineHeight: 1, marginBottom: 18,
                    textShadow: `1px 1px 0 ${fg}22`,
                  }}
                >
                  Menu
                </p>

                {/* QR on white bg */}
                <div
                  ref={canvasRef}
                  data-ref="cafe-qrbox"
                  style={{
                    position: "relative", zIndex: 1,
                    background: "#ffffff", padding: 10,
                    borderRadius: 8,
                    boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
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
                <p
                  data-ref="cafe-scannow"
                  style={{
                    position: "relative", zIndex: 1,
                    color: fg, fontSize: 17, fontWeight: 700,
                    letterSpacing: "0.08em", marginBottom: 12,
                  }}
                >
                  Scan Now
                </p>

                {/* Cafe logo */}
                <div
                  data-ref="cafe-logo"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: `1.5px solid ${fg}33`,
                    padding: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/havana-logo.png"
                    alt="Havana Cafe Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                </div>
              </div>
            ) : (
              /* ── Minimal preview ── */
              <div
                ref={previewRef}
                style={{
                  background: bg, padding: 24, borderRadius: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                  border: `2px solid ${fg}22`,
                }}
              >
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
            <button className="btn-gold" onClick={download} disabled={!url} style={{
              width: "100%", maxWidth: 300, height: 52,
              fontSize: 15, borderRadius: 14,
              boxShadow: "0 0 24px rgba(201,168,76,0.2)",
            }}>
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
        @media (min-width: 640px) {
          .qr-grid { grid-template-columns: 1fr 320px !important; align-items: start; }
        }
      `}</style>
    </div>
  )
}

// ── Download: Cafe template (Exact replica of Live Preview) ───────────────────
function downloadCafeTemplate(
  cardEl: HTMLDivElement | null,
  qrEl: HTMLCanvasElement,
  name: string,
  fg: string,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
) {
  const scale = 3
  const cardRect = cardEl ? cardEl.getBoundingClientRect() : null
  const W = cardRect ? Math.round(cardRect.width * scale) : 840
  const H = cardRect ? Math.round(cardRect.height * scale) : 1500

  const out = document.createElement("canvas")
  out.width = W
  out.height = H
  const ctx = out.getContext("2d")
  if (!ctx) return

  // 1. Clip entire canvas to rounded corners matching preview (borderRadius: 16)
  drawRoundRect(ctx, 0, 0, W, H, 16 * scale)
  ctx.clip()

  // 2. Base background color
  ctx.fillStyle = "#f5e6c8"
  ctx.fillRect(0, 0, W, H)

  // 3. Background image with CSS "cover" and "center" fitting
  const bgSource = bgImg && (bgImg.complete || bgImg.naturalWidth > 0) ? bgImg : null
  if (bgSource) {
    const imgW = bgSource.naturalWidth || bgSource.width
    const imgH = bgSource.naturalHeight || bgSource.height
    const imgRatio = imgW / imgH
    const canvasRatio = W / H
    let drawW = W, drawH = H, drawX = 0, drawY = 0

    if (imgRatio > canvasRatio) {
      drawH = H
      drawW = H * imgRatio
      drawX = (W - drawW) / 2
    } else {
      drawW = W
      drawH = W / imgRatio
      drawY = (H - drawH) / 2
    }
    ctx.drawImage(bgSource, drawX, drawY, drawW, drawH)
  }

  // 4. Softening overlay matching preview: rgba(245,230,200,0.18)
  ctx.fillStyle = "rgba(245,230,200,0.18)"
  ctx.fillRect(0, 0, W, H)

  // 5. Inset border matching preview: inset: 10, border: 1.5px solid ${fg}55, borderRadius: 10
  const inset = 10 * scale
  ctx.strokeStyle = fg + "55"
  ctx.lineWidth = 1.5 * scale
  drawRoundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, 10 * scale)
  ctx.stroke()

  // 6. Cafe name
  let nameY = 46 * scale
  const nameEl = cardEl?.querySelector("[data-ref='cafe-name']")
  if (nameEl && cardRect) {
    const rect = nameEl.getBoundingClientRect()
    nameY = (rect.top - cardRect.top + rect.height / 2) * scale
  }
  ctx.fillStyle = fg
  ctx.font = `800 ${15 * scale}px Georgia, "Playfair Display", "Times New Roman", serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = `${0.08 * 15 * scale}px`
  }
  ctx.fillText(name.toUpperCase(), W / 2, nameY)
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = "0px"
  }

  // 7. "Menu" heading matching preview (italic 46px, text-shadow)
  let menuY = 96 * scale
  const menuEl = cardEl?.querySelector("[data-ref='cafe-menu']")
  if (menuEl && cardRect) {
    const rect = menuEl.getBoundingClientRect()
    menuY = (rect.top - cardRect.top + rect.height / 2) * scale
  }
  ctx.save()
  ctx.fillStyle = fg
  ctx.font = `italic 800 ${46 * scale}px Georgia, "Playfair Display", "Times New Roman", serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.shadowColor = fg + "22"
  ctx.shadowOffsetX = 1 * scale
  ctx.shadowOffsetY = 1 * scale
  ctx.shadowBlur = 0
  ctx.fillText("Menu", W / 2, menuY)
  ctx.restore()

  // 8. QR Box & QR Code
  // Sized exactly to cover the placeholder QR code on background image
  let boxX = 20 * scale
  let boxY = 140 * scale
  let boxW = 240 * scale
  let boxH = 240 * scale
  const qrBoxEl = cardEl?.querySelector("[data-ref='cafe-qrbox']")
  if (qrBoxEl && cardRect) {
    const rect = qrBoxEl.getBoundingClientRect()
    boxX = (rect.left - cardRect.left) * scale
    boxY = (rect.top - cardRect.top) * scale
    boxW = rect.width * scale
    boxH = rect.height * scale
  }
  const pad = 10 * scale
  const boxR = 8 * scale

  // White box with shadow matching preview
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.25)"
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 2 * scale
  ctx.shadowBlur = 16 * scale
  ctx.fillStyle = "#ffffff"
  drawRoundRect(ctx, boxX, boxY, boxW, boxH, boxR)
  ctx.fill()
  ctx.restore()

  // Draw QR code crisp
  const qrDrawW = boxW - pad * 2
  const qrDrawH = boxH - pad * 2
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(qrEl, boxX + pad, boxY + pad, qrDrawW, qrDrawH)
  ctx.imageSmoothingEnabled = true

  // 9. "Scan Now" matching preview
  let scanY = boxY + boxH + 22 * scale
  const scanEl = cardEl?.querySelector("[data-ref='cafe-scannow']")
  if (scanEl && cardRect) {
    const rect = scanEl.getBoundingClientRect()
    scanY = (rect.top - cardRect.top + rect.height / 2) * scale
  }
  ctx.fillStyle = fg
  ctx.font = `700 ${17 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = `${0.08 * 17 * scale}px`
  }
  ctx.fillText("Scan Now", W / 2, scanY)
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = "0px"
  }

  // 10. Havana Cafe Logo centered badge matching preview
  let logoX = (W - 52 * scale) / 2
  let logoY = scanY + 24 * scale
  let logoW = 52 * scale
  let logoH = 52 * scale
  const logoEl = cardEl?.querySelector("[data-ref='cafe-logo']")
  if (logoEl && cardRect) {
    const rect = logoEl.getBoundingClientRect()
    logoX = (rect.left - cardRect.left) * scale
    logoY = (rect.top - cardRect.top) * scale
    logoW = rect.width * scale
    logoH = rect.height * scale
  }
  const radius = logoW / 2
  const logoPad = 4 * scale

  // White badge with shadow
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.12)"
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 2 * scale
  ctx.shadowBlur = 8 * scale
  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.arc(logoX + radius, logoY + radius, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Border
  ctx.strokeStyle = fg + "33"
  ctx.lineWidth = 1.5 * scale
  ctx.beginPath()
  ctx.arc(logoX + radius, logoY + radius, radius, 0, Math.PI * 2)
  ctx.stroke()

  // Logo image
  const actualLogo = logoImg || (logoEl?.querySelector("img") as HTMLImageElement | null)
  if (actualLogo && (actualLogo.complete || actualLogo.naturalWidth > 0)) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoX + radius, logoY + radius, radius - 1, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(actualLogo, logoX + logoPad, logoY + logoPad, logoW - logoPad * 2, logoH - logoPad * 2)
    ctx.restore()
  }

  const a = document.createElement("a")
  a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-menu-qr.png`
  a.href = out.toDataURL("image/png")
  a.click()
}

// ── Download: Minimal template ────────────────────────────────────────────────
function downloadMinimal(
  cardEl: HTMLDivElement | null,
  qrEl: HTMLCanvasElement,
  name: string,
  fg: string,
  bg: string
) {
  const scale = 3
  const cardRect = cardEl ? cardEl.getBoundingClientRect() : null
  const W = cardRect ? Math.round(cardRect.width * scale) : 600
  const H = cardRect ? Math.round(cardRect.height * scale) : 720

  let qrX = 0, qrY = 0, qrW = 0, qrH = 0
  let nameY = 0
  const pad = 24 * scale

  if (cardEl && cardRect) {
    const qrCanvas = cardEl.querySelector("canvas")
    if (qrCanvas) {
      const qRect = qrCanvas.getBoundingClientRect()
      qrX = (qRect.left - cardRect.left) * scale
      qrY = (qRect.top - cardRect.top) * scale
      qrW = qRect.width * scale
      qrH = qRect.height * scale
    }
    const nameP = cardEl.querySelector("p")
    if (nameP) {
      const nRect = nameP.getBoundingClientRect()
      nameY = (nRect.top - cardRect.top + nRect.height / 2) * scale
    }
  }

  const out = document.createElement("canvas")
  out.width = W
  out.height = H
  const ctx = out.getContext("2d")
  if (!ctx) return

  // Rounded card background
  drawRoundRect(ctx, 0, 0, W, H, 16 * scale)
  ctx.clip()
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Border matching preview: border: 2px solid ${fg}22
  ctx.strokeStyle = fg + "22"
  ctx.lineWidth = 2 * scale
  drawRoundRect(ctx, 1 * scale, 1 * scale, W - 2 * scale, H - 2 * scale, 16 * scale)
  ctx.stroke()

  // QR Code
  ctx.imageSmoothingEnabled = false
  if (qrW > 0) {
    ctx.drawImage(qrEl, qrX, qrY, qrW, qrH)
  } else {
    const qs = qrEl.width * scale
    ctx.drawImage(qrEl, (W - qs) / 2, pad, qs, qs)
  }
  ctx.imageSmoothingEnabled = true

  // Name
  ctx.fillStyle = fg
  ctx.font = `700 ${18 * scale}px Georgia, serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(name, W / 2, nameY || (H - pad))

  const a = document.createElement("a")
  a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-qr.png`
  a.href = out.toDataURL("image/png")
  a.click()
}

// ── Helper ────────────────────────────────────────────────────────────────────
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
