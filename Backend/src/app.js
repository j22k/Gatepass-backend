const express = require("express");
const adminRoutes = require("./routes/admin");
const visitorRoutes = require("./routes/visitor");
const validation = require("./utils/validation");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("./helpers/authHelpers");
const cors = require('cors');
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const app = express();

app.use(cors());
app.use(express.json());


// Mount routes
app.use("/admin", adminRoutes);
app.use("/visitor", visitorRoutes);

// Health/root
app.get("/", (req, res) => {
  res.send("✅ API is running. Try GET /admin/users, GET /visitor/warehouses, GET /visitor/visitor-types");
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const validationErrors = [];
  
  if (!email) validationErrors.push("email is required");
  if (!password) validationErrors.push("password is required");
  
  if (email && !validation.isValidEmail(email)) {
    validationErrors.push("email must be a valid email address");
  }
  
  if (password && typeof password !== 'string') {
    validationErrors.push("password must be a string");
  }
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors
    });
  }
  
  try {
    const user = await authenticateUser(validation.sanitizeString(email).toLowerCase(), password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });
    
    // Determine redirect URL based on role
    let redirectUrl = "/dashboard"; // Default fallback
    switch (user.role_name) {
      case "Admin":
        redirectUrl = "/admin/dashboard";
        break;
      case "Manager":
      case "Receptionist":
        redirectUrl = "/manager/dashboard";
        break;
      case "QA":
        redirectUrl = "/qa/dashboard";
        break;
      default:
        redirectUrl = "/visitor/dashboard";
        break;
    }
    
    res.status(200).json({ token, redirectUrl }); // Explicit 200 for clarity
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});