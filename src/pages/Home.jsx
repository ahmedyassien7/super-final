import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import { Link } from "react-router-dom";

const API = "http://localhost:3006/api";

export default function Home() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [openCart, setOpenCart] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // حفظ الكارت
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // 🟢 جلب الكاتيجوريز
    useEffect(() => {
        fetch(`${API}/categories`)
            .then(res => res.json())
            .then(data => {
                // لو بيرجع objects زي {name: "Food"}
                const names = data.map(c => c.name || c);
                setCategories(names);
            })
            .catch(err => console.log("Categories error:", err));
    }, []);

    // 🟢 جلب المنتجات
    useEffect(() => {
        let url = `${API}/products`;

        if (selectedCategory !== "All") {
            url += `?category=${encodeURIComponent(selectedCategory)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.log("Products error:", err));
    }, [selectedCategory]);

    const addToCart = (product) => {
        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const changeQuantity = (id, amount) => {
        setCart(
            cart.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + amount) }
                    : item
            )
        );
    };

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    // 🔍 search
    const filteredProducts = products.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="container">

            {/* NAVBAR */}
            <div className="navbar">
                <h2 className="logo">
                    <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                        🛒 Supermarket
                    </Link>
                </h2>

                <input
                    type="text"
                    placeholder="Search products..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>

                    {user ? (
                        <>
                            <span style={{ color: "#2ecc71", fontWeight: 500 }}>
                                👋 {user.name || user.email}
                            </span>
                            <button
                                className="logout-btn"
                                onClick={() => {
                                    localStorage.removeItem("user");
                                    window.location.reload();
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </div>

                <button
                    className="cart-toggle"
                    onClick={() => setOpenCart(!openCart)}
                >
                    🛒 ({cart.reduce((t, i) => t + i.quantity, 0)})
                </button>
            </div>

            {/* BANNER */}
            <div className="banner">
                <h1>Welcome to Our Store</h1>
                <p>Best prices. Best quality. Fast delivery.</p>
            </div>

            {/* CART */}
            {openCart && (
                <div className="cart">
                    <h3>Your Cart</h3>

                    {cart.length === 0 ? (
                        <p>Cart is empty</p>
                    ) : (
                        <>
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div>
                                        <p>{item.name}</p>
                                        <small>{item.price} EGP</small>
                                    </div>

                                    <div className="qty-controls">
                                        <button onClick={() => changeQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                                    </div>

                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}

                            <hr />
                            <h4>Total: {totalPrice} EGP</h4>

                            <button
                                className="checkout-btn"
                                onClick={() => navigate("/payment")}
                            >
                                Checkout
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* CATEGORIES */}
            <div className="categories">
                {["All", ...categories].map((cat) => (
                    <button
                        key={cat}
                        className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* PRODUCTS */}
            <div className="products">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="card">
                            <img src={product.image} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p className="price">{product.price} EGP</p>

                            <button
                                className="buy-btn"
                                onClick={() => addToCart(product)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={{ padding: "20px" }}>No products found</p>
                )}
            </div>

        </div>
    );
}