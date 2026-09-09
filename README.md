# Lottery Ticket App

Public storefront + admin/user login for selling lottery tickets.

## What's inside
- `src/` — React frontend (public page, login, dashboard)
- `api/` — Vercel serverless functions (login, tickets, customers, admin)
- `sql/schema.sql` — run this once to create tables and seed the 72 tickets

## Local development
```
npm install
npm run dev
```
(API routes only run when deployed to Vercel, or via `vercel dev` if you install the Vercel CLI.)

## Deploying — see the step-by-step guide from Claude for the click-by-click walkthrough.
Summary:
1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. In the Vercel project, add "Storage" → "Postgres" (free tier).
4. Set an environment variable `JWT_SECRET` to any long random string.
5. Run `sql/schema.sql` once in the Postgres query editor in the Vercel dashboard.
6. Create your first admin user (see below) directly in the database, since no users exist yet.

### Creating the first admin user
There's no signup page on purpose (only admins create accounts). To create the very first admin,
run this in the Vercel Postgres query editor, replacing the password hash:

You'll get exact instructions and the hash for your chosen password from Claude during setup.
