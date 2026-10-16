import { describe, expect, it } from "vitest";

import { productsListSchema, productSearchFormSchema } from "../../../catalog.schema";

describe("Products list schema", () => {
  it("uses default pagination values", () => {
    const result = productsListSchema.parse({});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(12);
  });

  it("accepts valid filters together", () => {
    const result = productsListSchema.parse({
      page: 2,
      pageSize: 20,
      search: "  phone  ",
      categoryIds: [1, 2],
      minPrice: 500_000,
      maxPrice: 50_000_000,
      sortBy: "minPrice",
      sortOrder: "asc",
    });

    expect(result).toEqual({
      page: 2,
      pageSize: 20,
      search: "phone",
      categoryIds: [1, 2],
      minPrice: 500_000,
      maxPrice: 50_000_000,
      sortBy: "minPrice",
      sortOrder: "asc",
    });
  });

  it.each([0, -1, 1.5, "2"])("rejects invalid page: %s", (page) => {
    expect(productsListSchema.safeParse({ page }).success).toBe(false);
  });

  it.each([0, -1, 1.5, 101, "12"])("rejects invalid pageSize: %s", (pageSize) => {
    expect(productsListSchema.safeParse({ pageSize }).success).toBe(false);
  });

  it.each([1, 100])("accepts pageSize boundary: %s", (pageSize) => {
    expect(productsListSchema.safeParse({ pageSize }).success).toBe(true);
  });

  it("rejects search text longer than 100 characters", () => {
    expect(
      productsListSchema.safeParse({
        search: "a".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("accepts valid category IDs", () => {
    expect(
      productsListSchema.safeParse({
        categoryIds: [1, 2, 3],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty category array", () => {
    expect(
      productsListSchema.safeParse({
        categoryIds: [],
      }).success,
    ).toBe(false);
  });

  it.each([0, -1, 1.5, "2"])("rejects invalid category ID: %s", (categoryId) => {
    expect(
      productsListSchema.safeParse({
        categoryIds: [categoryId],
      }).success,
    ).toBe(false);
  });

  it.each([
    { minPrice: 499_999 },
    { maxPrice: 499_999 },
    { minPrice: 200_000_001 },
    { maxPrice: 200_000_001 },
    { minPrice: 1.5 },
  ])("rejects invalid price filters: %j", (filters) => {
    expect(productsListSchema.safeParse(filters).success).toBe(false);
  });

  it("accepts minimum and maximum price boundaries", () => {
    expect(
      productsListSchema.safeParse({
        minPrice: 500_000,
        maxPrice: 200_000_000,
      }).success,
    ).toBe(true);
  });

  it.each(["name", "likesCount", "viewsCount", "savesCount", "minPrice"])(
    "accepts sortBy: %s",
    (sortBy) => {
      expect(productsListSchema.safeParse({ sortBy }).success).toBe(true);
    },
  );

  it("rejects unsupported sorting fields", () => {
    expect(
      productsListSchema.safeParse({
        sortBy: "unknownField",
      }).success,
    ).toBe(false);
  });

  it.each(["asc", "desc"])("accepts sortOrder: %s", (sortOrder) => {
    expect(productsListSchema.safeParse({ sortOrder }).success).toBe(true);
  });

  it("rejects an unsupported sorting direction", () => {
    expect(
      productsListSchema.safeParse({
        sortOrder: "random",
      }).success,
    ).toBe(false);
  });
});

describe("Product search form schema", () => {
  it("accepts a valid search term", () => {
    const result = productSearchFormSchema.parse({
      search: "  laptop  ",
    });

    expect(result.search).toBe("laptop");
  });

  it.each(["", "   "])("rejects an empty search term: %j", (search) => {
    expect(
      productSearchFormSchema.safeParse({
        search,
      }).success,
    ).toBe(false);
  });

  it("rejects a search term longer than 100 characters", () => {
    expect(
      productSearchFormSchema.safeParse({
        search: "a".repeat(101),
      }).success,
    ).toBe(false);
  });
});
