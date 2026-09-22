import { pgTable, serial, integer, varchar, primaryKey } from 'drizzle-orm/pg-core';

// Table "products"
export const products = pgTable('products', {
  id: serial('id').primaryKey(),

  name: varchar('name', {
    length: 100,
  }).notNull(),

  description: varchar('description', {
    length: 500
  }),

  likesCount: integer('likes_count').notNull().default(0),

  viewsCount: integer('views_count').notNull().default(0),

  savesCount: integer('saves_count').notNull().default(0),
})

// Table "product-specs"
export const productSpecs = pgTable("product_specs", {
  id: serial("id").primaryKey(),

  productId: integer("product_id").notNull().references(() => products.id),

  key: varchar("key", {
    length: 100,
  }).notNull(),

  value: varchar("value", {
    length: 255,
  }).notNull(),
})

// Table "categories"
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull().unique(),
})

// Table "product-categories"
export const productCategories = pgTable("product_categories",
  {
    productId: integer("product_id").notNull().references(() => products.id),

    categoryId: integer("category_id").notNull().references(() => categories.id),
  },

  (table) => [
    primaryKey({
      columns: [
        table.productId,
        table.categoryId
      ]
    })
  ]
)