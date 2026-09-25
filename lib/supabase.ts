import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const CAFE_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Business = {
  id: string
  name: string
  location: string
  google_review_url: string
  logo_url: string | null
  admin_email: string
  admin_password: string
}

export type Customer = {
  id: string
  cafe_id: string
  name: string
  phone: string
  visit_count: number
  last_visit: string
  created_at: string
}

export type Review = {
  id: string
  cafe_id: string
  customer_id: string | null
  rating: number
  food_rating: number | null
  service_rating: number | null
  atmosphere_rating: number | null
  review_text: string | null
  review_copied: boolean
  created_at: string
  customers?: { name: string; phone: string } | null
}

export type MenuItem = {
  id: string
  cafe_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
  is_must_try: boolean
  veg_nonveg: "veg" | "nonveg"
  sort_order: number
  created_at: string
  updated_at: string
}

export type InstagramSettings = {
  id: string
  cafe_id: string
  instagram_url: string
  username: string
  follower_count: string
  preview_images: string[]
  total_clicks: number
}

export type Template = {
  id: string
  cafe_id: string
  name: string
  category: string
  message: string
  created_at: string
}

export type Campaign = {
  id: string
  cafe_id: string
  template_id: string | null
  template_name: string | null
  segment: string
  total_sent: number
  delivered_count: number
  failed_count: number
  status: "pending" | "sending" | "completed" | "failed" | "scheduled"
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

// In-memory cache for ultra-fast repeated calls
let cachedBusiness: Business | null = null
const BUSINESS_CACHE_KEY = "havana_business_cache"

export async function getBusiness(): Promise<Business | null> {
  if (cachedBusiness) return cachedBusiness

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(BUSINESS_CACHE_KEY)
      if (stored) {
        cachedBusiness = JSON.parse(stored) as Business
        // Background revalidate without blocking
        ;(async () => {
          try {
            const { data } = await supabase
              .from("businesses")
              .select("*")
              .eq("id", CAFE_ID)
              .maybeSingle()
            if (data) {
              cachedBusiness = data as Business
              localStorage.setItem(BUSINESS_CACHE_KEY, JSON.stringify(data))
            }
          } catch {}
        })()
        return cachedBusiness
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", CAFE_ID)
    .maybeSingle()

  if (error) { console.error("getBusiness:", error.message); return null }
  if (data) {
    cachedBusiness = data as Business
    if (typeof window !== "undefined") {
      try { localStorage.setItem(BUSINESS_CACHE_KEY, JSON.stringify(data)) } catch {}
    }
  }
  return cachedBusiness
}

export async function updateBusiness(
  updates: Partial<Omit<Business, "id">>
): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", CAFE_ID)
    .select()
    .single()
  if (error) { console.error("updateBusiness:", error.message); return null }
  return data
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function upsertCustomer(
  name: string,
  phone: string
): Promise<Customer | null> {
  // maybeSingle() avoids PGRST116 error when no row found
  const { data: existing, error: fetchErr } = await supabase
    .from("customers")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .eq("phone", phone)
    .maybeSingle()

  if (fetchErr) console.error("upsertCustomer fetch:", fetchErr.message)

  if (existing) {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name,
        visit_count: existing.visit_count + 1,
        last_visit: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single()
    if (error) { console.error("upsertCustomer update:", error.message); return null }
    return data
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({ cafe_id: CAFE_ID, name, phone })
    .select()
    .single()
  if (error) { console.error("upsertCustomer insert:", error.message); return null }
  return data
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("last_visit", { ascending: false })
  if (error) { console.error("getCustomers:", error.message); return [] }
  return data ?? []
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function insertReview(review: {
  customer_id?: string
  rating: number
  food_rating?: number
  service_rating?: number
  atmosphere_rating?: number
  review_text?: string
}): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ cafe_id: CAFE_ID, ...review })
    .select("id, rating, created_at")
    .single()
  if (error) { console.error("insertReview:", error.message); return null }
  return data as Review
}

export async function markReviewCopied(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ review_copied: true })
    .eq("id", reviewId)
  if (error) console.error("markReviewCopied:", error.message)
}

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, customers(name, phone)")
    .eq("cafe_id", CAFE_ID)
    .order("created_at", { ascending: false })
  if (error) { console.error("getReviews:", error.message); return [] }
  return (data ?? []) as Review[]
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export async function getInstagram(): Promise<InstagramSettings | null> {
  const { data, error } = await supabase
    .from("instagram_settings")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .maybeSingle()
  if (error) { console.error("getInstagram:", error.message); return null }
  return data
}

