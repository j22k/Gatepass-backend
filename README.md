# Gatepass Backend

## Project Description
This is the backend API for a Gatepass Management System built with Node.js, Express, and PostgreSQL. It manages users, roles, warehouses, visitor types, and visitor requests. Features include:

- **Role-Based Access Control (RBAC)** with dynamic roles and permissions
- **JWT Authentication** for secure API access
- **User Management** (CRUD for users, assign roles and warehouses)
- **Role Management** (CRUD for roles, assign permissions to roles)
- **Permission Management** (CRUD for permissions, assign to roles)
- **Warehouse Management** (CRUD for warehouses)
- **Visitor Type Management** (CRUD for visitor types)
- **Visitor Request Management** (for public visitors)
- **Admin and Non-Admin User Support**
- **Multi-warehouse support**
- **Audit fields** (created_by, updated_by, timestamps)
- **Secure password hashing**
- **API-first design** (ready for frontend integration)
- **Health check endpoint**
- **Environment-based configuration**
- **Seed scripts for initial admin user and roles**
- **CORS enabled for frontend integration**
- **Comprehensive input validation** with detailed error messages

## Required Tools
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repo)
- **curl/Postman** (for API testing)

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Gate-pass/Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
- Install and start PostgreSQL on your system.
- Create a database named `gate_pass_db` (or update `DATABASE_URL` in `.env`).
- Ensure PostgreSQL is running on the default port (5432) or update the connection string.

### 4. Environment Variables
Create a `.env` file in the `Backend` directory with the following (copy from `.env` example):
```
DATABASE_URL="postgres://username:password@localhost:5432/gate_pass_db"
NODE_ENV=development
PGSSLMODE=disable
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=+1000000000
ADMIN_PASSWORD=Admin@123
ADMIN_ROLE=Admin
ADMIN_ROLE_DESC=System administrator
JWT_SECRET=your_jwt_secret_here
```
- Replace placeholders with your actual values.
- The `JWT_SECRET` should be a strong, unique string.

### 5. Run Migrations
**Important:** Ensure PostgreSQL is running and your `.env` file has the correct `DATABASE_URL`. Then, initialize the database schema:
```bash
npm run migrate:up
```
**Troubleshooting:** 
- If you encounter "column 'visitor_name' of relation 'visit_requests' does not exist", this indicates the database schema is outdated or migrations weren't applied.
- **For development:** Ensure your local PostgreSQL database exists and run `npm run migrate:up`
- **For production:** Switch to the production database URL in `.env` file:
  ```
  DATABASE_URL=postgresql://gate_pass_db_user:CcbRfoDrB03EMpbvBp66Vj5O0n9ZCzWo@dpg-d326cbur433s73933r0g-a.oregon-postgres.render.com/gate_pass_db
  NODE_ENV=production
  PGSSLMODE=require
  ```
- Restart the server after changing the database configuration
- If the error persists, check if the migration files exist in the `migrations` folder and run them manually

### 6. Seed Admin User
Create the initial admin user:
```bash
npm run seed:admin
```

## Starting the Application
Run the development server:
```bash
npm run dev
```
The server will start on `http://localhost:5000` (or the port specified in `.env`).

