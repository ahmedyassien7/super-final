/**
 * database.js
 * Creates a MySQL connection pool using mysql2/promise.
 * Exports pool + initTables() so callers can await table creation.
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "supermarket_user",
    password: process.env.DB_PASSWORD || "supermarket_pass",
    database: process.env.DB_NAME || "supermarket_db",
    port: parseInt(process.env.DB_PORT, 10) || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function initTables() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`CREATE TABLE IF NOT EXISTS categories (
            id   INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS users (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            name         VARCHAR(100),
            email        VARCHAR(255) UNIQUE NOT NULL,
            password     VARCHAR(255) NOT NULL,
            role         VARCHAR(20)  NOT NULL DEFAULT 'customer',
            reset_token  VARCHAR(255) DEFAULT NULL,
            reset_expires DATETIME    DEFAULT NULL,
            created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS products (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            price       DECIMAL(10,2) NOT NULL,
            category_id INT NOT NULL,
            image       VARCHAR(500),
            stock       INT NOT NULL DEFAULT 100,
            created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS orders (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            user_id    INT NOT NULL,
            total      DECIMAL(10,2) NOT NULL DEFAULT 0,
            status     ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS order_items (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            order_id   INT NOT NULL,
            product_id INT NOT NULL,
            quantity   INT NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        )`);

        console.log("✅ MySQL tables initialised");
    } finally {
        conn.release();
    }
}

// Store the promise so server.js can await it
const tablesReady = initTables().catch((err) => {
    console.error("❌ Failed to initialise tables:", err.message);
});

module.exports = pool;
module.exports.tablesReady = tablesReady;
module.exports.initTables = initTables;