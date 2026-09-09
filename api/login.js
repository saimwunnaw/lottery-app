import bcrypt from 'bcryptjs';
import { sql } from './_lib/db.js';
import { signToken } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  const { rows } = await sql`SELECT * FROM users WHERE username = ${username}`;
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

  const token = signToken(user);
  res.status(200).json({ token, username: user.username, role: user.role });
}
