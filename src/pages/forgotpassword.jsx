import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/style.css";

const API = "http://localhost:3006/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch(`${API}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            setSent(true);
        } catch (error) {
            console.error(error);
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="form-container">
                <div className="success-icon">📬</div>
                <h2>Check Your Email</h2>
                <p className="success-msg">
                    If this email is registered, you'll receive a password reset link shortly.
                </p>
                <Link to="/login" className="back-link">← Back to Login</Link>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="forgot-icon">🔐</div>
            <h2>Forgot Password</h2>
            <p className="forgot-desc">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <Link to="/login" className="back-link">← Back to Login</Link>
        </div>
    );
}
