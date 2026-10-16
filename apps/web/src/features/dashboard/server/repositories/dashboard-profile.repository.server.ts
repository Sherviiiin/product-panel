import { asc, db, eq, sellerProfiles, cities, sellerTypes, userProfiles, users } from "@repo/db";

import type {
  DashboardProfile,
  UpdateSellerDashboardProfileInput,
  UpdateUserDashboardProfileInput,
} from "../../dashboard.schema";

export class DashboardProfileRepository {
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
