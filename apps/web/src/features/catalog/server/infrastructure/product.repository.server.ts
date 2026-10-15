import {
  and,
  asc,
  categories,
  count,
  db,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  lte,
  min,
  productCategories,
  productLikes,
  products,
  productSaves,
  productSpecs,
  productViews,
  sellerProducts,
  sellerProfiles,
  sql,
} from "@repo/db";

import type {
  ProductRepository,
  ProductSearchParams,
  ProductSeller,
  ProductSpec,
} from "../domain/product.repository";

import type { ProductEntity } from "../domain/product.entity";

import type { ProductSearchItem } from "../application/search-products";

// import { toPersistence } from "./product.mapper"

export class DrizzleProductRepository implements ProductRepository {
  // 1
  async findById(id: number): Promise<ProductEntity | null> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!result[0]) {
      return null;
    }

    return this.toEntity(result[0]);
  }

  // 2
  async findSpecsByProductId(productId: number): Promise<ProductSpec[]> {
    return db
      .select({
        id: productSpecs.id,
        key: productSpecs.key,

        value: productSpecs.value,
      })
      .from(productSpecs)
      .where(eq(productSpecs.productId, productId));
  }

  // 3
  // Categories of a product
  async findCategoriesByProductId(productId: number): Promise<
    {
      id: number;
      name: string;
    }[]
  > {
    return db
      .select({
        id: categories.id,

        name: categories.name,
      })
      .from(productCategories)
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(eq(productCategories.productId, productId))
      .orderBy(asc(categories.name));
  }

  // 4
  async findSellersByProductId(productId: number): Promise<ProductSeller[]> {
    return db
      .select({
        id: sellerProfiles.id,

        shopName: sellerProfiles.shopName,

        price: sellerProducts.price,

        discountPrice: sellerProducts.discountPrice,

        stock: sellerProducts.stock,

        url: sellerProducts.url,
      })
      .from(sellerProducts)
      .innerJoin(sellerProfiles, eq(sellerProfiles.id, sellerProducts.sellerProfileId))
      .where(eq(sellerProducts.productId, productId))
      .orderBy(asc(sellerProducts.price));
  }

  // 5
  async getInteractionState(
    productId: number,
    userId: number,
  ): Promise<{
    isLiked: boolean;
    isSaved: boolean;
  }> {
    const [likes, saves] = await Promise.all([
      db
        .select({
          id: productLikes.id,
        })
        .from(productLikes)
        .where(and(eq(productLikes.productId, productId), eq(productLikes.userId, userId)))
        .limit(1),

      db
        .select({
          id: productSaves.id,
        })
        .from(productSaves)
        .where(and(eq(productSaves.productId, productId), eq(productSaves.userId, userId)))
        .limit(1),
    ]);

    return {
      isLiked: Boolean(likes[0]),

      isSaved: Boolean(saves[0]),
    };
  }

  // 6
  async toggleLike(
    productId: number,
    userId: number,
  ): Promise<{
    isLiked: boolean;
    likesCount: number;
  }> {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select({
          id: productLikes.id,
        })
        .from(productLikes)
        .where(and(eq(productLikes.productId, productId), eq(productLikes.userId, userId)))
        .limit(1);

      let isLiked: boolean;

      if (existing[0]) {
        await tx.delete(productLikes).where(eq(productLikes.id, existing[0].id));

        isLiked = false;
      } else {
        await tx.insert(productLikes).values({
          productId,
          userId,
        });

        isLiked = true;
      }

      const result = await tx
        .select({
          total: count(),
        })
        .from(productLikes)
        .where(eq(productLikes.productId, productId));

      const likesCount = result[0]?.total ?? 0;

      await tx
        .update(products)
        .set({
          likesCount,
        })
        .where(eq(products.id, productId));

      return {
        isLiked,
        likesCount,
      };
    });
  }

  // 7
  async toggleSave(
    productId: number,
    userId: number,
  ): Promise<{
    isSaved: boolean;
    savesCount: number;
  }> {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select({
          id: productSaves.id,
        })
        .from(productSaves)
        .where(and(eq(productSaves.productId, productId), eq(productSaves.userId, userId)))
        .limit(1);

      let isSaved: boolean;

      if (existing[0]) {
        await tx.delete(productSaves).where(eq(productSaves.id, existing[0].id));

        isSaved = false;
      } else {
        await tx.insert(productSaves).values({
          productId,
          userId,
        });

        isSaved = true;
      }

      const result = await tx
        .select({
          total: count(),
        })
        .from(productSaves)
        .where(eq(productSaves.productId, productId));

      const savesCount = result[0]?.total ?? 0;

      await tx
        .update(products)
        .set({
          savesCount,
        })
        .where(eq(products.id, productId));

      return {
        isSaved,
        savesCount,
      };
    });
  }

  // 8
  async recordView(
    productId: number,
    userId?: number,
  ): Promise<{
    viewsCount: number;
  }> {
    return db.transaction(async (tx) => {
      await tx.insert(productViews).values({
        productId,

        userId: userId ?? null,
      });

      const [updatedProduct] = await tx
        .update(products)
        .set({
          viewsCount: sql`${products.viewsCount} + 1`,
        })
        .where(eq(products.id, productId))
        .returning({
          viewsCount: products.viewsCount,
        });

      if (!updatedProduct) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      return updatedProduct;
    });
  }

  // 9
  async searchProducts(params: ProductSearchParams): Promise<{
    items: ProductSearchItem[];
    total: number;
  }> {
    const offset = (params.page - 1) * params.pageSize;

    const where = and(
      params.search ? ilike(products.name, `%${params.search}%`) : undefined,

      params.categoryIds && params.categoryIds.length > 0
        ? exists(
            db
              .select()
              .from(productCategories)
              .where(
                and(
                  eq(productCategories.productId, products.id),

                  inArray(productCategories.categoryId, params.categoryIds),
                ),
              ),
          )
        : undefined,
    );

    const minPriceExpression = min(sellerProducts.price);

    const priceFilter = and(
      params.minPrice !== undefined ? gte(minPriceExpression, params.minPrice) : undefined,

      params.maxPrice !== undefined ? lte(minPriceExpression, params.maxPrice) : undefined,
    );

    const sortColumns = {
      name: products.name,

      likesCount: products.likesCount,

      viewsCount: products.viewsCount,

      savesCount: products.savesCount,

      minPrice: minPriceExpression,
    };

    const orderBy =
      params.sortBy && params.sortOrder
        ? params.sortOrder === "asc"
          ? asc(sortColumns[params.sortBy])
          : desc(sortColumns[params.sortBy])
        : undefined;

    const rows = await db
      .select({
        id: products.id,

        name: products.name,

        description: products.description,

        likesCount: products.likesCount,

        viewsCount: products.viewsCount,

        savesCount: products.savesCount,

        minPrice: minPriceExpression,

        sellerCount: count(sellerProducts.id),
      })
      .from(products)
      .leftJoin(sellerProducts, eq(sellerProducts.productId, products.id))
      .where(where)
      .groupBy(products.id)
      .having(priceFilter)
      .orderBy(...(orderBy ? [orderBy] : []))
      .limit(params.pageSize)
      .offset(offset);

    /*
     * Categories are loaded in one query for
     * all products of the current page.
     *
     * This avoids an N+1 query.
     */
    const productIds = rows.map((product) => product.id);

    const categoryRows =
      productIds.length > 0
        ? await db
            .select({
              productId: productCategories.productId,

              id: categories.id,

              name: categories.name,
            })
            .from(productCategories)
            .innerJoin(categories, eq(categories.id, productCategories.categoryId))
            .where(inArray(productCategories.productId, productIds))
            .orderBy(asc(categories.name))
        : [];

    const categoriesByProduct = new Map<
      number,
      {
        id: number;
        name: string;
      }[]
    >();

    for (const category of categoryRows) {
      const current = categoriesByProduct.get(category.productId) ?? [];

      current.push({
        id: category.id,

        name: category.name,
      });

      categoriesByProduct.set(category.productId, current);
    }

    const items: ProductSearchItem[] = rows.map((product) => ({
      ...product,

      categories: categoriesByProduct.get(product.id) ?? [],
    }));

    const filteredProducts = db
      .select({
        id: products.id,
      })
      .from(products)
      .leftJoin(sellerProducts, eq(sellerProducts.productId, products.id))
      .where(where)
      .groupBy(products.id)
      .having(priceFilter)
      .as("filtered_products");

    const [totalRow] = await db
      .select({
        total: count(),
      })
      .from(filteredProducts);

    return {
      items,

      total: totalRow?.total ?? 0,
    };
  }

  // 10
  // async create(
  //   data: Omit<
  //     ProductEntity,
  //     "id"
  //   >,
  // ): Promise<ProductEntity> {
  //   const result =
  //     await db
  //       .insert(products)
  //       .values(
  //         toPersistence(
  //           data,
  //         ),
  //       )
  //       .returning()
  //
  //   return this.toEntity(
  //     result[0],
  //   )
  // }

  // 11
  private toEntity(row: typeof products.$inferSelect): ProductEntity {
    return {
      id: row.id,

      name: row.name,

      description: row.description,

      likesCount: row.likesCount,

      viewsCount: row.viewsCount,

      savesCount: row.savesCount,
    };
  }
}
