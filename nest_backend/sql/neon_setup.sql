-- Run this inside Neon SQL editor for project: empty-water-86466162

-- Optional: create a dedicated database for this app.
-- Skip if you want to use Neon default database.
CREATE DATABASE nest_next_ecom;

-- If you created a new DB, connect to it in Neon UI before running below.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

