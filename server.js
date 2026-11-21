const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Connect database
connectDB();

// Main route
app.get("/", (req, res) => {
  res.send("Inventory Management API is Running");
});

// Product routes
app.use("/api/products", productRoutes);

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});