const express = require("express");
const adminRoutes = require("./routes/admin");
const visitorRoutes = require("./routes/visitor");
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
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});