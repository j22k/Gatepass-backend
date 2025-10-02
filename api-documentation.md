# API Documentation

## Warehouse Workflow Endpoints

### 1. Get Structured Workflow Data by Warehouse ID
- **Method**: GET
- **Endpoint**: `/api/warehouse-workflow/:warehouseId`
- **Description**: Retrieves grouped workflow data for a specific warehouse, organized by visitor type.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
  - **URL Parameters**:
    - `warehouseId` (string, UUID): The ID of the warehouse.
- **Response**:
  - **Success (200)**:
    ```json
    [
      {
        "visitorType": "Supplier",
        "steps": [
          {
            "id": "uuid",
            "stepNo": 1,
            "approver": "John Doe"
          }
        ]
      }
    ]
    ```
  - **Error (400)**: Invalid warehouse ID.
    ```json
    {
      "error": "Invalid warehouse ID"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "error": "Internal server error"
    }
    ```

### 2. Add a New Workflow Entry
- **Method**: POST
- **Endpoint**: `/api/warehouse-workflow`
- **Description**: Creates a new workflow step for a warehouse and visitor type.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "warehouse_id": "uuid",
      "visitor_type_id": "uuid",
      "step_no": 1,
      "approver": "uuid"
    }
    ```
- **Response**:
  - **Success (201)**:
    ```json
    [
      {
        "id": "uuid",
        "warehouseId": "uuid",
        "visitorTypeId": "uuid",
        "stepNo": 1,
        "approver": "uuid"
      }
    ]
    ```
  - **Error (400)**: Invalid input.
    ```json
    {
      "error": "Invalid input: warehouse_id, visitor_type_id, and approver must be valid UUIDs, step_no must be a positive integer"
    }
    ```
  - **Error (409)**: Workflow step already exists.
    ```json
    {
      "error": "Workflow step already exists for this warehouse and visitor type"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "error": "Internal server error"
    }
    ```

### 3. Update a Workflow Entry
- **Method**: PUT
- **Endpoint**: `/api/warehouse-workflow/:id`
- **Description**: Updates an existing workflow entry's step number and approver.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the workflow entry.
  - **Body**:
    ```json
    {
      "step_no": 2,
      "approver": "uuid"
    }
    ```
- **Response**:
  - **Success (200)**:
    ```json
    [
      {
        "id": "uuid",
        "warehouseId": "uuid",
        "visitorTypeId": "uuid",
        "stepNo": 2,
        "approver": "uuid"
      }
    ]
    ```
  - **Error (400)**: Invalid input.
    ```json
    {
      "error": "Invalid input: id and approver must be valid UUIDs, step_no must be a positive integer"
    }
    ```
  - **Error (404)**: Workflow entry not found.
    ```json
    {
      "error": "Workflow entry not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "error": "Internal server error"
    }
    ```

### 4. Delete a Workflow Entry
- **Method**: DELETE
- **Endpoint**: `/api/warehouse-workflow/:id`
- **Description**: Deletes a workflow entry by its ID.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the workflow entry.
- **Response**:
  - **Success (204)**: No content (entry deleted).
  - **Error (400)**: Invalid workflow ID.
    ```json
    {
      "error": "Invalid workflow ID"
    }
    ```
  - **Error (404)**: Workflow entry not found.
    ```json
    {
      "error": "Workflow entry not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "error": "Internal server error"
    }
    ```

## Visitor Request Endpoints

### 1. Get All Visitor Requests
- **Method**: GET
- **Endpoint**: `/api/visitors/getall`
- **Description**: Retrieves all visitor requests with joined data (names, times).
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "name": "John Doe",
          "phone": "1234567890",
          "email": "john@example.com",
          "accompanying": ["Jane Doe"],
          "date": "2023-10-01",
          "status": "pending",
          "visitorTypeName": "Auditor",
          "warehouseName": "Main Warehouse",
          "timeSlotName": "Morning Shift",
          "from": "09:00:00",
          "to": "13:00:00"
        }
      ]
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 2. Get Visitor Request by ID
- **Method**: GET
- **Endpoint**: `/api/visitors/:id`
- **Description**: Retrieves a specific visitor request by its ID.
- **Request**:
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the visitor request.
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "phone": "1234567890",
        "email": "john@example.com",
        "visitorTypeId": "uuid",
        "warehouseId": "uuid",
        "warehouseTimeSlotId": "uuid",
        "accompanying": ["Jane Doe"],
        "date": "2023-10-01",
        "status": "pending",
        "visitorTypeName": "Auditor",
        "warehouseName": "Main Warehouse",
        "timeSlotName": "Morning Shift"
      }
    }
    ```
  - **Error (400)**: Invalid ID format.
    ```json
    {
      "success": false,
      "message": "Invalid ID format"
    }
    ```
  - **Error (404)**: Visitor request not found.
    ```json
    {
      "success": false,
      "message": "Visitor request not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 3. Create a New Visitor Request
- **Method**: POST
- **Endpoint**: `/api/visitors/create`
- **Description**: Creates a new visitor request.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "visitorTypeId": "uuid",
      "warehouseId": "uuid",
      "warehouseTimeSlotId": "uuid",
      "accompanying": ["Jane Doe"],
      "date": "2023-10-01"
    }
    ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "phone": "1234567890",
        "email": "john@example.com",
        "visitorTypeId": "uuid",
        "warehouseId": "uuid",
        "warehouseTimeSlotId": "uuid",
        "accompanying": ["Jane Doe"],
        "date": "2023-10-01",
        "status": "pending",
        "trackingCode": "ABCD1234"
      }
    }
    ```
  - **Error (400)**: Invalid input data.
    ```json
    {
      "success": false,
      "message": "Invalid input: All IDs must be valid UUIDs, date must be in the future"
    }
    ```
  - **Error (409)**: Request already exists.
    ```json
    {
      "success": false,
      "message": "A visitor request with the same name, date, warehouse, and time slot already exists"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 4. Update a Visitor Request
- **Method**: PUT
- **Endpoint**: `/api/visitors/:id`
- **Description**: Updates an existing visitor request.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the visitor request.
  - **Body**:
    ```json
    {
      "name": "John Doe",
      "phone": "0987654321",
      "email": "john.doe@example.com",
      "visitorTypeId": "uuid",
      "warehouseId": "uuid",
      "warehouseTimeSlotId": "uuid",
      "accompanying": ["Jane Doe"],
      "date": "2023-10-02",
      "status": "approved"
    }
    ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "phone": "0987654321",
        "email": "john.doe@example.com",
        "visitorTypeId": "uuid",
        "warehouseId": "uuid",
        "warehouseTimeSlotId": "uuid",
        "accompanying": ["Jane Doe"],
        "date": "2023-10-02",
        "status": "approved"
      }
    }
    ```
  - **Error (400)**: Invalid ID or input data.
    ```json
    {
      "success": false,
      "message": "Invalid visitor request ID format"
    }
    ```
  - **Error (404)**: Visitor request not found.
    ```json
    {
      "success": false,
      "message": "Visitor request not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 5. Approve a Visitor Request
- **Method**: PUT
- **Endpoint**: `/api/visitors/:id/approve`
- **Description**: Approves a visitor request.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the visitor request.
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Visitor request approved"
    }
    ```
  - **Error (400)**: Invalid ID format.
    ```json
    {
      "success": false,
      "message": "Invalid visitor request ID format"
    }
    ```
  - **Error (404)**: Visitor request not found or approval not found for this user.
    ```json
    {
      "success": false,
      "message": "Visitor request not found"
    }
    ```
  - **Error (409)**: Time slot already booked.
    ```json
    {
      "success": false,
      "message": "Time slot already booked"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 6. Reject a Visitor Request
- **Method**: PUT
- **Endpoint**: `/api/visitors/:id/reject`
- **Description**: Rejects a visitor request and optionally provides a reason.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the visitor request.
  - **Body** (optional):
    ```json
    {
      "reason": "Reason for rejection"
    }
    ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Visitor request rejected"
    }
    ```
  - **Error (400)**: Invalid ID or reason.
    ```json
    {
      "success": false,
      "message": "Invalid visitor request ID format"
    }
    ```
  - **Error (404)**: Approval not found.
    ```json
    {
      "success": false,
      "message": "Approval not found for this user"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

## User Endpoints

### 1. Get All Users
- **Method**: GET
- **Endpoint**: `/api/users/getall`
- **Description**: Retrieves all users with their roles and active status.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890",
          "designation": "Manager",
          "role": "Admin",
          "warehouseName": "Main Warehouse",
          "isActive": true
        }
      ]
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 2. Get User by ID
- **Method**: GET
- **Endpoint**: `/api/users/:id`
- **Description**: Retrieves a specific user by their ID.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "designation": "Manager",
        "role": "Admin",
        "warehouseName": "Main Warehouse",
        "isActive": true
      }
    }
    ```
  - **Error (400)**: Invalid ID format.
    ```json
    {
      "success": false,
      "message": "Invalid ID format"
    }
    ```
  - **Error (404)**: User not found.
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 3. Create a New User
- **Method**: POST
- **Endpoint**: `/api/users/create`
- **Description**: Creates a new user with the provided details.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "password": "SecureP@ssw0rd",
      "designation": "Manager",
      "role": "Admin",
      "warehouseId": "uuid"
    }
    ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "designation": "Manager",
        "role": "Admin",
        "warehouseId": "uuid",
        "isActive": true
      }
    }
    ```
  - **Error (400)**: Invalid input data.
    ```json
    {
      "success": false,
      "message": "Invalid input: All fields are required and must be valid"
    }
    ```
  - **Error (409)**: Email already in use.
    ```json
    {
      "success": false,
      "message": "Email already in use"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 4. Update a User
- **Method**: PUT
- **Endpoint**: `/api/users/:id`
- **Description**: Updates an existing user's details.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
    - `Content-Type: application/json`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
  - **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "0987654321",
      "password": "NewP@ssw0rd",
      "designation": "Senior Manager",
      "role": "Admin",
      "warehouseId": "uuid",
      "isActive": true
    }
    ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "0987654321",
        "designation": "Senior Manager",
        "role": "Admin",
        "warehouseId": "uuid",
        "isActive": true
      }
    }
    ```
  - **Error (400)**: Invalid ID or input data.
    ```json
    {
      "success": false,
      "message": "Invalid user ID format"
    }
    ```
  - **Error (404)**: User not found.
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 5. Disable a User
- **Method**: PUT
- **Endpoint**: `/api/users/:id/disable`
- **Description**: Disables (soft deletes) a user by their ID.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "0987654321",
        "designation": "Senior Manager",
        "role": "Admin",
        "warehouseId": "uuid",
        "isActive": false
      }
    }
    ```
  - **Error (400)**: Invalid ID format.
    ```json
    {
      "success": false,
      "message": "Invalid user ID format"
    }
    ```
  - **Error (404)**: User not found.
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 6. Enable a User
- **Method**: PUT
- **Endpoint**: `/api/users/:id/enable`
- **Description**: Enables a previously disabled user.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "0987654321",
        "designation": "Senior Manager",
        "role": "Admin",
        "warehouseId": "uuid",
        "isActive": true
      }
    }
    ```
  - **Error (400)**: Invalid ID format.
    ```json
    {
      "success": false,
      "message": "Invalid user ID format"
    }
    ```
  - **Error (404)**: User not found.
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

## Role Endpoints

### 1. Get All Roles
- **Method**: GET
- **Endpoint**: `/api/role/getall`
- **Description**: Retrieves all user roles (fixed enum values).
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": ["Admin", "Receptionist", "Approver"]
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

## Auth Endpoints

### 1. Login
- **Method**: POST
- **Endpoint**: `/api/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request**:
  - **Body**:
    ```json
    {
      "email": "john@example.com",
      "password": "SecureP@ssw0rd"
    }
    ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890",
          "designation": "Manager",
          "role": "Admin",
          "warehouse": "Main Warehouse",
          "isActive": true
        },
        "redirectTo": "/admin/admin-dashboard",
        "token": "Bearer <token>"
      }
    }
    ```
  - **Error (401)**: Invalid email or password.
    ```json
    {
      "success": false,
      "message": "Invalid email or password"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 2. Verify Token
- **Method**: GET
- **Endpoint**: `/api/auth/verify`
- **Description**: Verifies the JWT token and returns the current user.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "designation": "Manager",
        "role": "Admin",
        "warehouse": "Main Warehouse",
        "isActive": true
      }
    }
    ```
  - **Error (401)**: Invalid or expired token.
    ```json
    {
      "success": false,
      "message": "Invalid or expired token"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 3. Get Profile
- **Method**: GET
- **Endpoint**: `/api/auth/profile`
- **Description**: Retrieves the current user's profile information.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890",
          "designation": "Manager",
          "role": "Admin",
          "warehouse": {
            "name": "Main Warehouse",
            "location": "123 Warehouse St."
          },
          "isActive": true
        }
      }
    }
    ```
  - **Error (401)**: Unauthorized.
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 4. Logout
- **Method**: POST
- **Endpoint**: `/api/auth/logout`
- **Description**: Logs out the user (optional - mainly for token blacklisting if implemented).
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>` (Required for authentication)
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Logout successful"
    }
    ```
  - **Error (500)**: Internal server error.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```