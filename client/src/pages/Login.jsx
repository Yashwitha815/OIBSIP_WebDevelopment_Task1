import "../styles/Login.css";

import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import { login, reset } from "../features/auth/authSlice";
import { loadUserCart } from "../features/cart/cartSlice";
import { loadUserWishlist } from "../features/wishlist/wishlistSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { userInfo, isAuthenticated, loading, success, error, message } =
    useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(message);
      dispatch(reset());
      return;
    }

    if (success || isAuthenticated) {
      dispatch(loadUserCart());
      dispatch(loadUserWishlist());

      toast.success(`Welcome ${userInfo?.user?.name || userInfo?.name} 🍕`);

      navigate("/");
    }

    dispatch(reset());
  }, [success, error, message, isAuthenticated, userInfo, dispatch, navigate]);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    dispatch(
      login({
        email,
        password,
      }),
    );
  };

  return (
    <section className="login-page">
      <div className="login-container">
        {/* LEFT SIDE */}

        <div className="login-left">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000"
            alt="Pizza"
          />

          <div className="overlay"></div>

          <div className="left-content">
            <h1>PizzaVerse</h1>

            <p>Freshly baked happiness delivered to your doorstep.</p>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="login-right">
          <h2>Welcome Back 👋</h2>

          <p className="subtitle">
            Login to continue ordering your favourite pizzas.
          </p>

          {/* EMAIL */}

          <div className="input-group">
            <FaEnvelope className="input-icon" />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}

          <div className="input-group">
            <FaLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {showPassword ? (
              <FaEyeSlash
                className="eye-icon"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <FaEye
                className="eye-icon"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {/* OPTIONS */}

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {/* LOGIN BUTTON */}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          {/* REGISTER */}

          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/register">
              <span>Register</span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
