import { sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { numbers, tier } = req.body || {};
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'No numbers provided' });
  }
  if (!['single', 'pair', 'triple'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  // Keep only clean 6-digit numbers, de-duplicated within this batch
  const clean = [...new Set(numbers.map((n) => String(n).trim()).filter((n) => /^\d{6}$/.test(n)))];
  if (clean.length === 0) {
    return res.status(400).json({ error: 'No valid 6-digit numbers found' });
  }

  let added = 0;
  let skipped = 0;
  for (const number of clean) {
    try {
      await sql`INSERT INTO tickets (number, tier) VALUES (${number}, ${tier})`;
      added++;
    } catch (e) {
      // Unique constraint violation = already exists, skip it
      skipped++;
    }
  }

  res.status(200).json({ success: true, added, skipped, total: clean.length });
}
