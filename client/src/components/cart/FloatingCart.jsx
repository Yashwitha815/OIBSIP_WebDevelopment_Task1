import "../../styles/FloatingCart.css";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { clearCart } from "../../features/cart/cartSlice";

import toast from "react-hot-toast";

function FloatingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cartItems);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const freeDeliveryLimit = 299;

  const amountLeft = Math.max(freeDeliveryLimit - subtotal, 0);

  const progress = Math.min((subtotal / freeDeliveryLimit) * 100, 100);

  const handleClearCart = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear your cart?",
    );

    if (!confirmClear) return;

    dispatch(clearCart());

    toast.success("Cart Cleared 🗑️", {
      duration: 1500,
    });
  };

  if (location.pathname === "/cart" || totalItems === 0) {
    return null;
  }

  return (
    <div className="floating-cart">
      {/* Left */}

      <div className="cart-left">
        <div className="cart-brand">
          <span className="cart-icon">🛒</span>

          <span className="cart-title">My Cart</span>
        </div>

        <div className="divider"></div>

        <div className="items-card">
          <h2>{totalItems}</h2>

          <span>{totalItems === 1 ? "Item" : "Items"}</span>
        </div>

        <div className="divider"></div>

        <div className="total-card">
          <small>Total</small>

          <h2>₹{subtotal}</h2>
        </div>
      </div>

      {/* Center */}

      <div className="delivery-section">
        {subtotal >= freeDeliveryLimit ? (
          <>
            <p className="delivery-success">🚚 FREE Delivery Unlocked 🎉</p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: "100%",
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="delivery-text">
              🚚 You're <span className="highlight-price">₹{amountLeft}</span>{" "}
              away from <span className="highlight-green">FREE Delivery!</span>
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Right */}

      <div className="cart-actions">
        <button className="clear-btn" onClick={handleClearCart}>
          🗑 Clear
        </button>

        <button className="view-btn" onClick={() => navigate("/cart")}>
          🛒 View Cart • ₹{subtotal}
        </button>
      </div>
    </div>
  );
}

export default FloatingCart;
