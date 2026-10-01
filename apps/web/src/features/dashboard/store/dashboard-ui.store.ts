import {
  create,
} from "zustand"

import {
  persist,
} from "zustand/middleware"

export type UserDashboardTab =
  | "saved"
  | "liked"
  | "viewed"

export type SellerDashboardTab =
  | "listed"
  | "saved"
  | "liked"
  | "viewed"

type DashboardUiState = {
  userTab: UserDashboardTab
  sellerTab: SellerDashboardTab

  setUserTab: (
    tab: UserDashboardTab,
  ) => void

  setSellerTab: (
    tab: SellerDashboardTab,
  ) => void
}

export const useDashboardUiStore =
  create<DashboardUiState>()(
    persist(
      (set) => ({
        userTab: "saved",

        sellerTab: "listed",

        setUserTab: (tab) =>
          set({
            userTab: tab,
          }),

        setSellerTab: (tab) =>
          set({
            sellerTab: tab,
          }),
      }),
      {
        name:
          "dashboard-ui",
      },
    ),
  )