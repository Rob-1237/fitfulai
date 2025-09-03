import { create } from 'zustand'
import { WorkoutsAPI } from '../lib/supabaseWorkouts'

export const useWorkoutsStore = create((set, get) => ({
  workouts: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  async fetchWorkouts(userId) {
    set({ isLoading: true, error: null })
    const { data, error } = await WorkoutsAPI.getWorkouts(userId)
    set({ workouts: data || [], error, isLoading: false, isInitialized: true })
  },

  async addWorkout(workout) {
    const { data, error } = await WorkoutsAPI.createWorkout(workout)
    if (!error && data) {
      set({ workouts: [...get().workouts, data] })
    }
    return { data, error }
  },

  async updateWorkout(id, updates) {
    const { data, error } = await WorkoutsAPI.updateWorkout(id, updates)
    if (!error && data) {
      set({
        workouts: get().workouts.map(w => (w.id === id ? data : w))
      })
    }
    return { data, error }
  },

  async deleteWorkout(id) {
    const { error } = await WorkoutsAPI.deleteWorkout(id)
    if (!error) {
      set({
        workouts: get().workouts.filter(w => w.id !== id)
      })
    }
    return { error }
  }
}))
