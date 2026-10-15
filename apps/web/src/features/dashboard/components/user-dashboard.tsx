import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Bookmark, Eye, Heart, Search } from "lucide-react";

import type { DashboardProductSortBy, DashboardSortOrder } from "../dashboard.schema";

import { dashboardKeys, userDashboardProductsQuery } from "../queries/dashboard.query";

import { useDashboardUiStore } from "../store/dashboard-ui.store";

import { DashboardProductsTable } from "./dashboard-products-table";

import {
  toggleProductLike,
  toggleProductSave,
} from "@/features/catalog/server/functions/product.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;

const userTabs = [
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
] as const;

export function UserDashboard() {
  const queryClient = useQueryClient();

  const userTab = useDashboardUiStore((state) => state.userTab);

  const setUserTab = useDashboardUiStore((state) => state.setUserTab);

  const [searchText, setSearchText] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [sortBy, setSortBy] = useState<DashboardProductSortBy | undefined>(undefined);

  const [sortOrder, setSortOrder] = useState<DashboardSortOrder | undefined>(undefined);

  const input = {
    type: userTab,
    page,
    pageSize: PAGE_SIZE,

    search: search || undefined,

    sortBy,
    sortOrder,
  };

  const { data, isPending } = useQuery(userDashboardProductsQuery(input));

  const likeMutation = useMutation({
    mutationFn: (productId: number) =>
      toggleProductLike({
        data: {
          id: productId,
        },
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (productId: number) =>
      toggleProductSave({
        data: {
          id: productId,
        },
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });

  const total = data?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function changeTab(tab: "viewed" | "liked" | "saved") {
    setUserTab(tab);

    setPage(1);

    setSortBy(undefined);
    setSortOrder(undefined);
  }

  function submitSearch() {
    setSearch(searchText.trim());

    setPage(1);
  }

  function handleSort(column: DashboardProductSortBy) {
    setPage(1);

    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");

      return;
    }

    setSortBy(column);

    if (column === "name" || column === "minPrice") {
      setSortOrder("asc");
    } else {
      setSortOrder("desc");
    }
  }

  function renderActions(productId: number) {
    if (userTab === "liked") {
      const pending = likeMutation.isPending && likeMutation.variables === productId;

      return (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={(event) => {
            event.stopPropagation();
            likeMutation.mutate(productId);
          }}
        >
          <Heart className="size-4 fill-current" />
          حذف لایک
        </Button>
      );
    }

    if (userTab === "saved") {
      const pending = saveMutation.isPending && saveMutation.variables === productId;

      return (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={(event) => {
            event.stopPropagation();
            saveMutation.mutate(productId);
          }}
        >
          <Bookmark className="size-4 fill-current" />
          حذف از ذخیره‌ها
        </Button>
      );
    }

    return null;
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">داشبورد من</h1>

        <p className="mt-1 text-sm text-muted-foreground">مدیریت فعالیت‌ها و محصولات شما</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 overflow-hidden rounded-lg border">
        {userTabs.map((tab) => {
          const Icon = tab.icon;

          const active = userTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => changeTab(tab.value)}
              className={`flex h-12 items-center justify-center gap-2 border-l text-sm font-medium transition-colors last:border-l-0 ${
                active ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />

              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();

          submitSearch();
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="جستجو در محصولات..."
            className="pr-10"
          />
        </div>

        <Button type="submit">جستجو</Button>
      </form>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total.toLocaleString("fa-IR")} محصول</p>

        {(search || sortBy) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchText("");
              setSearch("");
              setSortBy(undefined);
              setSortOrder(undefined);
              setPage(1);
            }}
          >
            پاک کردن فیلترها
          </Button>
        )}
      </div>

      {/* Table */}
      {isPending ? (
        <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
          در حال دریافت اطلاعات...
        </div>
      ) : (
        <DashboardProductsTable
          products={data?.items ?? []}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          renderActions={(product) => renderActions(product.id)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            قبلی
          </Button>

          <span className="text-sm text-muted-foreground">
            صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
}
