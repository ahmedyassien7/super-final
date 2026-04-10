/**
 * routes/products.js
 */

const express = require("express");
const db = require("../database");

const router = express.Router();

const SELECT_PRODUCTS = `
  SELECT p.id, p.name, p.price, p.image, p.stock, p.created_at, c.name AS category
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

router.get("/", async (req, res) => {
    const { category } = req.query;
    try {
        let rows;
        if (category && category !== "All") {
            rows = await db.asyncAll(
                SELECT_PRODUCTS + " WHERE c.name = ? COLLATE NOCASE ORDER BY p.name ASC",
                [category]
            );
        } else {
            rows = await db.asyncAll(SELECT_PRODUCTS + " ORDER BY p.name ASC");
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product id" });

    try {
        const row = await db.asyncGet(SELECT_PRODUCTS + " WHERE p.id = ?", [id]);
        if (!row) return res.status(404).json({ error: "Product not found" });
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;