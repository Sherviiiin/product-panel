import { PackageSearch } from "lucide-react"

import type { ProductSearchItem } from "../server/application/search-products"

import { ProductCard } from "./product-card"

type ProductGridProps = {
  products: ProductSearchItem[]
}

export function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="size-6 text-muted-foreground" />
        </div>

        <h3 className="mt-4 font-semibold">
          محصولی پیدا نشد
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          عبارت جستجو یا فیلترها را تغییر دهید.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map(
        (product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ),
      )}
    </div>
  )
}