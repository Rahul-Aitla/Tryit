import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    // Get the latest job with full details
    const jobs = await client.query(`
      SELECT j.id, j.status, j."outfitId", j."outputsRequested", j."retryCount", 
             j."failedReason", j."createdAt", j.prompt,
             COUNT(gi.id) as "generatedCount",
             array_agg(gi."imageUrl") FILTER (WHERE gi.id IS NOT NULL) as images,
             o."imageUrl" as "outfitUrl"
      FROM "GenerationJob" j
      LEFT JOIN "GeneratedImage" gi ON gi."jobId" = j.id
      LEFT JOIN "Outfit" o ON o.id = j."outfitId"
      GROUP BY j.id, o."imageUrl"
      ORDER BY j."createdAt" DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Latest Jobs (full details):');
    for (const row of jobs.rows) {
      console.log(`\n  Job: ${row.id}`);
      console.log(`  Status: ${row.status}`);
      console.log(`  Created: ${row.createdAt}`);
      console.log(`  Requested: ${row.outputsRequested} images`);
      console.log(`  Generated: ${row.generatedCount}`);
      console.log(`  Outfit URL: ${row.outfitUrl?.slice(0,60)}...`);
      console.log(`  Generated URLs: ${JSON.stringify(row.images)}`);
      if (row.failedReason) console.log(`  ⚠️  Failed reason: ${row.failedReason}`);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
