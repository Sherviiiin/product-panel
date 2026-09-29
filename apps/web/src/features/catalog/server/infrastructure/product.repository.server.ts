import { db, sql, eq, ilike, count, min, gte, lte, and, asc, desc, exists, inArray,
productSpecs, sellerProfiles, products, productCategories, sellerProducts,
productLikes, productSaves, productViews
} from "@repo/db"

import type { ProductSearchParams, ProductRepository,
  ProductSpec, ProductSeller
} from "../domain/product.repository"

import type { ProductEntity } from "../domain/product.entity"
import type { ProductSearchItem } from "../application/search-products"
//import { toPersistence } from "./product.mapper"

export class DrizzleProductRepository implements ProductRepository{

  // 1
  async findById(id: number): Promise<ProductEntity | null> {

    const result = await db.select().from(products).where(eq(products.id, id)).limit(1)

    if (!result[0]) {
      return null
    }

    return this.toEntity(result[0])
  }

  // 2
  async findSpecsByProductId(
    productId: number,
  ): Promise<ProductSpec[]> {
    return db
      .select({
        key: productSpecs.key,
        value: productSpecs.value,
      })
      .from(productSpecs)
      .where(
        eq(
          productSpecs.productId,
          productId,
        ),
      )
  }

  // 3
  async findSellersByProductId(
    productId: number,
  ): Promise<ProductSeller[]> {
    return db
      .select({
        id: sellerProfiles.id,
        shopName: sellerProfiles.shopName,
        price: sellerProducts.price,
        discountPrice:
          sellerProducts.discountPrice,
        stock: sellerProducts.stock,
        url: sellerProducts.url,
      })
      .from(sellerProducts)
      .innerJoin(
        sellerProfiles,
        eq(
          sellerProfiles.id,
          sellerProducts.sellerProfileId,
        ),
      )
      .where(
        eq(
          sellerProducts.productId,
          productId,
        ),
      )
      .orderBy(
        asc(sellerProducts.price),
      )
  }
  
  // 4
  async getInteractionState(
    productId: number,
    userId: number,
  ): Promise<{
    isLiked: boolean
    isSaved: boolean
  }> {
    const [likes, saves] = await Promise.all([
      db
        .select({
          id: productLikes.id,
        })
        .from(productLikes)
        .where(
          and(
            eq(
              productLikes.productId,
              productId,
            ),
            eq(
              productLikes.userId,
              userId,
            ),
          ),
        )
        .limit(1),

      db
        .select({
          id: productSaves.id,
        })
        .from(productSaves)
        .where(
          and(
            eq(
              productSaves.productId,
              productId,
            ),
            eq(
              productSaves.userId,
              userId,
            ),
          ),
        )
        .limit(1),
    ])

    return {
      isLiked: Boolean(likes[0]),
      isSaved: Boolean(saves[0]),
    }
  }

