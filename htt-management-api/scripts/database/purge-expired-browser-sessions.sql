-- Optional maintenance, never run automatically. Execute only with the dedicated migrator.
-- Does not delete users, credentials, customer/employee profiles or business/audit data.
-- Run small batches outside peak hours; retain expired session groups for at least 24 hours.
BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='15s';
DO $$
DECLARE targets uuid[];
BEGIN
 SELECT array_agg(id) INTO targets FROM (
 SELECT id FROM identity.refresh_family WHERE expires_at<clock_timestamp()-interval '24 hours'
 ORDER BY expires_at LIMIT 1000 FOR UPDATE SKIP LOCKED) expired;
 DELETE FROM identity.login_session WHERE refresh_family_id=ANY(targets);
 DELETE FROM identity.refresh_token WHERE family_id=ANY(targets);
 DELETE FROM identity.refresh_family WHERE id=ANY(targets);
END $$;
COMMIT;
