import { randomUUID } from "node:crypto";
import {
  asc,
  categories,
  db,
  desc,
  eq,
  productCategories,
  products,
  sellerProducts,
} from "@repo/db";
import { beforeAll, describe, expect, it } from "vitest";

import type { ProductSearchItem } from "../../application/search-products";
import type { ProductSearchParams } from "../../domain/product.repository";
import { DrizzleProductRepository } from "../../infrastructure/product.repository.server";

type SearchFilters = Omit<ProductSearchParams, "page" | "pageSize">;

const repository = new DrizzleProductRepository();

let snapshot: ProductSearchItem[] = [];

function requireValue<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

function productIds(items: ProductSearchItem[]): Set<number> {
  return new Set(items.map((item) => item.id));
}

function expectSameProducts(actual: ProductSearchItem[], expected: ProductSearchItem[]): void {
  expect(actual).toHaveLength(expected.length);
  expect(productIds(actual)).toEqual(productIds(expected));
  expect(productIds(actual).size).toBe(actual.length);
}

async function searchAll(filters: SearchFilters = {}): Promise<{
  items: ProductSearchItem[];
  total: number;
}> {
  const pageSize = 50;

  const params = {
    ...filters,
    pageSize,
    sortBy: filters.sortBy ?? ("name" as const),
    sortOrder: filters.sortOrder ?? ("asc" as const),
  };

  const first = await repository.searchProducts({
    ...params,
    page: 1,
  });

  const items = [...first.items];

  const pageCount = Math.ceil(first.total / pageSize);

  for (let page = 2; page <= pageCount; page++) {
    const next = await repository.searchProducts({
      ...params,
      page,
    });

    expect(next.total).toBe(first.total);
    items.push(...next.items);
  }

  expect(items).toHaveLength(first.total);
  expect(productIds(items).size).toBe(items.length);

  return {
    items,
    total: first.total,
  };
}

beforeAll(async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const hostname = new URL(databaseUrl).hostname;

  if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname)) {
    throw new Error("Integration tests require a local development database");
  }

  const [productRows, offerRows, categoryRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        likesCount: products.likesCount,
        viewsCount: products.viewsCount,
        savesCount: products.savesCount,
      })
      .from(products),

    db
      .select({
        productId: sellerProducts.productId,
        price: sellerProducts.price,
      })
      .from(sellerProducts),

    db
      .select({
        productId: productCategories.productId,
        id: categories.id,
        name: categories.name,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id)),
  ]);

  if (productRows.length === 0) {
    throw new Error("No products found. Seed the database before testing.");
  }

  const pricesByProduct = new Map<number, number[]>();

  for (const offer of offerRows) {
    const prices = pricesByProduct.get(offer.productId) ?? [];

    prices.push(offer.price);
    pricesByProduct.set(offer.productId, prices);
  }

  const categoriesByProduct = new Map<number, { id: number; name: string }[]>();

  for (const category of categoryRows) {
    const list = categoriesByProduct.get(category.productId) ?? [];

    list.push({
      id: category.id,
      name: category.name,
    });

    categoriesByProduct.set(category.productId, list);
  }

  snapshot = productRows.map((product) => {
    const prices = pricesByProduct.get(product.id) ?? [];

    return {
      ...product,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      sellerCount: prices.length,
      categories: categoriesByProduct.get(product.id) ?? [],
    };
  });
});

describe("SearchProducts integration - results", () => {
  it("returns the correct total number of products", async () => {
    const result = await searchAll();

    expect(result.total).toBe(snapshot.length);
    expectSameProducts(result.items, snapshot);
  });

  it("does not duplicate products with multiple sellers", async () => {
    const result = await searchAll();

    expect(result.items).toHaveLength(result.total);
    expect(productIds(result.items).size).toBe(result.total);
  });

  it("returns correct product fields and aggregations", async () => {
    const result = await searchAll();

    const expectedById = new Map(snapshot.map((item) => [item.id, item]));

    for (const item of result.items) {
      const expected = requireValue(expectedById.get(item.id), `Unexpected product ${item.id}`);

      expect(item).toMatchObject({
        id: expected.id,
        name: expected.name,
        description: expected.description,
        likesCount: expected.likesCount,
        viewsCount: expected.viewsCount,
        savesCount: expected.savesCount,
        minPrice: expected.minPrice,
        sellerCount: expected.sellerCount,
      });

      const normalizeCategories = (values: { id: number; name: string }[]) =>
        values.map(({ id, name }) => ({ id, name })).sort((a, b) => a.id - b.id);

      expect(normalizeCategories(item.categories)).toEqual(
        normalizeCategories(expected.categories),
      );
    }
  });

  it("returns all categories of each matching product", async () => {
    const result = await searchAll();

    const expectedById = new Map(snapshot.map((item) => [item.id, item.categories]));

    for (const item of result.items) {
      const expected = requireValue(
        expectedById.get(item.id),
        `Categories not found for product ${item.id}`,
      );

      expect(new Set(item.categories.map((category) => category.id))).toEqual(
        new Set(expected.map((category) => category.id)),
      );
    }
  });
});

