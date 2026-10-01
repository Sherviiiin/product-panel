import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"

import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router"

import {
  Bookmark,
  Check,
  ChevronLeft,
  Eye,
  Heart,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react"

import {
  productKeys,
  productQuery,
} from "@/features/catalog/queries/product.query"

import {
  toggleProductLike,
  toggleProductSave,
} from "@/features/catalog/server/functions/product.functions"

import type { ProductDetail } from "@/features/catalog/server/domain/product-detail.dto"

import {
  Card,
  CardContent,
  //CardHeader,
  //CardTitle,
} from "@/components/ui/card"

import {
  Button,
  buttonVariants,
} from "@/components/ui/button"

export const Route = createFileRoute("/products/$id")({
  loader: async ({ context, params }) => {
    const id = Number(params.id)

    if (!Number.isInteger(id) || id <= 0) {
      throw notFound()
    }

    const product = await context.queryClient.query({
      ...productQuery(id),
    })

    if (!product) {
      throw notFound()
    }
  },

  component: ProductPage,

  notFoundComponent: () => (
    <main
      dir="rtl"
      className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4"
    >
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Package className="size-7 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">
              محصول پیدا نشد
            </h1>

            <p className="text-sm text-muted-foreground">
              محصول موردنظر وجود ندارد یا حذف شده است.
            </p>
          </div>

          <Link
            to="/products"
            search={{}}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            بازگشت به محصولات
          </Link>
        </CardContent>
      </Card>
    </main>
  ),
})

function ProductPage() {
  const { id } = Route.useParams()

  const productId = Number(id)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: product } = useSuspenseQuery(
    productQuery(productId),
  )

  const likeMutation = useMutation({
    mutationFn: () =>
      toggleProductLike({
        data: {
          id: productId,
        },
      }),

    onSuccess: (result) => {
      queryClient.setQueryData<ProductDetail | null>(
        productKeys.detail(productId),
        (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            isLiked: result.isLiked,
            likesCount: result.likesCount,
          }
        },
      )
    },

    onError: (error) => {
      if (
        error instanceof Error &&
        error.message === "AUTH_REQUIRED"
      ) {
        navigate({
          to: "/auth/login",
        })
      }
    },
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      toggleProductSave({
        data: {
          id: productId,
        },
      }),

    onSuccess: (result) => {
      queryClient.setQueryData<ProductDetail | null>(
        productKeys.detail(productId),
        (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            isSaved: result.isSaved,
            savesCount: result.savesCount,
          }
        },
      )
    },

    onError: (error) => {
      if (
        error instanceof Error &&
        error.message === "AUTH_REQUIRED"
      ) {
        navigate({
          to: "/auth/login",
        })
      }
    },
  })

  if (!product) {
    throw notFound()
  }

  const sellers = [...product.sellers].sort(
    (a, b) =>
      (a.discountPrice ?? a.price) -
      (b.discountPrice ?? b.price),
  )

  const cheapestSeller = sellers[0]

  const cheapestPrice = cheapestSeller
    ? cheapestSeller.discountPrice ??
      cheapestSeller.price
    : null

  return (
    <main
      dir="rtl"
      className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
        <Link
          to="/products"
          search={{}}
          className="shrink-0 transition-colors hover:text-foreground"
        >
          محصولات
        </Link>

        <ChevronLeft className="size-4 shrink-0" />

        <span className="truncate text-foreground">
          {product.name}
        </span>
      </nav>

      {/* Row 1 - Product Information */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Product Main Info */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  <Package className="size-11 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1 space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-2xl font-bold leading-relaxed sm:text-3xl">
                      {product.name}
                    </h1>

                    {product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {product.categories.map(
                          (category) => (
                            <span
                              key={category.id}
                              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {category.name}
                            </span>
                          ),
                        )}
                      </div>
                    )}

                    {product.description ? (
                      <p className="max-w-4xl leading-8 text-muted-foreground">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        توضیحی برای این محصول ثبت نشده است.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant={
                        product.isLiked
                          ? "default"
                          : "outline"
                      }
                      disabled={likeMutation.isPending}
                      onClick={() =>
                        likeMutation.mutate()
                      }
                      className="gap-2"
                    >
                      <Heart
                        className={
                          product.isLiked
                            ? "fill-current"
                            : ""
                        }
                      />

                      {product.isLiked
                        ? "پسندیده‌اید"
                        : "پسندیدن"}

                      <span className="text-xs opacity-70">
                        {product.likesCount.toLocaleString(
                          "fa-IR",
                        )}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant={
                        product.isSaved
                          ? "default"
                          : "outline"
                      }
                      disabled={saveMutation.isPending}
                      onClick={() =>
                        saveMutation.mutate()
                      }
                      className="gap-2"
                    >
                      <Bookmark
                        className={
                          product.isSaved
                            ? "fill-current"
                            : ""
                        }
                      />

                      {product.isSaved
                        ? "ذخیره شده"
                        : "ذخیره"}

                      {product.isSaved && (
                        <Check className="size-3.5" />
                      )}
                    </Button>

                    <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
                      <Eye className="size-4" />

                      {product.viewsCount.toLocaleString(
                        "fa-IR",
                      )}

                      بازدید
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t bg-muted/20 p-6 lg:border-r lg:border-t-0">
              <div className="flex h-full flex-col justify-center gap-5">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    شروع قیمت از
                  </p>

                  {cheapestPrice !== null ? (
                    <p className="text-2xl font-bold">
                      {cheapestPrice.toLocaleString(
                        "fa-IR",
                      )}

                      <span className="mr-1 text-sm font-normal text-muted-foreground">
                        تومان
                      </span>
                    </p>
                  ) : (
                    <p className="font-medium text-muted-foreground">
                      قیمت ثبت نشده
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="size-4" />

                  {sellers.length.toLocaleString(
                    "fa-IR",
                  )}{" "}
                  فروشنده
                </div>

                {cheapestSeller &&
                  cheapestSeller.stock > 0 && (
                    <a
                      href={cheapestSeller.url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({
                        className: "w-full gap-2",
                      })}
                    >
                      <ShoppingBag className="size-4" />
                      خرید با بهترین قیمت
                    </a>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2 lg:[direction:ltr]">
        {/* Left Column - Specs */}
        <section
          dir="rtl"
          className="min-w-0 space-y-3"
        >
          <div>
            <h2 className="text-xl font-bold">
              مشخصات محصول
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              مشخصات فنی و اطلاعات محصول
            </p>
          </div>

          <Card className="h-fit overflow-hidden py-0">
            <CardContent className="p-0">
              {product.specs.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  مشخصاتی برای این محصول ثبت نشده است.
                </div>
              ) : (
                <div>
                  {product.specs.map(
                    (spec, index) => (
                      <div
                        key={`${spec.key}-${index}`}
                        className="grid grid-cols-[130px_1fr] border-b last:border-b-0 sm:grid-cols-[170px_1fr]"
                      >
                        <div className="bg-muted/40 px-4 py-4 text-sm font-medium">
                          {spec.key}
                        </div>

                        <div className="break-words px-4 py-4 text-sm">
                          {spec.value}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Right Column - Sellers */}
        <section
          dir="rtl"
          className="min-w-0 space-y-3"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                فروشندگان
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                مرتب‌شده بر اساس کمترین قیمت نهایی
              </p>
            </div>

            <span className="shrink-0 text-sm text-muted-foreground">
              {sellers.length.toLocaleString(
                "fa-IR",
              )}{" "}
              فروشنده
            </span>
          </div>

          {sellers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                فروشنده‌ای برای این محصول ثبت نشده است.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sellers.map(
                (seller, index) => {
                  const finalPrice =
                    seller.discountPrice ??
                    seller.price

                  const hasDiscount =
                    seller.discountPrice !== null

                  return (
                    <Card
                      key={seller.id}
                      className={
                        index === 0
                          ? "border-primary/40"
                          : ""
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Store className="size-5 text-muted-foreground" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-semibold">
                                  {seller.shopName}
                                </p>

                                {index === 0 && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    بهترین قیمت
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {seller.stock > 0
                                  ? `موجودی ${seller.stock.toLocaleString(
                                      "fa-IR",
                                    )}`
                                  : "ناموجود"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-end justify-between gap-4 border-t pt-3">
                            <div>
                              {hasDiscount && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {seller.price.toLocaleString(
                                    "fa-IR",
                                  )}{" "}
                                  تومان
                                </p>
                              )}

                              <p className="font-bold">
                                {finalPrice.toLocaleString(
                                  "fa-IR",
                                )}{" "}
                                <span className="text-xs font-normal text-muted-foreground">
                                  تومان
                                </span>
                              </p>
                            </div>

                            {seller.stock > 0 ? (
                              <a
                                href={seller.url}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants({
                                  size: "sm",
                                })}
                              >
                                خرید
                              </a>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled
                              >
                                ناموجود
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                },
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}