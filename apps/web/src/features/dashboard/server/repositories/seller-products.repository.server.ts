import {
  and,
  asc,
  categories,
  count,
  db,
  desc,
  eq,
  ilike,
  isNull,
  productCategories,
  products,
  productSpecs,
  sellerProducts,
  sellerProfiles,
} from "@repo/db";

import type {
  CreateSellerListingInput,
  CreateSellerProductInput,
  SellerDashboardProductsInput,
  SellerProductsResult,
  UpdateSellerListingInput,
} from "../../dashboard.schema";

export class SellerProductsRepository {
  // 2
  // Products listed by the current seller
  async getSellerProducts(
    userId: number,
    input: SellerDashboardProductsInput,
  ): Promise<SellerProductsResult> {
    const offset = (input.page - 1) * input.pageSize;

    const where = and(
      eq(sellerProfiles.userId, userId),

      input.search ? ilike(products.name, `%${input.search}%`) : undefined,
    );

    const sortColumns = {
      name: products.name,

      price: sellerProducts.price,

      discountPrice: sellerProducts.discountPrice,

      stock: sellerProducts.stock,
    };

    const orderBy =
      input.sortBy && input.sortOrder
        ? input.sortOrder === "asc"
          ? asc(sortColumns[input.sortBy])
          : desc(sortColumns[input.sortBy])
        : desc(sellerProducts.id);

    const [totalRow] = await db
      .select({
        total: count(),
      })
      .from(sellerProducts)
      .innerJoin(sellerProfiles, eq(sellerProfiles.id, sellerProducts.sellerProfileId))
      .innerJoin(products, eq(products.id, sellerProducts.productId))
      .where(where);

    const items = await db
      .select({
        listingId: sellerProducts.id,

        productId: products.id,

        name: products.name,

        description: products.description,

        price: sellerProducts.price,

        discountPrice: sellerProducts.discountPrice,

        stock: sellerProducts.stock,

        url: sellerProducts.url,

        likesCount: products.likesCount,

        viewsCount: products.viewsCount,

        savesCount: products.savesCount,
      })
      .from(sellerProducts)
      .innerJoin(sellerProfiles, eq(sellerProfiles.id, sellerProducts.sellerProfileId))
      .innerJoin(products, eq(products.id, sellerProducts.productId))
      .where(where)
      .orderBy(orderBy)
      .limit(input.pageSize)
      .offset(offset);

    return {
      items,

      total: totalRow?.total ?? 0,
    };
  }

  // 3
  // Search existing products which
  // the current seller has not listed yet
  async searchProductsForSeller(userId: number, search: string) {
    const [seller] = await db
      .select({
        id: sellerProfiles.id,
      })
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);

    if (!seller) {
      throw new Error("SELLER_PROFILE_NOT_FOUND");
    }

