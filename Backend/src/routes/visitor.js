const express = require("express");
const router = express.Router();
const visitorHelper = require("../helpers/visitorHelpers");
const validation = require("../utils/validation");

/**
 * GET /visitor/warehouses
 * Retrieves all warehouses (public endpoint, no authentication required)
 * Used for warehouse selection in visit request forms
 */
router.get("/warehouses", async (req, res) => {
  try {
    const warehouses = await visitorHelper.getAllWarehouses();
    res.status(200).json(warehouses);
  } catch (err) {
    console.error("Error fetching warehouses:", err.message);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to retrieve warehouses"
    });
  }
});

/**
 * GET /visitor/visitor-types
 * Retrieves all visitor types (public endpoint, no authentication required)
 * Used for visitor type selection in visit request forms
 */
router.get("/visitor-types", async (req, res) => {
  try {
    const types = await visitorHelper.getAllVisitorTypes();
    res.status(200).json(types);
  } catch (err) {
    console.error("Error fetching visitor types:", err.message);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to retrieve visitor types"
    });
  }
});

/**
 * POST /visitor/visit-request
 * Creates a new visit request for public visitors (no authentication required)
 * Validates all input data and creates request with pending status
 */
router.post("/visit-request", async (req, res) => {
  try {
    const {
      visitor_name,
      visitor_email,
      visitor_phone,
      accompanying_persons,
      visit_date,
      visit_time,
      visitor_type_id,
      description,
      warehouse_id,
    } = req.body;
    
    console.log("Received visit request data:", req.body);
    console.log("Accompanying persons:", accompanying_persons);
    
    // Collect all validation errors
    const validationErrors = [];
    
    // Required field validation
    if (!visitor_name) validationErrors.push("visitor_name is required");
    if (!visitor_email) validationErrors.push("visitor_email is required");
    if (!visit_date) validationErrors.push("visit_date is required");
    if (!visit_time) validationErrors.push("visit_time is required");
    if (!visitor_type_id) validationErrors.push("visitor_type_id is required");
    if (!warehouse_id) validationErrors.push("warehouse_id is required");
    
    console.log("Required field validation errors:", validationErrors);
    
    // Field format validation
    if (visitor_name && !validation.isValidName(visitor_name)) {
      validationErrors.push("visitor_name must be 2-100 characters with letters, spaces, hyphens, and apostrophes only");
    }
    
    if (visitor_email && !validation.isValidEmail(visitor_email)) {
      validationErrors.push("visitor_email must be a valid email address");
    }
    
    if (visitor_phone && !validation.isValidPhone(visitor_phone)) {
      validationErrors.push("visitor_phone must be a valid international phone number");
    }
    
    if (visit_time && !["forenoon", "afternoon"].includes(visit_time)) {
      validationErrors.push("visit_time must be either 'forenoon' or 'afternoon'");
    }
    
    if (visit_date && !validation.isValidFutureDate(visit_date)) {
      validationErrors.push("visit_date must be in YYYY-MM-DD format and cannot be in the past");
    }
    
    if (visitor_type_id && !validation.isValidUUID(visitor_type_id)) {
      validationErrors.push("visitor_type_id must be a valid UUID");
    }
    
    if (warehouse_id && !validation.isValidUUID(warehouse_id)) {
      validationErrors.push("warehouse_id must be a valid UUID");
    }
    
    if (description && !validation.isValidText(description, 1, 1000)) {
      validationErrors.push("description must be between 1-1000 characters");
    }
    
    if (accompanying_persons && !validation.isValidAccompanyingPersons(accompanying_persons)) {
      validationErrors.push("accompanying_persons must be an array of valid person objects (max 10) with required 'name' field");
      console.log("Accompanying persons validation failed for:", accompanying_persons);
    }
    
    console.log("All validation errors:", validationErrors);
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      console.log("Returning validation error response");
      return res.status(400).json(validation.createValidationError(validationErrors));
    }
    
    console.log("Validation passed, checking foreign key references...");
    
    // Verify foreign key references exist in database
    const [visitorTypeExists, warehouseExists] = await Promise.all([
      visitorHelper.visitorTypeExists(visitor_type_id),
      visitorHelper.warehouseExists(warehouse_id)
    ]);
    
    console.log("Visitor type exists:", visitorTypeExists);
    console.log("Warehouse exists:", warehouseExists);
    
    if (!visitorTypeExists) {
      return res.status(400).json({ 
        error: "Invalid reference",
        message: "The specified visitor type does not exist"
      });
    }
    
    if (!warehouseExists) {
      return res.status(400).json({ 
        error: "Invalid reference",
        message: "The specified warehouse does not exist"
      });
    }

    console.log("Creating visit request...");
    
    // Create visit request with sanitized data
    const visitRequest = await visitorHelper.createVisitRequest({
      visitor_name: validation.sanitizeString(visitor_name),
      visitor_email: validation.sanitizeString(visitor_email).toLowerCase(),
      visitor_phone: visitor_phone ? validation.sanitizeString(visitor_phone) : null,
      accompanying_persons: accompanying_persons || [],
      visit_date,
      visit_time,
      visitor_type_id,
      description: description ? validation.sanitizeString(description) : null,
      warehouse_id,
    });

    console.log("Visit request created successfully:", visitRequest);

    res.status(201).json({
      success: true,
      message: "Visit request created successfully",
      data: visitRequest
    });
    
  } catch (err) {
    console.error("Error creating visit request:", err.message);
    console.error("Error stack:", err.stack);
    
    // Handle specific database errors
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ 
        error: "Invalid reference",
        message: "One or more referenced entities do not exist"
      });
    }
    
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ 
        error: "Duplicate entry",
        message: "A similar request already exists"
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to create visit request"
    });
  }
});

module.exports = router;