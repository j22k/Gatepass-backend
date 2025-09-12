const express = require("express");
const adminRoutes = require("./routes/admin");
const visitorRoutes = require("./routes/visitor");
require("dotenv").config();

const app = express();

app.use(express.json());

// Mount admin routes
app.use("/admin", adminRoutes);
app.use("/visitor", visitorRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("✅ API is running. Try /admin/users or /admin/roles");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