export async function updateInstagram(
  updates: Partial<Omit<InstagramSettings, "id" | "cafe_id">>
): Promise<InstagramSettings | null> {
  const { data, error } = await supabase
    .from("instagram_settings")
    .update(updates)
    .eq("cafe_id", CAFE_ID)
    .select()
    .single()
  if (error) { console.error("updateInstagram:", error.message); return null }
  return data
}

export async function trackInstagramClick(): Promise<void> {
  const current = await getInstagram()
  if (!current) return
  const { error } = await supabase
    .from("instagram_settings")
    .update({ total_clicks: (current.total_clicks ?? 0) + 1 })
    .eq("cafe_id", CAFE_ID)
  if (error) console.error("trackInstagramClick:", error.message)
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("sort_order")
  if (error) { console.error("getMenuItems:", error.message); return [] }
  return data ?? []
}

export async function insertMenuItem(
  item: Omit<MenuItem, "id" | "cafe_id" | "created_at" | "updated_at">
): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from("menu_items")
    .insert({ cafe_id: CAFE_ID, ...item })
    .select()
    .single()
  if (error) { console.error("insertMenuItem:", error.message); return null }
  return data
}

export async function updateMenuItem(
  id: string,
  updates: Partial<Omit<MenuItem, "id" | "cafe_id" | "created_at">>
): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from("menu_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) { console.error("updateMenuItem:", error.message); return null }
  return data
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id)
  if (error) console.error("deleteMenuItem:", error.message)
}

export function subscribeToMenu(callback: () => void): () => void {
  const channel = supabase
    .channel("menu_realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "menu_items" },
      callback
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("created_at", { ascending: false })
  if (error) { console.error("getTemplates:", error.message); return [] }
  return data ?? []
}

export async function insertTemplate(t: {
  name: string
  category: string
  message: string
}): Promise<Template | null> {
  const { data, error } = await supabase
    .from("templates")
    .insert({ cafe_id: CAFE_ID, ...t })
    .select()
    .single()
  if (error) { console.error("insertTemplate:", error.message); return null }
  return data
}

export async function updateTemplate(
  id: string,
  updates: Partial<Pick<Template, "name" | "category" | "message">>
): Promise<Template | null> {
  const { data, error } = await supabase
    .from("templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) { console.error("updateTemplate:", error.message); return null }
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("templates").delete().eq("id", id)
  if (error) console.error("deleteTemplate:", error.message)
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("created_at", { ascending: false })
  if (error) { console.error("getCampaigns:", error.message); return [] }
  return data ?? []
}

export async function insertCampaign(c: {
  template_id?: string
  template_name?: string
  segment: string
  total_sent: number
  scheduled_at?: string
}): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      cafe_id: CAFE_ID,
      status: c.scheduled_at ? "scheduled" : "pending",
      delivered_count: 0,
      failed_count: 0,
      ...c,
    })
    .select()
    .single()
  if (error) { console.error("insertCampaign:", error.message); return null }
  return data
}

export async function updateCampaignStatus(
  id: string,
  status: Campaign["status"],
  extra?: Partial<Pick<Campaign, "delivered_count" | "failed_count" | "sent_at">>
): Promise<void> {
  const { error } = await supabase
    .from("campaigns")
    .update({ status, ...extra })
    .eq("id", id)
  if (error) console.error("updateCampaignStatus:", error.message)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", CAFE_ID)
    .eq("admin_email", email)
    .eq("admin_password", password)
    .maybeSingle()
  if (error) console.error("adminLogin:", error.message)
  return !!data
}
