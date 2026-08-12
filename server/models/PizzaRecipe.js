import mongoose from "mongoose";

const recipeIngredientSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.0001,
    },
  },
  {
    _id: true,
  },
);

const pizzaRecipeSchema = new mongoose.Schema(
  {
    pizzaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      required: true,
      unique: true,
    },

    ingredients: {
      type: [recipeIngredientSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("PizzaRecipe", pizzaRecipeSchema);