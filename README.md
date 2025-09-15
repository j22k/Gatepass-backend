# Gatepass Backend

## Project Description
This is the backend API for a Gatepass Management System built with Node.js, Express, and PostgreSQL. It manages users, roles, warehouses, visitor types, and visitor requests. Features include role-based access control (RBAC), JWT authentication, and CRUD operations for admins. The system supports multiple user roles (e.g., Admin, Manager, Receptionist, QA) with restricted endpoints.

## Required Tools
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repo)

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
Initialize the database schema:
```bash
npm run migrate:up
```

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

## API Endpoints

### Authentication
- **POST /login**: Authenticate a user.
  - Body: `{ "email": "user@example.com", "password": "password" }`
  - Response (200): `{ "token": "jwt_token", "redirectUrl": "/role-based-path" }` (redirect URL based on user role, e.g., "/admin/dashboard" for Admin).
  - Use the token in the `Authorization: Bearer <token>` header for protected routes.

### Admin Endpoints (Requires Admin Role)
- **GET /admin/users**: List all users.
- **POST /admin/users**: Create a user (body: `{ "full_name", "email", "phone", "password", "role_id", "warehouse_id" }`).
- **GET /admin/users/:id**: Get user by ID.
- **PUT /admin/users/:id**: Update user.
- **DELETE /admin/users/:id**: Delete user.
- **GET /admin/roles**: List all roles.
- **POST /admin/roles**: Create a role (body: `{ "name", "description" }`).
- **GET /admin/roles/:id**: Get role by ID.
- **PUT /admin/roles/:id**: Update role.
- **DELETE /admin/roles/:id**: Delete role.
- **GET /admin/warehouses**: List all warehouses.
- **POST /admin/warehouses**: Create a warehouse (body: `{ "name", "address", "timezone" }`).
- **GET /admin/warehouses/:id**: Get warehouse by ID.
- **PUT /admin/warehouses/:id**: Update warehouse.
- **DELETE /admin/warehouses/:id**: Delete warehouse.
- **GET /admin/visitor-types**: List all visitor types.
- **POST /admin/visitor-types**: Create a visitor type (body: `{ "name", "description" }`).
- **GET /admin/visitor-types/:id**: Get visitor type by ID.
- **PUT /admin/visitor-types/:id**: Update visitor type.
- **DELETE /admin/visitor-types/:id**: Delete visitor type.

### Visitor Endpoints (Requires Authentication)
- **GET /visitor/warehouses**: List all warehouses.
- **GET /visitor/visitor-types**: List all visitor types.

### Health Check
- **GET /**: API status message.

## Usage and Testing
- Use tools like Postman or curl to test endpoints.
- Login first to get a token, then include it in headers for protected routes.
- Example login curl:
  ```bash
  curl -X POST http://localhost:5000/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"Admin@123"}'
  ```
- Check server logs for errors. Ensure migrations and seeding are done before starting.

## Contributing
- Run tests (if added) with `npm test`.
- Follow standard Node.js practices.

## License
ISC
