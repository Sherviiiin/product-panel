import { Link } from "@tanstack/react-router"
import {
  Bookmark,
  Eye,
  Heart,
  Store,
} from "lucide-react"

import type { ProductSearchItem } from "../server/application/search-products"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

import { buttonVariants } from "@/components/ui/button"

import { useMutation } from "@tanstack/react-query"

import { recordProductView } from "../server/functions/product.functions"

type ProductCardProps = {
  product: ProductSearchItem
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const viewMutation = useMutation({
    mutationFn: () => recordProductView({
      data: {
        id: product.id,
      },
    }),
  })

  return (
    <Card className="h-full overflow-hidden py-0">
      <CardContent className="flex h-full flex-col p-0">

        {/* Title + Description */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold leading-7 sm:line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-muted-foreground sm:block">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="border-t px-4 py-3">
          {product.minPrice !== null ? (
            <div>
              <span className="text-xs text-muted-foreground">
                شروع قیمت از
              </span>

              <p className="mt-1 font-bold">
                {product.minPrice.toLocaleString(
                  "fa-IR",
                )}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  تومان
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              قیمت ثبت نشده
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-t">
          <div className="flex flex-col items-center justify-center gap-1 border-l px-1 py-3">
            <Eye className="size-4 text-muted-foreground" />

            <span className="text-xs">
              {product.viewsCount.toLocaleString(
                "fa-IR",
              )}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 border-l px-1 py-3">
            <Heart className="size-4 text-muted-foreground" />

            <span className="text-xs">
              {product.likesCount.toLocaleString(
                "fa-IR",
              )}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 border-l px-1 py-3">
            <Bookmark className="size-4 text-muted-foreground" />

            <span className="text-xs">
              {product.savesCount.toLocaleString(
                "fa-IR",
              )}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 px-1 py-3">
            <Store className="size-4 text-muted-foreground" />

            <span className="text-xs">
              {product.sellerCount.toLocaleString(
                "fa-IR",
              )}
            </span>
          </div>
        </div>

        {/* Bottom CTA - completely attached to card borders */}
        <Link
          to="/products/$id"
          params={{
            id: String(product.id),
          }}
          onClick={() => {
            viewMutation.mutate()
          }}
          className={buttonVariants({
            variant: "secondary",
            className:
              "h-11 w-full rounded-none",
          })}
        >
          مشاهده محصول
        </Link>
      </CardContent>
    </Card>
  )
}