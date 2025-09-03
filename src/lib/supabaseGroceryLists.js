import { supabase } from './supabaseClient'

export const GroceryListsAPI = {
  async getLists(userId) {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async createList(list) {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .insert(list)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async updateList(id, updates) {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .update(updates)
        .eq('id', id)
        .single()

      return { data, error }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async deleteList(id) {
    try {
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', id)

      return { error }
    } catch (err) {
      return { error: err.message }
    }
  }
}
