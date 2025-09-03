import { supabase } from './supabaseClient'

export const MealsAPI = {
  async getMeals(userId) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true })

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async createMeal(meal) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert(meal)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async updateMeal(id, updates) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async deleteMeal(id) {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)

      return { error }
    } catch (err) {
      return { error: err.message }
    }
  }
}
