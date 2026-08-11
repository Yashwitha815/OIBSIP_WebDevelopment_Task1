import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "./models/Inventory.js";

dotenv.config();

const createInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Remove existing inventory items
    await Inventory.deleteMany({});

    // Create initial inventory
    const inventory = await Inventory.insertMany([
      {
        itemName: "Pizza Bases",
        quantity: 100,
        lowStockThreshold: 20,
        unit: "pieces",
      },
      {
        itemName: "Sauces",
        quantity: 100,
        lowStockThreshold: 20,
        unit: "units",
      },
      {
        itemName: "Cheese",
        quantity: 100,
        lowStockThreshold: 20,
        unit: "units",
      },
      {
        itemName: "Vegetables",
        quantity: 100,
        lowStockThreshold: 20,
        unit: "units",
      },
    ]);

    console.log("==================================");
    console.log("✅ INVENTORY CREATED");
    console.log("==================================");

    inventory.forEach((item) => {
      console.log(
        `${item.itemName}: ${item.quantity} ${item.unit}`
      );
    });

    console.log("==================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Inventory creation failed:", error);
    process.exit(1);
  }
};

createInventory();