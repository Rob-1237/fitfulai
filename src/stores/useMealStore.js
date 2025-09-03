import { create } from 'zustand'
import { MealsAPI } from '../lib/supabaseMeals'

export const useMealsStore = create((set, get) => ({
  meals: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  async fetchMeals(userId) {
    set({ isLoading: true, error: null })
    const { data, error } = await MealsAPI.getMeals(userId)
    set({ meals: data || [], error, isLoading: false, isInitialized: true })
  },

  async addMeal(meal) {
    const { data, error } = await MealsAPI.createMeal(meal)
    if (!error && data) {
      set({ meals: [...get().meals, data] })
    }
    return { data, error }
  },

  async updateMeal(id, updates) {
    const { data, error } = await MealsAPI.updateMeal(id, updates)
    if (!error && data) {
      set({
        meals: get().meals.map(m => (m.id === id ? data : m))
      })
    }
    return { data, error }
  },

  async deleteMeal(id) {
    const { error } = await MealsAPI.deleteMeal(id)
    if (!error) {
      set({
        meals: get().meals.filter(m => m.id !== id)
      })
    }
    return { error }
  }
}))
