/**
 * database.js
 * Opens (or creates) the SQLite database and initialises all tables.
 * Uses sqlite3 (async) wrapped in a promise helper.
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "supermarket.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to SQLite database");
});

// Enable WAL mode and foreign keys
db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA foreign_keys = ON");

  db.run(`CREATE TABLE IF NOT EXISTS categories (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT    UNIQUE NOT NULL
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        email      TEXT    UNIQUE NOT NULL,
        password   TEXT    NOT NULL,
        role       TEXT    NOT NULL DEFAULT 'customer',
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        price       REAL    NOT NULL CHECK (price >= 0),
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        image       TEXT,
        stock       INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total      REAL    NOT NULL DEFAULT 0 CHECK (total >= 0),
        status     TEXT    NOT NULL DEFAULT 'pending',
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id   INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity   INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL    NOT NULL CHECK (unit_price >= 0)
    )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);
});

// Helper: run a query that modifies data (INSERT, UPDATE, DELETE)
db.asyncRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Helper: get a single row
db.asyncGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper: get multiple rows
db.asyncAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;