import { useNavigate } from "@tanstack/react-router"

import type { ProductSearchParams } from "../catalog.search-params"

import { Button } from "@/components/ui/button"

type ProductPaginationProps = {
  search: Partial<ProductSearchParams>
  total: number
  pageSize: number
}

export function ProductPagination({
  search,
  total,
  pageSize,
}: ProductPaginationProps) {
  const navigate = useNavigate()

  const currentPage = search.page ?? 1

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  )

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return
    }

    navigate({
      to: "/products",
      search: {
        ...search,
        page,
      },
    })
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={currentPage <= 1}
        onClick={() =>
          goToPage(currentPage - 1)
        }
      >
        قبلی
      </Button>

      <span className="text-sm text-muted-foreground">
        صفحه{" "}
        {currentPage.toLocaleString("fa-IR")}{" "}
        از{" "}
        {totalPages.toLocaleString("fa-IR")}
      </span>

      <Button
        type="button"
        variant="outline"
        disabled={
          currentPage >= totalPages
        }
        onClick={() =>
          goToPage(currentPage + 1)
        }
      >
        بعدی
      </Button>
    </div>
  )
}