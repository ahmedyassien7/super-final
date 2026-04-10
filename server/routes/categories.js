/**
 * routes/categories.js
 */

const express = require("express");
const db = require("../database");

const router = express.Router();

router.get("/", async (_req, res) => {
    try {
        const rows = await db.asyncAll("SELECT id, name FROM categories ORDER BY name ASC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;