import {
  useState,
} from "react"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  Bookmark,
  Eye,
  Heart,
  PackageOpen,
  Search,
  Plus
} from "lucide-react"

import type {
  DashboardProductSortBy,
  DashboardSortOrder,
  SellerDashboardProductsInput,
  SellerListedProduct,
} from "../dashboard.schema"

import {
  dashboardKeys,
  sellerDashboardProductsQuery,
  userDashboardProductsQuery,
} from "../queries/dashboard.query"

import {
  useDashboardUiStore,
} from "../store/dashboard-ui.store"

import {
  DashboardProductsTable,
} from "./dashboard-products-table"
import {
  SellerListedProductsTable,
} from "./seller-listed-products-table"
import {
  SellerListingEditDialog,
} from "./seller-listing-edit-dialog"
import {
  SellerAddProductDialog,
} from "./seller-add-product-dialog"

import {
  deleteSellerListing,
} from "../server/functions/dashboard.functions"

import {
  toggleProductLike,
  toggleProductSave,
} from "@/features/catalog/server/functions/product.functions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 10

type SellerSortBy =
  NonNullable<
    SellerDashboardProductsInput["sortBy"]
  >

const sellerTabs = [
  {
    value: "viewed",
    label: "دیده‌شده‌ها",
    icon: Eye,
  },
  {
    value: "liked",
    label: "لایک‌شده‌ها",
    icon: Heart,
  },
  {
    value: "saved",
    label: "ذخیره‌شده‌ها",
    icon: Bookmark,
  },
  {
    value: "listed",
    label: "محصولات من",
    icon: PackageOpen,
  },
] as const

