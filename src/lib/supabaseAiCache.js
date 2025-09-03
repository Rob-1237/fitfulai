import { supabase } from './supabaseClient'

export const AiCacheAPI = {
  async getCachedResponse(requestHash) {
    try {
      const { data, error } = await supabase
        .from('ai_cache')
        .select('*')
        .eq('request_hash', requestHash)
        .maybeSingle() // returns null if no row

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async createCacheEntry(entry) {
    try {
      const { data, error } = await supabase
        .from('ai_cache')
        .insert(entry)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async purgeExpiredCache(now = new Date().toISOString()) {
    try {
      const { error } = await supabase
        .from('ai_cache')
        .delete()
        .lt('expires_at', now)

      return { error }
    } catch (err) {
      return { error: err.message }
    }
  }
}
