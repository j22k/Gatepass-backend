/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE warehouse (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL UNIQUE,
      location TEXT,
      is_active BOOLEAN DEFAULT TRUE,  -- Added for soft deletes
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE warehouse_time_slots (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      "from" TIME NOT NULL,
      "to" TIME NOT NULL,
      warehouse_id UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT TRUE,  -- Added for soft deletes
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE visitor_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,  -- Added for soft deletes
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TYPE user_role AS ENUM ('Admin', 'Receptionist', 'Approver');

    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password TEXT NOT NULL,
      designation VARCHAR(100),  -- New column for department-like info
      role user_role NOT NULL,   -- New enum column for roles
      warehouse_id UUID REFERENCES warehouse(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE visitor_request (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(150),
      visitor_type_id UUID NOT NULL REFERENCES visitor_types(id),
      warehouse_id UUID NOT NULL REFERENCES warehouse(id),
      warehouse_time_slot_id UUID NOT NULL REFERENCES warehouse_time_slots(id),
      accompanying JSONB DEFAULT '[]',
      date DATE NOT NULL CHECK (date >= CURRENT_DATE),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),

      -- Visit tracking fields
      visit_status VARCHAR(20) DEFAULT 'pending'
          CHECK (visit_status IN ('pending','visited','no_show')),  
      punctuality VARCHAR(10) 
          CHECK (punctuality IN ('on_time','late')),                
      arrived_at TIMESTAMP,                                         -- Actual arrival time
      checked_out_at TIMESTAMP,                                     -- Actual checkout time

      tracking_code VARCHAR(8) UNIQUE,  -- Short code for guest tracking
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE warehouse_workflow (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      warehouse_id UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
      visitor_type_id UUID NOT NULL REFERENCES visitor_types(id),
      step_no INT NOT NULL,
      approver UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (warehouse_id, visitor_type_id, step_no)
    );

    CREATE TABLE approval (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      visitor_request_id UUID NOT NULL REFERENCES visitor_request(id) ON DELETE CASCADE,
      step_no INT NOT NULL,
      approver UUID NOT NULL REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE OR REPLACE FUNCTION insert_approvals_for_request()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO approval (visitor_request_id, step_no, approver)
      SELECT NEW.id, wf.step_no, wf.approver
      FROM warehouse_workflow wf
      WHERE wf.warehouse_id = NEW.warehouse_id
        AND wf.visitor_type_id = NEW.visitor_type_id
      ORDER BY wf.step_no;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_insert_approvals
    AFTER INSERT ON visitor_request
    FOR EACH ROW
    EXECUTE FUNCTION insert_approvals_for_request();

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_warehouse_updated_at BEFORE UPDATE ON warehouse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_warehouse_time_slots_updated_at BEFORE UPDATE ON warehouse_time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_visitor_types_updated_at BEFORE UPDATE ON visitor_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_visitor_request_updated_at BEFORE UPDATE ON visitor_request FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_warehouse_workflow_updated_at BEFORE UPDATE ON warehouse_workflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_approval_updated_at BEFORE UPDATE ON approval FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_insert_approvals ON visitor_request;
    DROP TRIGGER IF EXISTS update_warehouse_updated_at ON warehouse;
    DROP TRIGGER IF EXISTS update_warehouse_time_slots_updated_at ON warehouse_time_slots;
    DROP TRIGGER IF EXISTS update_visitor_types_updated_at ON visitor_types;
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_visitor_request_updated_at ON visitor_request;
    DROP TRIGGER IF EXISTS update_warehouse_workflow_updated_at ON warehouse_workflow;
    DROP TRIGGER IF EXISTS update_approval_updated_at ON approval;
    DROP FUNCTION IF EXISTS insert_approvals_for_request();
    DROP FUNCTION IF EXISTS update_updated_at_column();
    DROP TABLE IF EXISTS approval CASCADE;
    DROP TABLE IF EXISTS warehouse_workflow CASCADE;
    DROP TABLE IF EXISTS visitor_request CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS visitor_types CASCADE;
    DROP TABLE IF EXISTS warehouse_time_slots CASCADE;
    DROP TABLE IF EXISTS warehouse CASCADE;
    DROP TYPE IF EXISTS user_role;
  `);
};