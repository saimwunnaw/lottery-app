import bcrypt from 'bcryptjs';
import { sql } from './_lib/db.js';
import { verifyToken } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  const { rows } = await sql`SELECT * FROM users WHERE id = ${auth.id}`;
  const user = rows[0];
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

  const newHash = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${auth.id}`;
  res.status(200).json({ success: true });
}
