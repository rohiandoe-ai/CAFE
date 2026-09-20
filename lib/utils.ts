import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { REVIEW_TEMPLATES } from "./review-templates"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

export function fillTemplate(message: string, vars: Record<string, string>): string {
  return message.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

const STORAGE_KEY = "grs_seen_reviews_v2"

// In-memory fallback if storage isn't available
const memorySeen: Record<number, number[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
}

function getSeenIndices(rating: number): number[] {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY}_${rating}`) || localStorage.getItem(`${STORAGE_KEY}_${rating}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
  }
  return memorySeen[rating] ?? []
}

function saveSeenIndices(rating: number, indices: number[]): void {
  memorySeen[rating] = indices
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_${rating}`, JSON.stringify(indices))
      localStorage.setItem(`${STORAGE_KEY}_${rating}`, JSON.stringify(indices))
    } catch {}
  }
}

export function generateReview(rating: number, cafeName: string, currentMessage?: string): string {
  const safeRating = rating >= 1 && rating <= 5 ? rating : 5
  const templates = REVIEW_TEMPLATES[safeRating] ?? REVIEW_TEMPLATES[5]

  if (!templates || templates.length === 0) {
    return `Great experience at ${cafeName}!`
  }

  // Find index of current message if present
  let currentIndex = -1
  if (currentMessage) {
    const trimmed = currentMessage.trim()
    currentIndex = templates.findIndex(tpl => tpl.replace(/\{name\}/g, cafeName).trim() === trimmed)
  }

  const seen = getSeenIndices(safeRating)

  // Filter available indices not yet seen in this rotation and not equal to current
  let available = templates
    .map((_, idx) => idx)
    .filter(idx => !seen.includes(idx) && idx !== currentIndex)

  // If all 100 templates have been exhausted, reset the rotation
  if (available.length === 0) {
    available = templates
      .map((_, idx) => idx)
      .filter(idx => idx !== currentIndex)
    
    // Reset seen history keeping only currentIndex
    const resetSeen = currentIndex !== -1 ? [currentIndex] : []
    saveSeenIndices(safeRating, resetSeen)
  }

  // Pick random index from remaining available pool
  const chosenIndex = available[Math.floor(Math.random() * available.length)]

  // Track the chosen index
  const updatedSeen = [...getSeenIndices(safeRating), chosenIndex]
  saveSeenIndices(safeRating, updatedSeen)

  return templates[chosenIndex].replace(/\{name\}/g, cafeName)
}