  // 5
  async toggleLike(
    productId: number,
    userId: number,
  ): Promise<{
    isLiked: boolean
    likesCount: number
  }> {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select({
          id: productLikes.id,
        })
        .from(productLikes)
        .where(
          and(
            eq(
              productLikes.productId,
              productId,
            ),
            eq(
              productLikes.userId,
              userId,
            ),
          ),
        )
        .limit(1)

      let isLiked: boolean

      if (existing[0]) {
        await tx
          .delete(productLikes)
          .where(
            eq(
              productLikes.id,
              existing[0].id,
            ),
          )

        isLiked = false
      } else {
        await tx
          .insert(productLikes)
          .values({
            productId,
            userId,
          })

        isLiked = true
      }

      const result = await tx
        .select({
          total: count(),
        })
        .from(productLikes)
        .where(
          eq(
            productLikes.productId,
            productId,
          ),
        )

      const likesCount =
        result[0]?.total ?? 0

      await tx
        .update(products)
        .set({
          likesCount,
        })
        .where(
          eq(
            products.id,
            productId,
          ),
        )

      return {
        isLiked,
        likesCount,
      }
    })
  }

  // 6
  async toggleSave(
    productId: number,
    userId: number,
  ): Promise<{
    isSaved: boolean
    savesCount: number
  }> {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select({
          id: productSaves.id,
        })
        .from(productSaves)
        .where(
          and(
            eq(
              productSaves.productId,
              productId,
            ),
            eq(
              productSaves.userId,
              userId,
            ),
          ),
        )
        .limit(1)

      let isSaved: boolean

      if (existing[0]) {
        await tx
          .delete(productSaves)
          .where(
            eq(
              productSaves.id,
              existing[0].id,
            ),
          )

        isSaved = false
      } else {
        await tx
          .insert(productSaves)
          .values({
            productId,
            userId,
          })

        isSaved = true
      }

      const result = await tx
        .select({
          total: count(),
        })
        .from(productSaves)
        .where(
          eq(
            productSaves.productId,
            productId,
          ),
        )

      const savesCount =
        result[0]?.total ?? 0

      await tx
        .update(products)
        .set({
          savesCount,
        })
        .where(
          eq(
            products.id,
            productId,
          ),
        )

      return {
        isSaved,
        savesCount,
      }
    })
  }

  // 7
  async recordView(
    productId: number,
    userId?: number,
  ): Promise<{
    viewsCount: number
  }> {
    return db.transaction(
      async (tx) => {
        await tx
          .insert(productViews)
          .values({
            productId,
            userId: userId ?? null,
          })

        const [updatedProduct] =
          await tx
            .update(products)
            .set({
              viewsCount: sql`${products.viewsCount} + 1`,
            })
            .where(
              eq(
                products.id,
                productId,
              ),
            )
            .returning({
              viewsCount:
                products.viewsCount,
            })

        if (!updatedProduct) {
          throw new Error(
            "PRODUCT_NOT_FOUND",
          )
        }

        return updatedProduct
      },
    )
  }

  // 8
  async searchProducts(
    params: ProductSearchParams,
  ): Promise<{
    items: ProductSearchItem[]
    total: number
  }> {
    const offset =
      (params.page - 1) * params.pageSize
  
    const where = and(
      params.search
        ? ilike(
            products.name,
            `%${params.search}%`,
          )
        : undefined,
        
      params.categoryIds
        ? exists(
            db
              .select()
              .from(productCategories)
              .where(
                and(
                  eq(
                    productCategories.productId,
                    products.id,
                  ),
                  inArray(
                    productCategories.categoryId,
                    params.categoryIds,
                  ),
                ),
              ),
          )
        : undefined,
    )
  
    const minPriceExpression =
      min(sellerProducts.price)
  
    const priceFilter = and(
      params.minPrice !== undefined
        ? gte(
            minPriceExpression,
            params.minPrice,
          )
        : undefined,
        
      params.maxPrice !== undefined
        ? lte(
            minPriceExpression,
            params.maxPrice,
          )
        : undefined,
    )
  
    const sortColumns = {
      name: products.name,
      likesCount: products.likesCount,
      viewsCount: products.viewsCount,
      savesCount: products.savesCount,
      minPrice: minPriceExpression,
    }
  
    const orderBy =
      params.sortBy && params.sortOrder
        ? params.sortOrder === "asc"
          ? asc(sortColumns[params.sortBy])
          : desc(sortColumns[params.sortBy])
        : undefined
  
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
      
        likesCount: products.likesCount,
        viewsCount: products.viewsCount,
        savesCount: products.savesCount,
      
        minPrice: minPriceExpression,
      
        sellerCount: count(
          sellerProducts.id,
        ),
      })
      .from(products)
      .leftJoin(
        sellerProducts,
        eq(
          sellerProducts.productId,
          products.id,
        ),
      )
      .where(where)
      .groupBy(products.id)
      .having(priceFilter)
      .orderBy(
        ...(orderBy ? [orderBy] : []),
      )
      .limit(params.pageSize)
      .offset(offset)
    
    const totalRows = await db
      .select({
        id: products.id,
      })
      .from(products)
      .leftJoin(
        sellerProducts,
        eq(
          sellerProducts.productId,
          products.id,
        ),
      )
      .where(where)
      .groupBy(products.id)
      .having(priceFilter)
    
    return {
      items: rows,
      total: totalRows.length,
    }
  }

  // 9
  //async create(data: Omit<ProductEntity, "id">): Promise<ProductEntity> {
  //
  //  const result = await db.insert(products).values(toPersistence(data)).returning()
  //
  //  return this.toEntity(result[0])
  //}

  // 10
  private toEntity(row: typeof products.$inferSelect): ProductEntity {

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      likesCount: row.likesCount,
      viewsCount: row.viewsCount,
      savesCount: row.savesCount,
    }
  }
}