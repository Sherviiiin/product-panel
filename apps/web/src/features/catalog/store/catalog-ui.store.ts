import { create } from "zustand"

type CatalogUiState = {
  isFilterOpen: boolean
  toggleFilter: () => void
  closeFilter: () => void
}

export const useCatalogUiStore = create<CatalogUiState>((set) => ({
  isFilterOpen: false,

  toggleFilter: () => set((state) => ({
    isFilterOpen:
      !state.isFilterOpen,
  })),
  
  closeFilter: () => set({
    isFilterOpen: false,
  }),
}))