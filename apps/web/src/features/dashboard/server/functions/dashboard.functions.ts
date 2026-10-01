import { createServerFn } from "@tanstack/react-start"

import { sellerDashboardProductsSchema, userDashboardProductsSchema,
  deleteSellerListingSchema, updateSellerListingSchema,
  createSellerListingSchema, createSellerProductSchema, searchSellerProductsSchema,
  updateSellerDashboardProfileSchema, updateUserDashboardProfileSchema,
} from "../../dashboard.schema"

import { useAuthSession } from "@/features/auth/server/auth.session.server"

import { dashboardService } from "../dashboard.service.server"

export const getUserDashboardProducts = createServerFn({method: "GET"})
.validator(userDashboardProductsSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId) {
    throw new Error("AUTH_REQUIRED")
  }

  return dashboardService.getUserProducts(userId, data)
})

export const getSellerDashboardProducts = createServerFn({method: "GET"})
.validator(sellerDashboardProductsSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId) {
    throw new Error("AUTH_REQUIRED")
  }
  if (session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }
  
  return dashboardService.getSellerProducts(userId, data)
})

export const updateSellerListing = createServerFn({method: "POST"})
.validator(updateSellerListingSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId) {
    throw new Error("AUTH_REQUIRED")
  }
  if (session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }

  return dashboardService.updateSellerListing(userId, data)
})

export const deleteSellerListing = createServerFn({method: "POST"})
.validator(deleteSellerListingSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId =
    session.data.userId

  if (!userId) {
    throw new Error("AUTH_REQUIRED")
  }
  if (session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }

  return dashboardService.deleteSellerListing(userId, data.listingId)
})

export const searchSellerProducts = createServerFn({method: "GET"})
.validator(searchSellerProductsSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId || session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }

  return dashboardService.searchProductsForSeller(userId, data.search)
})

export const createSellerListing = createServerFn({method: "POST"})
.validator(createSellerListingSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId || session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }

  return dashboardService.createSellerListing(userId, data)
})

export const createSellerProduct = createServerFn({method: "POST"})
.validator(createSellerProductSchema).handler(async ({ data }) => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId || session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }

  return dashboardService.createSellerProduct(userId, data)
})

export const getSellerProductCategories = createServerFn({method: "GET",})
.handler(async () => {
  const session = await useAuthSession()

  const userId = session.data.userId

  if (!userId || session.data.activeRole !== "seller") {
    throw new Error("FORBIDDEN")
  }

  return dashboardService.getProductCategories()
})

export const getDashboardProfile =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    const session =
      await useAuthSession()

    const userId =
      session.data.userId

    if (!userId) {
      throw new Error(
        "AUTH_REQUIRED",
      )
    }

    return dashboardService.getProfile(
      userId,
    )
  })

export const updateDashboardUserProfile =
  createServerFn({
    method: "POST",
  })
    .validator(
      updateUserDashboardProfileSchema,
    )
    .handler(
      async ({
        data,
      }) => {
        const session =
          await useAuthSession()

        const userId =
          session.data.userId

        if (!userId) {
          throw new Error(
            "AUTH_REQUIRED",
          )
        }

        await dashboardService.updateUserProfile(
          userId,
          data,
        )

        return {
          success: true,
        }
      },
    )

export const updateDashboardSellerProfile =
  createServerFn({
    method: "POST",
  })
    .validator(
      updateSellerDashboardProfileSchema,
    )
    .handler(
      async ({
        data,
      }) => {
        const session =
          await useAuthSession()

        const userId =
          session.data.userId

        if (
          !userId ||
          session.data
            .activeRole !==
            "seller"
        ) {
          throw new Error(
            "FORBIDDEN",
          )
        }

        await dashboardService.updateSellerProfile(
          userId,
          data,
        )

        return {
          success: true,
        }
      },
    )