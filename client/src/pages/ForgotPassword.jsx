import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: email.trim(),
        },
      );

      setSuccess(true);
      setMessage(res.data.message);
      setEmail("");
    } catch (error) {
      setSuccess(false);

      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-icon">🔑</div>

        <h1>Forgot Password?</h1>

        <p className="forgot-subtitle">
          No worries! Enter your registered email and we'll send you a password
          reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="forgot-form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {message && (
            <div
              className={
                success ? "forgot-message success" : "forgot-message error"
              }
            >
              {success ? "✓ " : "✕ "}
              {message}
            </div>
          )}

          <button type="submit" className="forgot-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" className="back-login">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
