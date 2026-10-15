import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SlidersHorizontal, X } from "lucide-react";

import {
  productSearchValidator,
  toProductsListInput,
} from "@/features/catalog/catalog.search-params";

import { productsQuery } from "@/features/catalog/queries/product.query";

import { ProductGrid } from "@/features/catalog/components/product-grid";
import { ProductToolbar } from "@/features/catalog/components/product-toolbar";
import { ProductPagination } from "@/features/catalog/components/product-pagination";
import { ProductSearchBar } from "@/features/catalog/components/product-search-bar";

import { useCatalogUiStore } from "@/features/catalog/store/catalog-ui.store";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products/")({
  validateSearch: productSearchValidator,

  loaderDeps: ({ search }) => toProductsListInput(search),

  loader: async ({ context, deps }) => {
    await context.queryClient.query({
      ...productsQuery(deps),
    });
  },

  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();

  const params = toProductsListInput(search);

  const { data } = useSuspenseQuery(productsQuery(params));

  const isFilterOpen = useCatalogUiStore((state) => state.isFilterOpen);

  const toggleFilter = useCatalogUiStore((state) => state.toggleFilter);

  return (
    <main dir="rtl" className="w-full max-w-none px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          {/* Header */}
          <div className="shrink-0">
            <h1 className="text-2xl font-bold sm:text-3xl">محصولات</h1>

            <p className="mt-1 text-sm text-muted-foreground">جستجو و مقایسه محصولات</p>
          </div>

          {/* Search */}
          <div className="w-full lg:flex-1">
            <ProductSearchBar search={search} />
          </div>
        </div>

        {/* Mobile Sticky Filter */}
        <div className="sticky top-0 z-40 -mx-4 bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <Button
            type="button"
            variant={isFilterOpen ? "secondary" : "outline"}
            className="w-full gap-2"
            onClick={toggleFilter}
          >
            {isFilterOpen ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}

            {isFilterOpen ? "بستن فیلترها" : "فیلتر و مرتب‌سازی"}
          </Button>

          {/*{isFilterOpen && (
            <div className="mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto pb-2">
              <ProductToolbar
                search={search}
              />
            </div>
          )}*/}
          <div
            className={`grid transition-all duration-100 ease-out ${
              isFilterOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pb-2">
                <ProductToolbar search={search} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        {/*<div
          className={`grid items-start gap-6 ${
            isFilterOpen
              ? "lg:grid-cols-[minmax(0,1fr)_320px]"
              : "lg:grid-cols-1"
          } lg:[direction:ltr]`}
        >*/}
        <div
          className={`grid items-start gap-6 transition-[grid-template-columns] duration-100 ease-out lg:[direction:ltr] ${
            isFilterOpen ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "lg:grid-cols-[minmax(0,1fr)_0px]"
          }`}
        >
          {/* Products */}
          <section dir="rtl" className="min-w-0 space-y-5">
            <div className="flex flex-row-reverse items-center justify-between gap-4">
              <div className="w-full text-right lg:w-auto lg:text-left">
                <h2 className="font-semibold">نتایج جستجو</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {data.total.toLocaleString("fa-IR")} محصول پیدا شد
                </p>
              </div>

              {/* Desktop Filter Button */}
              <Button
                type="button"
                variant="outline"
                className="hidden gap-2 lg:flex"
                onClick={toggleFilter}
              >
                {isFilterOpen ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}

                {isFilterOpen ? "بستن فیلترها" : "فیلتر و مرتب‌سازی"}
              </Button>
            </div>

            <ProductGrid products={data.items} />

            <div className="pt-3">
              <ProductPagination search={search} total={data.total} pageSize={params.pageSize} />
            </div>
          </section>

          {/* Desktop Filter Sidebar */}
          {isFilterOpen && (
            <aside dir="rtl" className="hidden min-w-0 lg:sticky lg:top-6 lg:block">
              <ProductToolbar search={search} />
            </aside>
          )}
          {/*<aside
            dir="rtl"
            className={`hidden min-w-0 overflow-hidden transition-all duration-200 ease-out lg:sticky lg:top-6 lg:block ${
              isFilterOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-3 opacity-0"
            }`}
          >
            <ProductToolbar
              search={search}
            />
          </aside>*/}
        </div>
      </div>
    </main>
  );
}
