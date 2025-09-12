const express = require("express");
const router = express.Router();
const visitorHelper = require("../helpers/visitorHelpers");


// READ all visitor types
router.get("/visitor-types", async (req, res) => {
  try {
    const types = await visitorHelper.getAllVisitorTypes();
    res.status(200).json(types);
  } catch (err) {
    console.error("Error fetching visitor types:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


// READ all warehouses
router.get("/warehouses", async (req, res) => {
  try {
    const warehouses = await visitorHelper.getAllWarehouses();
    res.status(200).json(warehouses);
  } catch (err) {
    console.error("Error fetching warehouses:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
