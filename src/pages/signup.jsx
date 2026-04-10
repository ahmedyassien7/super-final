import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/style.css";

const API = "http://localhost:3006/api";

export default function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem("user", JSON.stringify(user));
                navigate("/");
            } else {
                const err = await response.json();
                alert(err.error || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            alert("Server error — please try again");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Create Account</h2>

            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <p style={{ marginTop: "12px", fontSize: "13px", color: "#888" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#27ae60", textDecoration: "none" }}>
                    Login
                </Link>
            </p>
        </div>
    );
}
