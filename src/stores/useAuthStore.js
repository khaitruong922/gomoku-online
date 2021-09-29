import create from 'zustand'
import { persist } from "zustand/middleware"
import api from '../api/api'

const useAuthStore = create(persist(
  (set, get) => ({
    player: null,
    login: async ({ username, password }) => {
      try {
        const loginRes = await api.post('/auth/login', { username, password })
        const token = loginRes.data?.token
        return token
      }
      catch (e) {
        console.log(e.response)
      }
    },
    logout: async () => {
      try {
        await api.post('/auth/logout')
        get().clearUser()
      } catch (e) {
        console.log(e.response)
      }
    },
    fetchCurrentUser: async () => {
      try {
        const res = await api.get('users/me')
        const player = res.data
        set({ player })
        return get().player
      } catch (e) {
        console.log(e.response)
        get().clearUser()
        return null
      }
    },
    clearUser: () => {
      set({ player: null })
    },
  }),
  {
    name: "auth", // unique name
    getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
  }
))

useAuthStore.subscribe((state, prevState) => console.log(state))

export default useAuthStore