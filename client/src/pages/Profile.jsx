import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHome,
  FaCity,
  FaMapPin,
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaHeart,
  FaLock,
} from "react-icons/fa";

import { setUserInfo } from "../features/auth/authSlice";

import "../styles/Profile.css";

const API_URL = "http://localhost:5000/api/profile";

const getToken = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

    return userInfo?.token || null;
  } catch {
    return null;
  }
};

const emptyAddress = {
  fullName: "",
  phone: "",
  houseNo: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [address, setAddress] = useState(emptyAddress);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = getToken();

      if (!token) {
        if (!cancelled) {
          toast.error("Please login to view your profile");
          navigate("/login");
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
        }

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

        if (response.data?.success) {
          const currentUser = response.data.user;

          setUser(currentUser);

          setFormData({
            name: currentUser.name || "",
            phone: currentUser.phone || "",
          });

          const defaultAddress =
            currentUser.addresses?.find((item) => item.isDefault) ||
            currentUser.addresses?.[0];

          if (defaultAddress) {
            setAddress({
              fullName: defaultAddress.fullName || "",
              phone: defaultAddress.phone || "",
              houseNo: defaultAddress.houseNo || "",
              street: defaultAddress.street || "",
              city: defaultAddress.city || "",
              state: defaultAddress.state || "",
              pincode: defaultAddress.pincode || "",
              landmark: defaultAddress.landmark || "",
            });
          } else {
            setAddress({
              ...emptyAddress,
              fullName: currentUser.name || "",
              phone: currentUser.phone || "",
            });
          }
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Profile Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("token");

          toast.error("Session expired. Please login again.");

          navigate("/login");
          return;
        }

        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ======================================================
  // PERSONAL INFORMATION CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // ADDRESS CHANGE
  // ======================================================

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // START EDITING
  // ======================================================

  const handleEdit = () => {
    setEditing(true);
  };

  // ======================================================
  // CANCEL EDITING
  // ======================================================

  const handleCancel = () => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
    });

    const defaultAddress =
      user.addresses?.find((item) => item.isDefault) || user.addresses?.[0];

    if (defaultAddress) {
      setAddress({
        fullName: defaultAddress.fullName || "",
        phone: defaultAddress.phone || "",
        houseNo: defaultAddress.houseNo || "",
        street: defaultAddress.street || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "",
        pincode: defaultAddress.pincode || "",
        landmark: defaultAddress.landmark || "",
      });
    } else {
      setAddress({
        ...emptyAddress,
        fullName: user.name || "",
        phone: user.phone || "",
      });
    }

    setEditing(false);
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        API_URL,
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),

          address: {
            ...address,

            fullName: address.fullName.trim() || formData.name.trim(),

            phone: address.phone.trim() || formData.phone.trim(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success) {
        const updatedUser = response.data.user;

        setUser(updatedUser);

        setFormData({
          name: updatedUser.name || "",
          phone: updatedUser.phone || "",
        });

        const updatedAddress =
          updatedUser.addresses?.find((item) => item.isDefault) ||
          updatedUser.addresses?.[0];

        if (updatedAddress) {
          setAddress({
            fullName: updatedAddress.fullName || "",
            phone: updatedAddress.phone || "",
            houseNo: updatedAddress.houseNo || "",
            street: updatedAddress.street || "",
            city: updatedAddress.city || "",
            state: updatedAddress.state || "",
            pincode: updatedAddress.pincode || "",
            landmark: updatedAddress.landmark || "",
          });
        }

        // ================================================
        // UPDATE LOCAL STORAGE
        // ================================================

        const storedUserInfo = JSON.parse(
          localStorage.getItem("userInfo") || "null",
        );

        if (storedUserInfo) {
          const updatedUserInfo = {
            ...storedUserInfo,

            user: {
              ...(storedUserInfo.user || {}),
              ...updatedUser,
            },
          };

          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

          dispatch(setUserInfo(updatedUserInfo));
        }

        setEditing(false);

        toast.success("Profile updated successfully 🍕");
      }
    } catch (error) {
      console.error("Update Profile Error:", error);

      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>

          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  // ======================================================
  // NO USER
  // ======================================================

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-loading">
          <p>Unable to load your profile.</p>
        </div>
      </section>
    );
  }

  // ======================================================
  // AVATAR INITIALS
  // ======================================================

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <section className="profile-page">
      <div className="profile-container">
        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="profile-heading">
          <div>
            <span className="profile-eyebrow">PIZZAVERSE</span>

            <h1>My Profile 👤</h1>

            <p>Manage your personal information and delivery details.</p>
          </div>

          {!editing ? (
            <button
              type="button"
              className="profile-edit-btn"
              onClick={handleEdit}
            >
              <FaEdit />
              Edit Profile
            </button>
          ) : (
            <div className="profile-action-buttons">
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <FaTimes />
                Cancel
              </button>

              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <FaSave />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* ==================================================
            MAIN PROFILE CARD
        ================================================== */}

        <div className="profile-card">
          {/* ==================================================
              PROFILE HEADER
          ================================================== */}

          <div className="profile-top">
            <div className="profile-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name || "Profile"} />
              ) : (
                initials
              )}
            </div>

            <div className="profile-user-info">
              <h2>{user.name || "Customer"}</h2>

              <p>
                <FaEnvelope />
                {user.email}
              </p>

              <span className="customer-badge">
                {user.role === "admin" ? "Administrator" : "Customer"}
              </span>
            </div>
          </div>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="profile-section">
            <div className="section-title">
              <div className="section-icon">
                <FaUser />
              </div>

              <div>
                <h3>Personal Information</h3>

                <p>Your basic account information</p>
              </div>
            </div>

            <div className="profile-grid">
              {/* FULL NAME */}

              <div className="profile-field">
                <label>Full Name</label>

                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="field-value">
                    <FaUser />

                    {user.name || "Not added"}
                  </div>
                )}
              </div>

              {/* EMAIL */}

              <div className="profile-field">
                <label>Email Address</label>

                <div className="field-value disabled-field">
                  <FaEnvelope />

                  {user.email}
                </div>

                <small>Email cannot be changed here.</small>
              </div>

              {/* PHONE */}

              <div className="profile-field">
                <label>Phone Number</label>

                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="field-value">
                    <FaPhone />

                    {user.phone || "Not added"}
                  </div>
                )}
              </div>

              {/* EMAIL VERIFICATION */}

              <div className="profile-field">
                <label>Email Verification</label>

                <div
                  className={
                    user.isVerified ? "verification verified" : "verification"
                  }
                >
                  {user.isVerified ? "✓ Verified" : "Not Verified"}
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              DELIVERY ADDRESS
          ================================================== */}

          <div className="profile-section">
            <div className="section-title">
              <div className="section-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h3>Delivery Address</h3>

                <p>Your default delivery location</p>
              </div>
            </div>

            <div className="profile-grid">
              {/* HOUSE */}

              <div className="profile-field">
                <label>House / Flat No.</label>

                {editing ? (
                  <input
                    type="text"
                    name="houseNo"
                    value={address.houseNo}
                    onChange={handleAddressChange}
                    placeholder="House / Flat No."
                  />
                ) : (
                  <div className="field-value">
                    <FaHome />

                    {address.houseNo || "Not added"}
                  </div>
                )}
              </div>

              {/* STREET */}

              <div className="profile-field">
                <label>Street / Area</label>

                {editing ? (
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="Street / Area"
                  />
                ) : (
                  <div className="field-value">
                    <FaMapMarkerAlt />

                    {address.street || "Not added"}
                  </div>
                )}
              </div>

              {/* CITY */}

              <div className="profile-field">
                <label>City</label>

                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                  />
                ) : (
                  <div className="field-value">
                    <FaCity />

                    {address.city || "Not added"}
                  </div>
                )}
              </div>

              {/* STATE */}

              <div className="profile-field">
                <label>State</label>

                {editing ? (
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                  />
                ) : (
                  <div className="field-value">
                    <FaMapMarkerAlt />

                    {address.state || "Not added"}
                  </div>
                )}
              </div>

              {/* PINCODE */}

              <div className="profile-field">
                <label>PIN Code</label>

                {editing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    placeholder="PIN Code"
                  />
                ) : (
                  <div className="field-value">
                    <FaMapPin />

                    {address.pincode || "Not added"}
                  </div>
                )}
              </div>

              {/* LANDMARK */}

              <div className="profile-field">
                <label>Landmark</label>

                {editing ? (
                  <input
                    type="text"
                    name="landmark"
                    value={address.landmark}
                    onChange={handleAddressChange}
                    placeholder="Nearby landmark"
                  />
                ) : (
                  <div className="field-value">
                    <FaMapMarkerAlt />

                    {address.landmark || "Not added"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <div className="profile-section">
            <div className="section-title">
              <div className="section-icon">
                <FaUser />
              </div>

              <div>
                <h3>Quick Actions</h3>

                <p>Quickly access your PizzaVerse account</p>
              </div>
            </div>

            <div className="quick-actions">
              {/* MY ORDERS */}

              <button type="button" onClick={() => navigate("/orders")}>
                <FaShoppingBag />

                <span>
                  <strong>My Orders</strong>

                  <small>Track your pizza orders</small>
                </span>
              </button>

              {/* WISHLIST */}

              <button type="button" onClick={() => navigate("/wishlist")}>
                <FaHeart />

                <span>
                  <strong>My Wishlist</strong>

                  <small>View your favourite pizzas</small>
                </span>
              </button>

              {/* CHANGE PASSWORD */}

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                <FaLock />

                <span>
                  <strong>Change Password</strong>

                  <small>Reset your account password</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
