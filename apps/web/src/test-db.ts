//import "dotenv/config";
import { db, roles } from "@repo/db";

async function test() {
  const result = await db.select().from(roles);

  console.log(result);
}

test();
