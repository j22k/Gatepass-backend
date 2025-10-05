# GatePass Backend API Documentation

This document provides detailed API documentation for the GatePass Backend, including all available endpoints, request formats, response formats, and Curl examples for testing.

## Base URL
- **Development**: `http://localhost:3000` (or as per `PORT` in `.env`)
- **Production**: As configured in `ALLOWED_ORIGINS`

## Authentication
Most endpoints require JWT authentication via the `Authorization: Bearer <token>` header. Obtain a token from the `/api/auth/login` endpoint.

## Warehouse Endpoints
*(Note: Detailed routes for warehouse management are handled via `warehouseRoutes`. Assuming standard CRUD based on server.js; if specific docs exist, integrate them here.)*

### 1. Get All Warehouses
- **Method**: GET
- **Endpoint**: `/api/warehouse`
- **Description**: Retrieves all warehouses.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse" \
  -H "Authorization: Bearer <your-token>"
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "name": "Main Warehouse",
          "location": "123 Warehouse St."
        }
      ]
    }
    ```
  - **Error (500)**: Internal server error.

### 2. Create Warehouse
- **Method**: POST
- **Endpoint**: `/api/warehouse`
- **Description**: Creates a new warehouse.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "name": "New Warehouse",
      "location": "456 New St."
    }
    ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/warehouse" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Warehouse", "location": "456 New St."}'
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "New Warehouse",
        "location": "456 New St."
      }
    }
    ```
  - **Error (400)**: Invalid input.
  - **Error (500)**: Internal server error.

*(Add similar sections for Update, Delete, Get by ID if applicable, based on full route implementation.)*

## Visitor Type Endpoints
*(Handled via `visitortypeRoutes`.)*

### 1. Get All Visitor Types
- **Method**: GET
- **Endpoint**: `/api/visitortypes`
- **Description**: Retrieves all visitor types.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitortypes" \
  -H "Authorization: Bearer <your-token>"
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "name": "Supplier"
        }
      ]
    }
    ```
  - **Error (500)**: Internal server error.

### 2. Create Visitor Type
- **Method**: POST
- **Endpoint**: `/api/visitortypes`
- **Description**: Creates a new visitor type.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "name": "Auditor"
    }
    ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/visitortypes" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Auditor"}'
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "Auditor"
      }
    }
    ```
  - **Error (400)**: Invalid input.
  - **Error (500)**: Internal server error.

*(Add similar for Update, Delete, Get by ID.)*

## Warehouse Time Slot Endpoints
*(Handled via `warehouseTimeSlotRoutes`.)*

### 1. Get All Warehouse Time Slots
- **Method**: GET
- **Endpoint**: `/api/warehouse-time-slots`
- **Description**: Retrieves all time slots for warehouses.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse-time-slots" \
  -H "Authorization: Bearer <your-token>"
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "warehouseId": "uuid",
          "name": "Morning Shift",
          "from": "09:00:00",
          "to": "13:00:00"
        }
      ]
    }
    ```
  - **Error (500)**: Internal server error.

### 2. Create Warehouse Time Slot
- **Method**: POST
- **Endpoint**: `/api/warehouse-time-slots`
- **Description**: Creates a new time slot.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "warehouseId": "uuid",
      "name": "Evening Shift",
      "from": "14:00:00",
      "to": "18:00:00"
    }
    ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/warehouse-time-slots" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"warehouseId": "uuid", "name": "Evening Shift", "from": "14:00:00", "to": "18:00:00"}'
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "warehouseId": "uuid",
        "name": "Evening Shift",
        "from": "14:00:00",
        "to": "18:00:00"
      }
    }
    ```
  - **Error (400)**: Invalid input.
  - **Error (500)**: Internal server error.

*(Add similar for Update, Delete, Get by ID.)*

## Warehouse Workflow Endpoints

### 1. Get Structured Workflow Data by Warehouse ID
- **Method**: GET
- **Endpoint**: `/api/warehouse-workflow/:warehouseId`
- **Description**: Retrieves grouped workflow data for a specific warehouse, organized by visitor type.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
  - **URL Parameters**:
    - `warehouseId` (string, UUID): The ID of the warehouse.
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse-workflow/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
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
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/warehouse-workflow" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"warehouse_id": "uuid", "visitor_type_id": "uuid", "step_no": 1, "approver": "uuid"}'
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
    - `Authorization: Bearer <token>`
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
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/warehouse-workflow/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"step_no": 2, "approver": "uuid"}'
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
    - `Authorization: Bearer <token>`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the workflow entry.
