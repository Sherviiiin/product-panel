import {
  useEffect,
  useState,
} from "react"

import { useNavigate } from "@tanstack/react-router"

import {
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react"

import type { ProductSearchParams } from "../catalog.search-params"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MIN_PRICE = 500_000
const MAX_PRICE = 200_000_000

type SortValue =
  | "none"
  | "minPrice-asc"
  | "minPrice-desc"
  | "likesCount-desc"
  | "viewsCount-desc"
  | "savesCount-desc"

const SORT_OPTIONS = [
  {
    value: "none",
    label: "بدون مرتب‌سازی",
  },
  {
    value: "minPrice-asc",
    label: "قیمت: کم به زیاد",
  },
  {
    value: "minPrice-desc",
    label: "قیمت: زیاد به کم",
  },
  {
    value: "likesCount-desc",
    label: "بیشترین لایک",
  },
  {
    value: "viewsCount-desc",
    label: "بیشترین بازدید",
  },
  {
    value: "savesCount-desc",
    label: "بیشترین ذخیره",
  },
] satisfies {
  value: SortValue
  label: string
}[]

type ProductToolbarProps = {
  search: Partial<ProductSearchParams>
}

function getInitialSort(
  search: Partial<ProductSearchParams>,
): SortValue {
  if (
    search.sortBy === "minPrice" &&
    search.sortOrder === "asc"
  ) {
    return "minPrice-asc"
  }

  if (
    search.sortBy === "minPrice" &&
    search.sortOrder === "desc"
  ) {
    return "minPrice-desc"
  }

  if (
    search.sortBy === "likesCount" &&
    search.sortOrder === "desc"
  ) {
    return "likesCount-desc"
  }

  if (
    search.sortBy === "viewsCount" &&
    search.sortOrder === "desc"
  ) {
    return "viewsCount-desc"
  }

  if (
    search.sortBy === "savesCount" &&
    search.sortOrder === "desc"
  ) {
    return "savesCount-desc"
  }

  return "none"
}

export function ProductToolbar({
  search,
}: ProductToolbarProps) {
  const navigate = useNavigate()

  const [priceRange, setPriceRange] =
    useState<[number, number]>([
      search.minPrice ?? MIN_PRICE,
      search.maxPrice ?? MAX_PRICE,
    ])

  const [sort, setSort] =
    useState<SortValue>(
      getInitialSort(search),
    )

  useEffect(() => {
    setPriceRange([
      search.minPrice ?? MIN_PRICE,
      search.maxPrice ?? MAX_PRICE,
    ])

    setSort(
      getInitialSort({
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
      }),
    )
  }, [
    search.minPrice,
    search.maxPrice,
    search.sortBy,
    search.sortOrder,
  ])

  function applySort(
    value: SortValue,
  ) {
    setSort(value)

    if (value === "none") {
      navigate({
        to: "/products",
        search: {
          ...search,
          page: 1,
          sortBy: undefined,
          sortOrder: undefined,
        },
      })

      return
    }

    const [sortBy, sortOrder] =
      value.split("-")

    navigate({
      to: "/products",
      search: {
        ...search,
        page: 1,
        sortBy: sortBy as
          | "minPrice"
          | "likesCount"
          | "viewsCount"
          | "savesCount",
        sortOrder:
          sortOrder as
            | "asc"
            | "desc",
      },
    })
  }

  function applyPriceFilter() {
    navigate({
      to: "/products",
      search: {
        ...search,
        page: 1,

        minPrice:
          priceRange[0] === MIN_PRICE
            ? undefined
            : priceRange[0],

        maxPrice:
          priceRange[1] === MAX_PRICE
            ? undefined
            : priceRange[1],
      },
    })
  }

  function clearFilters() {
    setPriceRange([
      MIN_PRICE,
      MAX_PRICE,
    ])

    setSort("none")

    navigate({
      to: "/products",
      search: {
        ...search,
        page: 1,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
    })
  }

  const hasFilters =
    search.minPrice !== undefined ||
    search.maxPrice !== undefined ||
    search.sortBy !== undefined

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="size-4" />

          فیلتر و مرتب‌سازی
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-7 pt-5">
        {/* Sort */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-4 text-muted-foreground" />

            <p className="text-sm font-medium">
              مرتب‌سازی
            </p>
          </div>

          <Select
            items={SORT_OPTIONS}
            value={sort}
            onValueChange={(value) => {
              if (value !== null) {
                applySort(
                  value as SortValue,
                )
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">
                بدون مرتب‌سازی
              </SelectItem>

              <SelectItem value="minPrice-asc">
                قیمت: کم به زیاد
              </SelectItem>

              <SelectItem value="minPrice-desc">
                قیمت: زیاد به کم
              </SelectItem>

              <SelectItem value="likesCount-desc">
                بیشترین لایک
              </SelectItem>

              <SelectItem value="viewsCount-desc">
                بیشترین بازدید
              </SelectItem>

              <SelectItem value="savesCount-desc">
                بیشترین ذخیره
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t" />

        {/* Price */}
        <div className="space-y-5">
          <p className="text-sm font-medium">
            محدوده قیمت
          </p>

          <div dir="ltr">
            <Slider
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={500_000}
              value={priceRange}
              onValueChange={(value) => {
                if (!Array.isArray(value)) {
                  return
                }
          
                const minValue =
                  value[0] ?? MIN_PRICE
          
                const maxValue =
                  value[1] ?? MAX_PRICE
          
                setPriceRange([
                  Math.min(
                    minValue,
                    maxValue,
                  ),
                  Math.max(
                    minValue,
                    maxValue,
                  ),
                ])
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-muted/60 p-2">
              <span className="block text-muted-foreground">
                از
              </span>

              <span className="mt-1 block font-medium">
                {priceRange[0].toLocaleString(
                  "fa-IR",
                )}{" "}
                تومان
              </span>
            </div>

            <div className="rounded-md bg-muted/60 p-2">
              <span className="block text-muted-foreground">
                تا
              </span>

              <span className="mt-1 block font-medium">
                {priceRange[1].toLocaleString(
                  "fa-IR",
                )}{" "}
                تومان
              </span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={
              applyPriceFilter
            }
          >
            اعمال محدوده قیمت
          </Button>
        </div>

        {hasFilters && (
          <>
            <div className="border-t" />

            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={
                clearFilters
              }
            >
              <RotateCcw className="size-4" />

              پاک کردن فیلترها
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}