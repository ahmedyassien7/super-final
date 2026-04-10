import "../styles/style.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3006/api";

export default function Payment() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load user and cart on mount
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
        }

        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, [navigate]);

    // Redirect to home after success
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate("/");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!name || !address || !cardNumber) {
            alert("Please fill all fields");
            return;
        }

        if (cardNumber.length < 12) {
            alert("Invalid card number — must be at least 12 digits");
            return;
        }

        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            // Build order payload for the new API
            const order = {
                user_id: user.id,
                total: totalPrice,
                items: cart.map((item) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                })),
            };

            // POST /api/orders — wrapped in a SQL transaction on the backend
            const response = await fetch(`${API}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
            });

            if (response.ok) {
                setSuccess(true);
                localStorage.removeItem("cart");
            } else {
                const err = await response.json();
                alert(err.error || "Error saving order");
            }
        } catch (error) {
            console.error(error);
            alert("Network error — please try again");
        } finally {
            setLoading(false);
        }
    };

    // Show success message if payment done
    if (success) {
        return (
            <div className="payment-success">
                <h2>✅ Payment Successful!</h2>
                <p>Your order has been placed successfully.</p>
                <p>Redirecting to home page...</p>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <h2>Checkout</h2>

            <div className="payment-summary">
                <h3>Order Summary</h3>
                {cart.map((item) => (
                    <p key={item.id}>
                        {item.name} × {item.quantity} — {item.price * item.quantity} EGP
                    </p>
                ))}
                <hr />
                <h4>Total: {totalPrice} EGP</h4>
            </div>

            <form onSubmit={handlePayment} className="payment-form">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Card Number (min 12 digits)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={16}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Pay Now"}
                </button>
            </form>
        </div>
    );
}