import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL, // Use direct URL to avoid pgbouncer
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    // Delete generated images with Unsplash URLs
    const r1 = await client.query(`DELETE FROM "GeneratedImage" WHERE "imageUrl" LIKE '%unsplash.com%'`);
    console.log(`✅ Deleted ${r1.rowCount} broken Unsplash image records.`);

    // Delete failed jobs
    const r2 = await client.query(`DELETE FROM "GenerationJob" WHERE "status" = 'Failed'`);
    console.log(`✅ Deleted ${r2.rowCount} failed generation job records.`);

    // Show what's left
    const r3 = await client.query(`SELECT COUNT(*) FROM "GeneratedImage"`);
    console.log(`📊 Remaining generated images in DB: ${r3.rows[0].count}`);
    
    const r4 = await client.query(`SELECT "id", "status", "createdAt" FROM "GenerationJob" ORDER BY "createdAt" DESC LIMIT 5`);
    console.log(`📊 Recent jobs:`, r4.rows);
    
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
