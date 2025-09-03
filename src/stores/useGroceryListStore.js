import { create } from 'zustand'
import { GroceryListsAPI } from '../lib/supabaseGroceryLists'

export const useGroceryListsStore = create((set, get) => ({
  groceryLists: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  async fetchGroceryLists(userId) {
    set({ isLoading: true, error: null })
    const { data, error } = await GroceryListsAPI.getLists(userId)
    set({ groceryLists: data || [], error, isLoading: false, isInitialized: true })
  },

  async addGroceryList(list) {
    const { data, error } = await GroceryListsAPI.createList(list)
    if (!error && data) {
      set({ groceryLists: [...get().groceryLists, data] })
    }
    return { data, error }
  },

  async updateGroceryList(id, updates) {
    const { data, error } = await GroceryListsAPI.updateList(id, updates)
    if (!error && data) {
      set({
        groceryLists: get().groceryLists.map(l => (l.id === id ? data : l))
      })
    }
    return { data, error }
  },

  async deleteGroceryList(id) {
    const { error } = await GroceryListsAPI.deleteList(id)
    if (!error) {
      set({
        groceryLists: get().groceryLists.filter(l => l.id !== id)
      })
    }
    return { error }
  }
}))
