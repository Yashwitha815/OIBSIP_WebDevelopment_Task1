import "../styles/AdminLogin.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/admin/login",
        {
          email,
          password,
        },
      );

      if (response.data.success) {
        // Store admin authentication
        localStorage.setItem("token", response.data.token);

        localStorage.setItem("userInfo", JSON.stringify(response.data.user));

        toast.success("Admin login successful 👨‍💼");

        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-section">
      <div className="admin-login-card">
        {/* Header */}

        <div className="admin-login-header">
          <div className="admin-logo">🍕</div>

          <h1>PizzaVerse</h1>

          <h2>Admin Login</h2>

          <p>Sign in to access the admin dashboard.</p>
        </div>

        {/* Form */}

        <form className="admin-login-form" onSubmit={handleLogin}>
          {/* Email */}

          <div className="admin-input-group">
            <label>Email Address</label>

            <div className="admin-input-box">
              <FaEnvelope className="admin-input-icon" />

              <input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}

          <div className="admin-input-group">
            <label>Password</label>

            <div className="admin-input-box">
              <FaLock className="admin-input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="admin-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Login as Admin"}
          </button>
        </form>

        {/* Back to User Login */}

        <div className="admin-back-login">
          <button type="button" onClick={() => navigate("/login")}>
            ← Back to User Login
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
