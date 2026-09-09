-- Run this once in the Vercel Postgres query editor (or via psql)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pair','single')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold')),
  sold_by INTEGER REFERENCES users(id),
  sold_to INTEGER REFERENCES customers(id),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 72 tickets
INSERT INTO tickets (number, tier) VALUES ('351048', 'pair');
INSERT INTO tickets (number, tier) VALUES ('409761', 'pair');
INSERT INTO tickets (number, tier) VALUES ('609263', 'pair');
INSERT INTO tickets (number, tier) VALUES ('964841', 'pair');
INSERT INTO tickets (number, tier) VALUES ('229032', 'pair');
INSERT INTO tickets (number, tier) VALUES ('057300', 'pair');
INSERT INTO tickets (number, tier) VALUES ('911007', 'pair');
INSERT INTO tickets (number, tier) VALUES ('367500', 'pair');
INSERT INTO tickets (number, tier) VALUES ('064512', 'pair');
INSERT INTO tickets (number, tier) VALUES ('433712', 'pair');
INSERT INTO tickets (number, tier) VALUES ('570953', 'pair');
INSERT INTO tickets (number, tier) VALUES ('092070', 'pair');
INSERT INTO tickets (number, tier) VALUES ('200052', 'pair');
INSERT INTO tickets (number, tier) VALUES ('000193', 'pair');
INSERT INTO tickets (number, tier) VALUES ('777753', 'pair');
INSERT INTO tickets (number, tier) VALUES ('100133', 'pair');
INSERT INTO tickets (number, tier) VALUES ('737630', 'pair');
INSERT INTO tickets (number, tier) VALUES ('025506', 'pair');
INSERT INTO tickets (number, tier) VALUES ('730836', 'pair');
INSERT INTO tickets (number, tier) VALUES ('340371', 'pair');
INSERT INTO tickets (number, tier) VALUES ('159180', 'pair');
INSERT INTO tickets (number, tier) VALUES ('532571', 'pair');
INSERT INTO tickets (number, tier) VALUES ('841453', 'single');
INSERT INTO tickets (number, tier) VALUES ('006563', 'single');
INSERT INTO tickets (number, tier) VALUES ('920035', 'single');
INSERT INTO tickets (number, tier) VALUES ('804010', 'single');
INSERT INTO tickets (number, tier) VALUES ('390306', 'single');
INSERT INTO tickets (number, tier) VALUES ('860337', 'single');
INSERT INTO tickets (number, tier) VALUES ('450337', 'single');
INSERT INTO tickets (number, tier) VALUES ('008076', 'single');
INSERT INTO tickets (number, tier) VALUES ('280015', 'single');
INSERT INTO tickets (number, tier) VALUES ('200803', 'single');
INSERT INTO tickets (number, tier) VALUES ('382003', 'single');
INSERT INTO tickets (number, tier) VALUES ('502208', 'single');
INSERT INTO tickets (number, tier) VALUES ('115884', 'single');
INSERT INTO tickets (number, tier) VALUES ('056061', 'single');
INSERT INTO tickets (number, tier) VALUES ('653343', 'single');
INSERT INTO tickets (number, tier) VALUES ('810343', 'single');
INSERT INTO tickets (number, tier) VALUES ('608315', 'single');
INSERT INTO tickets (number, tier) VALUES ('245215', 'single');
INSERT INTO tickets (number, tier) VALUES ('878670', 'single');
INSERT INTO tickets (number, tier) VALUES ('961670', 'single');
INSERT INTO tickets (number, tier) VALUES ('422670', 'single');
INSERT INTO tickets (number, tier) VALUES ('105048', 'single');
INSERT INTO tickets (number, tier) VALUES ('381502', 'single');
INSERT INTO tickets (number, tier) VALUES ('905302', 'single');
INSERT INTO tickets (number, tier) VALUES ('836602', 'single');
INSERT INTO tickets (number, tier) VALUES ('477161', 'single');
INSERT INTO tickets (number, tier) VALUES ('624696', 'single');
INSERT INTO tickets (number, tier) VALUES ('782096', 'single');
INSERT INTO tickets (number, tier) VALUES ('023626', 'single');
INSERT INTO tickets (number, tier) VALUES ('364626', 'single');
INSERT INTO tickets (number, tier) VALUES ('678026', 'single');
INSERT INTO tickets (number, tier) VALUES ('011882', 'single');
INSERT INTO tickets (number, tier) VALUES ('868082', 'single');
INSERT INTO tickets (number, tier) VALUES ('882082', 'single');
INSERT INTO tickets (number, tier) VALUES ('539082', 'single');
INSERT INTO tickets (number, tier) VALUES ('932096', 'single');
INSERT INTO tickets (number, tier) VALUES ('151800', 'single');
INSERT INTO tickets (number, tier) VALUES ('125076', 'single');
INSERT INTO tickets (number, tier) VALUES ('424676', 'single');
INSERT INTO tickets (number, tier) VALUES ('132868', 'single');
INSERT INTO tickets (number, tier) VALUES ('209868', 'single');
INSERT INTO tickets (number, tier) VALUES ('548868', 'single');
INSERT INTO tickets (number, tier) VALUES ('067306', 'single');
INSERT INTO tickets (number, tier) VALUES ('770853', 'single');
INSERT INTO tickets (number, tier) VALUES ('938253', 'single');
INSERT INTO tickets (number, tier) VALUES ('236853', 'single');
INSERT INTO tickets (number, tier) VALUES ('039753', 'single');
INSERT INTO tickets (number, tier) VALUES ('033036', 'single');
INSERT INTO tickets (number, tier) VALUES ('965010', 'single');
INSERT INTO tickets (number, tier) VALUES ('608701', 'single');
