/**
 * seed.js
 * Seeds the MySQL database with categories, products, and users.
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./database");

console.log("🌱  Seeding database...\n");

const categories = ["Food", "Drinks", "Cleaning", "Electronics"];

const products = [
    { name: "Milk", price: 40, category: "Food", stock: 100, image: "/images/milk2.jpg" },
    { name: "Bread", price: 40, category: "Food", stock: 50, image: "/images/bread.jpg" },
    { name: "Carrots", price: 25, category: "Food", stock: 80, image: "/images/carrots.jpg" },
    { name: "Orange Juice", price: 15, category: "Drinks", stock: 60, image: "/images/orange-juice.jpg" },
    { name: "Coffee", price: 117, category: "Drinks", stock: 45, image: "/images/coffee.jpg" },
    { name: "Detergent", price: 50, category: "Cleaning", stock: 30, image: "/images/detergent.jpg" },
    { name: "Dish Soap", price: 35, category: "Cleaning", stock: 40, image: "/images/dish.jpg" },
    { name: "Headphones", price: 300, category: "Electronics", stock: 15, image: "/images/head.jpg" },
    { name: "Keyboard", price: 250, category: "Electronics", stock: 20, image: "/images/keyboard.jpg" },

    { name: "Sugar", price: 35, category: "Food", stock: 50, image: "/images/sugar.jpg" },
    { name: "Tea", price: 25, category: "Drinks", stock: 40, image: "/images/tea.jpg" },
    { name: "Butter", price: 60, category: "Food", stock: 30, image: "/images/butter.jpg" },
    { name: "Oil", price: 70, category: "Food", stock: 35, image: "/images/oil.jpg" },
    { name: "Honey", price: 90, category: "Food", stock: 20, image: "/images/honey.jpg" },
    { name: "Tuna", price: 35, category: "Food", stock: 45, image: "/images/tuna.jpg" },
    { name: "Cheese", price: 50, category: "Food", stock: 25, image: "/images/cheese.jpg" },
    { name: "Chicken", price: 85, category: "Food", stock: 20, image: "/images/chick.jpg" },
    { name: "Beans", price: 30, category: "Food", stock: 40, image: "/images/beans.jpg" },
    { name: "Peas", price: 28, category: "Food", stock: 35, image: "/images/peas.jpg" },
    { name: "Olive Oil", price: 120, category: "Food", stock: 15, image: "/images/olive.jpg" },
    { name: "Greek Yogurt", price: 10, category: "Food", stock: 60, image: "/images/yogurt.jpg" },

    { name: "V-Cola", price: 12, category: "Drinks", stock: 70, image: "/images/v.jpg" },
    { name: "Pepsi", price: 15, category: "Drinks", stock: 65, image: "/images/pepsi.jpg" },
    { name: "Coca Cola", price: 15, category: "Drinks", stock: 65, image: "/images/coca.jpg" },
    { name: "Sprite", price: 14, category: "Drinks", stock: 60, image: "/images/sprite.jpg" },

    { name: "Shampoo", price: 55, category: "Cleaning", stock: 30, image: "/images/shampoo.jpg" },
    { name: "Conditioner", price: 60, category: "Cleaning", stock: 25, image: "/images/cond.jpg" },
    { name: "Clorox", price: 40, category: "Cleaning", stock: 35, image: "/images/clorox.jpg" },
    { name: "Glass Cleaner", price: 35, category: "Cleaning", stock: 30, image: "/images/glass.jpg" },

    { name: "TV", price: 8000, category: "Electronics", stock: 10, image: "/images/tv.jpg" },
    { name: "Dishwasher", price: 6000, category: "Electronics", stock: 8, image: "/images/dishwasher.jpg" },
    { name: "Air Fryer", price: 2500, category: "Electronics", stock: 12, image: "/images/air.jpg" },
    { name: "Microwave", price: 3000, category: "Electronics", stock: 10, image: "/images/microwave.jpg" },

    { name: "PlayStation 5", price: 25000, category: "Electronics", stock: 5, image: "/images/ps5.jpg" },
    { name: "Nintendo Switch", price: 12000, category: "Electronics", stock: 7, image: "/images/nin.jpg" },
    { name: "Bell Pepper", price: 15, category: "Food", stock: 40, image: "/images/bell.jpg" },
    { name: "Cucumber", price: 10, category: "Food", stock: 50, image: "/images/cucumber.jpg" },
    { name: "Onion", price: 8, category: "Food", stock: 60, image: "/images/onion.jpg" },
    { name: "Eggs", price: 70, category: "Food", stock: 30, image: "/images/eggs.jpg" },
    { name: "Green Pepper", price: 20, category: "Food", stock: 35, image: "/images/green.jpg" },
    { name: "Black Pepper", price: 10, category: "Food", stock: 80, image: "/images/black.jpg" },
    { name: "Salt", price: 5, category: "Food", stock: 80, image: "/images/salt.jpg" },
    { name: "Paprika", price: 25, category: "Food", stock: 25, image: "/images/paprika.jpg" },
    { name: "Noodles", price: 12, category: "Food", stock: 55, image: "/images/noodles.jpg" },
    { name: "Pasta", price: 14, category: "Food", stock: 50, image: "/images/pasta.jpg" },
    { name: "Rice", price: 18, category: "Food", stock: 70, image: "/images/rice.jpg" },
    { name: "Cabbage", price: 12, category: "Food", stock: 40, image: "/images/cabbage.jpg" },
    { name: "Pringles", price: 30, category: "Food", stock: 25, image: "/images/pringles.jpg" },
    { name: "Meat", price: 250, category: "Food", stock: 20, image: "/images/meat.jpg" },
    { name: "Eggplant", price: 10, category: "Food", stock: 45, image: "/images/eggplant.jpg" },
    { name: "Potato", price: 6, category: "Food", stock: 80, image: "/images/potato.jpg" },

    { name: "Water", price: 8, category: "Drinks", stock: 100, image: "/images/water.jpg" },
    { name: "Apple Juice", price: 20, category: "Drinks", stock: 60, image: "/images/apple-juice.jpg" },
    { name: "Red Bull", price: 35, category: "Drinks", stock: 40, image: "/images/redbull.jpg" },

    { name: "Fridge", price: 15000, category: "Electronics", stock: 6, image: "/images/fridge.jpg" },
    { name: "Washing Machine", price: 10000, category: "Electronics", stock: 5, image: "/images/washing.jpg" },
    { name: "Water Heater", price: 3000, category: "Electronics", stock: 10, image: "/images/water-heater.jpg" },
    { name: "AC Unit", price: 12000, category: "Electronics", stock: 8, image: "/images/ac.jpg" },
    { name: "Stove", price: 5000, category: "Electronics", stock: 7, image: "/images/oven.jpg" },

    { name: "Floor Cleaner", price: 40, category: "Cleaning", stock: 35, image: "/images/floor-cleaner.jpg" },
    { name: "Air Freshener", price: 30, category: "Cleaning", stock: 50, image: "/images/air-freshner.jpg" },
    { name: "Toilet Cleaner", price: 38, category: "Cleaning", stock: 30, image: "/images/toilet-cleaner.jpg" },
    { name: "Sponge", price: 10, category: "Cleaning", stock: 70, image: "/images/sponge.jpg" },
    { name: "Scrub Brush", price: 20, category: "Cleaning", stock: 40, image: "/images/scrub-brush.jpg" },
    { name: "Mop", price: 120, category: "Cleaning", stock: 15, image: "/images/mop.jpg" },
    { name: "Broom", price: 90, category: "Cleaning", stock: 20, image: "/images/broom.jpg" },
    { name: "Multi-Surface Cleaner", price: 35, category: "Cleaning", stock: 45, image: "/images/multi.jpg" },
    { name: "Lettuce", price: 10, category: "Food", stock: 50, image: "/images/lettuce.jpg" },

    { name: "Flour", price: 25, category: "Food", stock: 40, image: "/images/flour.jpg" },
    { name: "Chocolate", price: 30, category: "Food", stock: 35, image: "/images/chocolate.jpg" },
    { name: "Fish", price: 120, category: "Food", stock: 20, image: "/images/fish.jpg" },
    { name: "Cereal", price: 45, category: "Food", stock: 30, image: "/images/cereal.jpg" },

    { name: "Tissues", price: 20, category: "Cleaning", stock: 60, image: "/images/tissues.jpg" },

    { name: "Mouse", price: 150, category: "Electronics", stock: 40, image: "/images/mouse.jpg" },
    { name: "Fan", price: 500, category: "Electronics", stock: 25, image: "/images/fan.jpg" },
    { name: "Mini Fridge", price: 4000, category: "Electronics", stock: 8, image: "/images/mini-fridge.jpg" },
];

async function seed() {
    // Wait for tables to be created before seeding
    await pool.tablesReady;

    const conn = await pool.getConnection();

    try {
        // Insert categories
        for (const cat of categories) {
            await conn.query("INSERT IGNORE INTO categories (name) VALUES (?)", [cat]);
        }
        console.log("✅  Categories seeded:", categories.join(", "));

        // Get category map
        const [catRows] = await conn.query("SELECT id, name FROM categories");
        const catMap = {};
        catRows.forEach((r) => (catMap[r.name] = r.id));

        // Insert products
        for (const p of products) {
            const catId = catMap[p.category];
            await conn.query(
                "INSERT IGNORE INTO products (name, price, category_id, image, stock) VALUES (?, ?, ?, ?, ?)",
                [p.name, p.price, catId, p.image, p.stock]
            );
        }
        console.log(`✅  ${products.length} products seeded`);

        // Insert admin user
        const [existingAdmin] = await conn.query("SELECT id FROM users WHERE email = ?", ["admin@test.com"]);
        if (existingAdmin.length === 0) {
            const hash = bcrypt.hashSync("123456", 10);
            await conn.query(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ["Admin", "admin@test.com", hash, "admin"]
            );
            console.log("✅  Admin user created: admin@test.com / 123456");
        } else {
            console.log("ℹ️   Admin user already exists – skipping");
        }

        // Insert customers
        const customers = [
            { name: "Customer One", email: "customer1@test.com", password: "pass12" },
            { name: "Customer Two", email: "customer2@test.com", password: "pass34" },
            { name: "Customer Three", email: "customer3@test.com", password: "pass56" },
            { name: "Customer Four", email: "customer4@test.com", password: "pass78" },
        ];

        for (const c of customers) {
            const [existing] = await conn.query("SELECT id FROM users WHERE email = ?", [c.email]);
            if (existing.length === 0) {
                const hash = bcrypt.hashSync(c.password, 10);
                await conn.query(
                    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    [c.name, c.email, hash, "customer"]
                );
                console.log(`✅  Customer created: ${c.email} / ${c.password}`);
            }
        }

        console.log("\n🎉  Seeding complete!");
    } finally {
        conn.release();
        await pool.end();
    }
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});