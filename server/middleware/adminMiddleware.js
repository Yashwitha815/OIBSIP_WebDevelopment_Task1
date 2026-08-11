import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    // Check whether authMiddleware has already loaded the user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

export default adminMiddleware;