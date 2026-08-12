import mongoose from "mongoose";
import dotenv from "dotenv";

import Pizza from "./models/Pizza.js";
import Inventory from "./models/Inventory.js";
import PizzaRecipe from "./models/PizzaRecipe.js";

dotenv.config();

const recipes = {
  "Farmhouse": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Onions", 0.05],
    ["Capsicum", 0.05],
    ["Tomatoes", 0.10],
    ["Mushrooms", 0.05],
  ],

  "Margherita": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Tomatoes", 0.10],
    ["Oregano", 0.005],
  ],

  "Veg Supreme": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Olives", 0.05],
    ["Sweet Corn", 0.05],
    ["Capsicum", 0.05],
    ["Onions", 0.05],
  ],

  "Paneer Tikka": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Paneer", 0.10],
    ["Onions", 0.05],
    ["Capsicum", 0.05],
    ["Oregano", 0.005],
  ],

  "Pepperoni": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Pepperoni", 0.08],
    ["Oregano", 0.005],
  ],

  "BBQ Chicken": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Chicken", 0.10],
    ["BBQ Sauce", 0.03],
    ["Onions", 0.05],
    ["Oregano", 0.005],
  ],

  "Cheese Burst": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 2],
  ],

  "Olive Herbs Pizza": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Olives", 0.05],
    ["Tomatoes", 0.08],
    ["Oregano", 0.005],
  ],

  "Chicken Dominator": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Chicken", 0.08],
    ["Chicken Sausage", 0.05],
    ["Pepperoni", 0.05],
    ["BBQ Chicken", 0.05],
  ],

  "Mushroom Delight": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Mushrooms", 0.10],
    ["Oregano", 0.005],
    ["Sauces", 0.02],
  ],

  "Mexican Fiesta": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Jalapenos", 0.04],
    ["Sweet Corn", 0.05],
    ["Black Olives", 0.04],
    ["Onions", 0.05],
    ["Chilli Flakes", 0.003],
  ],

  "Garlic Chicken Supreme": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Chicken", 0.10],
    ["Onions", 0.05],
    ["Oregano", 0.005],
    ["Chilli Flakes", 0.003],
  ],

  "Meat Lovers": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Pepperoni", 0.06],
    ["Chicken Sausage", 0.05],
    ["Chicken", 0.08],
  ],

  "Mediterranean Veg": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Tomatoes", 0.10],
    ["Oregano", 0.005],
  ],

  "Spicy Chicken Peri Peri": [
    ["Pizza Bases", 1],
    ["Pizza Boxes", 1],
    ["Cheese", 1],
    ["Chicken", 0.10],
    ["Jalapenos", 0.04],
    ["Onions", 0.05],
    ["Chilli Sauce", 0.03],
    ["Chilli Flakes", 0.003],
  ],
};

const normalize = (value) =>
  String(value).trim().toLowerCase();

const seedRecipes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    let created = 0;
    let updated = 0;

    for (const [pizzaName, ingredientList] of Object.entries(
      recipes,
    )) {
      // ==================================================
      // FIND PIZZA
      // ==================================================

      const pizza = await Pizza.findOne({
        name: {
          $regex: `^${pizzaName.replace(
            /[-/\\^$*+?.()|[\]{}]/g,
            "\\$&",
          )}$`,
          $options: "i",
        },
      });

      if (!pizza) {
        console.log(
          `⚠️ Pizza not found: ${pizzaName}`,
        );

        continue;
      }

      // ==================================================
      // FIND INVENTORY ITEMS
      // ==================================================

      const ingredients = [];

      for (const [inventoryName, quantity] of ingredientList) {
        const inventoryItem = await Inventory.findOne({
          itemName: {
            $regex: `^${inventoryName.replace(
              /[-/\\^$*+?.()|[\]{}]/g,
              "\\$&",
            )}$`,
            $options: "i",
          },
        });

        if (!inventoryItem) {
          console.log(
            `⚠️ Inventory item not found: ${inventoryName} → ${pizzaName}`,
          );

          continue;
        }

        ingredients.push({
          inventoryItem: inventoryItem._id,
          quantity,
        });
      }

      // ==================================================
      // MAKE SURE ALL INGREDIENTS WERE FOUND
      // ==================================================

      if (
        ingredients.length !==
        ingredientList.length
      ) {
        console.log(
          `❌ Skipping ${pizzaName} because one or more inventory items are missing.`,
        );

        continue;
      }

      // ==================================================
      // CREATE OR UPDATE RECIPE
      // ==================================================

      const existingRecipe =
        await PizzaRecipe.findOne({
          pizzaId: pizza._id,
        });

      if (existingRecipe) {
        existingRecipe.ingredients =
          ingredients;

        await existingRecipe.save();

        updated++;

        console.log(
          `🔄 Updated recipe: ${pizzaName}`,
        );
      } else {
        await PizzaRecipe.create({
          pizzaId: pizza._id,
          ingredients,
        });

        created++;

        console.log(
          `✅ Created recipe: ${pizzaName}`,
        );
      }
    }

    console.log("\n================================");
    console.log("🍕 RECIPE SEEDING COMPLETE");
    console.log("================================");
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log("================================\n");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Recipe seeding failed:",
      error,
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedRecipes();