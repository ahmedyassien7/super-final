/**
 * routes/orders.js
 */

const express = require("express");
const db = require("../database");

const router = express.Router();

// POST /api/orders
router.post("/", async (req, res) => {
    const { user_id, items, total } = req.body;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "items must be a non-empty array" });

    try {
        const user = await db.asyncGet("SELECT id FROM users WHERE id = ?", [user_id]);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Insert order
        const orderResult = await db.asyncRun(
            "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')",
            [user_id, total]
        );
        const order_id = orderResult.lastID;

        // Insert items
        for (const item of items) {
            await db.asyncRun(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                [order_id, item.product_id, item.quantity, item.unit_price]
            );
        }

        const order = await db.asyncGet(
            "SELECT id, user_id, total, status, created_at FROM orders WHERE id = ?",
            [order_id]
        );
        res.status(201).json(order);
    } catch (err) {
        console.error("Order creation failed:", err.message);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// GET /api/orders?email=X
router.get("/", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "email query param is required" });

    try {
        const user = await db.asyncGet("SELECT id FROM users WHERE email = ?", [email]);
        if (!user) return res.status(404).json({ error: "User not found" });

        const orders = await db.asyncAll(
            "SELECT id, user_id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [user.id]
        );

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await db.asyncAll(`
                SELECT oi.id, oi.quantity, oi.unit_price,
                       p.id AS product_id, p.name AS product_name, p.image
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = ?
            `, [order.id]);
            return { ...order, items };
        }));

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
        const order = await db.asyncGet(
            "SELECT id, user_id, total, status, created_at FROM orders WHERE id = ?",
            [id]
        );
        if (!order) return res.status(404).json({ error: "Order not found" });

        const items = await db.asyncAll(`
            SELECT oi.id, oi.quantity, oi.unit_price,
                   p.id AS product_id, p.name AS product_name, p.image
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        `, [id]);

        res.json({ ...order, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;