-- Add a UNIQUE constraint on (user_id, url) so upsert with onConflict works.
-- Run this in Supabase: SQL Editor → New query → paste and run.

ALTER TABLE products
ADD CONSTRAINT products_user_id_url_key UNIQUE (user_id, url);
