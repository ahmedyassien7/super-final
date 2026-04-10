/**
 * routes/orders.js
 * Uses MySQL transactions for atomic order creation.
 */

const express = require("express");
const pool = require("../database");

const router = express.Router();

// POST /api/orders
router.post("/", async (req, res) => {
    const { user_id, items, total } = req.body;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "items must be a non-empty array" });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Verify user exists
        const [userRows] = await conn.query("SELECT id FROM users WHERE id = ?", [user_id]);
        if (userRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "User not found" });
        }

        // Insert order
        const [orderResult] = await conn.query(
            "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')",
            [user_id, total]
        );
        const order_id = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            await conn.query(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                [order_id, item.product_id, item.quantity, item.unit_price]
            );
        }

        await conn.commit();

        // Fetch the created order
        const [orderRows] = await conn.query(
            "SELECT id, user_id, total, status, created_at FROM orders WHERE id = ?",
            [order_id]
        );
        res.status(201).json(orderRows[0]);
    } catch (err) {
        await conn.rollback();
        console.error("Order creation failed:", err.message);
        res.status(500).json({ error: "Failed to create order" });
    } finally {
        conn.release();
    }
});

// GET /api/orders?email=X
router.get("/", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "email query param is required" });

    try {
        const [userRows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (userRows.length === 0) return res.status(404).json({ error: "User not found" });

        const userId = userRows[0].id;

        const [orders] = await pool.query(
            "SELECT id, user_id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const [items] = await pool.query(
                    `SELECT oi.id, oi.quantity, oi.unit_price,
                            p.id AS product_id, p.name AS product_name, p.image
                     FROM order_items oi
                     JOIN products p ON p.id = oi.product_id
                     WHERE oi.order_id = ?`,
                    [order.id]
                );
                return { ...order, items };
            })
        );

        res.json(ordersWithItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order id" });

    try {
        const [orderRows] = await pool.query(
            "SELECT id, user_id, total, status, created_at FROM orders WHERE id = ?",
            [id]
        );
        if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });

        const [items] = await pool.query(
            `SELECT oi.id, oi.quantity, oi.unit_price,
                    p.id AS product_id, p.name AS product_name, p.image
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ?`,
            [id]
        );

        res.json({ ...orderRows[0], items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;