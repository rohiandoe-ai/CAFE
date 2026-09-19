"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ExternalLink, Heart, Users, Share2 } from "lucide-react"
import { getInstagram, trackInstagramClick, type InstagramSettings, type Business } from "@/lib/supabase"

export function SocialTab({ business }: { business: Business }) {
  const [insta, setInsta] = useState<InstagramSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    getInstagram().then(data => {
      setInsta(data)
      setLoading(false)
    })
  }, [])

  const handleFollow = async () => {
    setClicked(true)
    await trackInstagramClick()
    if (insta?.instagram_url) {
      window.open(insta.instagram_url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#c9a84c" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-5 pt-10 pb-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border"
          style={{ borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)" }}
        >
          <Share2 className="h-10 w-10" style={{ color: "#c9a84c" }} />
        </div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>Follow Us</h1>
        <p className="mt-1 text-sm" style={{ color: "#888880" }}>Stay updated with our latest posts</p>
      </div>

      {/* Instagram Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
        style={{ borderColor: "rgba(201,168,76,0.2)" }}
      >
        {/* Profile section */}
        <div className="flex items-center gap-4 p-5 border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
            style={{ background: "linear-gradient(135deg, #c9a84c, #a07830)" }}
          >
            <span className="text-xl font-bold text-black">
              {(insta?.username ?? business?.name ?? "H")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: "#f5f0e8" }}>{insta?.username ?? "@houseofpaloma"}</p>
            <p className="text-sm" style={{ color: "#888880" }}>{business?.name ?? "House of Paloma"}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1" style={{ color: "#c9a84c" }}>
              <Users className="h-4 w-4" />
              <span className="text-sm font-bold">{insta?.follower_count ?? "0"}</span>
            </div>
            <p className="text-xs" style={{ color: "#888880" }}>followers</p>
          </div>
        </div>

        {/* Preview images grid */}
        {insta?.preview_images && insta.preview_images.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {insta.preview_images.slice(0, 3).map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden">
                <img src={img} alt={`Post ${i+1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {[1,2,3].map(i => (
              <div
                key={i}
                className="aspect-square flex items-center justify-center shimmer"
              >
                <Heart className="h-6 w-6 opacity-30" style={{ color: "#c9a84c" }} />
              </div>
            ))}
          </div>
        )}

        {/* Follow button */}
        <div className="p-5">
          <button
            className="btn-gold gold-glow"
            onClick={handleFollow}
            style={{ fontSize: "1rem" }}
          >
            <Share2 className="h-5 w-5" />
            Follow on Instagram
            <ExternalLink className="h-4 w-4" />
          </button>
          {clicked && (
            <p className="mt-3 text-center text-sm" style={{ color: "#4caf7d" }}>
              ✅ Opening Instagram…
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 glass-card rounded-2xl p-5"
        style={{ borderColor: "rgba(201,168,76,0.2)" }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: "#888880" }}>Why follow us?</p>
        <ul className="space-y-2">
          {[
            "🎉 Exclusive offers for followers",
            "📸 Behind-the-scenes content",
            "🍽️ New menu announcements",
            "🎶 Event updates & live nights",
          ].map(item => (
            <li key={item} className="text-sm" style={{ color: "#f5f0e8" }}>{item}</li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
