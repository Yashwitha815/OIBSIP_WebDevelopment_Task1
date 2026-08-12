import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { clearCart } from "../features/cart/cartSlice";
import "../styles/Checkout.css";

const API_BASE_URL = "http://localhost:5000/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getToken = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
    return userInfo?.token || localStorage.getItem("token") || null;
  } catch {
    return localStorage.getItem("token") || null;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const userInfo = useSelector((state) => state.auth.userInfo);
  const currentUser = userInfo?.user || userInfo;

  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [placingOrder, setPlacingOrder] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (total, item) =>
        total + (item.singlePizzaPrice || item.price) * item.quantity,
      0,
    );

    const gst = subtotal * 0.05;
    const deliveryCharge = subtotal >= 299 ? 0 : 40;

    return {
      subtotal,
      gst,
      deliveryCharge,
      total: subtotal + gst + deliveryCharge,
    };
  }, [cartItems]);

  const buildOrderPayload = (paymentStatus, razorpayData = {}) => ({
    customerName: currentUser?.name || "",
    customerEmail: currentUser?.email || "",
    items: cartItems,
    paymentMethod,
    paymentStatus,
    razorpayOrderId: razorpayData.razorpayOrderId || null,
    razorpayPaymentId: razorpayData.razorpayPaymentId || null,
  });

  const createOrder = async (payload) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login before placing your order");
      navigate("/login");
      return null;
    }

    const response = await axios.post(`${API_BASE_URL}/orders`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  };

  const handleCODOrder = async () => {
    try {
      setPlacingOrder(true);

      const result = await createOrder(buildOrderPayload("Pending"));

      if (!result?.success) {
        throw new Error(result?.message || "Unable to place order");
      }

      dispatch(clearCart());
      toast.success("Order placed successfully! 🍕");
      navigate(`/order-success/${result.order._id}`);
    } catch (error) {
      console.error("COD Order Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setPlacingOrder(true);

      const token = getToken();

      if (!token) {
        toast.error("Please login before placing your order");
        navigate("/login");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout");
      }

      const createPaymentResponse = await axios.post(
        `${API_BASE_URL}/orders/razorpay/create`,
        { items: cartItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { razorpayOrder, keyId } = createPaymentResponse.data;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "PizzaVerse",
        description: "PizzaVerse Order",
        order_id: razorpayOrder.id,
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
        },
        theme: {
          color: "#ff6b35",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/orders/razorpay/verify`,
              {
                ...buildOrderPayload("Paid", {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                }),
                razorpaySignature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            if (!verifyResponse.data?.success) {
              throw new Error(
                verifyResponse.data?.message || "Payment verification failed",
              );
            }

            dispatch(clearCart());
            toast.success("Payment successful & order placed! 🎉");
            navigate(`/order-success/${verifyResponse.data.order._id}`);
          } catch (error) {
            console.error("Payment Verification Error:", error);
            toast.error(
              error.response?.data?.message ||
                error.message ||
                "Payment verification failed",
            );
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay Payment Failed:", response.error);
        toast.error(response.error?.description || "Payment failed");
        setPlacingOrder(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Razorpay Checkout Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start online payment",
      );
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/menu");
      return;
    }

    if (paymentMethod === "COD") {
      handleCODOrder();
      return;
    }

    handleRazorpayPayment();
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page checkout-empty">
        <h1>Your cart is empty</h1>
        <button onClick={() => navigate("/menu")}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate("/cart")}>
          ← Back to Cart
        </button>
        <h1>Checkout</h1>
        <p>Choose how you would like to pay for your PizzaVerse order.</p>
      </div>

      <div className="checkout-layout">
        <section className="payment-card">
          <h2>💳 Payment Method</h2>
          <p className="payment-subtitle">Select one payment option</p>

          <button
            type="button"
            className={`payment-option ${
              paymentMethod === "Razorpay" ? "selected" : ""
            }`}
            onClick={() => setPaymentMethod("Razorpay")}
          >
            <span className="payment-icon">💳</span>
            <span className="payment-content">
              <strong>Online Payment</strong>
              <small>
                Pay securely using Razorpay — UPI, cards, net banking & more.
              </small>
            </span>
            <span className="radio-dot" />
          </button>

          <button
            type="button"
            className={`payment-option ${
              paymentMethod === "COD" ? "selected" : ""
            }`}
            onClick={() => setPaymentMethod("COD")}
          >
            <span className="payment-icon">💵</span>
            <span className="payment-content">
              <strong>Cash on Delivery</strong>
              <small>Pay when your pizza is delivered to you.</small>
            </span>
            <span className="radio-dot" />
          </button>

          <div className="payment-note">
            {paymentMethod === "Razorpay"
              ? "🔒 You will be redirected to Razorpay's secure checkout to complete the payment."
              : "🚚 Your order will be placed immediately and payment will remain pending until delivery."}
          </div>
        </section>

        <aside className="checkout-summary-card">
          <h2>Order Summary</h2>

          <div className="checkout-items">
            {cartItems.map((item) => (
              <div className="checkout-item" key={item.cartId || item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.quantity} × ₹
                    {(item.singlePizzaPrice || item.price).toFixed(2)}
                  </span>
                </div>
                <strong>
                  ₹
                  {(
                    (item.singlePizzaPrice || item.price) * item.quantity
                  ).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <div className="summary-line">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>GST (5%)</span>
            <span>₹{totals.gst.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Delivery</span>
            <span className={totals.deliveryCharge === 0 ? "free" : ""}>
              {totals.deliveryCharge === 0
                ? "FREE"
                : `₹${totals.deliveryCharge.toFixed(2)}`}
            </span>
          </div>

          <hr />

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{totals.total.toFixed(2)}</strong>
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder
              ? "Processing..."
              : paymentMethod === "Razorpay"
                ? `Pay ₹${totals.total.toFixed(2)}`
                : "Place Order"}
          </button>

          <p className="checkout-secure">🔒 Secure Checkout</p>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