    return db
      .select({
        id: products.id,

        name: products.name,

        description: products.description,
      })
      .from(products)
      .leftJoin(
        sellerProducts,
        and(
          eq(sellerProducts.productId, products.id),
          eq(sellerProducts.sellerProfileId, seller.id),
        ),
      )
      .where(and(ilike(products.name, `%${search}%`), isNull(sellerProducts.id)))
      .limit(10);
  }

  // 4
  // Categories available when a seller
  // creates a new product
  async getProductCategories() {
    return db
      .select({
        id: categories.id,

        name: categories.name,
      })
      .from(categories)
      .orderBy(asc(categories.name));
  }

  // 5
  // List an already existing product
  async createSellerListing(userId: number, input: CreateSellerListingInput) {
    return db.transaction(async (tx) => {
      const [seller] = await tx
        .select({
          id: sellerProfiles.id,
        })
        .from(sellerProfiles)
        .where(eq(sellerProfiles.userId, userId))
        .limit(1);

      if (!seller) {
        throw new Error("SELLER_PROFILE_NOT_FOUND");
      }

      const [product] = await tx
        .select({
          id: products.id,
        })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const [existing] = await tx
        .select({
          id: sellerProducts.id,
        })
        .from(sellerProducts)
        .where(
          and(
            eq(sellerProducts.sellerProfileId, seller.id),
            eq(sellerProducts.productId, input.productId),
          ),
        )
        .limit(1);

      if (existing) {
        throw new Error("PRODUCT_ALREADY_LISTED");
      }

      const [listing] = await tx
        .insert(sellerProducts)
        .values({
          sellerProfileId: seller.id,

          productId: input.productId,

          price: input.price,

          discountPrice: input.discountPrice,

          stock: input.stock,

          url: input.url,
        })
        .returning({
          id: sellerProducts.id,
        });

      if (!listing) {
        throw new Error("LISTING_CREATE_FAILED");
      }

      return listing;
    });
  }

  // 6
  // Create a new product together with:
  // categories + specs + seller listing
  async createSellerProduct(userId: number, input: CreateSellerProductInput) {
    return db.transaction(async (tx) => {
      const [seller] = await tx
        .select({
          id: sellerProfiles.id,
        })
        .from(sellerProfiles)
        .where(eq(sellerProfiles.userId, userId))
        .limit(1);

      if (!seller) {
        throw new Error("SELLER_PROFILE_NOT_FOUND");
      }

      const [product] = await tx
        .insert(products)
        .values({
          name: input.name,

          description: input.description,

          likesCount: 0,
          viewsCount: 0,
          savesCount: 0,
        })
        .returning({
          id: products.id,
        });

      if (!product) {
        throw new Error("PRODUCT_CREATE_FAILED");
      }

      // Product categories
      await tx.insert(productCategories).values(
        input.categoryIds.map((categoryId) => ({
          productId: product.id,

          categoryId,
        })),
      );

      // Product specifications
      if (input.specs.length > 0) {
        await tx.insert(productSpecs).values(
          input.specs.map((spec) => ({
            productId: product.id,

            key: spec.key,

            value: spec.value,
          })),
        );
      }

      // Seller listing
      const [listing] = await tx
        .insert(sellerProducts)
        .values({
          sellerProfileId: seller.id,

          productId: product.id,

          price: input.price,

          discountPrice: input.discountPrice,

          stock: input.stock,

          url: input.url,
        })
        .returning({
          id: sellerProducts.id,
        });

      if (!listing) {
        throw new Error("LISTING_CREATE_FAILED");
      }

      return {
        productId: product.id,

        listingId: listing.id,
      };
    });
  }

  // 7
  // Update only seller listing data
  async updateSellerListing(userId: number, input: UpdateSellerListingInput) {
    return db.transaction(async (tx) => {
      const [listing] = await tx
        .select({
          id: sellerProducts.id,
        })
        .from(sellerProducts)
        .innerJoin(sellerProfiles, eq(sellerProfiles.id, sellerProducts.sellerProfileId))
        .where(and(eq(sellerProducts.id, input.listingId), eq(sellerProfiles.userId, userId)))
        .limit(1);

      if (!listing) {
        throw new Error("LISTING_NOT_FOUND");
      }

      const [updated] = await tx
        .update(sellerProducts)
        .set({
          price: input.price,

          discountPrice: input.discountPrice,

          stock: input.stock,

          url: input.url,
        })
        .where(eq(sellerProducts.id, listing.id))
        .returning({
          id: sellerProducts.id,

          price: sellerProducts.price,

          discountPrice: sellerProducts.discountPrice,

          stock: sellerProducts.stock,

          url: sellerProducts.url,
        });

      if (!updated) {
        throw new Error("LISTING_UPDATE_FAILED");
      }

      return updated;
    });
  }

  // 8
  // Delete only the current seller's listing
  async deleteSellerListing(userId: number, listingId: number) {
    return db.transaction(async (tx) => {
      const [listing] = await tx
        .select({
          id: sellerProducts.id,
        })
        .from(sellerProducts)
        .innerJoin(sellerProfiles, eq(sellerProfiles.id, sellerProducts.sellerProfileId))
        .where(and(eq(sellerProducts.id, listingId), eq(sellerProfiles.userId, userId)))
        .limit(1);

      if (!listing) {
        throw new Error("LISTING_NOT_FOUND");
      }

      await tx.delete(sellerProducts).where(eq(sellerProducts.id, listing.id));

      return {
        success: true,
      };
    });
  }
}
