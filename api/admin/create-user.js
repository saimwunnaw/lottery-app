import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = verifyToken(req);
  if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const { username, password, role } = req.body || {};
  if (!username || !password || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    await sql`INSERT INTO users (username, password_hash, role) VALUES (${username}, ${hash}, ${role})`;
  } catch (e) {
    return res.status(400).json({ error: 'That username already exists' });
  }
  res.status(200).json({ success: true });
}
