import { useMemo } from "react";

import { tableFeatures, useTable } from "@tanstack/react-table";

import type { ColumnDef } from "@tanstack/react-table";

import { useNavigate } from "@tanstack/react-router";

import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";

import type { SellerDashboardProductsInput, SellerListedProduct } from "../dashboard.schema";

import { Button } from "@/components/ui/button";

const features = tableFeatures({});

type SellerSortBy = NonNullable<SellerDashboardProductsInput["sortBy"]>;

type Props = {
  products: SellerListedProduct[];

  sortBy?: SellerSortBy;

  sortOrder?: "asc" | "desc";

  onSort: (column: SellerSortBy) => void;

  onEdit: (product: SellerListedProduct) => void;

  onDelete: (product: SellerListedProduct) => void;

  deletingListingId?: number;
};

function SortHeader({
  column,
  children,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: SellerSortBy;
  children: React.ReactNode;
  sortBy?: SellerSortBy;
  sortOrder?: "asc" | "desc";
  onSort: (column: SellerSortBy) => void;
}) {
  const active = sortBy === column;

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
  );
}

export function SellerListedProductsTable({
  products,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  deletingListingId,
}: Props) {
  const navigate = useNavigate();

  const columns = useMemo<Array<ColumnDef<typeof features, SellerListedProduct>>>(
    () => [
      {
        accessorKey: "name",

        header: () => (
          <SortHeader column="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            محصول
          </SortHeader>
        ),

        cell: (info) => (
          <div className="min-w-[180px]">
            <p className="font-medium">{info.row.original.name}</p>

            {info.row.original.description && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {info.row.original.description}
              </p>
            )}
          </div>
        ),
      },

      {
        accessorKey: "price",

        header: () => (
          <SortHeader column="price" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            قیمت
          </SortHeader>
        ),

        cell: (info) => (
          <span className="whitespace-nowrap">
            {info.row.original.price.toLocaleString("fa-IR")} تومان
          </span>
        ),
      },

      {
        accessorKey: "discountPrice",

        header: () => (
          <SortHeader column="discountPrice" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            قیمت تخفیف
          </SortHeader>
        ),

        cell: (info) => {
          const value = info.row.original.discountPrice;

          return value === null ? "—" : `${value.toLocaleString("fa-IR")} تومان`;
        },
      },

      {
        accessorKey: "stock",

        header: () => (
          <SortHeader column="stock" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            موجودی
          </SortHeader>
        ),

        cell: (info) => info.row.original.stock.toLocaleString("fa-IR"),
      },

      {
        id: "actions",
        header: "عملیات",

        cell: (info) => {
          const product = info.row.original;

          return (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(product);
                }}
              >
                <Pencil className="size-3.5" />
                ویرایش
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive"
                disabled={deletingListingId === product.listingId}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(product);
                }}
              >
                <Trash2 className="size-3.5" />
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingListingId, onDelete, onEdit, onSort, sortBy, sortOrder],
  );

  const table = useTable({
    key: "seller-listed-products",

    features,
    columns,
    data: products,
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[800px]">
        <thead className="border-b bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-12 px-4 text-right text-sm font-medium">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                محصولی لیست نشده است.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/40"
                onClick={() => {
                  navigate({
                    to: "/products/$id",
                    params: {
                      id: String(row.original.productId),
                    },
                  });
                }}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
