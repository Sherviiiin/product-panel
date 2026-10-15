import { queryOptions } from "@tanstack/react-query";

import type { SellerDashboardProductsInput, UserDashboardProductsInput } from "../dashboard.schema";

import {
  getSellerDashboardProducts,
  getUserDashboardProducts,
  searchSellerProducts,
  getSellerProductCategories,
  getDashboardProfile,
} from "../server/functions/dashboard.functions";

const DASHBOARD_ROOT_KEY = ["dashboard"] as const;

export const dashboardKeys = {
  all: DASHBOARD_ROOT_KEY,

  userProducts: (input: UserDashboardProductsInput) =>
    [...DASHBOARD_ROOT_KEY, "user-products", input] as const,

  sellerProducts: (input: SellerDashboardProductsInput) =>
    [...DASHBOARD_ROOT_KEY, "seller-products", input] as const,

  sellerProductSearch: (search: string) =>
    [...DASHBOARD_ROOT_KEY, "seller-product-search", search] as const,

  categories: [...DASHBOARD_ROOT_KEY, "categories"] as const,

  profile: [...DASHBOARD_ROOT_KEY, "profile"] as const,
};

export function userDashboardProductsQuery(input: UserDashboardProductsInput) {
  return queryOptions({
    queryKey: dashboardKeys.userProducts(input),

    queryFn: () => getUserDashboardProducts({ data: input }),
  });
}

export function sellerDashboardProductsQuery(input: SellerDashboardProductsInput) {
  return queryOptions({
    queryKey: dashboardKeys.sellerProducts(input),

    queryFn: () => getSellerDashboardProducts({ data: input }),
  });
}

export function sellerProductSearchQuery(search: string) {
  return queryOptions({
    queryKey: dashboardKeys.sellerProductSearch(search),

    queryFn: () => searchSellerProducts({ data: { search } }),
  });
}

export function sellerProductCategoriesQuery() {
  return queryOptions({
    queryKey: dashboardKeys.categories,

    queryFn: () => getSellerProductCategories(),
  });
}

export function dashboardProfileQuery() {
  return queryOptions({
    queryKey: dashboardKeys.profile,

    queryFn: () => getDashboardProfile(),
  });
}
