import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL || "";

declare global {
  var _mizanPgPool: Pool | undefined;
}

export const pool =
  global._mizanPgPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000
  });

pool.on("error", () => {
  void 0;
});

if (process.env.NODE_ENV !== "production") {
  global._mizanPgPool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}
