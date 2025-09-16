/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Roles
    CREATE TABLE roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Warehouses
    CREATE TABLE warehouses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      address TEXT,
      timezone TEXT DEFAULT 'UTC',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID,
      updated_at TIMESTAMPTZ,
      updated_by UUID
    );

    -- Users (each user has one role and works at one warehouse)
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login TIMESTAMPTZ,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
      warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT
    );

    -- Visitor Types
    CREATE TABLE visitor_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT visitor_types_name_not_blank CHECK (btrim(name) <> '')
    );

    -- Permissions
    CREATE TABLE permissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Role-Permissions join table
    CREATE TABLE role_permissions (
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    -------------------------------------------------------------------------
    -- Seed Data
    -------------------------------------------------------------------------

    -- Roles
    INSERT INTO roles (name, description) VALUES
      ('Admin', 'Full system access'),
      ('Manager', 'Can approve visitor requests'),
      ('Receptionist', 'Can approve visitor requests'),
      ('QA', 'Quality Assurance role');

    -- Example warehouse
    INSERT INTO warehouses (name, address, timezone)
    VALUES ('Default Warehouse', 'HQ Address', 'UTC')
    ON CONFLICT (name) DO NOTHING;

    -- Example visitor type
    INSERT INTO visitor_types (name, description)
    VALUES ('Auditor', 'Auditor visitor type')
    ON CONFLICT (name) DO NOTHING;

    -- Permissions
    INSERT INTO permissions (name, description) VALUES
      ('user.read', 'Read users'),
      ('user.create', 'Create users'),
      ('user.update', 'Update users'),
      ('user.delete', 'Delete users'),
      ('role.read', 'Read roles'),
      ('role.create', 'Create roles'),
      ('role.update', 'Update roles'),
      ('role.delete', 'Delete roles'),
      ('warehouse.read', 'Read warehouses'),
      ('warehouse.create', 'Create warehouses'),
      ('warehouse.update', 'Update warehouses'),
      ('warehouse.delete', 'Delete warehouses'),
      ('visitor_type.read', 'Read visitor types'),
      ('visitor_type.create', 'Create visitor types'),
      ('visitor_type.update', 'Update visitor types'),
      ('visitor_type.delete', 'Delete visitor types'),
      ('permission.read', 'Read permissions');

    -- Grant all permissions to Admin role
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'Admin';

    -------------------------------------------------------------------------
    -- Indexes
    -------------------------------------------------------------------------
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role_id ON users(role_id);
    CREATE INDEX idx_users_warehouse_id ON users(warehouse_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS role_permissions CASCADE;
    DROP TABLE IF EXISTS permissions CASCADE;
    DROP TABLE IF EXISTS visitor_types CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS warehouses CASCADE;
    DROP TABLE IF EXISTS roles CASCADE;
  `);
};
