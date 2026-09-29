import { relations } from "drizzle-orm";

import { users, roles, userRoles, userProfiles, cities} from "./tables/users";
import {products,productSpecs,categories,productCategories} from "./tables/products";
import {sellerProfiles,sellerTypes,sellerProducts} from "./tables/sellers";
import {productViews,productLikes,productSaves} from "./tables/interactions";

// Relations of "users"
export const usersRelations = relations(users,
  ({ one, many }) => ({
    profile: one(userProfiles),
    sellerProfile: one(sellerProfiles),

    roles: many(userRoles),
    likes: many(productLikes),
    saves: many(productSaves),
    views: many(productViews)
  })
)

// Relations of "user-roles"
export const userRolesRelations = relations(userRoles,
  ({ one }) => ({
    user: one(users, {
      fields: [userRoles.userId],
      references: [users.id],
    }),

    role: one(roles, {
      fields: [userRoles.roleId],
      references: [roles.id],
    }),
  }),
)
// Relations of "roles"
export const rolesRelations = relations(roles,
  ({ many }) => ({
    users: many(userRoles),
  }),
)

// Relations of "user-profiles"
export const userProfilesRelations = relations(userProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [userProfiles.userId],
      references: [users.id]
    }),

    city: one(cities, {
      fields: [userProfiles.cityId],
      references: [cities.id]
    })
  })
)

// Relations of "seller-profiles"
export const sellerProfilesRelations = relations(sellerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [sellerProfiles.userId],
      references: [users.id],
    }),

    city: one(cities, {
      fields: [sellerProfiles.cityId],
      references: [cities.id],
    }),

    type: one(sellerTypes, {
      fields: [sellerProfiles.sellerTypeId],
      references: [sellerTypes.id],
    }),

    products: many(sellerProducts),
  })
)

// Relations of "seller-products"
export const sellerProductsRelations = relations(sellerProducts,
  ({ one }) => ({
    seller: one(sellerProfiles, {
      fields: [sellerProducts.sellerProfileId],
      references: [sellerProfiles.id],
    }),

    product: one(products, {
      fields: [sellerProducts.productId],
      references: [products.id],
    }),
  })
)

// Relations of "products"
export const productsRelations = relations(products,
  ({ many }) => ({
    specs: many(productSpecs),
    sellers: many(sellerProducts),
    categories: many(productCategories),
    likes: many(productLikes),
    saves: many(productSaves),
    views: many(productViews)
  })
)

// Relations of "product-specs"
export const productSpecsRelations = relations(productSpecs,
  ({ one }) => ({
    product: one(products, {
      fields: [productSpecs.productId],
      references: [products.id]
    })
  })
)

// Relations of "categories"
export const categoriesRelations = relations(categories,
  ({ many }) => ({
    products: many(productCategories)
  })
)

// Relations of "product-likes"
export const productLikesRelations = relations(productLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [productLikes.userId],
      references: [users.id],
    }),

    product: one(products, {
      fields: [productLikes.productId],
      references: [products.id],
    }),
  })
)
// Relations of "product-views"
export const productViewsRelations = relations(productViews,
  ({ one }) => ({
    user: one(users, {
      fields: [productViews.userId],
      references: [users.id],
    }),

    product: one(products, {
      fields: [productViews.productId],
      references: [products.id],
    }),
  })
)
// Relations of "product-saves"
export const productSavesRelations = relations(productSaves,
  ({ one }) => ({
    user: one(users, {
      fields: [productSaves.userId],
      references: [users.id],
    }),

    product: one(products, {
      fields: [productSaves.productId],
      references: [products.id],
    }),
  })
)