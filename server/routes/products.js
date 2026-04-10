/**
 * routes/products.js
 */

const express = require("express");
const pool = require("../database");

const router = express.Router();

const SELECT_PRODUCTS = `
  SELECT p.id, p.name, p.price, p.image, p.stock, p.created_at, c.name AS category
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

// GET /api/products  or  GET /api/products?category=Drinks
router.get("/", async (req, res) => {
    const { category } = req.query;
    try {
        let rows;
        if (category && category !== "All") {
            [rows] = await pool.query(
                SELECT_PRODUCTS + " WHERE c.name = ? ORDER BY p.name ASC",
                [category]
            );
        } else {
            [rows] = await pool.query(SELECT_PRODUCTS + " ORDER BY p.name ASC");
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product id" });

    try {
        const [rows] = await pool.query(SELECT_PRODUCTS + " WHERE p.id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;