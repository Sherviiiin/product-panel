import { pgTable, serial, integer, unique } from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

// Table product-views
export const productViews = pgTable("product_views",{
  id: serial("id").primaryKey(),
  
  userId: integer("user_id").references(() => users.id),
  
  productId: integer("product_id").notNull().references(() => products.id)
})

// Table product-likes
export const productLikes = pgTable("product_likes",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id").notNull().references(() => users.id),

    productId: integer("product_id").notNull().references(() => products.id)
  },

  (table) => [
    unique().on(table.productId, table.userId)
  ]
)

// Table product-saves
export const productSaves = pgTable("product_saves",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id").notNull().references(() => users.id),

    productId: integer("product_id").notNull().references(() => products.id)
  },

  (table) => [
    unique().on(table.productId, table.userId)
  ]
)
