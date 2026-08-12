import "../../styles/Navbar.css";

import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { useState, useEffect, useRef } from "react";

import toast from "react-hot-toast";

import { FaPizzaSlice, FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";

import { logout } from "../../features/auth/authSlice";

import { clearCart } from "../../features/cart/cartSlice";

import { clearWishlist } from "../../features/wishlist/wishlistSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);

  // ==========================
  // Redux State
  // ==========================

  const cartItems = useSelector((state) => state.cart.cartItems);

  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);

  const user = userInfo?.user;

  // ==========================
  // Badge Counts
  // ==========================

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalWishlistItems = wishlistItems.length;

  // ==========================
  // Close Dropdown
  // ==========================

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ==========================
  // Logout
  // ==========================

  const handleLogout = () => {
    dispatch(logout());

    dispatch(clearCart());

    dispatch(clearWishlist());

    setShowDropdown(false);

    toast.success("Logged Out Successfully 👋");

    navigate("/login");
  };

  return (
    <header className="navbar">
      {/* ==========================
          Logo
      ========================== */}

      <Link to="/" className="logo">
        <FaPizzaSlice className="logo-icon" />
        <span>PizzaVerse</span>
      </Link>

      {/* ==========================
          Navigation
      ========================== */}

      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Menu
        </NavLink>
      </nav>

      {/* ==========================
          Right Side
      ========================== */}

      <div className="nav-actions">
        {/* Wishlist */}

        <NavLink to="/wishlist" className="icon-btn wishlist-btn">
          <div className="wishlist-icon-wrapper">
            <FaHeart />

            {totalWishlistItems > 0 && (
              <span className="wishlist-badge">{totalWishlistItems}</span>
            )}
          </div>
        </NavLink>

        {/* Cart */}

        <NavLink to="/cart" className="cart-btn">
          <div className="cart-icon-wrapper">
            <FaShoppingCart />

            {totalCartItems > 0 && (
              <span className="cart-badge">{totalCartItems}</span>
            )}
          </div>

          <span>Cart</span>
        </NavLink>

        {/* User */}

        {isAuthenticated ? (
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FaUser />

              <span>{user?.name}</span>

              <span className="dropdown-arrow">▼</span>
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <NavLink to="/profile" onClick={() => setShowDropdown(false)}>
                  👤 My Profile
                </NavLink>

                <NavLink to="/orders" onClick={() => setShowDropdown(false)}>
                  📦 My Orders
                </NavLink>

                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" className="login-btn">
            <FaUser />

            <span>Login</span>
          </NavLink>
        )}
      </div>
    </header>
  );
}

export default Navbar;
