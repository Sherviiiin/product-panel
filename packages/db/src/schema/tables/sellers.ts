import { pgTable, serial, varchar, integer, unique } from "drizzle-orm/pg-core";
import { products } from "./products";
import { users, cities } from "./users";

// Table seller-types
export const sellerTypes = pgTable("seller_types", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 50,
  })
    .notNull()
    .unique(),
});

// Table seller-profiles
export const sellerProfiles = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),

  shopName: varchar("shop_name", {
    length: 150,
  }).notNull(),

  avatar: varchar("avatar", {
    length: 500,
  }),

  cityId: integer("city_id").references(() => cities.id),

  sellerTypeId: integer("seller_type_id")
    .notNull()
    .references(() => sellerTypes.id),
});

// Table seller-products
export const sellerProducts = pgTable(
  "seller_products",
  {
    id: serial("id").primaryKey(),

    sellerProfileId: integer("seller_profile_id")
      .notNull()
      .references(() => sellerProfiles.id),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),

    url: varchar("url", {
      length: 255,
    })
      .notNull()
      .unique(),

    price: integer("price").notNull(),

    discountPrice: integer("discount_price"),

    stock: integer("stock").notNull().default(0),
  },

  (table) => [unique().on(table.sellerProfileId, table.productId)],
);
