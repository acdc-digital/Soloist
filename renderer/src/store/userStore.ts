// ZUSTAND USER STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/userStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  profilePicture?: string
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  signOut: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false
      }),
      signOut: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      }),
    }),
    {
      name: 'user-storage',
    }
  )
)