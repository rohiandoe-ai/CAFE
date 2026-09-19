"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { adminLogin } from "@/lib/supabase"

export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail]     = useState("")
  const [password, setPass]   = useState("")
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError(false)
    const ok = await adminLogin(email.trim(), password)
    if (ok) {
      sessionStorage.setItem("admin_auth", "true")
      router.replace("/admin/dashboard")
    } else {
      setError(true); setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0a", padding: "20px", position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{
        position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={error
          ? { x: [-10, 10, -8, 8, 0], opacity: 1, y: 0 }
          : { opacity: 1, y: 0 }
        }
        transition={{ duration: error ? 0.4 : 0.5 }}
        style={{
          width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 0 60px rgba(201,168,76,0.08), 0 24px 48px rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Icon + Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", margin: "0 auto 18px",
            background: "rgba(201,168,76,0.1)",
            border: "1.5px solid rgba(201,168,76,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(201,168,76,0.15)",
          }}>
            <Lock style={{ width: 28, height: 28, color: "#c9a84c" }} />
          </div>
          <h1 className="font-serif" style={{
            color: "#f5f0e8", fontSize: 26, fontWeight: 700, marginBottom: 6,
          }}>Admin Login</h1>
          <p style={{ color: "#888880", fontSize: 14 }}>Cafe Management Dashboard</p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 600,
              color: "#888880", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                width: 16, height: 16, color: "#888880",
              }} />
              <input
                type="email"
                className="input-base"
                style={{ paddingLeft: 42 }}
                placeholder="admin@cafe.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 600,
              color: "#888880", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                width: 16, height: 16, color: "#888880",
              }} />
              <input
                type={show ? "text" : "password"}
                className="input-base"
                style={{ paddingLeft: 42, paddingRight: 44 }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPass(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#888880", padding: 4, display: "flex", alignItems: "center",
                }}
              >
                {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 14,
              background: "rgba(224,85,85,0.1)",
              border: "1px solid rgba(224,85,85,0.25)",
              borderRadius: 10, padding: "10px 14px",
              color: "#e05555", fontSize: 13, textAlign: "center",
            }}
          >
            ❌ Incorrect email or password
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn-gold"
          disabled={loading || !email || !password}
          style={{ marginTop: 24, height: 52, fontSize: 15, borderRadius: 14, boxShadow: "0 0 20px rgba(201,168,76,0.2)" }}
        >
          {loading
            ? <Loader2 style={{ width: 20, height: 20, animation: "spin 0.8s linear infinite" }} />
            : "Sign In"
          }
        </button>

        {/* Footer hint */}
        <p style={{ textAlign: "center", color: "#555", fontSize: 12, marginTop: 20 }}>
          Havana Jaipur · Admin Portal
        </p>
      </motion.form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
