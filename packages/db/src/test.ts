import { db } from "./db";
import { roles } from "./schema";

async function test() {
  const result = await db.select().from(roles);

  console.log(result);
}

test();