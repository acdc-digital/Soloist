// SIDEBAR STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/sidebarStore.ts

"use client";

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type View = "dashboard" | "soloist" | "testing";

interface SidebarState {
  collapsed: boolean;
  searchQuery: string;
  currentView: View;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setSearchQuery: (query: string) => void;
  setView: (view: View) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      searchQuery: '',
      currentView: 'dashboard',
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setView: (currentView) => set({ currentView }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);