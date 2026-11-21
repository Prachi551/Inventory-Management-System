const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStock,
  getSummary,
  adjustStock
} = require("../controllers/productController");


// Create product
router.post("/", createProduct);

// Get all products
router.get("/", getProducts);

// Low stock report
router.get("/low-stock", getLowStock);

// Category summary
router.get("/summary", getSummary);

// Adjust stock
router.patch("/:id/stock", adjustStock);

// Get single product
router.get("/:id", getProductById);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;