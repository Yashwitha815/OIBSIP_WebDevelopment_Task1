import Inventory from "../models/Inventory.js";

// ======================================================
// GET INVENTORY
// GET /api/inventory
// ADMIN ONLY
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

// ======================================================
// ADD INVENTORY
// POST /api/inventory
// ADMIN ONLY
// ======================================================

export const addInventory = async (req, res) => {
  try {
    const {
      itemName,
      quantity,
      unit,
      lowStockThreshold,
    } = req.body;

    if (
      !itemName ||
      quantity === undefined ||
      !unit ||
      lowStockThreshold === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All inventory fields are required",
      });
    }

    const existingItem = await Inventory.findOne({
      itemName: itemName.trim(),
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Inventory item already exists",
      });
    }

    const inventory = await Inventory.create({
      itemName: itemName.trim(),
      quantity: Number(quantity),
      unit,
      lowStockThreshold: Number(lowStockThreshold),
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item added successfully",
      inventory,
    });
  } catch (error) {
    console.error("Add Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add inventory item",
    });
  }
};

// ======================================================
// UPDATE INVENTORY
// PUT /api/inventory/:id
// ADMIN ONLY
// ======================================================

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      itemName,
      quantity,
      unit,
      lowStockThreshold,
    } = req.body;

    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (itemName !== undefined) {
      inventory.itemName = itemName.trim();
    }

    if (quantity !== undefined) {
      inventory.quantity = Number(quantity);
    }

    if (unit !== undefined) {
      inventory.unit = unit;
    }

    if (lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = Number(lowStockThreshold);
    }

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("Update Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory",
    });
  }
};

// ======================================================
// DELETE INVENTORY
// DELETE /api/inventory/:id
// ADMIN ONLY
// ======================================================

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    await Inventory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory",
    });
  }
};