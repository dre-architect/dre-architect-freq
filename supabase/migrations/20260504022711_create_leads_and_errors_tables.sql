/*
  # Create leads and client_errors tables

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `name` (text, not null)
      - `organization` (text, default empty)
      - `created_at` (timestamptz, default now())
    - `client_errors`
      - `id` (uuid, primary key)
      - `message` (text, not null)
      - `source` (text)
      - `lineno` (integer)
      - `colno` (integer)
      - `url` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - leads: allow authenticated inserts only (form submissions)
    - client_errors: allow anonymous inserts (error capture script)
    - No read access from client (data is admin-only)
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  organization text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  source text DEFAULT '',
  lineno integer DEFAULT 0,
  colno integer DEFAULT 0,
  url text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_errors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for client error capture
CREATE POLICY "Allow anonymous error inserts"
  ON client_errors FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated inserts for lead capture
CREATE POLICY "Allow authenticated lead inserts"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon inserts for leads (form submissions from unauthenticated users)
CREATE POLICY "Allow anonymous lead inserts"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);
