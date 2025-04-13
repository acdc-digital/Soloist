// FEED STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/feedStore.ts

"use client";

import { create } from "zustand";

export interface FeedMessage {
  _id: string;
  date: string;
  createdAt: number;
  message: string;
}

interface FeedState {
  feedMessages: FeedMessage[] | null;
  setFeedMessages: (messages: FeedMessage[] | null) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feedMessages: null,
  setFeedMessages: (messages) => set({ feedMessages: messages }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  // The feed sidebar open/close logic
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));