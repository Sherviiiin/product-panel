import { useEffect, useState } from "react";

import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import type { ProductSearchParams } from "../catalog.search-params";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductSearchBarProps = {
  search: Partial<ProductSearchParams>;
};

export function ProductSearchBar({ search }: ProductSearchBarProps) {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState(search.search ?? "");

  useEffect(() => {
    setSearchText(search.search ?? "");
  }, [search.search]);

  function submitSearch() {
    const value = searchText.trim();

    if (!value) {
      return;
    }

    navigate({
      to: "/products",
      search: {
        ...search,
        search: value,
        page: 1,
      },
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      className="flex w-full gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="نام محصول موردنظر را جستجو کنید..."
          className="h-11 pr-10"
        />
      </div>

      <Button type="submit" className="h-11 px-6">
        جستجو
      </Button>
    </form>
  );
}
