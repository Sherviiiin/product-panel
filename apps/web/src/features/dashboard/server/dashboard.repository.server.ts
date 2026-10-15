import {
  and, asc, categories, count, db, desc, eq, ilike, isNull, max, min, sql,
  productCategories, productLikes, products, productSaves, productSpecs, productViews,
  sellerProducts, sellerProfiles, cities, sellerTypes, userProfiles, users,
} from "@repo/db";

import type {
  CreateSellerListingInput, CreateSellerProductInput, DashboardProductsResult,
  SellerDashboardProductsInput, SellerProductsResult, UpdateSellerListingInput, UserDashboardProductsInput,
  DashboardProfile, UpdateSellerDashboardProfileInput, UpdateUserDashboardProfileInput,
} from "../dashboard.schema";

export class DashboardRepository {
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

  // 9
  async getProfile(userId: number): Promise<DashboardProfile> {
    const [profile] = await db
      .select({
        email: users.email,

        phone: users.phone,

        fullName: userProfiles.fullName,

        username: userProfiles.username,

        avatar: userProfiles.avatar,

        cityId: userProfiles.cityId,

        sellerId: sellerProfiles.id,

        shopName: sellerProfiles.shopName,

        sellerAvatar: sellerProfiles.avatar,

        sellerCityId: sellerProfiles.cityId,

        sellerTypeId: sellerProfiles.sellerTypeId,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(sellerProfiles, eq(sellerProfiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!profile) {
      throw new Error("PROFILE_NOT_FOUND");
    }

    const [cityRows, sellerTypeRows] = await Promise.all([
      db
        .select({
          id: cities.id,
          province: cities.province,
          city: cities.city,
        })
        .from(cities)
        .orderBy(asc(cities.province), asc(cities.city)),

      db
        .select({
          id: sellerTypes.id,

          name: sellerTypes.name,
        })
        .from(sellerTypes)
        .orderBy(asc(sellerTypes.name)),
    ]);

    let seller: DashboardProfile["seller"] = null;

    if (profile.sellerId !== null) {
      if (profile.shopName === null || profile.sellerTypeId === null) {
        throw new Error("SELLER_PROFILE_INVALID");
      }

      seller = {
        shopName: profile.shopName,

        avatar: profile.sellerAvatar,

        cityId: profile.sellerCityId,

        sellerTypeId: profile.sellerTypeId,
      };
    }

    return {
      email: profile.email,

      phone: profile.phone,

      fullName: profile.fullName,

      username: profile.username,

      avatar: profile.avatar,

      cityId: profile.cityId,

      seller,

      cities: cityRows,

      sellerTypes: sellerTypeRows,
    };
  }

  async updateUserProfile(userId: number, input: UpdateUserDashboardProfileInput): Promise<void> {
    const [sameUsername] = await db
      .select({
        userId: userProfiles.userId,
      })
      .from(userProfiles)
      .where(eq(userProfiles.username, input.username))
      .limit(1);

    if (sameUsername && sameUsername.userId !== userId) {
      throw new Error("USERNAME_TAKEN");
    }

    const [updated] = await db
      .update(userProfiles)
      .set({
        fullName: input.fullName,

        username: input.username,

        avatar: input.avatar || null,

        cityId: input.cityId,
      })
      .where(eq(userProfiles.userId, userId))
      .returning({
        userId: userProfiles.userId,
      });

    if (!updated) {
      throw new Error("PROFILE_NOT_FOUND");
    }
  }

  async updateSellerProfile(
    userId: number,
    input: UpdateSellerDashboardProfileInput,
  ): Promise<void> {
    await db.transaction(async (tx) => {
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

      const [sameUsername] = await tx
        .select({
          userId: userProfiles.userId,
        })
        .from(userProfiles)
        .where(eq(userProfiles.username, input.username))
        .limit(1);

      if (sameUsername && sameUsername.userId !== userId) {
        throw new Error("USERNAME_TAKEN");
      }

      await tx
        .update(userProfiles)
        .set({
          fullName: input.fullName,

          username: input.username,

          avatar: input.avatar || null,

          cityId: input.cityId,
        })
        .where(eq(userProfiles.userId, userId));

      await tx
        .update(sellerProfiles)
        .set({
          shopName: input.shopName,

          avatar: input.sellerAvatar || null,

          cityId: input.sellerCityId,

          sellerTypeId: input.sellerTypeId,
        })
        .where(eq(sellerProfiles.userId, userId));
    });
  }
}
