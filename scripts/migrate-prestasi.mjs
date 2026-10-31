import fs from "fs";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const data = JSON.parse(
  fs.readFileSync("/opt/data/home/mizan.apps/scripts/prestasi-data.json", "utf-8")
);

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Beginning fast batch migration of prestasi dataset...");
    await client.query("BEGIN");

    await client.query(`
      UPDATE categories
      SET name = 'Prestasi Akademik, Bahasa & Kepemimpinan'
      WHERE code = 'E';
    `);

    await client.query(`
      DELETE FROM indicators WHERE type = 'HASANAH';
    `);

    await client.query(`
      DELETE FROM unsurs WHERE type = 'HASANAH';
    `);

    const unsursList = [];
    const indicatorsList = [];

    for (const cat of data) {
      for (const unsur of cat.unsurs) {
        unsursList.push({
          id: unsur.id,
          category_name: cat.name,
          name: unsur.name,
          type: "HASANAH"
        });
        for (const ind of unsur.indicators) {
          indicatorsList.push({
            id: ind.id,
            unsur_id: unsur.id,
            text: ind.text,
            type: "HASANAH",
            default_score: ind.default_score,
            tingkat: ind.tingkat
          });
        }
      }
    }

    const CHUNK_SIZE = 50;
    for (let i = 0; i < unsursList.length; i += CHUNK_SIZE) {
      const chunk = unsursList.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = chunk
        .map((u, idx) => {
          const offset = idx * 4;
          values.push(u.id, u.category_name, u.name, u.type);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
        })
        .join(", ");

      await client.query(
        `INSERT INTO unsurs (id, category_name, name, type)
         VALUES ${placeholders}
         ON CONFLICT (id) DO UPDATE SET
           category_name = EXCLUDED.category_name,
           name = EXCLUDED.name,
           type = EXCLUDED.type`,
        values
      );
    }

    for (let i = 0; i < indicatorsList.length; i += CHUNK_SIZE) {
      const chunk = indicatorsList.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = chunk
        .map((ind, idx) => {
          const offset = idx * 6;
          values.push(
            ind.id,
            ind.unsur_id,
            ind.text,
            ind.type,
            ind.default_score,
            ind.tingkat
          );
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
        })
        .join(", ");

      await client.query(
        `INSERT INTO indicators (id, unsur_id, text, type, default_score, tingkat)
         VALUES ${placeholders}
         ON CONFLICT (id) DO UPDATE SET
           unsur_id = EXCLUDED.unsur_id,
           text = EXCLUDED.text,
           type = EXCLUDED.type,
           default_score = EXCLUDED.default_score,
           tingkat = EXCLUDED.tingkat`,
        values
      );
    }

    await client.query("COMMIT");
    console.log(`Successfully migrated ${unsursList.length} unsurs and ${indicatorsList.length} indicators for Prestasi!`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
