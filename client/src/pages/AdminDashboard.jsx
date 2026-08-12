import "../styles/AdminDashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function AdminDashboard() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "",
    unit: "",
    lowStockThreshold: "",
  });

  // ======================================================
  // GET ICON
  // ======================================================

  const getItemIcon = (itemName) => {
    const name = itemName.toLowerCase();

    if (
      name.includes("chicken") ||
      name.includes("pepperoni") ||
      name.includes("sausage") ||
      name.includes("bacon") ||
      name.includes("salami")
    ) {
      return "🍗";
    }

    if (name.includes("cheese") || name.includes("mozzarella")) {
      return "🧀";
    }

    if (name.includes("sauce") || name.includes("tomato")) {
      return "🍅";
    }

    if (
      name.includes("vegetable") ||
      name.includes("capsicum") ||
      name.includes("onion") ||
      name.includes("jalapeno") ||
      name.includes("mushroom") ||
      name.includes("corn") ||
      name.includes("olive")
    ) {
      return "🥬";
    }

    if (name.includes("base") || name.includes("pizza")) {
      return "🍕";
    }

    if (
      name.includes("oregano") ||
      name.includes("chilli") ||
      name.includes("seasoning")
    ) {
      return "🌿";
    }

    if (name.includes("box") || name.includes("packaging")) {
      return "📦";
    }

    return "📦";
  };

  // ======================================================
  // LOAD INVENTORY
  // ======================================================

  const loadInventory = async () => {
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
      }
    } catch (error) {
      console.error("Inventory Error:", error);

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

      toast.error(error.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please login as admin");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/inventory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!cancelled && response.data.success) {
          setInventory(response.data.inventory);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Inventory Error:", error);

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
          error.response?.data?.message || "Failed to load inventory",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ======================================================
  // REFRESH
  // ======================================================

  const refreshInventory = async () => {
    await loadInventory();
    toast.success("Inventory refreshed");
  };

  // ======================================================
  // ADD MODAL
  // ======================================================

  const openAddModal = () => {
    setEditingItem(null);

    setFormData({
      itemName: "",
      quantity: "",
      unit: "",
      lowStockThreshold: "",
    });

    setShowModal(true);
  };

  // ======================================================
  // EDIT MODAL
  // ======================================================

  const openEditModal = (item) => {
    setEditingItem(item);

    setFormData({
      itemName: item.itemName || "",
      quantity: item.quantity ?? "",
      unit: item.unit || "",
      lowStockThreshold: item.lowStockThreshold ?? "",
    });

    setShowModal(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingItem(null);

    setFormData({
      itemName: "",
      quantity: "",
      unit: "",
      lowStockThreshold: "",
    });
  };

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // ADD / UPDATE INVENTORY
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.itemName.trim() ||
      formData.quantity === "" ||
      !formData.unit.trim() ||
      formData.lowStockThreshold === ""
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (Number(formData.quantity) < 0) {
      toast.error("Quantity cannot be negative");
      return;
    }

    if (Number(formData.lowStockThreshold) < 0) {
      toast.error("Low-stock threshold cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login as admin");
        navigate("/admin/login");
        return;
      }

      const payload = {
        itemName: formData.itemName.trim(),
        quantity: Number(formData.quantity),
        unit: formData.unit.trim(),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };

      let response;

      if (editingItem) {
        response = await axios.put(
          `http://localhost:5000/api/inventory/${editingItem._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/inventory",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      if (response.data.success) {
        toast.success(
          editingItem
            ? "Inventory updated successfully"
            : "Inventory item added successfully",
        );

        closeModal();
        await loadInventory();
      }
    } catch (error) {
      console.error(
        editingItem ? "Update Inventory Error:" : "Add Inventory Error:",
        error,
      );

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
        error.response?.data?.message ||
          (editingItem
            ? "Failed to update inventory"
            : "Failed to add inventory"),
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DELETE
  // ONLY ONE CONFIRMATION
  // ======================================================

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.itemName}"?`,
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login as admin");
        navigate("/admin/login");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/inventory/${item._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setInventory((previous) =>
          previous.filter((inventoryItem) => inventoryItem._id !== item._id),
        );

        toast.success("Inventory item deleted");
      }
    } catch (error) {
      console.error("Delete Inventory Error:", error);

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
        error.response?.data?.message || "Failed to delete inventory item",
      );
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
  // COUNTS
  // ======================================================

  const totalItems = inventory.length;

  const outOfStockItems = inventory.filter(
    (item) => Number(item.quantity) <= 0,
  ).length;

  const lowStockItems = inventory.filter(
    (item) =>
      Number(item.quantity) > 0 &&
      Number(item.quantity) <= Number(item.lowStockThreshold),
  ).length;

  const inStockItems = totalItems - lowStockItems - outOfStockItems;

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredInventory = inventory.filter((item) =>
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-dashboard">
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">🍕</div>

          <div>
            <h2>PizzaVerse</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className="admin-nav-item active"
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>📦</span>
            <span>Inventory</span>
          </button>

          <button
            className="admin-nav-item"
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            <span>📋</span>
            <span>Orders</span>
          </button>

          <button
            className="admin-nav-item"
            type="button"
            onClick={() => navigate("/admin/recipes")}
          >
            <span>🍕</span>
            <span>Pizza Recipes</span>
          </button>
        </nav>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="admin-main">
        {/* TOP BAR */}

        <header className="admin-topbar">
          <div className="admin-title">
            <div className="admin-title-icon">📦</div>

            <div>
              <h1>Inventory Dashboard</h1>

              <p>Monitor and manage your PizzaVerse stock.</p>
            </div>
          </div>

          <div className="admin-profile">
            <span>●</span>
            Admin
          </div>
        </header>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="inventory-stats">
          <div className="inventory-stat-card">
            <div className="stat-icon total">📦</div>

            <div>
              <span>Total Inventory</span>
              <strong>{totalItems}</strong>
            </div>
          </div>

          <div className="inventory-stat-card">
            <div className="stat-icon good">✓</div>

            <div>
              <span>In Stock</span>
              <strong>{inStockItems}</strong>
            </div>
          </div>

          <div className="inventory-stat-card">
            <div className="stat-icon low">⚠</div>

            <div>
              <span>Low Stock</span>
              <strong>{lowStockItems}</strong>
            </div>
          </div>

          <div className="inventory-stat-card">
            <div className="stat-icon out">!</div>

            <div>
              <span>Out of Stock</span>
              <strong>{outOfStockItems}</strong>
            </div>
          </div>
        </section>

        {/* ==================================================
            INVENTORY SECTION
        ================================================== */}

        <section className="inventory-section">
          <div className="inventory-section-header">
            <div>
              <h2>Available Stock</h2>

              <p>Manage your ingredients and stock levels.</p>
            </div>

            <div className="inventory-actions">
              <button
                className="refresh-btn"
                type="button"
                onClick={refreshInventory}
                disabled={loading}
              >
                🔄 Refresh
              </button>

              <button
                className="add-inventory-btn"
                type="button"
                onClick={openAddModal}
              >
                + Add Inventory
              </button>
            </div>
          </div>

          {/* ==================================================
              SEARCH BAR
          ================================================== */}

          {!loading && inventory.length > 0 && (
            <div className="inventory-search-wrapper">
              <div className="inventory-search">
                <span className="search-icon">🔍</span>

                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <span className="search-count">
                {filteredInventory.length}{" "}
                {filteredInventory.length === 1 ? "item" : "items"}
              </span>
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div className="inventory-loading">
              <div className="loading-icon">📦</div>

              <h3>Loading inventory...</h3>
            </div>
          ) : inventory.length === 0 ? (
            <div className="inventory-empty">
              <div className="empty-icon">📦</div>

              <h2>No inventory items found</h2>

              <p>Add your first inventory item to get started.</p>

              <button
                className="empty-add-btn"
                type="button"
                onClick={openAddModal}
              >
                + Add Inventory
              </button>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="inventory-no-results">
              <div className="no-results-icon">🔍</div>

              <h3>No inventory found</h3>

              <p>No item matches "{searchTerm}".</p>

              <button type="button" onClick={() => setSearchTerm("")}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="inventory-grid">
              {filteredInventory.map((item) => {
                const quantity = Number(item.quantity);

                const threshold = Number(item.lowStockThreshold);

                const isOutOfStock = quantity <= 0;

                const isLowStock = !isOutOfStock && quantity <= threshold;

                const progress = Math.min(Math.max(quantity, 0), 100);

                return (
                  <div className="inventory-card" key={item._id}>
                    {/* CARD TOP */}

                    <div className="inventory-card-top">
                      <div className="inventory-icon">
                        {getItemIcon(item.itemName)}
                      </div>

                      <span
                        className={
                          isOutOfStock
                            ? "stock-status out"
                            : isLowStock
                              ? "stock-status low"
                              : "stock-status"
                        }
                      >
                        <span className="status-dot">●</span>

                        {isOutOfStock
                          ? "Out of Stock"
                          : isLowStock
                            ? "Low Stock"
                            : "In Stock"}
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
                          isOutOfStock
                            ? "stock-progress out"
                            : isLowStock
                              ? "stock-progress low"
                              : "stock-progress"
                        }
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    {/* THRESHOLD */}

                    <div className="threshold-row">
                      <span>Low-stock threshold</span>

                      <strong>{item.lowStockThreshold}</strong>
                    </div>

                    {/* ACTIONS */}

                    <div className="inventory-card-actions">
                      <button
                        className="edit-inventory-btn"
                        type="button"
                        onClick={() => openEditModal(item)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-inventory-btn"
                        type="button"
                        onClick={() => handleDelete(item)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div
          className="inventory-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <div className="modal-header-left">
                <div className="modal-title-icon">
                  {editingItem ? "✏️" : "📦"}
                </div>

                <div>
                  <h2>{editingItem ? "Edit Inventory" : "Add Inventory"}</h2>

                  <p>
                    {editingItem
                      ? "Update your stock details."
                      : "Add a new ingredient to your inventory."}
                  </p>
                </div>
              </div>

              <button
                className="inventory-modal-close"
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form className="inventory-form" onSubmit={handleSubmit}>
              <div className="inventory-form-group">
                <label htmlFor="itemName">Item Name</label>

                <input
                  id="itemName"
                  name="itemName"
                  type="text"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g. Pepperoni"
                  disabled={saving}
                />
              </div>

              <div className="inventory-form-row">
                <div className="inventory-form-group">
                  <label htmlFor="quantity">Quantity</label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="100"
                    disabled={saving}
                  />
                </div>

                <div className="inventory-form-group">
                  <label htmlFor="unit">Unit</label>

                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="kg / liters / pieces"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="inventory-form-group">
                <label htmlFor="lowStockThreshold">Low Stock Threshold</label>

                <input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="10"
                  disabled={saving}
                />
              </div>

              <div className="inventory-form-actions">
                <button
                  type="button"
                  className="inventory-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                      ? "Save Changes"
                      : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
