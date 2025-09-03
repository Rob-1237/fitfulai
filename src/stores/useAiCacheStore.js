import { create } from 'zustand'
import { AiCacheAPI } from '../lib/supabaseAiCache'

export const useAiCacheStore = create((set, get) => ({
  cache: {},
  isLoading: false,
  error: null,

  async getCachedResponse(requestHash) {
    set({ isLoading: true, error: null })
    const { data, error } = await AiCacheAPI.getCachedResponse(requestHash)
    if (!error && data) {
      set({ cache: { ...get().cache, [requestHash]: data } })
    }
    set({ isLoading: false, error })
    return { data, error }
  },

  async createCacheEntry(entry) {
    const { data, error } = await AiCacheAPI.createCacheEntry(entry)
    if (!error && data) {
      set({ cache: { ...get().cache, [entry.request_hash]: data } })
    }
    return { data, error }
  },

  async purgeExpired() {
    return await AiCacheAPI.purgeExpiredCache()
  }
}))
