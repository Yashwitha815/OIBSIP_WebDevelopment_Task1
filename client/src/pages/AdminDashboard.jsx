import "../styles/AdminDashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function AdminDashboard() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET ICON FOR INVENTORY ITEM
  // ======================================================

  const getItemIcon = (itemName) => {
    if (itemName === "Pizza Bases") {
      return "🍕";
    }

    if (itemName === "Sauces") {
      return "🍅";
    }

    if (itemName === "Cheese") {
      return "🧀";
    }

    if (itemName === "Vegetables") {
      return "🥬";
    }

    return "📦";
  };

  // ======================================================
  // LOAD INVENTORY
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const token = localStorage.getItem("token");

    // No token
    if (!token) {
      toast.error("Please login as admin");
      navigate("/admin/login");
      return () => {
        cancelled = true;
      };
    }

    axios
      .get("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (cancelled) return;

        if (response.data.success) {
          setInventory(response.data.inventory);
        }
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Inventory Error:", error);

        // Unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");

          toast.error("Session expired. Please login again.");

          navigate("/admin/login");
          return;
        }

        // Forbidden
        if (error.response?.status === 403) {
          toast.error("Admin access required");
          navigate("/");
          return;
        }

        toast.error(
          error.response?.data?.message || "Failed to load inventory",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ======================================================
  // REFRESH INVENTORY
  // ======================================================

  const refreshInventory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login as admin");
        navigate("/admin/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setInventory(response.data.inventory);
        toast.success("Inventory refreshed");
      }
    } catch (error) {
      console.error("Refresh Inventory Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");

        toast.error("Session expired. Please login again.");

        navigate("/admin/login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/");
        return;
      }

      toast.error(
        error.response?.data?.message || "Failed to refresh inventory",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    toast.success("Admin logged out");

    navigate("/admin/login");
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-dashboard">
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="admin-sidebar">
        {/* BRAND */}

        <div className="admin-brand">
          <span>🍕</span>

          <div>
            <h2>PizzaVerse</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="admin-nav">
          {/* INVENTORY */}

          <button
            className="admin-nav-item active"
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>📦</span>
            <span>Inventory</span>
          </button>

          {/* ORDERS */}

          <button
            className="admin-nav-item"
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            <span>📋</span>
            <span>Orders</span>
          </button>
        </nav>

        {/* LOGOUT */}

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="admin-main">
        {/* TOP BAR */}

        <header className="admin-topbar">
          <div>
            <h1>Inventory Dashboard</h1>

            <p>Monitor your PizzaVerse ingredient stock.</p>
          </div>

          <div className="admin-profile">Admin</div>
        </header>

        {/* ==================================================
            INVENTORY SECTION
        ================================================== */}

        <section className="inventory-section">
          {/* SECTION HEADING */}

          <div className="section-heading">
            <div>
              <h2>Available Stock</h2>

              <p>Current inventory levels</p>
            </div>

            <button
              className="refresh-btn"
              type="button"
              onClick={refreshInventory}
            >
              Refresh
            </button>
          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div className="inventory-loading">Loading inventory...</div>
          ) : inventory.length === 0 ? (
            /* ==================================================
                EMPTY
            ================================================== */

            <div className="inventory-empty">No inventory items found.</div>
          ) : (
            /* ==================================================
                INVENTORY CARDS
            ================================================== */

            <div className="inventory-grid">
              {inventory.map((item) => {
                const isLowStock = item.quantity <= item.lowStockThreshold;

                return (
                  <div className="inventory-card" key={item._id}>
                    {/* CARD TOP */}

                    <div className="inventory-card-top">
                      {/* ITEM ICON */}

                      <div className="inventory-icon">
                        {getItemIcon(item.itemName)}
                      </div>

                      {/* STOCK STATUS */}

                      <span
                        className={
                          isLowStock ? "stock-status low" : "stock-status"
                        }
                      >
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </div>

                    {/* ITEM NAME */}

                    <h3>{item.itemName}</h3>

                    {/* QUANTITY */}

                    <div className="quantity">
                      <strong>{item.quantity}</strong>

                      <span>{item.unit}</span>
                    </div>

                    {/* STOCK BAR */}

                    <div className="stock-bar">
                      <div
                        className={
                          isLowStock ? "stock-progress low" : "stock-progress"
                        }
                        style={{
                          width: `${Math.min(item.quantity, 100)}%`,
                        }}
                      />
                    </div>

                    {/* THRESHOLD */}

                    <p className="threshold">
                      Low-stock threshold:{" "}
                      <strong>{item.lowStockThreshold}</strong>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
