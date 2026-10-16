import { beforeEach, describe, expect, it, vi } from "vitest";

import { SearchProducts } from "../../application/search-products";
import type { ProductRepository } from "../../domain/product.repository";

const searchProductsMock = vi.fn<ProductRepository["searchProducts"]>();

const repository = {
  searchProducts: searchProductsMock,
} as unknown as ProductRepository;

const useCase = new SearchProducts(repository);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("SearchProducts", () => {
  it("forwards search filters and returns results", async () => {
    const params = {
      page: 2,
      pageSize: 10,
      search: "phone",
      categoryIds: [1, 2],
      minPrice: 100000,
      maxPrice: 500000,
      sortBy: "minPrice" as const,
      sortOrder: "asc" as const,
    };

    const response = {
      items: [
        {
          id: 1,
          name: "Test Phone",
          description: null,
          categories: [{ id: 1, name: "Electronics" }],
          likesCount: 2,
          viewsCount: 10,
          savesCount: 1,
          minPrice: 200000,
          sellerCount: 3,
        },
      ],
      total: 25,
    };

    searchProductsMock.mockResolvedValue(response);

    const result = await useCase.execute(params);

    expect(searchProductsMock).toHaveBeenCalledExactlyOnceWith(params);

    expect(result).toEqual(response);
  });

  it("handles empty search results", async () => {
    searchProductsMock.mockResolvedValue({
      items: [],
      total: 0,
    });

    const result = await useCase.execute({
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual({
      items: [],
      total: 0,
    });
  });

  it("propagates repository errors", async () => {
    searchProductsMock.mockRejectedValue(new Error("DATABASE_ERROR"));

    await expect(
      useCase.execute({
        page: 1,
        pageSize: 10,
      }),
    ).rejects.toThrow("DATABASE_ERROR");
  });
});
