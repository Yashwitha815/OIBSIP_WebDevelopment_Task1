import { useNavigate, useParams } from "react-router-dom";
import "../styles/OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  return (
    <div className="order-success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <p className="success-label">ORDER CONFIRMED</p>
        <h1>Your pizza is on its way! 🍕</h1>
        <p>
          Your PizzaVerse order has been placed successfully. We&apos;ll keep
          you updated as it moves through the kitchen and delivery.
        </p>

        <div className="success-order-id">
          <span>Order ID</span>
          <strong>#{orderId?.slice(-8).toUpperCase()}</strong>
        </div>

        <button onClick={() => navigate("/menu")}>Continue Ordering</button>
      </div>
    </div>
  );
};

export default OrderSuccess;
