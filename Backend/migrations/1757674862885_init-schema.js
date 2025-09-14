/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Permissions (granular access control)
    CREATE TABLE permissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      resource TEXT NOT NULL, -- e.g., 'users', 'visitors', 'warehouses', 'visitor_types'
      action TEXT NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete', 'approve'
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Roles
    CREATE TABLE roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Role Permissions (many-to-many)
    CREATE TABLE role_permissions (
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (role_id, permission_id)
    );

    -- Users (single role per user enforced via role_id)
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login TIMESTAMPTZ,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT
    );

    -- Warehouses
    CREATE TABLE warehouses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      address TEXT,
      timezone TEXT DEFAULT 'UTC',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL
    );

    -- Visitor Types (CRUD managed by Admin)
    CREATE TABLE IF NOT EXISTS visitor_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT visitor_types_name_not_blank CHECK (btrim(name) <> '')
    );

    -------------------------------------------------------------------------
    -- SEED DATA (Roles & Permissions)
    -------------------------------------------------------------------------

    -- Roles
    INSERT INTO roles (name, description) VALUES
      ('Admin', 'Full system access'),
      ('Visitor', 'Can create visit requests only'),
      ('Manager', 'Can approve visitor requests'),
      ('Receptionist', 'Can approve visitor requests'),
      ('QA', 'Quality Assurance role');

    -- Permissions
    INSERT INTO permissions (name, resource, action, description) VALUES
      -- User permissions
      ('user.create', 'users', 'create', 'Create new user'),
      ('user.read', 'users', 'read', 'Read user information'),
      ('user.update', 'users', 'update', 'Update user information'),
      ('user.delete', 'users', 'delete', 'Delete user'),

      -- Warehouse permissions
      ('warehouse.create', 'warehouses', 'create', 'Create new warehouse'),
      ('warehouse.read', 'warehouses', 'read', 'Read warehouse information'),
      ('warehouse.update', 'warehouses', 'update', 'Update warehouse'),
      ('warehouse.delete', 'warehouses', 'delete', 'Delete warehouse'),

      -- Visitor permissions
      ('visitor.create', 'visitors', 'create', 'Create new visitor entry'),
      ('visitor.read', 'visitors', 'read', 'Read visitor information'),
      ('visitor.update.approve', 'visitors', 'approve', 'Approve visitor entry'),
      ('visitor.delete', 'visitors', 'delete', 'Delete visitor entry'),

      -- Visitor type permissions (Admin-only)
      ('visitor_type.create', 'visitor_types', 'create', 'Create visitor types'),
      ('visitor_type.read',   'visitor_types', 'read',   'Read visitor types'),
      ('visitor_type.update', 'visitor_types', 'update', 'Update visitor types'),
      ('visitor_type.delete', 'visitor_types', 'delete', 'Delete visitor types');

    -- Optional seed example type (e.g., Auditor)
    INSERT INTO visitor_types (name, description)
    VALUES ('Auditor', 'Auditor visitor type')
    ON CONFLICT (name) DO NOTHING;

    -- Map roles to permissions
    -- Admin gets everything
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r, permissions p
    WHERE r.name = 'Admin';

    -- Visitor can only create visitor entries
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.name = 'visitor.create'
    WHERE r.name = 'Visitor';

    -- Manager can approve visitors
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.name = 'visitor.update.approve'
    WHERE r.name = 'Manager';

    -- Receptionist can approve visitors
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.name = 'visitor.update.approve'
    WHERE r.name = 'Receptionist';

    -- Indexes for performance
    CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role_id ON users(role_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Drop in dependency-safe order
    DROP TABLE IF EXISTS role_permissions CASCADE;
    DROP TABLE IF EXISTS warehouses CASCADE;
    DROP TABLE IF EXISTS visitor_types CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS permissions CASCADE;
    DROP TABLE IF EXISTS roles CASCADE;
  `);
};