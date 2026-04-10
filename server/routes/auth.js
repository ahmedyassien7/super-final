/**
 * routes/auth.js
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });

    try {
        const user = await db.asyncGet(
            "SELECT id, email, password, role FROM users WHERE email = ?",
            [email]
        );
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });

        res.json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });
    if (password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });

    try {
        const existing = await db.asyncGet("SELECT id FROM users WHERE email = ?", [email]);
        if (existing) return res.status(409).json({ error: "Email already registered" });

        const hash = bcrypt.hashSync(password, 10);
        const result = await db.asyncRun(
            "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
            [email, hash, "customer"]
        );
        res.status(201).json({ id: result.lastID, email, role: "customer" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;