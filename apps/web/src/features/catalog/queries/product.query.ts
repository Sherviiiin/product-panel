import { queryOptions } from "@tanstack/react-query"

import type { ProductsListInput } from "../catalog.schema"

import { getProduct, searchProducts } from "../server/functions/product.functions"

export const productKeys = {
  all: ["products"] as const,

  detail: (id: number) => [...productKeys.all, "detail", id] as const,
  // ["products", "detail", 10] مثل این

  search: (params: ProductsListInput) => [...productKeys.all, "search", params] as const,
}

export function productQuery(id: number) {
  return queryOptions({
    queryKey: productKeys.detail(id),
    // queryKey: ["products", "detail", 10] مثل این

    queryFn: () =>
      getProduct({
        data: { id },
      }),
  })
}

export function productsQuery(params: ProductsListInput) {
  return queryOptions({
    queryKey: productKeys.search(params),

    queryFn: () =>
      searchProducts({
        data: params,
      }),
  })
}