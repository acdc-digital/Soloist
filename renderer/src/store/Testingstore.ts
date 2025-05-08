import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface TestingStore {
  // Date selection state
  selectedDateRange: DateRange;
  setSelectedDateRange: (range: DateRange) => void;
  
  // Forecast generation state
  isGeneratingForecast: boolean;
  forecastGenerated: boolean;
  setIsGeneratingForecast: (isGenerating: boolean) => void;
  setForecastGenerated: (generated: boolean) => void;
  
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
      
      // Actions
      setSelectedDateRange: (range) => set({ selectedDateRange: range }),
      setIsGeneratingForecast: (isGenerating) => set({ isGeneratingForecast: isGenerating }),
      setForecastGenerated: (generated) => set({ forecastGenerated: generated }),
      
      // Reset all state
      resetState: () => set({
        selectedDateRange: { start: null, end: null },
        isGeneratingForecast: false,
        forecastGenerated: false,
      }),
    }),
    {
      name: 'testing-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        selectedDateRange: {
          start: state.selectedDateRange.start ? state.selectedDateRange.start.toISOString() : null,
          end: state.selectedDateRange.end ? state.selectedDateRange.end.toISOString() : null,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects
          if (state.selectedDateRange) {
            state.selectedDateRange = {
              start: state.selectedDateRange.start ? new Date(state.selectedDateRange.start as unknown as string) : null,
              end: state.selectedDateRange.end ? new Date(state.selectedDateRange.end as unknown as string) : null,
            };
          }
        }
      },
    }
  )
); 