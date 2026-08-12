import "../../styles/CartSummary.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CartSummary = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.singlePizzaPrice || item.price) * item.quantity,
    0,
  );

  const gst = subtotal * 0.05;

  const freeDeliveryLimit = 299;

  const deliveryCharge = subtotal >= freeDeliveryLimit ? 0 : 40;

  const total = subtotal + gst + deliveryCharge;

  const amountLeft = Math.max(freeDeliveryLimit - subtotal, 0);

  const progress = Math.min((subtotal / freeDeliveryLimit) * 100, 100);

  return (
    <div className="cart-summary">
      <h2>Order Summary</h2>

      {/* Free Delivery Box */}

      <div className="delivery-box">
        {subtotal >= freeDeliveryLimit ? (
          <>
            <p className="free-msg">
              🎉 You've unlocked <strong>FREE Delivery!</strong>
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill success"
                style={{ width: "100%" }}
              ></div>
            </div>

            <p className="saved-money">💚 You saved ₹40 on delivery</p>
          </>
        ) : (
          <>
            <p className="delivery-msg">
              🚚 Add <strong>₹{amountLeft}</strong> more to unlock
              <strong> FREE Delivery</strong>
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        )}
      </div>

      <div className="summary-row">
        <span>Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      <div className="summary-row">
        <span>GST (5%)</span>
        <span>₹{gst.toFixed(2)}</span>
      </div>

      <div className="summary-row">
        <span>Delivery</span>

        {deliveryCharge === 0 ? (
          <span className="free-delivery">FREE</span>
        ) : (
          <span>₹40.00</span>
        )}
      </div>

      <hr />

      <div className="summary-row total">
        <span>Total</span>

        <span>₹{total.toFixed(2)}</span>
      </div>

      <button className="checkout-btn" onClick={() => navigate("/checkout")}>
        Proceed to Checkout
      </button>

      <p className="secure-checkout">🔒 100% Secure Checkout</p>
    </div>
  );
};

export default CartSummary;
