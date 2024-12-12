-- Add indexes for better query performance
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_role (role);
ALTER TABLE users ADD INDEX idx_status (status);
ALTER TABLE users ADD INDEX idx_refresh_token (refresh_token);

ALTER TABLE auth_tokens ADD INDEX idx_user_token (user_id, token);
ALTER TABLE auth_tokens ADD INDEX idx_token_type (type);
ALTER TABLE auth_tokens ADD INDEX idx_expires_at (expires_at);
ALTER TABLE auth_tokens ADD INDEX idx_revoked (revoked);

-- Rest of the indexes remain the same...