"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { User, Phone, Star, RefreshCw, Copy, Check, ChevronRight, Loader2 } from "lucide-react"
import { upsertCustomer, insertReview, markReviewCopied, type Business, type Customer } from "@/lib/supabase"
import { generateReview } from "@/lib/utils"

type Step = 1 | 2 | 3 | 4
const SUB = ["Food", "Service", "Atmosphere"] as const

export function ReviewTab({ business }: { business: Business }) {
  const cafeName  = business.name
  const reviewUrl = business.google_review_url

  const [googleUrl, setGoogleUrl] = useState(business?.google_review_url || "")
  const [step, setStep]       = useState<Step>(1)
  const [name, setName]       = useState("")
  const [phone, setPhone]     = useState("")
  const [saving, setSaving]   = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [subRatings, setSub]  = useState<Record<string, number>>({ Food: 0, Service: 0, Atmosphere: 0 })
  const [popStar, setPopStar] = useState(0)
  const [message, setMessage] = useState("")
  const [generating, setGen]  = useState(false)
  const [reviewId, setRevId]  = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  // Preload and keep google_review_url ready in state
  useEffect(() => {
    if (business?.google_review_url) {
      setGoogleUrl(business.google_review_url)
    }
  }, [business?.google_review_url])

  // Instant step 1 to step 2 with background customer upsert
  const step1 = async () => {
    if (!name.trim() || phone.length < 10) return
    setStep(2)
    upsertCustomer(name.trim(), phone.trim())
      .then(c => { if (c) setCustomer(c) })
      .catch(console.error)
  }

  // Pre-generate AI review on star select so it's 100% ready for step 3
  const starClick = (s: number) => {
    setRating(s)
    setPopStar(s)
    setTimeout(() => setPopStar(0), 300)
    const pregen = generateReview(s, cafeName)
    setMessage(pregen)
  }

  // Instant transition to step 3 with background review insert
  const step2 = () => {
    if (!rating) return
    const reviewText = message || generateReview(rating, cafeName)
    if (!message) setMessage(reviewText)
    setStep(3)
    insertReview({
      customer_id: customer?.id,
      rating,
      food_rating: subRatings.Food || undefined,
      service_rating: subRatings.Service || undefined,
      atmosphere_rating: subRatings.Atmosphere || undefined,
      review_text: reviewText,
    }).then(rev => {
      if (rev?.id) setRevId(rev.id)
    }).catch(console.error)
  }

  const reshuffle = () => {
    setMessage(generateReview(rating, cafeName, message))
  }

  // Instant clipboard copy + instant Google redirect + async DB update
  const copy = () => {
    // 1. Copy text to clipboard
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message)
      } else {
        const ta = document.createElement("textarea")
        ta.value = message
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
    } catch {}

    setCopied(true)

    // 2. Open Google review link immediately (direct user click gesture, no popup block)
    const targetUrl = googleUrl || reviewUrl || business.google_review_url
    if (targetUrl) {
      window.open(targetUrl, "_blank")
    }

    // 3. Mark review copied in background without delaying user
    if (reviewId) {
      markReviewCopied(reviewId).catch(() => {})
    }
  }

  const reset = () => {
    setStep(1); setRating(0); setMessage(""); setCopied(false)
    setName(""); setPhone(""); setSub({ Food: 0, Service: 0, Atmosphere: 0 })
  }

  const V = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    exit:    { opacity: 0, x: -24, transition: { duration: 0.2 } },
  }

  // Step labels
  const STEP_LABELS = ["Info", "Rate", "Review", "Done"]

  return (
    <div style={{ minHeight: "100vh", padding: "24px 20px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          background: "#ffffff",
          border: "2px solid rgba(201,168,76,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px", overflow: "hidden",
          padding: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,76,0.2)",
        }}>
          <img src="/havana-logo.png" alt="Havana Cafe Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 22, fontWeight: 700 }}>
          Welcome to {cafeName}
        </h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>Share your experience</p>

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 20 }}>
          {STEP_LABELS.map((label, i) => {
            const s   = i + 1
            const done = step > s
            const curr = step === s
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: done ? "#c9a84c" : curr ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)",
                    border: `2px solid ${done || curr ? "#c9a84c" : "rgba(201,168,76,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: done ? "#0a0a0a" : curr ? "#c9a84c" : "#666",
                    transition: "all 0.3s",
                  }}>
                    {done ? "✓" : s}
                  </div>
                  <span style={{ fontSize: 9, color: curr ? "#c9a84c" : "#555", fontWeight: curr ? 600 : 400 }}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div style={{
                    width: 32, height: 2, margin: "0 2px",
                    marginBottom: 16,
                    background: done ? "#c9a84c" : "rgba(201,168,76,0.15)",
                    transition: "background 0.3s",
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="s1" variants={V} initial="initial" animate="animate" exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 16, padding: 20,
              display: "flex", flexDirection: "column", gap: 16,
            }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888880", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Your Name
                </label>
                <div style={{ position: "relative" }}>
                  <User style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#c9a84c" }} />
                  <input
                    className="input-base"
                    style={{ paddingLeft: 38 }}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && step1()}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888880", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Phone Number
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: 12, padding: "0 12px",
                    flexShrink: 0, height: 48,
                  }}>
                    <span style={{ fontSize: 16 }}>🇮🇳</span>
                    <span style={{ fontSize: 13, color: "#888880", fontWeight: 600 }}>+91</span>
                  </div>
                  <input
                    className="input-base"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={e => e.key === "Enter" && step1()}
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-gold"
              onClick={step1}
              disabled={!name.trim() || phone.length < 10 || saving}
              style={{ height: 52 }}
            >
              {saving ? <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} /> : <>Continue <ChevronRight style={{ width: 16, height: 16 }} /></>}
            </button>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div key="s2" variants={V} initial="initial" animate="animate" exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 16, padding: 20,
            }}>
              <p style={{ color: "#f5f0e8", fontWeight: 600, marginBottom: 4 }}>Overall Rating</p>
              <p style={{ color: "#888880", fontSize: 13, marginBottom: 16 }}>Tap a star to rate your experience</p>

              {/* Big stars - 52px mobile, 8px gap, bright gold outline when empty, solid gold + glow when filled */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                {[1, 2, 3, 4, 5].map(s => {
                  const isFilled = s <= (hovered || rating)
                  const isHovered = hovered === s || popStar === s
                  return (
                    <button
                      key={s}
                      onClick={() => starClick(s)}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      aria-label={`${s} star rating`}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        minWidth: 48,
                        minHeight: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: popStar === s ? "scale(1.25)" : isHovered ? "scale(1.15)" : isFilled ? "scale(1.08)" : "scale(1)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      <Star
                        style={{
                          width: 50,
                          height: 50,
                          color: "#C9A84C",
                          fill: isFilled ? "#C9A84C" : "transparent",
                          strokeWidth: 2,
                          filter: isFilled
                            ? "drop-shadow(0 0 8px rgba(201, 168, 76, 0.8))"
                            : "drop-shadow(0 0 3px rgba(201, 168, 76, 0.35))",
                          transition: "fill 0.15s ease, filter 0.15s ease, transform 0.15s ease",
                        }}
                      />
                    </button>
                  )
                })}
              </div>

              {rating > 0 && (
                <p style={{ textAlign: "center", color: "#c9a84c", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                  {["","Poor 😔","Fair 😐","Good 🙂","Great 😊","Excellent! 🤩"][rating]}
                </p>
              )}

              {/* Sub ratings */}
              <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ color: "#888880", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Rate aspects (optional)
                </p>
                {SUB.map(label => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#f5f0e8", fontSize: 14, fontWeight: 500 }}>{label}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4, 5].map(s => {
                        const isFilled = s <= subRatings[label]
                        return (
                          <button
                            key={s}
                            onClick={() => setSub(p => ({ ...p, [label]: s }))}
                            aria-label={`${label} ${s} star`}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 2,
                              minWidth: 34,
                              minHeight: 34,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: isFilled ? "scale(1.08)" : "scale(1)",
                              transition: "transform 0.12s ease",
                            }}
                          >
                            <Star
                              style={{
                                width: 30,
                                height: 30,
                                color: "#C9A84C",
                                fill: isFilled ? "#C9A84C" : "transparent",
                                strokeWidth: 2,
                                filter: isFilled ? "drop-shadow(0 0 6px rgba(201, 168, 76, 0.7))" : "none",
                                transition: "fill 0.12s ease, filter 0.12s ease",
                              }}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-gold" onClick={step2} disabled={!rating} style={{ height: 52 }}>
              Next <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.div key="s3" variants={V} initial="initial" animate="animate" exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <p style={{ color: "#f5f0e8", fontWeight: 600, marginBottom: 4 }}>Your Review</p>
              <p style={{ color: "#888880", fontSize: 13 }}>Edit this message before copying</p>
            </div>

            {generating ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 12, minHeight: 160,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(201,168,76,0.12)",
                borderRadius: 16,
              }}>
                <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: "#c9a84c" }} />
                <p style={{ color: "#888880", fontSize: 13 }}>Crafting your review…</p>
              </div>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="input-base"
                  style={{ resize: "none", lineHeight: 1.65 }}
                />
                <button
                  onClick={reshuffle}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "none", border: "none", cursor: "pointer",
                    color: "#c9a84c", fontSize: 13, fontWeight: 500,
                    padding: "4px 0",
                  }}
                >
                  <RefreshCw style={{ width: 14, height: 14 }} />
                  Try a different message
                </button>
                <button
                  className="btn-gold"
                  onClick={() => setStep(4)}
                  disabled={!message.trim()}
                  style={{ height: 52 }}
                >
                  Continue <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <motion.div key="s4" variants={V} initial="initial" animate="animate" exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(201,168,76,0.1)",
                border: "1.5px solid rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <Star style={{ width: 28, height: 28, color: "#c9a84c", fill: "#c9a84c" }} />
              </div>
              <p style={{ color: "#f5f0e8", fontSize: 18, fontWeight: 700 }}>One Last Step!</p>
              <p style={{ color: "#888880", fontSize: 13, marginTop: 6 }}>
                Copy your review and paste it on Google
              </p>
            </div>

            {/* Preview */}
            <div style={{
              background: "rgba(201,168,76,0.05)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 16, padding: 16,
            }}>
              <p style={{ color: "#f5f0e8", fontSize: 14, lineHeight: 1.65 }}>{message}</p>
            </div>

            <button
              className="btn-gold"
              onClick={copy}
              style={{ height: 56, fontSize: 15, boxShadow: "0 0 24px rgba(201,168,76,0.2)" }}
            >
              {copied
                ? <><Check style={{ width: 20, height: 20 }} /> Copied! Opening Google…</>
                : <><Copy style={{ width: 20, height: 20 }} /> Copy &amp; Open Google Review</>
              }
            </button>

            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", color: "#4caf7d", fontSize: 14 }}
              >
                ✅ Thank you for your review!
              </motion.p>
            )}

            <button
              onClick={reset}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: "8px 0" }}
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
