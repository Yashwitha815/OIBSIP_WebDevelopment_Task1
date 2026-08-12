import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import "../styles/Orders.css";

const API_BASE_URL = "http://localhost:5000/api";

const STATUS_STEPS = [
  "Order Received",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

// ======================================================
// NORMALIZE BACKEND STATUS → CUSTOMER STATUS
// ======================================================

const normalizeStatus = (status) => {
  if (!status) return "Order Received";

  if (status === "In Kitchen") {
    return "Preparing";
  }

  if (status === "Sent to Delivery") {
    return "Out for Delivery";
  }

  return status;
};

// ======================================================
// DECODE JWT SAFELY
// ======================================================

const decodeToken = (token) => {
  try {
    if (!token) return null;

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    return JSON.parse(atob(padded));
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

// ======================================================
// GET CUSTOMER TOKEN
// ======================================================
//
// IMPORTANT:
// Admin and customer both use localStorage "token".
// Therefore we must NOT blindly use localStorage.token.
//
// We check available tokens and prefer one whose JWT role
// is "user".
// ======================================================

const getCustomerToken = () => {
  const candidates = [];

  const directToken = localStorage.getItem("token");

  if (directToken) {
    candidates.push(directToken);
  }

  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

    if (userInfo?.token) {
      candidates.push(userInfo.token);
    }
  } catch (error) {
    console.error("Unable to read userInfo:", error);
  }

  // Remove duplicates
  const uniqueTokens = [...new Set(candidates)];

  // First preference: JWT with role "user"
  const customerToken = uniqueTokens.find((token) => {
    const payload = decodeToken(token);
    return payload?.role === "user";
  });

  if (customerToken) {
    return customerToken;
  }

  // If there is only one token and it isn't an admin token,
  // allow it as a fallback.
  if (uniqueTokens.length === 1) {
    const payload = decodeToken(uniqueTokens[0]);

    if (payload?.role !== "admin") {
      return uniqueTokens[0];
    }
  }

  return null;
};

// ======================================================
// DATE
// ======================================================

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Date unavailable";
  }
};

// ======================================================
// TIME
// ======================================================

