-- Access control entries for the Certificate Verification System (Problem 3)
-- Adds a sidebar menu + screen + API permissions, then grants them to Admin (role_id = 1).

-- 1. Insert access control entries (idempotent via ON CONFLICT on unique (path, method))
INSERT INTO access_controls (name, path, icon, parent_path, hierarchy_id, type, method)
VALUES
  ('Certificates', 'certificate_parent', 'communication.svg', NULL, 9, 'menu-screen', NULL),
  ('Certificate Management', 'certificates', NULL, 'certificate_parent', 1, 'menu-screen', NULL),
  ('Issue certificate', '/api/v1/certificates', NULL, 'certificate_parent', NULL, 'api', 'POST'),
  ('Verify certificate', '/api/v1/certificates/verify/:certificateId', NULL, 'certificate_parent', NULL, 'api', 'GET'),
  ('Get student certificates', '/api/v1/certificates/student/:studentId', NULL, 'certificate_parent', NULL, 'api', 'GET'),
  ('Revoke certificate', '/api/v1/certificates/revoke/:certificateId', NULL, 'certificate_parent', NULL, 'api', 'POST')
ON CONFLICT (path, method) DO NOTHING;

-- 2. Grant all certificate access controls to the Admin role (role_id = 1)
INSERT INTO permissions (role_id, access_control_id, type)
SELECT 1, ac.id, ac.type
FROM access_controls ac
WHERE ac.parent_path = 'certificate_parent' OR ac.path = 'certificate_parent'
ON CONFLICT (role_id, access_control_id) DO NOTHING;
