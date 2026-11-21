const Product = require("../models/Product");

// 1. CREATE PRODUCT
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};


// 2. GET ALL PRODUCTS
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

    const sortOrder = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      count: products.length,
      products
    });

  } catch (error) {
    next(error);
  }
};


// 3. GET SINGLE PRODUCT
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    next(error);
  }
};


// 4. UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    next(error);
  }
};


// 5. DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted",
      id: product._id
    });

  } catch (error) {
    next(error);
  }
};


// 6. LOW STOCK REPORT
exports.getLowStock = async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({
      $expr: {
        $lte: ["$quantity", "$reorderLevel"]
      }
    });

    res.json({
      count: lowStockItems.length,
      lowStockItems
    });

  } catch (error) {
    next(error);
  }
};


// 7. CATEGORY-WISE INVENTORY SUMMARY
exports.getSummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",

          totalItems: {
            $sum: 1
          },

          totalQuantity: {
            $sum: "$quantity"
          },

          totalStockValue: {
            $sum: {
              $multiply: ["$price", "$quantity"]
            }
          },

          avgPrice: {
            $avg: "$price"
          }
        }
      }
    ]);

    res.json({
      categories: summary.length,
      summary
    });

  } catch (error) {
    next(error);
  }
};


// 8. RESTOCK / SALE
exports.adjustStock = async (req, res, next) => {
  try {
    const change = Number(req.body.change);

    if (!Number.isInteger(change) || change === 0) {
      return res.status(400).json({
        message: "Change must be a non-zero integer"
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        quantity: { $gte: Math.max(0, -change) }
      },
      {
        $inc: { quantity: change }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(400).json({
        message: "Product not found or insufficient stock"
      });
    }

    res.json({
      message: "Stock updated",
      product
    });

  } catch (error) {
    next(error);
  }
};