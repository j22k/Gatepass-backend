# GatePass Backend API Documentation

This document provides detailed API documentation for the GatePass Backend, including all available endpoints, request formats, response formats, and Curl examples for testing.

## Base URL
- **Development**: `http://localhost:3000` (or as per `PORT` in `.env`)
- **Production**: As configured in `ALLOWED_ORIGINS`

## Authentication
Most endpoints require JWT authentication via the `Authorization: Bearer <token>` header. Obtain a token from the `/api/auth/login` endpoint.

### User Roles
- **Admin**: Full access to all endpoints
- **Receptionist**: Access to visitor management and warehouse operations
- **Approver**: Access to approval/rejection of visitor requests

## Warehouse Endpoints

### 1. Get All Warehouses
- **Method**: GET
- **Endpoint**: `/api/warehouse/getall`
- **Description**: Retrieves all active warehouses.
- **Authentication**: None required
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse/getall"
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

### 2. Get All Disabled Warehouses
- **Method**: GET
- **Endpoint**: `/api/warehouse/getall/disabled`
- **Description**: Retrieves all disabled warehouses (Admin only).
- **Authentication**: Required (Admin role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse/getall/disabled" \
  -H "Authorization: Bearer <your-token>"
  ```

### 3. Get Warehouse by ID
- **Method**: GET
- **Endpoint**: `/api/warehouse/:id`
- **Description**: Retrieves a specific warehouse by ID.
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Warehouse ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```

### 4. Create Warehouse
- **Method**: POST
- **Endpoint**: `/api/warehouse/create`
- **Description**: Creates a new warehouse (Admin only).
- **Authentication**: Required (Admin role)
- **Request Body**:
  ```json
  {
    "name": "New Warehouse",
    "location": "456 New St."
  }
  ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/warehouse/create" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Warehouse", "location": "456 New St."}'
  ```

### 5. Update Warehouse
- **Method**: PUT
- **Endpoint**: `/api/warehouse/:id`
- **Description**: Updates an existing warehouse (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Warehouse ID
- **Request Body**:
  ```json
  {
    "name": "Updated Warehouse Name",
    "location": "Updated Location"
  }
  ```
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/warehouse/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Warehouse", "location": "Updated Location"}'
  ```

### 6. Disable Warehouse
- **Method**: PUT
- **Endpoint**: `/api/warehouse/:id/disable`
- **Description**: Disables a warehouse (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Warehouse ID
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/warehouse/uuid/disable" \
  -H "Authorization: Bearer <your-token>"
  ```

### 7. Enable Warehouse
- **Method**: PUT
- **Endpoint**: `/api/warehouse/:id/enable`
- **Description**: Enables a previously disabled warehouse (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Warehouse ID
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/warehouse/uuid/enable" \
  -H "Authorization: Bearer <your-token>"
  ```

## Visitor Type Endpoints

### 1. Get All Visitor Types
- **Method**: GET
- **Endpoint**: `/api/visitortypes/getall`
- **Description**: Retrieves all active visitor types.
- **Authentication**: None required
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitortypes/getall"
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "name": "Supplier",
          "description": "External supplier visits"
        }
      ]
    }
    ```

### 2. Get All Disabled Visitor Types
- **Method**: GET
- **Endpoint**: `/api/visitortypes/getall/disabled`
- **Description**: Retrieves all disabled visitor types (Admin only).
- **Authentication**: Required (Admin role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitortypes/getall/disabled" \
  -H "Authorization: Bearer <your-token>"
  ```

### 3. Get Visitor Type by ID
- **Method**: GET
- **Endpoint**: `/api/visitortypes/:id`
- **Description**: Retrieves a specific visitor type by ID (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Visitor type ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitortypes/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```

### 4. Create Visitor Type
- **Method**: POST
- **Endpoint**: `/api/visitortypes/create`
- **Description**: Creates a new visitor type (Admin only).
- **Authentication**: Required (Admin role)
- **Request Body**:
  ```json
  {
    "name": "Auditor",
    "description": "External auditor visits"
  }
  ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/visitortypes/create" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Auditor", "description": "External auditor visits"}'
  ```

### 5. Update Visitor Type
- **Method**: PUT
- **Endpoint**: `/api/visitortypes/:id`
- **Description**: Updates an existing visitor type (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Visitor type ID
- **Request Body**:
  ```json
  {
    "name": "Updated Visitor Type",
    "description": "Updated description",
    "isActive": true
  }
  ```
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitortypes/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Type", "description": "Updated description"}'
  ```

### 6. Disable Visitor Type
- **Method**: PUT
- **Endpoint**: `/api/visitortypes/:id/disable`
- **Description**: Disables a visitor type (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Visitor type ID
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitortypes/uuid/disable" \
  -H "Authorization: Bearer <your-token>"
  ```

### 7. Enable Visitor Type
- **Method**: PUT
- **Endpoint**: `/api/visitortypes/:id/enable`
- **Description**: Enables a previously disabled visitor type (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Visitor type ID
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitortypes/uuid/enable" \
  -H "Authorization: Bearer <your-token>"
  ```

## Warehouse Time Slot Endpoints

### 1. Get All Warehouse Time Slots
- **Method**: GET
- **Endpoint**: `/api/warehouse-time-slots/getall`
- **Description**: Retrieves all warehouse time slots (Admin only).
- **Authentication**: Required (Admin role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse-time-slots/getall" \
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

### 2. Get Time Slots by Warehouse ID
- **Method**: GET
- **Endpoint**: `/api/warehouse-time-slots/:warehouseId`
- **Description**: Retrieves all time slots for a specific warehouse.
- **Authentication**: None required
- **Parameters**: `warehouseId` (UUID) - Warehouse ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/warehouse-time-slots/uuid"
  ```

### 3. Create Warehouse Time Slot
- **Method**: POST
- **Endpoint**: `/api/warehouse-time-slots/warehouse/:warehouseId`
- **Description**: Creates a new time slot for a warehouse (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `warehouseId` (UUID) - Warehouse ID
- **Request Body**:
  ```json
  {
    "name": "Evening Shift",
    "from": "14:00:00",
    "to": "18:00:00"
  }
  ```
- **Curl Example**:
  ```bash
  curl -X POST "http://localhost:3000/api/warehouse-time-slots/warehouse/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Evening Shift", "from": "14:00:00", "to": "18:00:00"}'
  ```

### 4. Update Warehouse Time Slot
- **Method**: PUT
- **Endpoint**: `/api/warehouse-time-slots/:id`
- **Description**: Updates an existing time slot (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Time slot ID
- **Request Body**:
  ```json
  {
    "name": "Updated Shift",
    "from": "08:00:00",
    "to": "16:00:00",
    "warehouseId": "uuid"
  }
  ```
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/warehouse-time-slots/uuid" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Shift", "from": "08:00:00", "to": "16:00:00"}'
  ```

### 5. Delete Warehouse Time Slot
- **Method**: DELETE
- **Endpoint**: `/api/warehouse-time-slots/:id`
- **Description**: Deletes a time slot (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - Time slot ID
- **Curl Example**:
  ```bash
  curl -X DELETE "http://localhost:3000/api/warehouse-time-slots/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```

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
- **Description**: Retrieves a visitor request by its tracking code (public endpoint).
- **Authentication**: None required
- **Parameters**: `trackingCode` (string) - The tracking code of the visitor request
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

### 8. Get Pending Requests by User ID
- **Method**: GET
- **Endpoint**: `/api/visitors/user/:userId/pending`
- **Description**: Retrieves pending visitor requests assigned to a specific user (for approvers).
- **Authentication**: Required
- **Parameters**: `userId` (UUID) - User ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/user/uuid/pending" \
  -H "Authorization: Bearer <your-token>"
  ```

### 9. Get Approved Requests by User ID
- **Method**: GET
- **Endpoint**: `/api/visitors/user/:userId/approved`
- **Description**: Retrieves approved visitor requests by a specific user.
- **Authentication**: Required
- **Parameters**: `userId` (UUID) - User ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/user/uuid/approved" \
  -H "Authorization: Bearer <your-token>"
  ```

### 10. Get Rejected Requests by User ID
- **Method**: GET
- **Endpoint**: `/api/visitors/user/:userId/rejected`
- **Description**: Retrieves rejected visitor requests by a specific user.
- **Authentication**: Required
- **Parameters**: `userId` (UUID) - User ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/user/uuid/rejected" \
  -H "Authorization: Bearer <your-token>"
  ```

### 11. Get All Requests by Receptionist Warehouse
- **Method**: GET
- **Endpoint**: `/api/visitors/receptionist/all`
- **Description**: Gets all visitor requests for the receptionist's warehouse.
- **Authentication**: Required (Admin or Receptionist role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/receptionist/all" \
  -H "Authorization: Bearer <your-token>"
  ```

### 12. Get Today's Requests by Receptionist Warehouse
- **Method**: GET
- **Endpoint**: `/api/visitors/receptionist/today`
- **Description**: Gets today's visitor requests for the receptionist's warehouse.
- **Authentication**: Required (Admin or Receptionist role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/receptionist/today" \
  -H "Authorization: Bearer <your-token>"
  ```

### 13. Update Visitor Status by Receptionist
- **Method**: PUT
- **Endpoint**: `/api/visitors/receptionist/update/:id`
- **Description**: Updates visitor status by receptionist (e.g., arrived, departed).
- **Authentication**: Required (Admin or Receptionist role)
- **Parameters**: `id` (UUID) - Visitor request ID
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/visitors/receptionist/update/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```

### 14. Get Total Pending Requests
- **Method**: GET
- **Endpoint**: `/api/visitors/stats/pending`
- **Description**: Gets the total count of pending visitor requests (Admin only).
- **Authentication**: Required (Admin role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/stats/pending" \
  -H "Authorization: Bearer <your-token>"
  ```

### 15. Get Total Approved Today
- **Method**: GET
- **Endpoint**: `/api/visitors/stats/approved-today`
- **Description**: Gets the total count of approved requests for today (Admin only).
- **Authentication**: Required (Admin role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/visitors/stats/approved-today" \
  -H "Authorization: Bearer <your-token>"
  ```

## User Endpoints

### 1. Get All Users
- **Method**: GET
- **Endpoint**: `/api/users/getall`
- **Description**: Retrieves all users with their roles and active status (Admin only).
- **Authentication**: Required (Admin role)
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
      "message": "Users fetched successfully",
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

### 2. Get Users by Warehouse ID
- **Method**: GET
- **Endpoint**: `/api/users/warehouse/:warehouseId`
- **Description**: Retrieves all users for a specific warehouse (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `warehouseId` (UUID) - Warehouse ID
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/users/warehouse/uuid" \
  -H "Authorization: Bearer <your-token>"
  ```

### 3. Get Total Active Users
- **Method**: GET
- **Endpoint**: `/api/users/total-active`
- **Description**: Gets the total count of active users (Admin only).
- **Authentication**: Required (Admin role)
- **Curl Example**:
  ```bash
  curl -X GET "http://localhost:3000/api/users/total-active" \
  -H "Authorization: Bearer <your-token>"
  ```

### 4. Get User by ID
- **Method**: GET
- **Endpoint**: `/api/users/:id`
- **Description**: Retrieves a specific user by their ID (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - User ID
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

### 5. Create a New User
- **Method**: POST
- **Endpoint**: `/api/users/create`
- **Description**: Creates a new user with the provided details (Admin only).
- **Authentication**: Required (Admin role)
- **Request Body**:
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
      "message": "User created successfully",
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

### 6. Update a User
- **Method**: PUT
- **Endpoint**: `/api/users/:id`
- **Description**: Updates an existing user's details (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - User ID
- **Request Body**:
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
  -d '{"name": "John Doe", "email": "john.doe@example.com", "phone": "0987654321", "designation": "Senior Manager", "role": "Admin", "warehouseId": "uuid", "isActive": true}'
  ```

### 7. Disable a User
- **Method**: PUT
- **Endpoint**: `/api/users/:id/disable`
- **Description**: Disables (soft deletes) a user by their ID (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - User ID
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
      "message": "User disabled successfully",
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

### 8. Enable a User
- **Method**: PUT
- **Endpoint**: `/api/users/:id/enable`
- **Description**: Enables a previously disabled user (Admin only).
- **Authentication**: Required (Admin role)
- **Parameters**: `id` (UUID) - User ID
- **Curl Example**:
  ```bash
  curl -X PUT "http://localhost:3000/api/users/uuid/enable" \
  -H "Authorization: Bearer <your-token>"
  ```

## Role Endpoints

### 1. Get All Roles
- **Method**: GET
- **Endpoint**: `/api/role/getall`
- **Description**: Retrieves all user roles (fixed enum values: Admin, Receptionist, Approver).
- **Authentication**: Required (Admin role)
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
  - **Error (401)**: Unauthorized access.
  - **Error (403)**: Insufficient permissions (Admin role required).
  - **Error (500)**: Internal server error.

## Auth Endpoints

### 1. Login
- **Method**: POST
- **Endpoint**: `/api/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Authentication**: None required
- **Request Body**:
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

### 2. Verify Token
- **Method**: GET
- **Endpoint**: `/api/auth/verify`
- **Description**: Verifies the JWT token and returns the current user.
- **Authentication**: Required
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

### 3. Get Profile
- **Method**: GET
- **Endpoint**: `/api/auth/profile`
- **Description**: Retrieves the current user's profile information.
- **Authentication**: Required
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

### 4. Logout
- **Method**: POST
- **Endpoint**: `/api/auth/logout`
- **Description**: Logs out the user (token blacklisting if implemented).
- **Authentication**: Required
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

## Health Check

### Server Status
- **Method**: GET
- **Endpoint**: `/health`
- **Description**: Checks if the server is running.
- **Authentication**: None required
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

## API Summary

This GatePass Backend API provides comprehensive functionality for managing warehouse visitor access with the following main features:

### Core Modules:
1. **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Receptionist, Approver)
2. **Warehouse Management**: CRUD operations for warehouses with enable/disable functionality
3. **Visitor Type Management**: Managing different types of visitors (Suppliers, Auditors, etc.)
4. **Time Slot Management**: Managing available time slots for each warehouse
5. **Workflow Management**: Configuring approval workflows for different visitor types
6. **Visitor Request Management**: Complete lifecycle of visitor requests from creation to approval/rejection
7. **User Management**: Admin functionality for managing system users

### Key Features:
- **Role-based Access Control**: Different permission levels for Admin, Receptionist, and Approver roles
- **Workflow Engine**: Multi-step approval process for visitor requests
- **Tracking System**: Unique tracking codes for visitor requests
- **Statistics Dashboard**: Admin dashboard with pending/approved request counts
- **Receptionist Dashboard**: Warehouse-specific visitor management
- **Approver Dashboard**: User-specific pending/approved/rejected requests

### Public Endpoints:
- Warehouse listing (`/api/warehouse/getall`)
- Visitor type listing (`/api/visitortypes/getall`)
- Time slots by warehouse (`/api/warehouse-time-slots/:warehouseId`)
- Visitor tracking by code (`/api/visitors/track/:trackingCode`)
- Health check (`/health`)

### Security Features:
- JWT token authentication
- Input validation and sanitization
- Role-based authorization
- Password hashing with bcrypt
- CORS configuration
- Request payload limits

### Error Handling:
- Consistent error response format
- HTTP status codes following REST conventions
- Input validation with detailed error messages
- Graceful error handling with proper logging

### Development Setup:
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed the database
npm run seed

# Start development server
npm run dev
```

For more detailed information about specific endpoints, refer to the sections above. Each endpoint includes complete request/response examples with curl commands for testing.
