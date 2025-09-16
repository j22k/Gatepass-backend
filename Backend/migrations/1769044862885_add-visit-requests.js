/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(`
    -- Visit Requests table for public visitors
    CREATE TABLE visit_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      visitor_name TEXT NOT NULL,
      visitor_email TEXT NOT NULL,
      visitor_phone TEXT,
      accompanying_persons JSONB DEFAULT '[]', -- Array of objects: [{name, phone, email}]
      visit_date DATE NOT NULL,
      visit_time TEXT NOT NULL CHECK (visit_time IN ('forenoon', 'afternoon')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      visitor_type_id UUID NOT NULL REFERENCES visitor_types(id),
      description TEXT, -- Visit purpose
      warehouse_id UUID NOT NULL REFERENCES warehouses(id),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      updated_at TIMESTAMPTZ,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      approval_time TIMESTAMPTZ
    );
    
    -- Add permissions for visit requests
    INSERT INTO permissions (name, description) VALUES
      ('visit_request.read', 'Read visit requests'),
      ('visit_request.create', 'Create visit requests'),
      ('visit_request.update', 'Update visit requests'),
      ('visit_request.approve', 'Approve or reject visit requests');
      
    -- Grant these permissions to Admin role
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id 
    FROM roles r, permissions p 
    WHERE r.name = 'Admin' 
    AND p.name LIKE 'visit_request.%';
    
    -- Grant approve permission to Manager and QA roles
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id 
    FROM roles r, permissions p 
    WHERE r.name IN ('Manager','QA' ) 
    AND p.name = 'visit_request.approve';
    
    -- Create indexes
    CREATE INDEX idx_visit_requests_status ON visit_requests(status);
    CREATE INDEX idx_visit_requests_date ON visit_requests(visit_date);
    CREATE INDEX idx_visit_requests_warehouse ON visit_requests(warehouse_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS visit_requests CASCADE;
    DELETE FROM permissions WHERE name LIKE 'visit_request.%';
  `);
};
