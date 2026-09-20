const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const wishlistRoutes = require("./wishlistRoutes");
const cartRoutes = require("./cartRoutes");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const subcategoryRoutes = require("./routes/subcategoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const app = express();

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// ================= STATIC UPLOADS =================

app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/services", serviceRoutes);
// ================= HOME / TEST =================

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/test", (req, res) => {
  res.send("Server test working");
});

// ================= FEEDBACK API =================

app.post("/api/feedback", (req, res) => {
  const { full_name, email, rating, feedback } = req.body;

  if (!full_name || !email || !rating || !feedback) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const sql = `
    INSERT INTO feedback
    (full_name, email, rating, feedback)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [full_name, email, rating, feedback],
    (err, result) => {
      if (err) {
        console.log("Feedback insert error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to save feedback"
        });
      }

      res.json({
        success: true,
        message: "Feedback submitted successfully"
      });
    }
  );
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});