- **Curl Example**:
  ```bash
  curl -X DELETE "http://localhost:3000/api/warehouse-workflow/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/getall" \
  -H "Authorization: Bearer <your-token>"
  ```
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
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/uuid"
  ```
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
    - `Authorization: Bearer <token>`
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
      "date": "2023-10-01",
      "allergenInformation": {},
      "declarationAcknowledged": true
    }
    ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/visitors/create" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phone": "1234567890", "email": "john@example.com", "visitorTypeId": "uuid", "warehouseId": "uuid", "warehouseTimeSlotId": "uuid", "accompanying": ["Jane Doe"], "date": "2023-10-01", "allergenInformation": {}, "declarationAcknowledged": true}'
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
        "trackingCode": "ABCD1234",
        "allergenInformation": {},
        "declarationAcknowledged": true,
        "reason": null
      }
    }
    ```
  - **Error (400)**:
    ```json
    {
      "success": false,
      "message": "Declaration must be acknowledged"
    }
    ```
  - **Error (409)**: Request already exists.
    ```json
    {
      "success": false,
      "message": "A visitor request with the same name, date, warehouse, and time slot already exists"
    }
    ```
    ```json
    {
      "success": false,
      "message": "Time slot already booked for this date"
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
    - `Authorization: Bearer <token>`
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
      "status": "approved",
      "allergenInformation": {},
      "declarationAcknowledged": true,
      "reason": "Updated reason"
    }
    ```
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitors/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phone": "0987654321", "email": "john.doe@example.com", "visitorTypeId": "uuid", "warehouseId": "uuid", "warehouseTimeSlotId": "uuid", "accompanying": ["Jane Doe"], "date": "2023-10-02", "status": "approved", "allergenInformation": {}, "declarationAcknowledged": true, "reason": "Updated reason"}'
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
    - `Authorization: Bearer <token>`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the visitor request.
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitors/uuid/approve" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the visitor request.
  - **Body** (optional):
    ```json
    {
      "reason": "Reason for rejection"
    }
    ```
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitors/uuid/reject" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Reason for rejection"}'
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

### 7. Get Visitor Request by Tracking Code
- **Method**: GET
- **Endpoint**: `/api/visitors/track/:trackingCode`
- **Description**: Retrieves a visitor request by its tracking code.
- **Request**:
  - **URL Parameters**:
    - `trackingCode` (string): The tracking code of the visitor request.
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/track/ABCD1234"
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "status": "approved",
        "date": "2023-10-01",
        "allergenInformation": {},
        "visitorTypeName": "Auditor",
        "warehouseName": "Main Warehouse",
        "timeSlotName": "Morning Shift",
        "reason": null,
        "approvals": [
          {
            "stepNo": 1,
            "status": "approved",
            "approverName": "Jane Approver",
            "reason": null
          }
        ]
      }
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

## User Endpoints

### 1. Get All Users
- **Method**: GET
- **Endpoint**: `/api/users/getall`
- **Description**: Retrieves all users with their roles and active status.
- **Request**:
  - **Headers**:
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/users/getall" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/users/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
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
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/users/create" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "1234567890", "password": "SecureP@ssw0rd", "designation": "Manager", "role": "Admin", "warehouseId": "uuid"}'
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
    - `Authorization: Bearer <token>`
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
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/users/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john.doe@example.com", "phone": "0987654321", "password": "NewP@ssw0rd", "designation": "Senior Manager", "role": "Admin", "warehouseId": "uuid", "isActive": true}'
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
    - `Authorization: Bearer <token>`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/users/uuid/disable" \
  -H "Authorization: Bearer <your-token>"
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
    - `Authorization: Bearer <token>`
  - **URL Parameters**:
    - `id` (string, UUID): The ID of the user.
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/users/uuid/enable" \
  -H "Authorization: Bearer <your-token>"
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
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/role/getall" \
  -H "Authorization: Bearer <your-token>"
  ```
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
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "SecureP@ssw0rd"}'
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
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/auth/verify" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer <your-token>"
  ```
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
    - `Authorization: Bearer <token>`
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/auth/logout" \
  -H "Authorization: Bearer <your-token>"
  ```
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

## Health Check
- **Method**: GET
- **Endpoint**: `/health`
- **Description**: Checks if the server is running.
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/health"
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "message": "Gatepass Backend API is running",
      "timestamp": "2023-10-01T12:00:00.000Z",
      "environment": "development"
    }
    ```
