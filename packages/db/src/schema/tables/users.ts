import {
  pgTable,
  serial,
  primaryKey,
  unique,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// user-status Enum
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "banned"]);

// Table roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 30,
  })
    .notNull()
    .unique(),
});

// Table cities
export const cities = pgTable(
  "cities",
  {
    id: serial("id").primaryKey(),

    province: varchar("province", {
      length: 100,
    }).notNull(),

    city: varchar("city", {
      length: 100,
    }).notNull(),
  },

  (table) => [unique().on(table.province, table.city)],
);

// Table users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),

  phone: varchar("phone", {
    length: 20,
  })
    .notNull()
    .unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  status: userStatusEnum("status").notNull().default("active"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// Table user-roles
export const userRoles = pgTable(
  "user_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
  },

  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
    }),
  ],
);

// Table user-profiles
export const userProfiles = pgTable("user_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),

  fullName: varchar("full_name", {
    length: 150,
  }).notNull(),

  username: varchar("username", {
    length: 100,
  })
    .notNull()
    .unique(),

  avatar: varchar("avatar", {
    length: 500,
  }),

  cityId: integer("city_id").references(() => cities.id),
});
