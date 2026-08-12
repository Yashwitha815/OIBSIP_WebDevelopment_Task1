import express from "express";

import {
  getAllRecipes,
  getRecipeByPizza,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ======================================================
// ALL RECIPE ROUTES ARE ADMIN ONLY
// ======================================================

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllRecipes,
);

router.get(
  "/:pizzaId",
  authMiddleware,
  adminMiddleware,
  getRecipeByPizza,
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createRecipe,
);

router.put(
  "/:pizzaId",
  authMiddleware,
  adminMiddleware,
  updateRecipe,
);

router.delete(
  "/:pizzaId",
  authMiddleware,
  adminMiddleware,
  deleteRecipe,
);

export default router;