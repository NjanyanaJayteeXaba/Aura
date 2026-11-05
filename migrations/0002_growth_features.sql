ALTER TABLE users ADD COLUMN avatar TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN available INTEGER NOT NULL DEFAULT 1;
ALTER TABLE profiles ADD COLUMN custom_domain TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN services TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN verified TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_profiles_available ON profiles(available);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON profiles(custom_domain);
