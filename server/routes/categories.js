/**
 * routes/categories.js
 */

const express = require("express");
const pool = require("../database");

const router = express.Router();

// GET /api/categories
router.get("/", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;