import { supabase } from './supabaseClient'

export const WorkoutsAPI = {
  async getWorkouts(userId) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true })

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async createWorkout(workout) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert(workout)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async updateWorkout(id, updates) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async deleteWorkout(id) {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      return { error }
    } catch (err) {
      return { error: err.message }
    }
  }
}
