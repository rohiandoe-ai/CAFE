"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ExternalLink, Users, Heart, Share2, RefreshCw } from "lucide-react"
import { getInstagram, trackInstagramClick, type InstagramSettings, type Business } from "@/lib/supabase"

// Fallback data for Havana Jaipur
const FALLBACK_INSTA: InstagramSettings = {
  id: "",
  cafe_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  instagram_url: "https://www.instagram.com/havanajaipur/",
  username: "@havanajaipur",
  follower_count: "10K",
  preview_images: [],
  total_clicks: 0,
}

export function SocialTab({ business }: { business: Business }) {
  const [insta, setInsta]   = useState<InstagramSettings>(FALLBACK_INSTA)
  const [loading, setLoad]  = useState(true)
  const [clicked, setClick] = useState(false)

  useEffect(() => {
    getInstagram()
      .then(data => { if (data) setInsta(data) })
      .catch(console.error)
      .finally(() => setLoad(false))
  }, [])

  const follow = async () => {
    setClick(true)
    await trackInstagramClick()
    window.open(insta.instagram_url || "https://www.instagram.com/havanajaipur/", "_blank")
  }

  const initial = (insta.username ?? business.name ?? "H").replace("@", "")[0].toUpperCase()

  return (
    <div style={{ minHeight: "100vh", padding: "28px 20px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
          border: "1.5px solid rgba(201,168,76,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
        }}>
          <Share2 style={{ width: 28, height: 28, color: "#c9a84c" }} />
        </div>
        <h1 className="font-serif" style={{ color: "#f5f0e8", fontSize: 22, fontWeight: 700 }}>
          Follow Us on Instagram
        </h1>
        <p style={{ color: "#888880", fontSize: 13, marginTop: 4 }}>
          Stay updated with our latest posts &amp; offers
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 48 }}>
          <RefreshCw style={{ width: 28, height: 28, color: "#c9a84c", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420, margin: "0 auto" }}>

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 20, overflow: "hidden",
            }}
          >
            {/* Profile header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "18px 18px 16px",
              borderBottom: "1px solid rgba(201,168,76,0.08)",
            }}>
              {/* Avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #c9a84c, #a07830)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: "#0a0a0a",
                boxShadow: "0 0 0 3px rgba(201,168,76,0.2)",
              }}>
                {initial}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 16 }}>{insta.username}</p>
                <p style={{ color: "#888880", fontSize: 12, marginTop: 2 }}>{business.name}</p>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", color: "#c9a84c" }}>
                  <Users style={{ width: 14, height: 14 }} />
                  <span style={{ fontWeight: 800, fontSize: 17 }}>{insta.follower_count}</span>
                </div>
                <p style={{ color: "#888880", fontSize: 11, marginTop: 1 }}>followers</p>
              </div>
            </div>

            {/* Preview images grid */}
            {insta.preview_images && insta.preview_images.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, padding: 2 }}>
                {insta.preview_images.slice(0, 3).map((img, i) => (
                  <div key={i} style={{ aspectRatio: "1", overflow: "hidden" }}>
                    <img src={img} alt={`Post ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            ) : (
              /* Placeholder grid when no images */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, padding: 2 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Heart style={{ width: 22, height: 22, color: "rgba(201,168,76,0.15)" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Follow button */}
            <div style={{ padding: 16 }}>
              <button
                className="btn-gold"
                onClick={follow}
                style={{ height: 52, fontSize: 15, borderRadius: 14, gap: 10 }}
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

          {/* Why follow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: 18, padding: "16px 18px",
            }}
          >
            <p style={{ color: "#888880", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Why follow us?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["🎉", "Exclusive offers for followers"],
                ["📸", "Behind-the-scenes content"],
                ["🍽️", "New menu announcements first"],
                ["🎶", "Event updates & live nights"],
              ].map(([icon, text]) => (
                <div key={text as string} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: "#d0c8c0", fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
