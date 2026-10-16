import {
  createStandardSchemaV1,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";

import { productsListSchema, type ProductsListInput } from "./catalog.schema";

const productSortFields = ["name", "likesCount", "viewsCount", "savesCount", "minPrice"] as const;
const sortOrders = ["asc", "desc"] as const;

// nuqs schema
export const productSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(12),
  search: parseAsString.withDefault(""),
  categoryIds: parseAsString.withDefault(""),

  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,

  sortBy: parseAsStringLiteral(productSortFields), //.withDefault("viewsCount"),
  sortOrder: parseAsStringLiteral(sortOrders), //.withDefault("desc"),
};
// nuqs validator
export const productSearchValidator = createStandardSchemaV1(productSearchParams, {
  partialOutput: true,
});
// nuqs schema, typescript type
export type ProductSearchParams = inferParserType<typeof productSearchParams>;

// mapper, into zod schema
export function toProductsListInput(search: Partial<ProductSearchParams>): ProductsListInput {
  const categoryIds = search.categoryIds
    ?.split(",")
    .map(Number)
    .filter((id: number) => Number.isInteger(id) && id > 0);

  return productsListSchema.parse({
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 12,
    search: search.search?.trim() || undefined,

    categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,

    minPrice: search.minPrice ?? undefined,
    maxPrice: search.maxPrice ?? undefined,

    sortBy: search.sortBy ?? undefined,
    sortOrder: search.sortOrder ?? undefined,
  });
}
