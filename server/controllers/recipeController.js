import PizzaRecipe from "../models/PizzaRecipe.js";
import Pizza from "../models/Pizza.js";
import Inventory from "../models/Inventory.js";

// ======================================================
// GET ALL RECIPES
// GET /api/recipes
// ADMIN ONLY
// ======================================================

export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await PizzaRecipe.find()
      .populate("pizzaId", "name image price category")
      .populate(
        "ingredients.inventoryItem",
        "itemName quantity unit lowStockThreshold",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error("Get Recipes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizza recipes",
    });
  }
};

// ======================================================
// GET RECIPE BY PIZZA
// GET /api/recipes/:pizzaId
// ADMIN ONLY
// ======================================================

export const getRecipeByPizza = async (req, res) => {
  try {
    const { pizzaId } = req.params;

    const recipe = await PizzaRecipe.findOne({ pizzaId })
      .populate("pizzaId", "name image price category")
      .populate(
        "ingredients.inventoryItem",
        "itemName quantity unit lowStockThreshold",
      );

    if (!recipe) {
      return res.status(200).json({
        success: true,
        recipe: null,
      });
    }

    return res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("Get Recipe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recipe",
    });
  }
};

// ======================================================
// CREATE RECIPE
// POST /api/recipes
// ADMIN ONLY
// ======================================================

export const createRecipe = async (req, res) => {
  try {
    const { pizzaId, ingredients } = req.body;

    if (!pizzaId) {
      return res.status(400).json({
        success: false,
        message: "Pizza is required",
      });
    }

    if (!Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: "Ingredients must be an array",
      });
    }

    // Check pizza exists
    const pizza = await Pizza.findById(pizzaId);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    // Only one recipe per pizza
    const existingRecipe = await PizzaRecipe.findOne({
      pizzaId,
    });

    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        message: "Recipe already exists for this pizza",
      });
    }

    // Validate ingredients
    const cleanedIngredients = [];

    for (const ingredient of ingredients) {
      if (!ingredient?.inventoryItem) {
        return res.status(400).json({
          success: false,
          message: "Every ingredient must have an inventory item",
        });
      }

      const quantity = Number(ingredient.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Ingredient quantity must be greater than zero",
        });
      }

      const inventoryItem = await Inventory.findById(
        ingredient.inventoryItem,
      );

      if (!inventoryItem) {
        return res.status(400).json({
          success: false,
          message: "One or more inventory items were not found",
        });
      }

      cleanedIngredients.push({
        inventoryItem: inventoryItem._id,
        quantity,
      });
    }

    const recipe = await PizzaRecipe.create({
      pizzaId: pizza._id,
      ingredients: cleanedIngredients,
    });

    const populatedRecipe = await PizzaRecipe.findById(recipe._id)
      .populate("pizzaId", "name image price category")
      .populate(
        "ingredients.inventoryItem",
        "itemName quantity unit lowStockThreshold",
      );

    return res.status(201).json({
      success: true,
      message: "Pizza recipe created successfully",
      recipe: populatedRecipe,
    });
  } catch (error) {
    console.error("Create Recipe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create pizza recipe",
    });
  }
};

// ======================================================
// UPDATE RECIPE
// PUT /api/recipes/:pizzaId
// ADMIN ONLY
// ======================================================

export const updateRecipe = async (req, res) => {
  try {
    const { pizzaId } = req.params;
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: "Ingredients must be an array",
      });
    }

    const pizza = await Pizza.findById(pizzaId);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    const cleanedIngredients = [];

    for (const ingredient of ingredients) {
      if (!ingredient?.inventoryItem) {
        return res.status(400).json({
          success: false,
          message: "Every ingredient must have an inventory item",
        });
      }

      const quantity = Number(ingredient.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Ingredient quantity must be greater than zero",
        });
      }

      const inventoryItem = await Inventory.findById(
        ingredient.inventoryItem,
      );

      if (!inventoryItem) {
        return res.status(400).json({
          success: false,
          message: "One or more inventory items were not found",
        });
      }

      cleanedIngredients.push({
        inventoryItem: inventoryItem._id,
        quantity,
      });
    }

    const recipe = await PizzaRecipe.findOneAndUpdate(
      { pizzaId },
      {
        pizzaId,
        ingredients: cleanedIngredients,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    )
      .populate("pizzaId", "name image price category")
      .populate(
        "ingredients.inventoryItem",
        "itemName quantity unit lowStockThreshold",
      );

    return res.status(200).json({
      success: true,
      message: "Pizza recipe updated successfully",
      recipe,
    });
  } catch (error) {
    console.error("Update Recipe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update pizza recipe",
    });
  }
};

// ======================================================
// DELETE RECIPE
// DELETE /api/recipes/:pizzaId
// ADMIN ONLY
// ======================================================

export const deleteRecipe = async (req, res) => {
  try {
    const { pizzaId } = req.params;

    const recipe = await PizzaRecipe.findOneAndDelete({
      pizzaId,
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza recipe deleted successfully",
    });
  } catch (error) {
    console.error("Delete Recipe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete pizza recipe",
    });
  }
};