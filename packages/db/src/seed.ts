import { db } from "./db";
import { roles, sellerTypes } from "./schema";

async function seed() {
  await db.insert(roles).values([
    { "name": "normal" },
    { "name": "seller" },
    { "name": "admin" }
  ]).onConflictDoNothing()

  await db.insert(sellerTypes).values([
    { "name": "online" },
    { "name": "physical" }
  ]).onConflictDoNothing()
}

seed()