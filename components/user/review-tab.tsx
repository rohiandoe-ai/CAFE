"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  User, Phone, Star, RefreshCw, Copy, Check,
  ChevronRight, Loader2
} from "lucide-react"
import { upsertCustomer, insertReview, markReviewCopied, type Business, type Customer } from "@/lib/supabase"
import { generateReview } from "@/lib/utils"

type Step = 1 | 2 | 3 | 4

const SUB_RATINGS = ["Food", "Service", "Atmosphere"] as const

export function ReviewTab({ business }: { business: Business }) {
  const cafeName = business?.name ?? "House of Paloma"
  const reviewUrl = business?.google_review_url ?? ""

  // Step state
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [name, setName]   = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  // Step 2
  const [rating, setRating]     = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [subRatings, setSubRatings]   = useState<Record<string, number>>({ Food: 0, Service: 0, Atmosphere: 0 })
  const [animateStar, setAnimateStar] = useState(0)

  // Step 3
  const [message, setMessage]     = useState("")
  const [generating, setGenerating] = useState(false)
  const [reviewId, setReviewId]   = useState<string | null>(null)

  // Step 4
  const [copied, setCopied] = useState(false)

  // ── Step 1: Save customer ─────────────────────────────────────────────────
  const handleStep1 = async () => {
    if (!name.trim() || phone.trim().length < 10) return
    setSaving(true)
    const c = await upsertCustomer(name.trim(), phone.trim())
    setCustomer(c)
    setSaving(false)
    setStep(2)
  }

  // ── Step 2: Select rating ─────────────────────────────────────────────────
  const handleStarClick = (s: number) => {
    setRating(s)
    setAnimateStar(s)
    setTimeout(() => setAnimateStar(0), 300)
  }

  const handleSubRating = (label: string, val: number) => {
    setSubRatings(prev => ({ ...prev, [label]: val }))
  }

  const handleStep2 = async () => {
    if (rating === 0) return
    setStep(3)
    setGenerating(true)

    // Save review to Supabase
    const rev = await insertReview({
      customer_id: customer?.id,
      rating,
      food_rating: subRatings.Food || undefined,
      service_rating: subRatings.Service || undefined,
      atmosphere_rating: subRatings.Atmosphere || undefined,
    })
    setReviewId(rev?.id ?? null)

    // Simulate AI generation delay
    await new Promise(r => setTimeout(r, 1200))
    setMessage(generateReview(rating, cafeName))
    setGenerating(false)
  }

  // ── Step 3: Reshuffle message ─────────────────────────────────────────────
  const reshuffle = () => {
    setGenerating(true)
    setTimeout(() => {
      setMessage(generateReview(rating, cafeName))
      setGenerating(false)
    }, 600)
  }

  // ── Step 4: Copy & redirect ───────────────────────────────────────────────
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(message) } catch {}
    setCopied(true)
    if (reviewId) await markReviewCopied(reviewId)
    setTimeout(() => {
      window.open(reviewUrl, "_blank")
    }, 1000)
  }

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -20 },
  }

  return (
    <div className="min-h-screen px-5 pt-10 pb-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border"
          style={{ borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)" }}
        >
          <span className="text-3xl">☕</span>
        </div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>
          Welcome to {cafeName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#888880" }}>
          Share your experience with us
        </p>

        {/* Step indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {[1,2,3,4].map(s => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === s ? "2rem" : "0.5rem",
                background: s <= step ? "#c9a84c" : "rgba(201,168,76,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: User Info ── */}
        {step === 1 && (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: "#f5f0e8" }}>Tell us who you are</h2>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#888880" }}>Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#c9a84c" }} />
                <input
                  className="input-base pl-10"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleStep1()}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#888880" }}>Phone Number</label>
              <div className="flex gap-2">
                <div
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border px-3"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(201,168,76,0.15)" }}
                >
                  <span>🇮🇳</span>
                  <span className="text-sm font-medium" style={{ color: "#888880" }}>+91</span>
                </div>
                <input
                  className="input-base"
                  type="tel"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={e => e.key === "Enter" && handleStep1()}
                />
              </div>
            </div>

            <button
              className="btn-gold mt-2"
              onClick={handleStep1}
              disabled={!name.trim() || phone.length < 10 || saving}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ChevronRight className="h-4 w-4" /></>}
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: Rating ── */}
        {step === 2 && (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#f5f0e8" }}>How was your experience?</h2>
              <p className="mt-1 text-sm" style={{ color: "#888880" }}>Tap a star to rate</p>
            </div>

            {/* Overall stars */}
            <div className="flex justify-center gap-3">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => handleStarClick(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className={`transition-transform duration-150 ${animateStar === s ? "star-pop" : ""}`}
                >
                  <Star
                    className="h-10 w-10"
                    style={{
                      color: s <= (hoveredStar || rating) ? "#c9a84c" : "#333",
                      fill: s <= (hoveredStar || rating) ? "#c9a84c" : "transparent",
                      transition: "color 0.15s, fill 0.15s",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Sub ratings */}
            <div className="space-y-4">
              <p className="text-sm font-medium" style={{ color: "#888880" }}>Rate specific aspects (optional)</p>
              {SUB_RATINGS.map(label => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#f5f0e8" }}>{label}</span>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => handleSubRating(label, s)}>
                        <Star
                          className="h-5 w-5"
                          style={{
                            color: s <= subRatings[label] ? "#c9a84c" : "#333",
                            fill: s <= subRatings[label] ? "#c9a84c" : "transparent",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-gold" onClick={handleStep2} disabled={rating === 0}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* ── STEP 3: AI Message ── */}
        {step === 3 && (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#f5f0e8" }}>Your review is ready!</h2>
              <p className="mt-1 text-sm" style={{ color: "#888880" }}>Feel free to edit this message</p>
            </div>

            {generating ? (
              <div
                className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border"
                style={{ borderColor: "rgba(201,168,76,0.15)", background: "rgba(255,255,255,0.03)" }}
              >
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#c9a84c" }} />
                <p className="text-sm" style={{ color: "#888880" }}>Crafting your review…</p>
              </div>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="input-base resize-none"
                  style={{ lineHeight: 1.6 }}
                />
                <button
                  onClick={reshuffle}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "#c9a84c" }}
                >
                  <RefreshCw className="h-4 w-4" /> Try a different message
                </button>
                <button
                  className="btn-gold"
                  onClick={() => setStep(4)}
                  disabled={!message.trim()}
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── STEP 4: Final Action ── */}
        {step === 4 && (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="text-center">
              <div
                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                <Star className="h-8 w-8" style={{ color: "#c9a84c", fill: "#c9a84c" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#f5f0e8" }}>One Last Step!</h2>
              <p className="mt-2 text-sm" style={{ color: "#888880" }}>
                Copy your review and paste it on Google to help others discover us
              </p>
            </div>

            {/* Preview */}
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.05)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "#f5f0e8" }}>{message}</p>
            </div>

            <button
              className="btn-gold gold-glow"
              onClick={handleCopy}
              style={{ fontSize: "1rem", padding: "1rem" }}
            >
              {copied ? (
                <><Check className="h-5 w-5" /> Copied! Opening Google…</>
              ) : (
                <><Copy className="h-5 w-5" /> Copy &amp; Open Google Review</>
              )}
            </button>

            {copied && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm"
                style={{ color: "#4caf7d" }}
              >
                ✅ Thank you for your review!
              </motion.p>
            )}

            <button
              onClick={() => { setStep(1); setRating(0); setMessage(""); setCopied(false); setName(""); setPhone("") }}
              className="w-full text-center text-sm py-2"
              style={{ color: "#888880" }}
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
