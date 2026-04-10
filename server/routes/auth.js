/**
 * routes/auth.js
 * Handles login, register, forgot-password, and reset-password.
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../database");
const { sendResetEmail } = require("../utils/mailer");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supermarket_jwt_secret_key_2024_xKz9mN";

// Helper: generate JWT
function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });

    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, password, role FROM users WHERE email = ?",
            [email]
        );
        if (rows.length === 0)
            return res.status(401).json({ error: "Invalid email or password" });

        const user = rows[0];
        const match = bcrypt.compareSync(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid email or password" });

        const token = signToken(user);
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });
    if (password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });

    try {
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0)
            return res.status(409).json({ error: "Email already registered" });

        const hash = bcrypt.hashSync(password, 10);
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name || null, email, hash, "customer"]
        );

        const user = { id: result.insertId, name: name || null, email, role: "customer" };
        const token = signToken(user);
        res.status(201).json({ ...user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    // Always return success to prevent email enumeration
    if (!email)
        return res.json({ message: "If this email is registered, you will receive a reset link." });

    try {
        const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 3600000); // 1 hour from now

            await pool.query(
                "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
                [token, expires, email]
            );

            // Build the reset link (use FRONTEND_URL if set, otherwise default)
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3003";
            const resetLink = `${frontendUrl}/reset-password?token=${token}`;

            // Send the reset email
            try {
                const result = await sendResetEmail(email, resetLink);
                console.log(`\n📧 Password reset email sent to ${email}`);
                if (result.previewUrl) {
                    console.log(`   📬 Preview URL: ${result.previewUrl}`);
                }
                console.log(`   🔗 Reset link: ${resetLink}\n`);
            } catch (emailErr) {
                console.error("Failed to send reset email:", emailErr.message);
                // Don't fail the request — token is still saved
            }
        }

        res.json({ message: "If this email is registered, you will receive a reset link." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password)
        return res.status(400).json({ error: "Token and new password are required" });
    if (password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });

    try {
        const [rows] = await pool.query(
            "SELECT id, email FROM users WHERE reset_token = ? AND reset_expires > NOW()",
            [token]
        );
        if (rows.length === 0)
            return res.status(400).json({ error: "Invalid or expired reset link" });

        const user = rows[0];
        const hash = bcrypt.hashSync(password, 10);

        await pool.query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
            [hash, user.id]
        );

        res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;