For production:
```bash
npm start
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Standard Headers
For authenticated endpoints:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

For public endpoints:
```
Content-Type: application/json
```

### Standard Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

#### Error Response
```json
{
  "error": "Error type",
  "message": "Human readable error message",
  "details": ["specific validation errors"],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

## API Endpoints

### 1. Authentication

#### Login
**Endpoint:** `POST /login`  
**Description:** Authenticate user and receive JWT token  
**Authentication:** Not required  

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirectUrl": "/admin/dashboard"
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "email is required",
    "email must be a valid email address"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **401 - Invalid Credentials:**
```json
{
  "error": "Invalid credentials",
  "message": "Authentication failed",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Login failed",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

---

### 2. Admin - User Management

#### Get All Users
**Endpoint:** `GET /admin/users`  
**Description:** Retrieve all users with role and warehouse information  
**Permission Required:** `user.read`  

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "last_login": "2023-01-01T12:00:00.000Z",
      "role_name": "Admin",
      "warehouse_name": "Default Warehouse"
    }
  ]
}
```

**Error Responses:**
- **401 - Unauthorized:**
```json
{
  "error": "Unauthorized: missing user identity"
}
```

- **403 - Forbidden:**
```json
{
  "error": "Forbidden: missing permissions",
  "missing": ["user.read"]
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve users",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/admin/users \
  -H "Authorization: Bearer <jwt_token>"
```

#### Create User
**Endpoint:** `POST /admin/users`  
**Description:** Create a new user  
**Permission Required:** `user.create`  

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "password": "SecurePass123!",
  "role_id": "123e4567-e89b-12d3-a456-426614174001",
  "warehouse_id": "123e4567-e89b-12d3-a456-426614174002"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1987654321",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": null,
    "role_id": "123e4567-e89b-12d3-a456-426614174001",
    "warehouse_id": "123e4567-e89b-12d3-a456-426614174002"
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "full_name must be 2-100 characters with letters, spaces, hyphens, and apostrophes only",
    "password must be at least 8 characters with uppercase, lowercase, number, and special character",
    "role_id must be a valid UUID"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Email Already Exists:**
```json
{
  "error": "Duplicate entry",
  "message": "Email already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Invalid Reference:**
```json
{
  "error": "Invalid reference",
  "message": "Invalid role_id or warehouse_id",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to create user",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Get User by ID
**Endpoint:** `GET /admin/users/:id`  
**Description:** Retrieve a specific user by ID  
**Permission Required:** `user.read`  

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": "2023-01-01T12:00:00.000Z",
    "role_name": "Admin",
    "warehouse_name": "Default Warehouse"
  }
}
```

**Error Responses:**
- **400 - Invalid ID:**
```json
{
  "error": "Invalid input",
  "message": "Invalid user ID format",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "User not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve user",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Update User
**Endpoint:** `PUT /admin/users/:id`  
**Description:** Update user information (partial updates supported)  
**Permission Required:** `user.update`  

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "email": "john.updated@example.com",
  "is_active": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "John Updated Doe",
    "email": "john.updated@example.com",
    "phone": "+1234567890",
    "is_active": false,
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": "2023-01-01T12:00:00.000Z",
    "role_id": "123e4567-e89b-12d3-a456-426614174001",
    "warehouse_id": "123e4567-e89b-12d3-a456-426614174002"
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "full_name must be 2-100 characters with letters, spaces, hyphens, and apostrophes only",
    "email must be a valid email address"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Email Already Exists:**
```json
{
  "error": "Duplicate entry",
  "message": "Email already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Invalid Reference:**
```json
{
  "error": "Invalid reference",
  "message": "Invalid role_id or warehouse_id",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "User not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to update user",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Delete User
**Endpoint:** `DELETE /admin/users/:id`  
**Description:** Delete a user from the system  
**Permission Required:** `user.delete`  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- **400 - Invalid ID:**
```json
{
  "error": "Invalid input",
  "message": "Invalid user ID format",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "User not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to delete user",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 3. Admin - Role Management

#### Get All Roles
**Endpoint:** `GET /admin/roles`  
**Permission Required:** `role.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Admin",
      "description": "Full system access",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Manager",
      "description": "Can approve visitor requests",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve roles",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Create Role
**Endpoint:** `POST /admin/roles`  
**Permission Required:** `role.create`  

**Request Body:**
```json
{
  "name": "Security Guard",
  "description": "Can monitor visitor entries and exits"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174005",
    "name": "Security Guard",
    "description": "Can monitor visitor entries and exits",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "name is required",
    "name must be 2-50 characters"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Role Name Exists:**
```json
{
  "error": "Duplicate entry",
  "message": "Role name already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to create role",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Get Role by ID
**Endpoint:** `GET /admin/roles/:id`  
**Permission Required:** `role.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Admin",
    "description": "Full system access",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- **400 - Invalid ID:**
```json
{
  "error": "Invalid input",
  "message": "Invalid role ID format",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Role not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve role",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Update Role
**Endpoint:** `PUT /admin/roles/:id`  
**Permission Required:** `role.update`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Admin",
    "description": "Updated description",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "name must be 2-50 characters"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Role Name Exists:**
```json
{
  "error": "Duplicate entry",
  "message": "Role name already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Role not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to update role",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Delete Role
**Endpoint:** `DELETE /admin/roles/:id`  
**Permission Required:** `role.delete`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Error Responses:**
- **400 - Invalid ID:**
```json
{
  "error": "Invalid input",
  "message": "Invalid role ID format",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Role not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Referenced by Users:**
```json
{
  "error": "Invalid reference",
  "message": "Cannot delete role: it is referenced by existing users",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to delete role",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 4. Admin - Warehouse Management

#### Get All Warehouses
**Endpoint:** `GET /admin/warehouses`  
**Permission Required:** `warehouse.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Warehouses retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Main Warehouse",
      "address": "123 Industrial Drive, City, State 12345",
      "timezone": "UTC+5:30",
      "created_at": "2023-01-01T00:00:00.000Z",
      "created_by": "123e4567-e89b-12d3-a456-426614174001",
      "updated_at": null,
      "updated_by": null
    }
  ]
}
```

**Error Responses:**
- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve warehouses",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Create Warehouse
**Endpoint:** `POST /admin/warehouses`  
**Permission Required:** `warehouse.create`  

**Request Body:**
```json
{
  "name": "North Warehouse",
  "address": "456 North Street, Industrial Area",
  "timezone": "UTC+5:30"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Warehouse created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174005",
    "name": "North Warehouse",
    "address": "456 North Street, Industrial Area",
    "timezone": "UTC+5:30",
    "created_at": "2023-01-01T00:00:00.000Z",
    "created_by": "123e4567-e89b-12d3-a456-426614174001",
    "updated_at": null,
    "updated_by": null
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "name is required",
    "name must be 2-100 characters"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Warehouse Name Exists:**
```json
{
  "error": "Duplicate entry",
  "message": "Warehouse name already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to create warehouse",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Get Warehouse by ID
**Endpoint:** `GET /admin/warehouses/:id`  
**Permission Required:** `warehouse.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Warehouse retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Main Warehouse",
    "address": "123 Industrial Drive, City, State 12345",
    "timezone": "UTC+5:30",
    "created_at": "2023-01-01T00:00:00.000Z",
    "created_by": "123e4567-e89b-12d3-a456-426614174001",
    "updated_at": null,
    "updated_by": null
  }
}
```

**Error Responses:**
- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Warehouse not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve warehouse",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Update Warehouse
**Endpoint:** `PUT /admin/warehouses/:id`  
**Permission Required:** `warehouse.update`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Warehouse updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Warehouse",
    "address": "Updated Address",
    "timezone": "UTC+5:30",
    "created_at": "2023-01-01T00:00:00.000Z",
    "created_by": "123e4567-e89b-12d3-a456-426614174001",
    "updated_at": "2023-01-01T12:00:00.000Z",
    "updated_by": "123e4567-e89b-12d3-a456-426614174001"
  }
}
```

**Error Responses:**
- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Warehouse not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to update warehouse",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Delete Warehouse
**Endpoint:** `DELETE /admin/warehouses/:id`  
**Permission Required:** `warehouse.delete`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Warehouse deleted successfully"
}
```

**Error Responses:**
- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Warehouse not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to delete warehouse",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 5. Admin - Visitor Type Management

#### Get All Visitor Types
**Endpoint:** `GET /admin/visitor-types`  
**Permission Required:** `visitor_type.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Visitor types retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Business Visitor",
      "description": "External business partners and clients",
      "created_at": "2023-01-01T00:00:00.000Z",
      "created_by": "123e4567-e89b-12d3-a456-426614174001",
      "updated_at": null,
      "updated_by": null
    }
  ]
}
```

**Error Responses:**
- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve visitor types",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Create Visitor Type
**Endpoint:** `POST /admin/visitor-types`  
**Permission Required:** `visitor_type.create`  

**Request Body:**
```json
{
  "name": "Government Official",
  "description": "Government inspectors and regulatory officials"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Visitor type created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174005",
    "name": "Government Official",
    "description": "Government inspectors and regulatory officials",
    "created_at": "2023-01-01T00:00:00.000Z",
    "created_by": "123e4567-e89b-12d3-a456-426614174001",
    "updated_at": null,
    "updated_by": null
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "name is required",
    "description must be 5-200 characters"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Visitor Type Name Exists:**
```json
{
  "error": "Duplicate entry",
  "message": "Visitor type name already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to create visitor type",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Get Visitor Type by ID
**Endpoint:** `GET /admin/visitor-types/:id`  
**Permission Required:** `visitor_type.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Visitor type retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Business Visitor",
    "description": "External business partners and clients",
    "created_at": "2023-01-01T00:00:00.000Z",
    "created_by": "123e4567-e89b-12d3-a456-426614174001",
    "updated_at": null,
    "updated_by": null
  }
}
```

**Error Responses:**
- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Visitor type not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve visitor type",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Update Visitor Type
**Endpoint:** `PUT /admin/visitor-types/:id`  
**Permission Required:** `visitor_type.update`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Visitor type updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Visitor Type",
    "description": "Updated description",
    "created_at": "2023-01-01T00:00:00.000Z",
    "created_by": "123e4567-e89b-12d3-a456-426614174001",
    "updated_at": "2023-01-01T12:00:00.000Z",
    "updated_by": "123e4567-e89b-12d3-a456-426614174001"
  }
}
```