export function SellerDashboard() {
  const queryClient = useQueryClient()

  const [editingListing, setEditingListing] = useState<SellerListedProduct | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)

  const sellerTab =
    useDashboardUiStore(
      (state) =>
        state.sellerTab,
    )

  const setSellerTab =
    useDashboardUiStore(
      (state) =>
        state.setSellerTab,
    )

  const [
    searchText,
    setSearchText,
  ] = useState("")

  const [
    search,
    setSearch,
  ] = useState("")

  const [page, setPage] =
    useState(1)

  const [
    commonSortBy,
    setCommonSortBy,
  ] =
    useState<
      DashboardProductSortBy | undefined
    >(undefined)

  const [
    sellerSortBy,
    setSellerSortBy,
  ] =
    useState<
      SellerSortBy | undefined
    >(undefined)

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState<
      DashboardSortOrder | undefined
    >(undefined)

  const commonInput =
    sellerTab !== "listed"
      ? {
          type: sellerTab,
          page,
          pageSize:
            PAGE_SIZE,
          search:
            search ||
            undefined,
          sortBy:
            commonSortBy,
          sortOrder,
        }
      : {
          type:
            "viewed" as const,
          page: 1,
          pageSize:
            PAGE_SIZE,
        }

  const sellerInput: SellerDashboardProductsInput =
    {
      page,
      pageSize: PAGE_SIZE,
      search:
        search ||
        undefined,
      sortBy:
        sellerSortBy,
      sortOrder,
    }

  const commonQuery =
    useQuery({
      ...userDashboardProductsQuery(
        commonInput,
      ),

      enabled:
        sellerTab !==
        "listed",
    })

  const listedQuery =
    useQuery({
      ...sellerDashboardProductsQuery(
        sellerInput,
      ),

      enabled:
        sellerTab ===
        "listed",
    })

  const deleteMutation =
    useMutation({
      mutationFn: (
        listingId: number,
      ) =>
        deleteSellerListing({
          data: {
            listingId,
          },
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.all,
        })
      },
    })

  const likeMutation =
    useMutation({
      mutationFn: (
        productId: number,
      ) =>
        toggleProductLike({
          data: {
            id: productId,
          },
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.all,
        })
      },
    })

  const saveMutation =
    useMutation({
      mutationFn: (
        productId: number,
      ) =>
        toggleProductSave({
          data: {
            id: productId,
          },
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            dashboardKeys.all,
        })
      },
    })

  const total =
    sellerTab === "listed"
      ? listedQuery.data
          ?.total ?? 0
      : commonQuery.data
          ?.total ?? 0

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / PAGE_SIZE,
      ),
    )

  function changeTab(
    tab:
      | "listed"
      | "saved"
      | "liked"
      | "viewed",
  ) {
    setSellerTab(tab)

    setPage(1)
    setSearch("")
    setSearchText("")
    setCommonSortBy(
      undefined,
    )
    setSellerSortBy(
      undefined,
    )
    setSortOrder(
      undefined,
    )
  }

  function submitSearch() {
    setSearch(
      searchText.trim(),
    )

    setPage(1)
  }

  function handleCommonSort(
    column:
      DashboardProductSortBy,
  ) {
    setPage(1)

    if (
      commonSortBy === column
    ) {
      setSortOrder(
        sortOrder === "asc"
          ? "desc"
          : "asc",
      )

      return
    }

    setCommonSortBy(
      column,
    )

    setSortOrder(
      column === "name" ||
        column === "minPrice"
        ? "asc"
        : "desc",
    )
  }

  function handleSellerSort(
    column: SellerSortBy,
  ) {
    setPage(1)

    if (
      sellerSortBy === column
    ) {
      setSortOrder(
        sortOrder === "asc"
          ? "desc"
          : "asc",
      )

      return
    }

    setSellerSortBy(column)

    setSortOrder(
      column === "name"
        ? "asc"
        : "desc",
    )
  }

  function renderCommonActions(
    productId: number,
  ) {
    if (sellerTab === "liked") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            likeMutation.isPending &&
            likeMutation.variables ===
              productId
          }
          onClick={() =>
            likeMutation.mutate(
              productId,
            )
          }
        >
          حذف لایک
        </Button>
      )
    }

    if (sellerTab === "saved") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            saveMutation.isPending &&
            saveMutation.variables ===
              productId
          }
          onClick={() =>
            saveMutation.mutate(
              productId,
            )
          }
        >
          حذف از ذخیره‌ها
        </Button>
      )
    }

    return null
  }

  function editListing(
    product:
      SellerListedProduct,
  ) {
    // مرحله بعد:
    // Edit Dialog
    setEditingListing(product)
  }

  function removeListing(
    product:
      SellerListedProduct,
  ) {
    const confirmed =
      window.confirm(
        `لیست "${product.name}" حذف شود؟`,
      )

    if (!confirmed) {
      return
    }

    deleteMutation.mutate(
      product.listingId,
    )
  }

  const isPending =
    sellerTab === "listed"
      ? listedQuery.isPending
      : commonQuery.isPending

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            داشبورد فروشنده
          </h1>
      
          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت فروشگاه و فعالیت‌های شما
          </p>
        </div>
      
        {sellerTab ===
          "listed" && (
          <Button
            type="button"
            className="gap-2"
            onClick={() =>
              setAddProductOpen(
                true,
              )
            }
          >
            <Plus className="size-4" />
      
            افزودن محصول
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 overflow-hidden rounded-lg border">
        {sellerTabs.map(
          (tab) => {
            const Icon =
              tab.icon

            const active =
              sellerTab ===
              tab.value

            return (
              <button
                key={
                  tab.value
                }
                type="button"
                onClick={() =>
                  changeTab(
                    tab.value,
                  )
                }
                className={`flex h-16 flex-col items-center justify-center gap-1 border-l text-center text-xs font-medium transition-colors sm:h-12 sm:flex-row sm:gap-2 sm:text-sm ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                <Icon className="size-4" />

                {tab.label}
              </button>
            )
          },
        )}
      </div>

      {/* Search */}
      <form
        className="flex gap-2"
        onSubmit={(
          event,
        ) => {
          event.preventDefault()

          submitSearch()
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={
              searchText
            }
            onChange={(
              event,
            ) =>
              setSearchText(
                event.target
                  .value,
              )
            }
            placeholder="جستجو در محصولات..."
            className="pr-10"
          />
        </div>

        <Button type="submit">
          جستجو
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total.toLocaleString(
          "fa-IR",
        )}{" "}
        محصول
      </p>

      {/* Table */}
      {isPending ? (
        <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
          در حال دریافت اطلاعات...
        </div>
      ) : sellerTab ===
        "listed" ? (
        <SellerListedProductsTable
          products={
            listedQuery.data
              ?.items ?? []
          }
          sortBy={
            sellerSortBy
          }
          sortOrder={
            sortOrder
          }
          onSort={
            handleSellerSort
          }
          onEdit={
            editListing
          }
          onDelete={
            removeListing
          }
          deletingListingId={
            deleteMutation.isPending
              ? deleteMutation
                  .variables
              : undefined
          }
        />
      ) : (
        <DashboardProductsTable
          products={
            commonQuery.data
              ?.items ?? []
          }
          sortBy={
            commonSortBy
          }
          sortOrder={
            sortOrder
          }
          onSort={
            handleCommonSort
          }
          renderActions={(
            product,
          ) =>
            renderCommonActions(
              product.id,
            )
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={
              page <= 1
            }
            onClick={() =>
              setPage(
                (value) =>
                  value - 1,
              )
            }
          >
            قبلی
          </Button>

          <span className="text-sm text-muted-foreground">
            صفحه{" "}
            {page.toLocaleString(
              "fa-IR",
            )}{" "}
            از{" "}
            {totalPages.toLocaleString(
              "fa-IR",
            )}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={
              page >=
              totalPages
            }
            onClick={() =>
              setPage(
                (value) =>
                  value + 1,
              )
            }
          >
            بعدی
          </Button>
        </div>
      )}

      <SellerListingEditDialog
        product={
          editingListing
        }
        open={
          editingListing !== null
        }
        onOpenChange={(open) => {
          if (!open) {
            setEditingListing(
              null,
            )
          }
        }}
      />

      <SellerAddProductDialog
        open={addProductOpen}
        onOpenChange={
          setAddProductOpen
        }
      />
    </div>
  )
}