import {
  useMemo,
  type ReactNode,
} from "react"

import {
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import type {
  ColumnDef,
} from "@tanstack/react-table"

import {
  useNavigate,
} from "@tanstack/react-router"

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react"

import type {
  DashboardProduct,
  DashboardProductSortBy,
  DashboardSortOrder,
} from "../dashboard.schema"

import { Button } from "@/components/ui/button"

const features = tableFeatures({})

type DashboardProductsTableProps = {
  products: DashboardProduct[]

  sortBy?:
    DashboardProductSortBy

  sortOrder?:
    DashboardSortOrder

  onSort: (
    sortBy: DashboardProductSortBy,
  ) => void

  renderActions?: (
    product: DashboardProduct,
  ) => ReactNode
}

function SortHeader({
  column,
  children,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: DashboardProductSortBy
  children: ReactNode
  sortBy?: DashboardProductSortBy
  sortOrder?: DashboardSortOrder
  onSort: (sortBy: DashboardProductSortBy) => void
}) {
  const active = sortBy === column

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-mr-3 gap-1.5"
      onClick={() => onSort(column)}
    >
      {children}

      {!active ? (
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
      ) : sortOrder === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : (
        <ArrowDown className="size-3.5" />
      )}
    </Button>
  )
}

export function DashboardProductsTable({
  products,
  sortBy,
  sortOrder,
  onSort,
  renderActions,
}: DashboardProductsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo<
    Array<
      ColumnDef<
        typeof features,
        DashboardProduct
      >
    >
  >(
    () => [
      {
        accessorKey: "name",

        header: () => (
          <SortHeader column="name"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          >
            محصول
          </SortHeader>
        ),

        cell: (info) => (
          <div className="min-w-[180px]">
            <p className="font-medium">
              {info.row.original.name}
            </p>

            {info.row.original.description && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {
                  info.row.original
                    .description
                }
              </p>
            )}
          </div>
        ),
      },

      {
        accessorKey: "minPrice",

        header: () => (
          <SortHeader column="minPrice"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          >
            قیمت
          </SortHeader>
        ),

        cell: (info) => {
          const price =
            info.row.original
              .minPrice

          if (price === null) {
            return (
              <span className="text-muted-foreground">
                —
              </span>
            )
          }

          return (
            <span className="whitespace-nowrap">
              {price.toLocaleString(
                "fa-IR",
              )}{" "}
              تومان
            </span>
          )
        },
      },

      {
        accessorKey: "sellerCount",
        header: "فروشنده",

        cell: (info) =>
          info.row.original.sellerCount.toLocaleString(
            "fa-IR",
          ),
      },

      {
        accessorKey: "likesCount",

        header: () => (
          <SortHeader column="likesCount"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          >
            لایک
          </SortHeader>
        ),

        cell: (info) =>
          info.row.original.likesCount.toLocaleString(
            "fa-IR",
          ),
      },

      {
        accessorKey: "viewsCount",

        header: () => (
          <SortHeader column="viewsCount"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          >
            بازدید
          </SortHeader>
        ),

        cell: (info) =>
          info.row.original.viewsCount.toLocaleString(
            "fa-IR",
          ),
      },

      {
        accessorKey: "savesCount",

        header: () => (
          <SortHeader column="savesCount"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          >
            ذخیره
          </SortHeader>
        ),

        cell: (info) =>
          info.row.original.savesCount.toLocaleString(
            "fa-IR",
          ),
      },

      ...(renderActions
        ? [
            {
              id: "actions",
              header: "عملیات",

              cell: (info) => renderActions(info.row.original),
            } satisfies ColumnDef<
              typeof features,
              DashboardProduct
            >,
          ]
        : []),
    ],
    [
      renderActions,
      sortBy,
      sortOrder,
      onSort,
    ],
  )

  const table = useTable({
    key: "dashboard-products",

    features,
    columns,
    data: products,
  })

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[850px]">
        <thead className="border-b bg-muted/40">
          {table
            .getHeaderGroups()
            .map(
              (
                headerGroup,
              ) => (
                <tr
                  key={
                    headerGroup.id
                  }
                >
                  {headerGroup.headers.map(
                    (header) => (
                      <th
                        key={
                          header.id
                        }
                        className="h-12 px-4 text-right text-sm font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : (
                            <table.FlexRender
                              header={
                                header
                              }
                            />
                          )}
                      </th>
                    ),
                  )}
                </tr>
              ),
            )}
        </thead>

        <tbody>
          {table.getRowModel()
            .rows.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length
                }
                className="h-32 text-center text-sm text-muted-foreground"
              >
                محصولی پیدا نشد.
              </td>
            </tr>
          ) : (
            table
              .getRowModel()
              .rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/40"
                  onClick={() => {
                    navigate({
                      to: "/products/$id",
                      params: {
                        id: String(
                          row
                            .original
                            .id,
                        ),
                      },
                    })
                  }}
                >
                  {row
                    .getAllCells()
                    .map(
                      (cell) => (
                        <td
                          key={
                            cell.id
                          }
                          className="px-4 py-4 text-sm"
                        >
                          <table.FlexRender
                            cell={
                              cell
                            }
                          />
                        </td>
                      ),
                    )}
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  )
}