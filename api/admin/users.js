import { sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = verifyToken(req);
  if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const { rows } = await sql`SELECT id, username, role, created_at FROM users ORDER BY created_at`;
  res.status(200).json(rows);
}
