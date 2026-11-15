-- Passwords are stored as scrypt hashes ("scrypt:<salt>:<hash>"), never plain text.
-- Brand logins live only in brand_users; the legacy brands.client_* columns are removed.
-- Applied while both tables were empty, so no data conversion is needed.

ALTER TABLE brand_users RENAME COLUMN password TO password_hash;
ALTER TABLE brand_users
  ADD CONSTRAINT brand_users_password_hash_format CHECK (password_hash LIKE 'scrypt:%:%');

ALTER TABLE brands DROP COLUMN IF EXISTS client_email;
ALTER TABLE brands DROP COLUMN IF EXISTS client_password;
