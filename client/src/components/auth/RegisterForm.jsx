import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import { register, reset } from "../../features/auth/authSlice";

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success, error, message } = useSelector(
    (state) => state.auth,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const { name, email, password, confirmPassword, acceptedTerms } = formData;

  useEffect(() => {
    if (error) {
      toast.error(message);
    }

    if (success) {
      toast.success("Registration Successful 🎉");

      navigate("/login");
    }

    dispatch(reset());
  }, [error, success, message, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Full Name is required");
      return false;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!acceptedTerms) {
      toast.error("Please accept Terms & Conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(
      register({
        name,
        email,
        password,
        confirmPassword,
      }),
    );
  };

  return (
    <div className="register-card">
      <div className="card-header">
        <h2>Create Account</h2>

        <p>Create your PizzaVerse account 🍕</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        {/* Name */}

        <div className="input-group">
          <label>Full Name</label>

          <div className="input-box">
            <FaUser className="input-icon" />

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={name}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}

        <div className="input-group">
          <label>Email Address</label>

          <div className="input-box">
            <FaEnvelope className="input-icon" />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}

        <div className="input-group">
          <label>Password</label>

          <div className="input-box">
            <FaLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}

        <div className="input-group">
          <label>Confirm Password</label>

          <div className="input-box">
            <FaLock className="input-icon" />

            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={handleChange}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Terms */}

        <div className="terms">
          <label>
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={acceptedTerms}
              onChange={handleChange}
            />

            <span>
              I agree to the <Link to="/terms">Terms & Conditions</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </span>
          </label>
        </div>

        {/* Button */}

        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="bottom-text">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default RegisterForm;
