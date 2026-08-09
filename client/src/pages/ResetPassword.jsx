import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import "../styles/ResetPassword.css";

function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    // Check token
    if (!token) {
      setMessage("Invalid password reset link.");
      return;
    }

    // Check password
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          password,
          confirmPassword,
        },
      );

      setSuccess(true);
      setMessage(res.data.message);

      // Clear password fields
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setSuccess(false);

      setMessage(
        error.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        {/* Icon */}
        <div className="reset-icon">🔐</div>

        {/* Success */}
        {success ? (
          <>
            <h1>Password Reset Successful!</h1>

            <p className="reset-subtitle">{message}</p>

            <p className="reset-success-text">
              Your password has been changed successfully. You can now login
              using your new password.
            </p>

            <Link to="/login" className="reset-btn">
              Login Now
            </Link>
          </>
        ) : (
          <>
            {/* Heading */}
            <h1>Reset Password</h1>

            <p className="reset-subtitle">
              Create a new password for your PizzaVerse account.
            </p>

            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="reset-form-group">
                <label htmlFor="password">New Password</label>

                <div className="reset-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="reset-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div className="reset-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {message && (
                <div className="reset-message error">✕ {message}</div>
              )}

              {/* Reset Button */}
              <button type="submit" className="reset-btn" disabled={loading}>
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>

            {/* Back to Login */}
            <Link to="/login" className="back-login">
              ← Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
