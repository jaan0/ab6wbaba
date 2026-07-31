import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = ReturnType<typeof createDb>;

function createDb(): ReturnType<typeof drizzle<typeof schema>> {
  return drizzle(neon(process.env.DATABASE_URL!), { schema });
}

// Lazy singleton — only instantiated on first request, not at module load
let _instance: DB | undefined;

export function getDb(): DB {
  if (!_instance) _instance = createDb();
  return _instance;
}
