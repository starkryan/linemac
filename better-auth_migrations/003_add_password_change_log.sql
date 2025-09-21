-- Create password change log table
CREATE TABLE password_change_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    changed_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create index for faster queries
CREATE INDEX idx_password_change_log_user_id ON password_change_log(user_id);
CREATE INDEX idx_password_change_log_changed_by ON password_change_log(changed_by);
CREATE INDEX idx_password_change_log_changed_at ON password_change_log(changed_at);

-- Add comments
COMMENT ON TABLE password_change_log IS 'Audit log for password changes';
COMMENT ON COLUMN password_change_log.user_id IS 'User whose password was changed';
COMMENT ON COLUMN password_change_log.changed_by IS 'Admin who changed the password';
COMMENT ON COLUMN password_change_log.changed_at IS 'When the password was changed';
COMMENT ON COLUMN password_change_log.ip_address IS 'IP address from which the change was made';
COMMENT ON COLUMN password_change_log.user_agent IS 'User agent string of the client';