**Error Responses:**
- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Visitor type not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to update visitor type",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Delete Visitor Type
**Endpoint:** `DELETE /admin/visitor-types/:id`  
**Permission Required:** `visitor_type.delete`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Visitor type deleted successfully"
}
```

**Error Responses:**
- **404 - Not Found:**
```json
{
  "error": "Not found",
  "message": "Visitor type not found",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to delete visitor type",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 6. Admin - Permission Management

#### Get All Permissions
**Endpoint:** `GET /admin/permissions`  
**Permission Required:** `permission.read`  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "user.read",
      "description": "Read users",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "user.create",
      "description": "Create users",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve permissions",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 7. Visitor Endpoints (Public)

#### Get All Warehouses (Public)
**Endpoint:** `GET /visitor/warehouses`  
**Description:** List all warehouses for visitor selection  
**Authentication:** Not required  

**Request Headers:**
```
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Warehouses retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Main Warehouse",
      "address": "123 Industrial Drive, City, State 12345",
      "timezone": "UTC+5:30",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve warehouses",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Get All Visitor Types (Public)
**Endpoint:** `GET /visitor/visitor-types`  
**Description:** List all visitor types for selection  
**Authentication:** Not required  

**Success Response (200):**
```json
{
  "success": true,
  "message": "Visitor types retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Business Visitor",
      "description": "External business partners and clients",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve visitor types",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Create Visit Request
**Endpoint:** `POST /visitor/visit-request`  
**Description:** Submit a new visit request  
**Authentication:** Not required  

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "visitor_name": "John Business Partner",
  "visitor_email": "john@businesspartner.com",
  "visitor_phone": "+1234567890",
  "accompanying_persons": [
    {
      "name": "Jane Assistant",
      "phone": "+1987654321",
      "email": "jane@businesspartner.com"
    }
  ],
  "visit_date": "2023-12-25",
  "visit_time": "forenoon",
  "visitor_type_id": "123e4567-e89b-12d3-a456-426614174000",
  "description": "Quarterly business review meeting",
  "warehouse_id": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Visit request created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174010",
    "visitor_name": "John Business Partner",
    "visitor_email": "john@businesspartner.com",
    "visitor_phone": "+1234567890",
    "accompanying_persons": [
      {
        "name": "Jane Assistant",
        "phone": "+1987654321",
        "email": "jane@businesspartner.com"
      }
    ],
    "visit_date": "2023-12-25",
    "visit_time": "forenoon",
    "visitor_type_id": "123e4567-e89b-12d3-a456-426614174000",
    "description": "Quarterly business review meeting",
    "warehouse_id": "123e4567-e89b-12d3-a456-426614174001",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- **400 - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "visitor_name must be 2-100 characters with letters, spaces, hyphens, and apostrophes only",
    "visitor_email must be a valid email address",
    "visit_date must be in YYYY-MM-DD format and cannot be in the past",
    "visit_time must be either 'forenoon' or 'afternoon'",
    "accompanying_persons must be an array of valid person objects (max 10) with required 'name' field"
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Invalid Reference:**
```json
{
  "error": "Invalid reference",
  "message": "One or more referenced entities do not exist",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **400 - Duplicate Entry:**
```json
{
  "error": "Duplicate entry",
  "message": "A similar request already exists",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

- **500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to create visit request",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/visitor/visit-request \
  -H "Content-Type: application/json" \
  -d '{
    "visitor_name": "John Business Partner",
    "visitor_email": "john@businesspartner.com",
    "visitor_phone": "+1234567890",
    "visit_date": "2023-12-25",
    "visit_time": "forenoon",
    "visitor_type_id": "123e4567-e89b-12d3-a456-426614174000",
    "description": "Quarterly business review meeting",
    "warehouse_id": "123e4567-e89b-12d3-a456-426614174001"
  }'
```

---

### 8. Health Check

#### API Status
**Endpoint:** `GET /`  
**Description:** Check API health status  
**Authentication:** Not required  

**Success Response (200):**
```
✅ API is running. Try GET /admin/users, GET /visitor/warehouses, GET /visitor/visitor-types
```

---

## Validation Rules

### General Rules
- All UUIDs must be valid v4 format
- Email addresses must be valid format
- Phone numbers support international format with optional country code
- Dates must be in YYYY-MM-DD format
- Text fields have specified length limits
- Required fields cannot be null or empty

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Visit Request Rules
- Visit date cannot be in the past
- Visit time must be "forenoon" or "afternoon"
- Maximum 10 accompanying persons
- Each accompanying person must have a valid name
- Phone and email are optional for accompanying persons

### Business Rules
- User emails must be unique
- Role names must be unique
- Warehouse names must be unique
- Visitor type names must be unique
- Users cannot be deleted if they created records
- Roles cannot be deleted if assigned to users

---

## Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid input data or validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (unique constraint violation) |
| 500 | Internal Server Error | Unexpected server error |
