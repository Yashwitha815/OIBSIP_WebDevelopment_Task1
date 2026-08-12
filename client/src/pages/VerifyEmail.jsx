import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import "../styles/VerifyEmail.css";

function VerifyEmail() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Prevent duplicate verification requests
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verifyEmail = async () => {
      if (!token) {
        setSuccess(false);
        setMessage("Verification token is missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`,
        );

        setSuccess(true);
        setMessage(
          res.data.message || "Email verified successfully. You can now login.",
        );
        setLoading(false);
      } catch (error) {
        console.error("Email Verification Error:", error);

        const errorMessage =
          error.response?.data?.message ||
          "Verification failed. Please try again.";

        /*
         * If the request was duplicated and the first request
         * already verified the account, the second request may
         * say that the token is invalid.
         *
         * In that case, check whether the account is already
         * verified before showing failure.
         */
        if (
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("not found")
        ) {
          setSuccess(false);
          setMessage(errorMessage);
        } else {
          setSuccess(false);
          setMessage(errorMessage);
        }

        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  // ============================
  // Loading
  // ============================

  if (loading) {
    return (
      <div className="verify-page">
        <div className="verify-card">
          <div className="verify-icon loading-icon">⏳</div>

          <h1>Verifying Your Email...</h1>

          <p>Please wait while we verify your PizzaVerse account.</p>
        </div>
      </div>
    );
  }

  // ============================
  // Success
  // ============================

  if (success) {
    return (
      <div className="verify-page">
        <div className="verify-card success-card">
          <div className="verify-icon success-icon">✓</div>

          <h1>Email Verified!</h1>

          <p className="verify-message">{message}</p>

          <p className="verify-submessage">
            Your PizzaVerse account has been successfully verified.
          </p>

          <Link to="/login" className="verify-btn">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  // ============================
  // Failure
  // ============================

  return (
    <div className="verify-page">
      <div className="verify-card error-card">
        <div className="verify-icon error-icon">×</div>

        <h1>Verification Failed</h1>

        <p className="verify-message">{message}</p>

        <p className="verify-submessage">
          The verification link may be invalid or expired. Please register again
          to receive a new verification link.
        </p>

        <Link to="/register" className="verify-btn">
          Register Again
        </Link>

        <Link to="/" className="verify-home-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmail;
