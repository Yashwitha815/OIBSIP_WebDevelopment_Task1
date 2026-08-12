import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import pizzaRoutes from "./routes/pizzaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

dotenv.config();

// ======================================================
// DATABASE
// ======================================================

connectDB();

const app = express();

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// ROUTES
// ======================================================

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/pizzas", pizzaRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/recipes", recipeRoutes);

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.send("🍕 PizzaVerse Backend Running...");
});

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});