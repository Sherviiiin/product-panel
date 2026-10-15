import {
  and, asc, count, db, desc, eq, ilike, max, min, sql,
  productLikes, products, productSaves, productViews, sellerProducts
} from "@repo/db";

import type {
  DashboardProductsResult, UserDashboardProductsInput
} from "../../dashboard.schema";

export class UserProductsRepository {
  // 1
  // Products related to the current user:
  // viewed / liked / saved
  async getUserProducts(
    userId: number,
    input: UserDashboardProductsInput,
  ): Promise<DashboardProductsResult> {
    const offset = (input.page - 1) * input.pageSize;

    const searchCondition = input.search ? ilike(products.name, `%${input.search}%`) : undefined;

    const minPriceExpression = min(sellerProducts.price);

    const productSelection = {
      id: products.id,

      name: products.name,

      description: products.description,

      likesCount: products.likesCount,

      viewsCount: products.viewsCount,

      savesCount: products.savesCount,

      minPrice: minPriceExpression,

      sellerCount: count(sellerProducts.id),
    };

    const sortColumns = {
      name: products.name,

      likesCount: products.likesCount,

      viewsCount: products.viewsCount,

      savesCount: products.savesCount,

      minPrice: minPriceExpression,
    };

    const orderBy =
      input.sortBy && input.sortOrder
        ? input.sortOrder === "asc"
          ? asc(sortColumns[input.sortBy])
          : desc(sortColumns[input.sortBy])
        : undefined;

    // Viewed products
    if (input.type === "viewed") {
      const where = and(eq(productViews.userId, userId), searchCondition);

      const [totalRow] = await db
        .select({
          total: sql<number>`
              count(
                distinct ${productViews.productId}
              )
            `.mapWith(Number),
        })
        .from(productViews)
        .innerJoin(products, eq(products.id, productViews.productId))
        .where(where);

      const items = await db
        .select(productSelection)
        .from(productViews)
        .innerJoin(products, eq(products.id, productViews.productId))
        .leftJoin(sellerProducts, eq(sellerProducts.productId, products.id))
        .where(where)
        .groupBy(products.id)
        .orderBy(orderBy ?? desc(max(productViews.id)))
        .limit(input.pageSize)
        .offset(offset);

      return {
        items,

        total: totalRow?.total ?? 0,
      };
    }

    // Liked products
    if (input.type === "liked") {
      const where = and(eq(productLikes.userId, userId), searchCondition);

      const [totalRow] = await db
        .select({
          total: sql<number>`
              count(
                distinct ${productLikes.productId}
              )
            `.mapWith(Number),
        })
        .from(productLikes)
        .innerJoin(products, eq(products.id, productLikes.productId))
        .where(where);

      const items = await db
        .select(productSelection)
        .from(productLikes)
        .innerJoin(products, eq(products.id, productLikes.productId))
        .leftJoin(sellerProducts, eq(sellerProducts.productId, products.id))
        .where(where)
        .groupBy(products.id)
        .orderBy(orderBy ?? desc(max(productLikes.id)))
        .limit(input.pageSize)
        .offset(offset);

      return {
        items,

        total: totalRow?.total ?? 0,
      };
    }

    // Saved products
    if (input.type === "saved") {
      const where = and(eq(productSaves.userId, userId), searchCondition);

      const [totalRow] = await db
        .select({
          total: sql<number>`
              count(
                distinct ${productSaves.productId}
              )
            `.mapWith(Number),
        })
        .from(productSaves)
        .innerJoin(products, eq(products.id, productSaves.productId))
        .where(where);

      const items = await db
        .select(productSelection)
        .from(productSaves)
        .innerJoin(products, eq(products.id, productSaves.productId))
        .leftJoin(sellerProducts, eq(sellerProducts.productId, products.id))
        .where(where)
        .groupBy(products.id)
        .orderBy(orderBy ?? desc(max(productSaves.id)))
        .limit(input.pageSize)
        .offset(offset);

      return {
        items,

        total: totalRow?.total ?? 0,
      };
    }

    return {
      items: [],
      total: 0,
    };
  }
}