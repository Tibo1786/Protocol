-- Enable RLS on the rules table
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- Force RLS even for the table owner (prevents superuser bypass)
ALTER TABLE rules FORCE ROW LEVEL SECURITY;

-- SELECT: only rows belonging to the session's active org
CREATE POLICY rules_select_own_org
  ON rules
  FOR SELECT
  USING (organisation_id = current_setting('app.current_org_id', TRUE));

-- INSERT: prevent org injection via client-supplied data
CREATE POLICY rules_insert_own_org
  ON rules
  FOR INSERT
  WITH CHECK (organisation_id = current_setting('app.current_org_id', TRUE));

-- UPDATE
CREATE POLICY rules_update_own_org
  ON rules
  FOR UPDATE
  USING      (organisation_id = current_setting('app.current_org_id', TRUE))
  WITH CHECK (organisation_id = current_setting('app.current_org_id', TRUE));

-- DELETE
CREATE POLICY rules_delete_own_org
  ON rules
  FOR DELETE
  USING (organisation_id = current_setting('app.current_org_id', TRUE));
