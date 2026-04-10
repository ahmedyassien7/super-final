

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// ── Import route handlers ─────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3006;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3003",
            "http://localhost:3005",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3003",
            "http://127.0.0.1:3005",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

// ── Serve product images from the React public/images folder ──────────────────
app.use("/images", express.static(path.join(__dirname, "..", "public", "images")));

// ── Request logger (development) ──────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀  Supermarket API running on http://localhost:${PORT}`);
    console.log(`─────────────────────────────────────────────────`);
    console.log(`  GET  /api/products`);
    console.log(`  GET  /api/products?category=Drinks`);
    console.log(`  GET  /api/products/:id`);
    console.log(`  GET  /api/categories`);
    console.log(`  POST /api/auth/login`);
    console.log(`  POST /api/auth/register`);
    console.log(`  POST /api/auth/forgot-password`);
    console.log(`  POST /api/auth/reset-password`);
    console.log(`  POST /api/orders`);
    console.log(`  GET  /api/orders?email=...`);
    console.log(`  GET  /api/orders/:id`);
    console.log(`  GET  /api/health`);
    console.log(`─────────────────────────────────────────────────\n`);
});

module.exports = app;