const formatTime = (date) => {
  if (!date) return "";

  try {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// ======================================================
// SHORT ORDER ID
// ======================================================

const getShortOrderId = (id) => {
  if (!id) return "N/A";

  return `#${id.slice(-8).toUpperCase()}`;
};

// ======================================================
// COMPONENT
// ======================================================

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // LOAD CUSTOMER ORDERS
  // ======================================================

  const fetchOrders = useCallback(
    async (showToast = false) => {
      const token = getCustomerToken();

      if (!token) {
        setLoading(false);

        toast.error("Please login as a customer to view your orders");

        navigate("/login");

        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.success) {
          setOrders(response.data.orders || []);

          if (showToast) {
            toast.success("Orders refreshed");
          }
        } else {
          setOrders([]);

          if (showToast) {
            toast.error(response.data?.message || "Failed to load your orders");
          }
        }
      } catch (error) {
        console.error("Load My Orders Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");

          toast.error("Session expired. Please login again.");

          navigate("/login");

          return;
        }

        if (error.response?.status === 403) {
          toast.error("Please login as a customer to view your orders");

          return;
        }

        if (showToast) {
          toast.error(
            error.response?.data?.message || "Failed to load your orders",
          );
        }

        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  // ======================================================
  // INITIAL LOAD + AUTO REFRESH
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      await fetchOrders(false);
    };

    load();

    // Automatically check for admin status changes
    // every 10 seconds.
    const interval = setInterval(() => {
      if (!cancelled) {
        fetchOrders(false);
      }
    }, 10000);

    // Refresh when user comes back to the tab.
    const handleFocus = () => {
      fetchOrders(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchOrders]);

  // ======================================================
  // MANUAL REFRESH
  // ======================================================

  const refreshOrders = async () => {
    setLoading(true);

    await fetchOrders(true);
  };

  // ======================================================
  // GET CURRENT TRACKING STEP
  // ======================================================

  const getCurrentStep = (status) => {
    const normalizedStatus = normalizeStatus(status);

    return STATUS_STEPS.indexOf(normalizedStatus);
  };

  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "Cancelled") {
      return "cancelled";
    }

    if (normalizedStatus === "Delivered") {
      return "delivered";
    }

    return "active";
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="orders-header">
          <div>
            <p className="orders-eyebrow">PIZZAVERSE</p>

            <h1>My Orders 🍕</h1>

            <p className="orders-subtitle">
              Track your pizza orders and see their current status.
            </p>
          </div>

          <button
            className="orders-refresh-btn"
            onClick={refreshOrders}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* ==================================================
            EMPTY
        ================================================== */}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">🍕</div>

            <h2>No orders yet</h2>

            <p>
              You haven&apos;t placed any orders yet.
              <br />
              Your delicious pizzas will appear here.
            </p>

            <button
              onClick={() => navigate("/menu")}
              className="orders-browse-btn"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* ==================================================
             ORDERS
          ================================================== */

          <div className="orders-list">
            {orders.map((order) => {
              const status = normalizeStatus(order.status);

              const currentStep = getCurrentStep(order.status);

              const isCancelled = status === "Cancelled";

              return (
                <div className="customer-order-card" key={order._id}>
                  {/* ==================================================
                      ORDER HEADER
                  ================================================== */}

                  <div className="customer-order-top">
                    <div>
                      <p className="customer-order-label">ORDER ID</p>

                      <h2>{getShortOrderId(order._id)}</h2>

                      <p className="customer-order-date">
                        {formatDate(order.createdAt)}

                        {order.createdAt && " • "}

                        {formatTime(order.createdAt)}
                      </p>
                    </div>

                    <div
                      className={`customer-order-status ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      <span className="status-dot"></span>

                      {status}
                    </div>
                  </div>

                  {/* ==================================================
                      TRACKING
                  ================================================== */}

                  <div className="tracking-section">
                    <div className="tracking-title">
                      <span>Order Tracking</span>

                      {!isCancelled && (
                        <span>
                          {status === "Delivered"
                            ? "Delivered 🎉"
                            : "On the way 🍕"}
                        </span>
                      )}
                    </div>

                    {isCancelled ? (
                      /* CANCELLED */

                      <div className="cancelled-message">
                        <span>✕</span>

                        <div>
                          <strong>Order Cancelled</strong>

                          <p>This order has been cancelled.</p>
                        </div>
                      </div>
                    ) : (
                      /* NORMAL TRACKING */

                      <div className="tracking-wrapper">
                        <div className="tracking-line">
                          <div
                            className="tracking-progress"
                            style={{
                              width:
                                currentStep <= 0
                                  ? "0%"
                                  : `${
                                      (currentStep /
                                        (STATUS_STEPS.length - 1)) *
                                      100
                                    }%`,
                            }}
                          />
                        </div>

                        <div className="tracking-steps">
                          {STATUS_STEPS.map((step, index) => {
                            const completed = index <= currentStep;

                            const current = index === currentStep;

                            return (
                              <div
                                className={`tracking-step ${
                                  completed ? "completed" : ""
                                } ${current ? "current" : ""}`}
                                key={step}
                              >
                                <div className="tracking-circle">
                                  {completed ? "✓" : index + 1}
                                </div>

                                <span>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ==================================================
                      ITEMS
                  ================================================== */}

                  <div className="customer-order-items">
                    <div className="section-title">Order Items</div>

                    {Array.isArray(order.items) &&
                      order.items.map((item, index) => (
                        <div
                          className="customer-order-item"
                          key={`${item.pizzaId || item.name}-${index}`}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />

                          <div className="item-details">
                            <h3>{item.name}</h3>

                            <p>
                              {item.size && item.size}

                              {item.crust && ` • ${item.crust}`}
                            </p>

                            {item.toppings?.length > 0 && (
                              <p className="item-toppings">
                                + {item.toppings.join(", ")}
                              </p>
                            )}
                          </div>

                          <div className="item-quantity">× {item.quantity}</div>

                          <div className="item-price">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toFixed(2)}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* ==================================================
                      PAYMENT
                  ================================================== */}

                  <div className="customer-order-bottom">
                    <div className="payment-info">
                      <div>
                        <span>Payment Method</span>

                        <strong>
                          {order.paymentMethod || "Cash on Delivery"}
                        </strong>
                      </div>

                      <div>
                        <span>Payment Status</span>

                        <strong
                          className={
                            order.paymentStatus === "Paid" ? "paid" : "pending"
                          }
                        >
                          {order.paymentStatus || "Pending"}
                        </strong>
                      </div>
                    </div>

                    <div className="order-total">
                      <span>Total Amount</span>

                      <strong>
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
