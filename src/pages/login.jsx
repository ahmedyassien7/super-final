import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/style.css";

const API = "http://localhost:3006/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("user", JSON.stringify(data));
                navigate("/");
            } else {
                const err = await response.json();
                alert(err.error || "Invalid email or password");
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
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="input-wrapper">
                    <input
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                        {showPass ? "🙈" : "👁️"}
                    </span>
                </div>

                <div className="forgot-link-wrapper">
                    <Link to="/forgot-password" className="forgot-link">
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p style={{ marginTop: "12px", fontSize: "13px", color: "#888" }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ color: "#27ae60", textDecoration: "none" }}>
                    Sign Up
                </Link>
            </p>


        </div>
    );
}
