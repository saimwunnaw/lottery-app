import { sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  const auth = verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT * FROM customers WHERE created_by = ${auth.id} ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, phone, notes } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await sql`
      INSERT INTO customers (name, phone, notes, created_by)
      VALUES (${name}, ${phone || null}, ${notes || null}, ${auth.id})
      RETURNING *
    `;
    return res.status(200).json(rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
