import { sql } from "drizzle-orm"
import { pgTable, serial, integer, unique, uniqueIndex, uuid, check, } from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

// Table product-views
export const productViews = pgTable(
  "product_views",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .references(() => users.id),

    guestId: uuid("guest_id"),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
  },
  (table) => [
    uniqueIndex("product_views_user_unique")
      .on(table.productId, table.userId)
      .where(sql`${table.userId} IS NOT NULL`),

    uniqueIndex("product_views_guest_unique")
      .on(table.productId, table.guestId)
      .where(sql`${table.guestId} IS NOT NULL`),

    check(
      "product_views_identity_check",
      sql`${table.userId} IS NOT NULL OR ${table.guestId} IS NOT NULL`,
    ),
  ],
)

// Table product-likes
export const productLikes = pgTable(
  "product_likes",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
  },

  (table) => [unique().on(table.productId, table.userId)],
);

// Table product-saves
export const productSaves = pgTable(
  "product_saves",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
  },

  (table) => [unique().on(table.productId, table.userId)],
);
