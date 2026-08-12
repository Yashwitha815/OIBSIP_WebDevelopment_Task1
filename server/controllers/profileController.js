import User from "../models/User.js";

// ======================================================
// GET USER PROFILE
// GET /api/profile
// ACCESS: Private
// ======================================================

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};

// ======================================================
// UPDATE USER PROFILE
// PUT /api/profile
// ACCESS: Private
// ======================================================

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // BASIC INFORMATION
    // -----------------------------

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof phone === "string") {
      user.phone = phone.trim();
    }

    // -----------------------------
    // DEFAULT ADDRESS
    // -----------------------------

    if (address && typeof address === "object") {
      const cleanAddress = {
        fullName:
          typeof address.fullName === "string"
            ? address.fullName.trim()
            : user.name,

        phone:
          typeof address.phone === "string"
            ? address.phone.trim()
            : user.phone,

        houseNo:
          typeof address.houseNo === "string"
            ? address.houseNo.trim()
            : "",

        street:
          typeof address.street === "string"
            ? address.street.trim()
            : "",

        city:
          typeof address.city === "string"
            ? address.city.trim()
            : "",

        state:
          typeof address.state === "string"
            ? address.state.trim()
            : "",

        pincode:
          typeof address.pincode === "string"
            ? address.pincode.trim()
            : "",

        landmark:
          typeof address.landmark === "string"
            ? address.landmark.trim()
            : "",

        isDefault: true,
      };

      // Keep one default address for now.
      user.addresses = [cleanAddress];
    }

    await user.save();

    const updatedUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};