describe("SearchProducts integration - text search", () => {
  it("searches product names case-insensitively", async () => {
    const sample = snapshot.find((item) => /[A-Za-z]{3,}/.test(item.name));

    if (!sample) {
      throw new Error("No searchable Latin product name found");
    }

    const word = requireValue(sample.name.match(/[A-Za-z]{3,}/)?.[0], "Search word not found");

    const result = await searchAll({
      search: word.toUpperCase(),
    });

    const expected = snapshot.filter((item) =>
      item.name.toLowerCase().includes(word.toLowerCase()),
    );

    expect(expected.length).toBeGreaterThan(0);
    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("returns zero for an unmatched search", async () => {
    const result = await repository.searchProducts({
      page: 1,
      pageSize: 10,
      search: `no-such-product-${randomUUID()}`,
    });

    expect(result).toEqual({
      items: [],
      total: 0,
    });
  });

  it("returns all products when search is omitted", async () => {
    const result = await searchAll();

    expectSameProducts(result.items, snapshot);
  });
});

describe("SearchProducts integration - categories", () => {
  it("filters by one category", async () => {
    const category = requireValue(
      snapshot.flatMap((item) => item.categories)[0],
      "No categories exist",
    );

    const result = await searchAll({
      categoryIds: [category.id],
    });

    const expected = snapshot.filter((item) =>
      item.categories.some((value) => value.id === category.id),
    );

    expect(expected.length).toBeGreaterThan(0);
    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("supports multiple category IDs with OR semantics", async () => {
    const ids = [
      ...new Set(snapshot.flatMap((item) => item.categories.map((category) => category.id))),
    ].slice(0, 2);

    expect(ids).toHaveLength(2);

    const result = await searchAll({
      categoryIds: ids,
    });

    const expected = snapshot.filter((item) =>
      item.categories.some((category) => ids.includes(category.id)),
    );

    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("does not duplicate products belonging to multiple categories", async () => {
    const categoryIds = [
      ...new Set(snapshot.flatMap((item) => item.categories.map((category) => category.id))),
    ];

    const result = await searchAll({
      categoryIds,
    });

    expect(productIds(result.items).size).toBe(result.items.length);
  });

  it("returns no results for an unknown category", async () => {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, 2_000_000_000));

    if (existing) {
      throw new Error("Reserved category ID is already used");
    }

    const result = await repository.searchProducts({
      page: 1,
      pageSize: 10,
      categoryIds: [2_000_000_000],
    });

    expect(result).toEqual({
      items: [],
      total: 0,
    });
  });
});

describe("SearchProducts integration - prices", () => {
  function getPriceRange() {
    const prices = snapshot
      .map((item) => item.minPrice)
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);

    const minPrice = requireValue(
      prices[Math.floor(prices.length / 4)],
      "Minimum test price not found",
    );

    const maxPrice = requireValue(
      prices[Math.floor((prices.length * 3) / 4)],
      "Maximum test price not found",
    );

    return { minPrice, maxPrice };
  }

  it("filters by minimum price", async () => {
    const { minPrice } = getPriceRange();

    const result = await searchAll({ minPrice });

    const expected = snapshot.filter((item) => item.minPrice !== null && item.minPrice >= minPrice);

    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("filters by maximum price", async () => {
    const { maxPrice } = getPriceRange();

    const result = await searchAll({ maxPrice });

    const expected = snapshot.filter((item) => item.minPrice !== null && item.minPrice <= maxPrice);

    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("combines minimum and maximum price", async () => {
    const { minPrice, maxPrice } = getPriceRange();

    const result = await searchAll({
      minPrice,
      maxPrice,
    });

    const expected = snapshot.filter(
      (item) => item.minPrice !== null && item.minPrice >= minPrice && item.minPrice <= maxPrice,
    );

    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("includes products at an exact price boundary", async () => {
    const product = snapshot.find((item) => item.minPrice !== null);

    const price = requireValue(product?.minPrice, "No priced product exists");

    const result = await searchAll({
      minPrice: price,
      maxPrice: price,
    });

    const expected = snapshot.filter((item) => item.minPrice === price);

    expect(expected.length).toBeGreaterThan(0);
    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });
});

describe("SearchProducts integration - combined filters", () => {
  it("combines text, category and price filters", async () => {
    const sample = snapshot.find(
      (item) =>
        item.minPrice !== null && item.categories.length > 0 && /[A-Za-z]{3,}/.test(item.name),
    );

    if (!sample) {
      throw new Error("No suitable product for combined filters");
    }

    const category = requireValue(sample.categories[0], "Sample category not found");

    const price = requireValue(sample.minPrice, "Sample price not found");

    const word = requireValue(
      sample.name.match(/[A-Za-z]{3,}/)?.[0],
      "Sample search word not found",
    );

    const result = await searchAll({
      search: word.toUpperCase(),
      categoryIds: [category.id],
      minPrice: price,
      maxPrice: price,
    });

    const expected = snapshot.filter(
      (item) =>
        item.name.toLowerCase().includes(word.toLowerCase()) &&
        item.categories.some((value) => value.id === category.id) &&
        item.minPrice === price,
    );

    expect(expected.length).toBeGreaterThan(0);
    expect(result.total).toBe(expected.length);
    expectSameProducts(result.items, expected);
  });

  it("keeps total consistent when filters return an empty page", async () => {
    const category = requireValue(
      snapshot.flatMap((item) => item.categories)[0],
      "No category exists",
    );

    const expectedCount = snapshot.filter((item) =>
      item.categories.some((value) => value.id === category.id),
    ).length;

    const result = await repository.searchProducts({
      page: expectedCount + 2,
      pageSize: 1,
      categoryIds: [category.id],
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(expectedCount);
  });
});

describe("SearchProducts integration - sorting", () => {
  it.each(["asc", "desc"] as const)("sorts names in %s order", async (sortOrder) => {
    const result = await searchAll({
      sortBy: "name",
      sortOrder,
    });

    const independentlySorted = await db
      .select({ name: products.name })
      .from(products)
      .orderBy(sortOrder === "asc" ? asc(products.name) : desc(products.name));

    expect(result.items.map((item) => item.name)).toEqual(
      independentlySorted.map((item) => item.name),
    );
  });

  it.each([
    ["likesCount", "asc"],
    ["likesCount", "desc"],
    ["viewsCount", "asc"],
    ["viewsCount", "desc"],
    ["savesCount", "asc"],
    ["savesCount", "desc"],
    ["minPrice", "asc"],
    ["minPrice", "desc"],
  ] as const)("sorts %s in %s order", async (sortBy, sortOrder) => {
    const result = await searchAll({
      sortBy,
      sortOrder,
    });

    for (let i = 1; i < result.items.length; i++) {
      const previous = requireValue(result.items[i - 1], "Previous item not found");

      const current = requireValue(result.items[i], "Current item not found");

      const a = previous[sortBy];
      const b = current[sortBy];

      if (a === null && b === null) {
        continue;
      }

      if (a === null) {
        expect(sortOrder).toBe("desc");
        continue;
      }

      if (b === null) {
        expect(sortOrder).toBe("asc");
        continue;
      }

      if (sortOrder === "asc") {
        expect(a).toBeLessThanOrEqual(b);
      } else {
        expect(a).toBeGreaterThanOrEqual(b);
      }
    }
  });
});

describe("SearchProducts integration - pagination", () => {
  it("returns correct first and second pages", async () => {
    expect(snapshot.length).toBeGreaterThanOrEqual(10);

    const first = await repository.searchProducts({
      page: 1,
      pageSize: 5,
      sortBy: "name",
      sortOrder: "asc",
    });

    const second = await repository.searchProducts({
      page: 2,
      pageSize: 5,
      sortBy: "name",
      sortOrder: "asc",
    });

    expect(first.total).toBe(snapshot.length);
    expect(second.total).toBe(snapshot.length);

    expect(first.items).toHaveLength(5);
    expect(second.items).toHaveLength(5);

    const firstIds = productIds(first.items);

    for (const item of second.items) {
      expect(firstIds.has(item.id)).toBe(false);
    }
  });

  it("uses the correct offset for subsequent pages", async () => {
    const full = await searchAll({
      sortBy: "name",
      sortOrder: "asc",
    });

    const third = await repository.searchProducts({
      page: 3,
      pageSize: 5,
      sortBy: "name",
      sortOrder: "asc",
    });

    expect(third.items.map((item) => item.id)).toEqual(
      full.items.slice(10, 15).map((item) => item.id),
    );

    expect(third.total).toBe(snapshot.length);
  });

  it("returns an empty page beyond the last page", async () => {
    const page = Math.ceil(snapshot.length / 10) + 2;

    const result = await repository.searchProducts({
      page,
      pageSize: 10,
      sortBy: "name",
      sortOrder: "asc",
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(snapshot.length);
  });

  it("returns the correct total for a filtered page", async () => {
    const category = requireValue(
      snapshot.flatMap((item) => item.categories)[0],
      "No category exists",
    );

    const expected = snapshot.filter((item) =>
      item.categories.some((value) => value.id === category.id),
    );

    const result = await repository.searchProducts({
      page: 1,
      pageSize: 3,
      categoryIds: [category.id],
      sortBy: "name",
      sortOrder: "asc",
    });

    expect(result.total).toBe(expected.length);
    expect(result.items.length).toBeLessThanOrEqual(3);

    for (const item of result.items) {
      expect(expected.some((product) => product.id === item.id)).toBe(true);
    }
  });
});
