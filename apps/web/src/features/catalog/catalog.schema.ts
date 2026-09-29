import { array, z } from "zod"

export const getProductSchema = z.object({
  id: z.number().int().positive(),
})

export const productsListSchema = z.object({
  page: z.number().int().min(1).default(1),

  pageSize: z.number().int().min(1).max(100).default(12),

  search: z.string().trim().max(100).optional(),

  categoryIds: array(z.number().int().positive()).min(1).optional(),

  minPrice: z.number().int().min(500_000).max(200_000_000).optional(),
  maxPrice: z.number().int().min(500_000).max(200_000_000).optional(),

  sortBy: z.enum(["name", "likesCount", "viewsCount", "savesCount", "minPrice"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export const productSearchFormSchema = z.object({
  search: z.string().trim().min(1, "عبارت جست و جو را وارد کنید").max(100, "عبارت جست و جو می تواند حداکثر 100 کاراکتر باشد"),
})



export type GetProductInput = z.infer<typeof getProductSchema>
export type ProductsListInput = z.infer<typeof productsListSchema>
export type ProductSearchFormInput = z.input<typeof productSearchFormSchema>
