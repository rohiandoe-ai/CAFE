"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ExternalLink, Users, Heart, Share2 } from "lucide-react"
import { getInstagram, trackInstagramClick, type InstagramSettings, type Business } from "@/lib/supabase"

export function SocialTab({ business }: { business: Business }) {
  const [insta, setInsta]   = useState<InstagramSettings | null>(null)
  const [loading, setLoad]  = useState(true)
  const [clicked, setClick] = useState(false)

  useEffect(() => {
    getInstagram()
      .then(setInsta)
      .catch(console.error)
      .finally(() => setLoad(false))
  }, [])

  const follow = async () => {
    setClick(true)
    await trackInstagramClick()
    if (insta?.instagram_url) window.open(insta.instagram_url, "_blank")
  }

  const initial = (insta?.username ?? business.name ?? "H")[0].toUpperCase()

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(201,168,76,0.08)",
          border: "1.5px solid rgba(201,168,76,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
        }}>
          <Share2 style={{ width: 32, height: 32, color: "#c9a84c" }} />
        </div>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 22, fontWeight: 700 }}>
          Follow Us
        </h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>
          Stay updated with our latest posts
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid #c9a84c", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ borderRadius: 20, overflow: "hidden", borderColor: "rgba(201,168,76,0.2)" }}
          >
            {/* Profile header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "18px 18px 14px",
              borderBottom: "1px solid rgba(201,168,76,0.1)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #c9a84c, #a07830)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, color: "#0a0a0a",
              }}>
                {initial}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#f5f0e8", fontWeight: 600, fontSize: 15 }}>
                  {insta?.username ?? "@houseofpaloma"}
                </p>
                <p style={{ color: "#888880", fontSize: 12, marginTop: 2 }}>{business.name}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#c9a84c" }}>
                  <Users style={{ width: 14, height: 14 }} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{insta?.follower_count ?? "0"}</span>
                </div>
                <p style={{ color: "#888880", fontSize: 11, marginTop: 1 }}>followers</p>
              </div>
            </div>

            {/* Image grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, padding: 2 }}>
              {(insta?.preview_images?.length ? insta.preview_images.slice(0, 3) : [null, null, null]).map((img, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {img
                    ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Heart style={{ width: 24, height: 24, color: "rgba(201,168,76,0.2)" }} />
                  }
                </div>
              ))}
            </div>

            {/* Follow button */}
            <div style={{ padding: 16 }}>
              <button
                className="btn-gold"
                onClick={follow}
                style={{ height: 52, gap: 10 }}
              >
                <Share2 style={{ width: 18, height: 18 }} />
                Follow on Instagram
                <ExternalLink style={{ width: 14, height: 14 }} />
              </button>
              {clicked && (
                <p style={{ textAlign: "center", color: "#4caf7d", fontSize: 13, marginTop: 10 }}>
                  ✅ Opening Instagram…
                </p>
              )}
            </div>
          </motion.div>

          {/* Reasons card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-card"
            style={{ borderRadius: 20, padding: 18, borderColor: "rgba(201,168,76,0.15)" }}
          >
            <p style={{ color: "#888880", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Why follow us?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["🎉", "Exclusive offers for followers"],
                ["📸", "Behind-the-scenes content"],
                ["🍽️", "New menu announcements first"],
                ["🎶", "Event updates & live nights"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: "#e0d8cc", fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
