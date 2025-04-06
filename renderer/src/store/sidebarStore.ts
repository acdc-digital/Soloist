// SIDEBAR STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/sidebarStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  collapsed: boolean
  searchQuery: string
  toggleCollapsed: () => void
  setCollapsed: (collapsed: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      searchQuery: '',
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
)