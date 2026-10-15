import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const pg_url = process.env.DATABASE_URL;

if (!pg_url) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",

  dbCredentials: {
    url: pg_url,
  },
});
