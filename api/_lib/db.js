import { neon } from '@neondatabase/serverless';

// Neon's tagged-template `sql` resolves directly to an array of rows
// (not { rows: [...] } like @vercel/postgres) — every api/*.js file
// destructures accordingly: `const rows = await sql\`...\`;`
export const sql = neon(process.env.DATABASE_URL);
