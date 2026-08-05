import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    houseNo: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // ==========================
    // Basic Information
    // ==========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ==========================
    // Email Verification
    // ==========================

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    verificationTokenExpires: {
      type: Date,
      default: null,
    },

    // ==========================
    // Forgot Password
    // ==========================

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // ==========================
    // Profile
    // ==========================

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ==========================
    // Role
    // ==========================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ==========================
    // Addresses
    // ==========================

    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);