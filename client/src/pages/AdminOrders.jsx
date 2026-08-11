import "../styles/AdminOrders.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000/api";

const STATUS_OPTIONS = [
  "Order Received",
  "In Kitchen",
  "Sent to Delivery",
  "Delivered",
];

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = () => {
    const directToken = localStorage.getItem("token");

    if (directToken) {
      return directToken;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

      return userInfo?.token || null;
    } catch {
      return null;
    }
  };

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      const token = getToken();

      if (!token) {
        toast.error("Please login as admin");
        navigate("/admin/login");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/orders/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (cancelled) {
          return;
        }

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to load orders");
        }

        const fetchedOrders = Array.isArray(response.data.orders)
          ? response.data.orders
          : [];

        setOrders(fetchedOrders);

        const initialStatuses = {};

        fetchedOrders.forEach((order) => {
          initialStatuses[order._id] = order.status || "Order Received";
        });

        setSelectedStatuses(initialStatuses);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load Orders Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");

          toast.error("Session expired. Please login again.");
          navigate("/admin/login");
          return;
        }

        if (error.response?.status === 403) {
          toast.error("Admin access required");
          navigate("/admin/dashboard");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load orders",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshOrders = async () => {
    const token = getToken();

    if (!token) {
      toast.error("Please login as admin");
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE_URL}/orders/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to refresh orders");
      }

      const fetchedOrders = Array.isArray(response.data.orders)
        ? response.data.orders
        : [];

      setOrders(fetchedOrders);

      const refreshedStatuses = {};

      fetchedOrders.forEach((order) => {
        refreshedStatuses[order._id] = order.status || "Order Received";
      });

      setSelectedStatuses(refreshedStatuses);

      toast.success("Orders refreshed");
    } catch (error) {
      console.error("Refresh Orders Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");

        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/admin/dashboard");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to refresh orders",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    toast.success("Admin logged out");

    navigate("/admin/login");
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getOrderId = (id) => {
    if (!id) {
      return "N/A";
    }

    return `#${id.slice(-6).toUpperCase()}`;
  };

  const getCustomerName = (order) => {
    return (
      order.user?.name || order.userName || order.customerName || "Customer"
    );
  };

  const getCustomerEmail = (order) => {
    return (
      order.user?.email ||
      order.email ||
      order.customerEmail ||
      "Email not available"
    );
  };

  const getOrderStatus = (order) => {
    return order.status || "Order Received";
  };

  const getOrderAmount = (order) => {
    return order.totalAmount ?? order.amount ?? order.total ?? 0;
  };

  const getPaymentStatus = (order) => {
    return (
      order.paymentStatus ||
      order.payment?.status ||
      order.payment_status ||
      "Pending"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Received":
        return "📥";

      case "In Kitchen":
        return "👨‍🍳";

      case "Sent to Delivery":
        return "🛵";

      case "Delivered":
        return "✓";

      default:
        return "📦";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Order Received":
        return "order-received";

      case "In Kitchen":
        return "in-kitchen";

      case "Sent to Delivery":
        return "sent-to-delivery";

      case "Delivered":
        return "delivered";

      default:
        return "order-received";
    }
  };

  const getItems = (order) => {
    if (!Array.isArray(order.items)) {
      return [];
    }

    return order.items;
  };

  const getItemsText = (order) => {
    const items = getItems(order);

    if (items.length === 0) {
      return "No items";
    }

    return items
      .map((item) => {
        const name = item.name || item.title || item.pizzaName || "Pizza";

        const quantity = item.quantity || 1;

        return `${name} × ${quantity}`;
      })
      .join(", ");
  };

  // =========================================================
  // STATUS DROPDOWN
  // =========================================================

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatuses((previous) => ({
      ...previous,
      [orderId]: newStatus,
    }));
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================
  // IMPORTANT:
  // Backend uses PUT:
  // /api/orders/admin/:orderId/status
  //
  // NO confirm()
  // NO alert()
  // =========================================================

  const updateOrderStatus = async (orderId) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login as admin");
      navigate("/admin/login");
      return;
    }

    const newStatus = selectedStatuses[orderId] || "Order Received";

    try {
      setUpdatingOrderId(orderId);

      const response = await axios.put(
        `${API_BASE_URL}/orders/admin/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to update order status",
        );
      }

      // Update the row immediately
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order,
        ),
      );

      // Keep dropdown synced
      setSelectedStatuses((previous) => ({
        ...previous,
        [orderId]: newStatus,
      }));

      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Update Status Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");

        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error("Admin access required");
        return;
      }

      if (error.response?.status === 404) {
        toast.error("Order status update route was not found.");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =========================================================
  // FILTER + SEARCH
  // =========================================================

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (activeFilter !== "All Orders") {
      filtered = filtered.filter(
        (order) => getOrderStatus(order) === activeFilter,
      );
    }

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter((order) => {
        const orderId = order._id?.toLowerCase() || "";

        const customerName = getCustomerName(order).toLowerCase();

        const customerEmail = getCustomerEmail(order).toLowerCase();

        const itemNames = getItemsText(order).toLowerCase();

        return (
          orderId.includes(search) ||
          customerName.includes(search) ||
          customerEmail.includes(search) ||
          itemNames.includes(search)
        );
      });
    }

    return filtered;
  }, [orders, activeFilter, searchTerm]);

  // =========================================================
  // COUNTS
  // =========================================================

  const getCount = (status) => {
    if (status === "All Orders") {
      return orders.length;
    }

    return orders.filter((order) => getOrderStatus(order) === status).length;
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="admin-dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">🍕</span>

          <div>
            <h2>PizzaVerse</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className="admin-nav-item"
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span className="admin-nav-icon">📦</span>

            <span>Inventory</span>
          </button>

          <button
            className="admin-nav-item active"
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            <span className="admin-nav-icon">📋</span>

            <span>Orders</span>
          </button>
        </nav>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">
        {/* PAGE HEADER */}

        <header className="orders-page-header">
          <div className="orders-title-wrapper">
            <div className="orders-title-icon">📋</div>

            <div>
              <h1>Order Management</h1>

              <p>View, manage and track all incoming PizzaVerse orders.</p>
            </div>
          </div>

          <button
            className="orders-refresh-button"
            type="button"
            onClick={refreshOrders}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="order-stats-grid">
          <div className="order-stat-card">
            <div className="stat-icon total">📦</div>

            <div>
              <span>Total Orders</span>
              <strong>{getCount("All Orders")}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon received">📥</div>

            <div>
              <span>Order Received</span>
              <strong>{getCount("Order Received")}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon kitchen">👨‍🍳</div>

            <div>
              <span>In Kitchen</span>
              <strong>{getCount("In Kitchen")}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon delivery">🛵</div>

            <div>
              <span>Out for Delivery</span>
              <strong>{getCount("Sent to Delivery")}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon delivered">✅</div>

            <div>
              <span>Delivered</span>
              <strong>{getCount("Delivered")}</strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            CUSTOMER ORDERS
        ===================================================== */}

        <section className="orders-section">
          {/* SECTION HEADER */}

          <div className="orders-section-header">
            <div>
              <h2>Customer Orders</h2>

              <p>All incoming PizzaVerse orders</p>
            </div>

            <div className="admin-profile">
              <span>👤</span>
              <strong>Admin</strong>
            </div>
          </div>

          {/* FILTERS + SEARCH */}

          <div className="orders-toolbar">
            <div className="order-filters">
              {[
                "All Orders",
                "Order Received",
                "In Kitchen",
                "Sent to Delivery",
                "Delivered",
              ].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={
                    activeFilter === filter
                      ? "filter-button active"
                      : "filter-button"
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}

                  <span>{getCount(filter)}</span>
                </button>
              ))}
            </div>

            <div className="order-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search order or customer..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          {/* ===================================================
              LOADING
          =================================================== */}

          {loading ? (
            <div className="orders-loading">
              <div className="loading-icon">🍕</div>

              <h3>Loading Orders...</h3>

              <p>Please wait while we fetch the latest orders.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-icon">📋</div>

              <h2>No Matching Orders</h2>

              <p>Try changing your search or filter.</p>
            </div>
          ) : (
            /* =================================================
               TABLE
            ================================================= */

            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>DATE &amp; TIME</th>
                    <th>ITEMS</th>
                    <th>TOTAL AMOUNT</th>
                    <th>PAYMENT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const orderStatus = getOrderStatus(order);

                    const selectedStatus =
                      selectedStatuses[order._id] || orderStatus;

                    const paymentStatus = getPaymentStatus(order);

                    const paymentClass = paymentStatus
                      .toLowerCase()
                      .replace(/\s+/g, "-");

                    const items = getItems(order);

                    return (
                      <tr key={order._id}>
                        {/* ORDER ID */}

                        <td>
                          <strong className="order-id">
                            {getOrderId(order._id)}
                          </strong>
                        </td>

                        {/* CUSTOMER */}

                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {getCustomerName(order).charAt(0).toUpperCase()}
                            </div>

                            <div className="customer-details">
                              <strong>{getCustomerName(order)}</strong>

                              <span>{getCustomerEmail(order)}</span>
                            </div>
                          </div>
                        </td>

                        {/* DATE */}

                        <td>
                          <div className="date-cell">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        {/* ITEMS */}

                        <td>
                          <div className="items-cell">
                            {items.length > 0 ? (
                              items.map((item, index) => (
                                <div
                                  className="item-row"
                                  key={item._id || item.id || index}
                                >
                                  <span className="pizza-icon">🍕</span>

                                  <span className="item-name">
                                    {item.name ||
                                      item.title ||
                                      item.pizzaName ||
                                      "Pizza"}
                                  </span>

                                  <strong>×{item.quantity || 1}</strong>
                                </div>
                              ))
                            ) : (
                              <span className="no-items">No item details</span>
                            )}
                          </div>
                        </td>

                        {/* TOTAL */}

                        <td>
                          <strong className="amount">
                            ₹{Number(getOrderAmount(order)).toFixed(2)}
                          </strong>
                        </td>

                        {/* PAYMENT */}

                        <td>
                          <span className={`payment-status ${paymentClass}`}>
                            {paymentStatus}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`order-status ${getStatusClass(
                              orderStatus,
                            )}`}
                          >
                            <span>{getStatusIcon(orderStatus)}</span>

                            {orderStatus}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td>
                          <div className="action-cell">
                            <select
                              className="status-select"
                              value={selectedStatus}
                              onChange={(event) =>
                                handleStatusChange(
                                  order._id,
                                  event.target.value,
                                )
                              }
                              disabled={updatingOrderId === order._id}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="update-btn"
                              onClick={() => updateOrderStatus(order._id)}
                              disabled={updatingOrderId === order._id}
                            >
                              {updatingOrderId === order._id
                                ? "Updating..."
                                : "Update"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* FOOTER */}

          {!loading && filteredOrders.length > 0 && (
            <div className="orders-table-footer">
              Showing <strong>{filteredOrders.length}</strong> of{" "}
              <strong>{orders.length}</strong> orders
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminOrders;
