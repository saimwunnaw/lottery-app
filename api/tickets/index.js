import { sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const auth = verifyToken(req);
    if (auth) {
      // Logged-in view: full detail, all statuses
      const rows = await sql`
        SELECT t.*, c.name AS customer_name
        FROM tickets t
        LEFT JOIN customers c ON c.id = t.sold_to
        ORDER BY t.tier, t.number
      `;
      return res.status(200).json(rows);
    } else {
      // Public view: only available tickets, minimal fields
      const rows = await sql`
        SELECT id, number, tier FROM tickets
        WHERE status = 'available'
        ORDER BY tier, number
      `;
      return res.status(200).json(rows);
    }
  }

  if (req.method === 'POST') {
    const auth = verifyToken(req);
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });

    const { ticketIds, customerId } = req.body || {};
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: 'No tickets selected' });
    }

    for (const id of ticketIds) {
      await sql`
        UPDATE tickets
        SET status = 'sold', sold_by = ${auth.id}, sold_to = ${customerId || null}, sold_at = now()
        WHERE id = ${id} AND status = 'available'
      `;
    }
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
