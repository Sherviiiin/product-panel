import { z } from "zod"

export const userDashboardProductsSchema = z.object({
  type: z.enum(["viewed","liked","saved"]),

  page: z.number().int().min(1).default(1),

  pageSize: z.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(100).optional(),

  sortBy: z.enum(["name", "likesCount", "viewsCount", "savesCount", "minPrice"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export const userDashboardSearchSchema = z.object({
  type: z.enum(["viewed","liked","saved"]).catch("viewed"),

  page: z.coerce.number().int().min(1).catch(1),
})

export type UserDashboardSearch = z.infer<typeof userDashboardSearchSchema>
export type UserDashboardProductsInput = z.infer<typeof userDashboardProductsSchema>

export type DashboardProductSortBy =
  | "name"
  | "likesCount"
  | "viewsCount"
  | "savesCount"
  | "minPrice"
export type DashboardSortOrder =
  | "asc"
  | "desc"
export interface DashboardProduct {
  id: number
  name: string
  description: string | null
  likesCount: number
  viewsCount: number
  savesCount: number
  minPrice: number | null
  sellerCount: number
}
export interface DashboardProductsResult {
  items: DashboardProduct[]
  total: number
}

export const sellerDashboardProductsSchema = z.object({
  page: z.number().int().min(1).default(1),
  
  pageSize: z.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(100).optional(),

  sortBy: z.enum(["name", "price", "discountPrice", "stock"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
})
export type SellerDashboardProductsInput = z.infer<typeof sellerDashboardProductsSchema>
export interface SellerListedProduct {
  listingId: number
  productId: number

  name: string
  description: string | null

  price: number
  discountPrice: number | null
  stock: number
  url: string

  likesCount: number
  viewsCount: number
  savesCount: number
}
export interface SellerProductsResult {
  items: SellerListedProduct[]
  total: number
}


export const updateSellerListingSchema = z.object({
  listingId: z.number().int().positive(),

  price: z.number().int().positive(),

  discountPrice: z.number().int().positive().nullable(),

  stock: z.number().int().min(0),

  url: z.string().trim().url().max(2048),
  
}).refine((data) => data.discountPrice === null || data.discountPrice <= data.price,
  {
    message: "قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد",
    path: ["discountPrice"],
  },
)
export type UpdateSellerListingInput = z.infer<typeof updateSellerListingSchema>
export const deleteSellerListingSchema = z.object({

  listingId: z.number().int().positive()
})


export const searchSellerProductsSchema =
  z.object({
    search: z
      .string()
      .trim()
      .min(1)
      .max(100),
  })

export const createSellerListingSchema =
  z
    .object({
      productId: z
        .number()
        .int()
        .positive(),

      price: z
        .number()
        .int()
        .positive(),

      discountPrice: z
        .number()
        .int()
        .positive()
        .nullable(),

      stock: z
        .number()
        .int()
        .min(0),

      url: z
        .string()
        .trim()
        .url()
        .max(2048),
    })
    .refine(
      (data) =>
        data.discountPrice === null ||
        data.discountPrice <= data.price,
      {
        message:
          "قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد",
        path: ["discountPrice"],
      },
    )

export type CreateSellerListingInput =
  z.infer<
    typeof createSellerListingSchema
  >

export const createSellerProductSchema = z.object({
  name: z.string().trim().min(2).max(255),

  description: z.string().trim().max(2000).nullable(),

  categoryIds: z.array(z.number().int().positive()).min(1, "حداقل یک دسته‌بندی انتخاب کنید")
  .refine((ids) => new Set(ids).size === ids.length,
    "دسته‌بندی تکراری مجاز نیست"
  ),

  specs: z.array(
    z.object({
      key: z.string().trim().min(1).max(100),
      value: z.string().trim().min(1).max(500),
    })
  ),

  price: z.number().int().positive(),

  discountPrice: z.number().int().positive().nullable(),

  stock: z.number().int().min(0),

  url: z.string().trim().url().max(2048)

}).refine((data) => data.discountPrice === null || data.discountPrice <= data.price,
  {
    message: "قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد",
    path: ["discountPrice"],
  },
)
export type CreateSellerProductInput = z.infer<typeof createSellerProductSchema>


const optionalProfileUrlSchema = z.union([
  z.literal(""),

  z.string().trim().url("لینک تصویر معتبر نیست").max(500),
])

export const updateUserDashboardProfileSchema = z.object({
  fullName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد",).max(150),

  username: z.string().trim().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد",).max(100),

  avatar: optionalProfileUrlSchema,

  cityId: z.number().int().positive().nullable(),
})

export type UpdateUserDashboardProfileInput = z.infer<typeof updateUserDashboardProfileSchema>

export const updateSellerDashboardProfileSchema = updateUserDashboardProfileSchema.extend({
  shopName: z.string().trim().min(2, "نام فروشگاه باید حداقل ۲ کاراکتر باشد",).max(150),

  sellerAvatar: optionalProfileUrlSchema,

  sellerCityId: z.number().int().positive().nullable(),

  sellerTypeId: z.number().int().positive(),
})

export type UpdateSellerDashboardProfileInput = z.infer<typeof updateSellerDashboardProfileSchema>

export interface DashboardProfile {
  email: string
  phone: string

  fullName: string
  username: string
  avatar: string | null
  cityId: number | null

  seller: {
    shopName: string
    avatar: string | null
    cityId: number | null
    sellerTypeId: number
  } | null

  cities: {
    id: number
    province: string
    city: string
  }[]

  sellerTypes: {
    id: number
    name: string
  }[]
}