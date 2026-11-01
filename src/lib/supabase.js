import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Publishable key нь хөтөчид ил байхад зориулагдсан. Secret key-г энд хэзээ ч бүү тавь.
export const supabase = url && key ? createClient(url, key) : null;

/** Нэвтэрсэн хэрэглэгчийн access token, нэвтрээгүй бол null. */
export async function accessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
