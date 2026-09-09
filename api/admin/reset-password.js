import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = verifyToken(req);
  if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const { targetUsername, newPassword } = req.body || {};
  if (!targetUsername || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  const hash = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password_hash = ${hash} WHERE username = ${targetUsername}`;
  res.status(200).json({ success: true });
}
