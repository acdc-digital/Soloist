import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

// Type for the cache map
type DailyDetailsCache = Record<string, string>; // Keys are 'YYYY-MM-DD', values are detail strings
type WeeklyInsightsCache = Record<string, string[]>; // Keys are rangeKey, values are insight strings array

interface TestingStore {
  // Date selection state
  selectedDateRange: DateRange;
  setSelectedDateRange: (range: DateRange) => void;
  
  // Forecast generation state
  isGeneratingForecast: boolean;
  forecastGenerated: boolean;
  setIsGeneratingForecast: (isGenerating: boolean) => void;
  setForecastGenerated: (generated: boolean) => void;
  
  // Daily Details Cache (Session Only)
  dailyDetailsCache: DailyDetailsCache;
  setDailyDetail: (date: string, detail: string) => void;
  clearDailyDetailsCache: () => void;
  
  // Weekly Insights Cache (Session Only)
  weeklyInsightsCache: WeeklyInsightsCache;
  setWeeklyInsights: (rangeKey: string, insights: string[]) => void;
  clearWeeklyInsightsCache: () => void;
  
  // Reset all state
  resetState: () => void;
}

export const useTestingStore = create<TestingStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedDateRange: { start: null, end: null },
      isGeneratingForecast: false,
      forecastGenerated: false,
      dailyDetailsCache: {}, // Initial empty cache
      weeklyInsightsCache: {}, // Initial empty cache for weekly insights
      
      // Actions
      setSelectedDateRange: (range) => set({ selectedDateRange: range }),
      setIsGeneratingForecast: (isGenerating) => set({ isGeneratingForecast: isGenerating }),
      setForecastGenerated: (generated) => set({ forecastGenerated: generated }),
      
      // Cache Actions
      setDailyDetail: (date, detail) =>
        set((state) => ({
          dailyDetailsCache: {
            ...state.dailyDetailsCache,
            [date]: detail,
          },
        })),
      clearDailyDetailsCache: () => set({ dailyDetailsCache: {} }),
      
      // Weekly Insights Cache Actions
      setWeeklyInsights: (rangeKey, insights) =>
        set((state) => ({
          weeklyInsightsCache: {
            ...state.weeklyInsightsCache,
            [rangeKey]: insights,
          },
        })),
      clearWeeklyInsightsCache: () => set({ weeklyInsightsCache: {} }),
      
      // Reset all state (includes clearing cache)
      resetState: () => set({
        selectedDateRange: { start: null, end: null },
        isGeneratingForecast: false,
        forecastGenerated: false,
        dailyDetailsCache: {}, // Reset cache too
        weeklyInsightsCache: {}, // Reset weekly insights cache too
      }),
    }),
    {
      name: 'testing-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Explicitly select ONLY the state to persist
        // Exclude dailyDetailsCache and weeklyInsightsCache
        const { dailyDetailsCache, weeklyInsightsCache, ...rest } = state;
        return {
          ...rest, // Persist everything else
          // Serialize Date objects for localStorage
          selectedDateRange: {
            start: rest.selectedDateRange.start ? rest.selectedDateRange.start.toISOString() : null,
            end: rest.selectedDateRange.end ? rest.selectedDateRange.end.toISOString() : null,
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects on rehydration
          if (state.selectedDateRange) {
            state.selectedDateRange = {
              start: state.selectedDateRange.start ? new Date(state.selectedDateRange.start as unknown as string) : null,
              end: state.selectedDateRange.end ? new Date(state.selectedDateRange.end as unknown as string) : null,
            };
          }
          // Ensure caches start empty even if somehow persisted
          state.dailyDetailsCache = {};
          state.weeklyInsightsCache = {};
        }
      },
    }
  )
); 