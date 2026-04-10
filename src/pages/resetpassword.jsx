import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../styles/style.css";

const API = "http://localhost:3006/api";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate("/login"), 3000);
            } else {
                const err = await response.json();
                setError(err.error || "Invalid or expired reset link");
            }
        } catch (error) {
            console.error(error);
            setError("Server error — please try again");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="form-container">
                <div className="forgot-icon">⚠️</div>
                <h2>Invalid Link</h2>
                <p className="forgot-desc">This reset link is invalid or has expired.</p>
                <Link to="/forgot-password" className="back-link">Request a new link</Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="form-container">
                <div className="success-icon">✅</div>
                <h2>Password Reset!</h2>
                <p className="success-msg">
                    Your password has been reset successfully. Redirecting to login...
                </p>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="forgot-icon">🔑</div>
            <h2>Reset Password</h2>
            <p className="forgot-desc">Enter your new password below.</p>

            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                    <input
                        type={showPass ? "text" : "password"}
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                        {showPass ? "🙈" : "👁️"}
                    </span>
                </div>

                <input
                    type={showPass ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            <Link to="/login" className="back-link">← Back to Login</Link>
        </div>
    );
}
