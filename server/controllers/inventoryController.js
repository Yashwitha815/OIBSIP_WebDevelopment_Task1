import Inventory from "../models/Inventory.js";

// ======================================================
// @desc    Get Inventory
// @route   GET /api/inventory
// @access  Admin
// ======================================================

export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({
      itemName: 1,
    });

    return res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("Get Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};