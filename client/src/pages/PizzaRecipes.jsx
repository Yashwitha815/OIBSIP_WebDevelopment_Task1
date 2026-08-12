import "../styles/PizzaRecipes.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function PizzaRecipes() {
  const navigate = useNavigate();

  const [pizzas, setPizzas] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [selectedPizza, setSelectedPizza] = useState("");
  const [ingredients, setIngredients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login as admin");
        navigate("/admin/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [pizzaResponse, inventoryResponse, recipeResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/pizzas"),
          axios.get("http://localhost:5000/api/inventory", { headers }),
          axios.get("http://localhost:5000/api/recipes", { headers }),
        ]);

      if (pizzaResponse.data) {
        const pizzaData = Array.isArray(pizzaResponse.data)
          ? pizzaResponse.data
          : pizzaResponse.data.pizzas || [];

        setPizzas(pizzaData);
      }

      if (inventoryResponse.data?.success) {
        setInventory(inventoryResponse.data.inventory || []);
      }

      if (recipeResponse.data?.success) {
        setRecipes(recipeResponse.data.recipes || []);
      }
    } catch (error) {
      console.error("Pizza Recipes Load Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");

        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/admin/dashboard");
        return;
      }

      toast.error(
        error.response?.data?.message || "Failed to load pizza recipe data",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please login as admin");
          navigate("/admin/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [pizzaResponse, inventoryResponse, recipeResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/pizzas"),
            axios.get("http://localhost:5000/api/inventory", {
              headers,
            }),
            axios.get("http://localhost:5000/api/recipes", {
              headers,
            }),
          ]);

        if (cancelled) return;

        const pizzaData = Array.isArray(pizzaResponse.data)
          ? pizzaResponse.data
          : pizzaResponse.data?.pizzas || [];

        setPizzas(pizzaData);

        if (inventoryResponse.data?.success) {
          setInventory(inventoryResponse.data.inventory || []);
        }

        if (recipeResponse.data?.success) {
          setRecipes(recipeResponse.data.recipes || []);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Pizza Recipes Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");

          toast.error("Session expired. Please login again.");
          navigate("/admin/login");
          return;
        }

        if (error.response?.status === 403) {
          toast.error("Admin access required");
          navigate("/admin/dashboard");
          return;
        }

        toast.error(
          error.response?.data?.message || "Failed to load pizza recipes",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    toast.success("Admin logged out");

    navigate("/admin/login");
  };

  // ======================================================
  // SELECT PIZZA
  // ======================================================

  const handlePizzaChange = async (event) => {
    const pizzaId = event.target.value;

    setSelectedPizza(pizzaId);
    setIngredients([]);

    if (!pizzaId) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/recipes/${pizzaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success && response.data.recipe) {
        const existingIngredients = response.data.recipe.ingredients || [];

        setIngredients(
          existingIngredients.map((ingredient) => ({
            inventoryItem:
              ingredient.inventoryItem?._id || ingredient.inventoryItem || "",
            quantity: ingredient.quantity || "",
          })),
        );

        toast.success("Existing recipe loaded");
      }
    } catch (error) {
      console.error("Load Recipe Error:", error);

      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || "Failed to load recipe");
      }
    }
  };

  // ======================================================
  // ADD INGREDIENT
  // ======================================================

  const addIngredient = () => {
    setIngredients((previous) => [
      ...previous,
      {
        inventoryItem: "",
        quantity: "",
      },
    ]);
  };

  // ======================================================
  // UPDATE INGREDIENT
  // ======================================================

  const updateIngredient = (index, field, value) => {
    setIngredients((previous) =>
      previous.map((ingredient, ingredientIndex) =>
        ingredientIndex === index
          ? {
              ...ingredient,
              [field]: value,
            }
          : ingredient,
      ),
    );
  };

  // ======================================================
  // REMOVE INGREDIENT
  // ======================================================

  const removeIngredient = (index) => {
    setIngredients((previous) =>
      previous.filter((_, ingredientIndex) => ingredientIndex !== index),
    );
  };

  // ======================================================
  // SAVE RECIPE
  // ======================================================

  const saveRecipe = async () => {
    if (!selectedPizza) {
      toast.error("Please select a pizza");
      return;
    }

    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    for (const ingredient of ingredients) {
      if (!ingredient.inventoryItem) {
        toast.error("Please select all ingredients");
        return;
      }

      if (!ingredient.quantity || Number(ingredient.quantity) <= 0) {
        toast.error("Ingredient quantity must be greater than zero");
        return;
      }
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const payload = {
        pizzaId: selectedPizza,
        ingredients: ingredients.map((ingredient) => ({
          inventoryItem: ingredient.inventoryItem,
          quantity: Number(ingredient.quantity),
        })),
      };

      const existingRecipe = recipes.find(
        (recipe) =>
          String(recipe.pizzaId?._id || recipe.pizzaId) ===
          String(selectedPizza),
      );

      let response;

      if (existingRecipe) {
        response = await axios.put(
          `http://localhost:5000/api/recipes/${selectedPizza}`,
          {
            ingredients: payload.ingredients,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/recipes",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      if (response.data?.success) {
        toast.success(
          existingRecipe
            ? "Pizza recipe updated successfully"
            : "Pizza recipe created successfully",
        );

        setIngredients([]);

        const recipeResponse = await axios.get(
          "http://localhost:5000/api/recipes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (recipeResponse.data?.success) {
          setRecipes(recipeResponse.data.recipes || []);
        }
      }
    } catch (error) {
      console.error("Save Recipe Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to save pizza recipe",
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DELETE RECIPE
  // ======================================================

  const deleteRecipe = async (pizzaId, pizzaName) => {
    const confirmed = window.confirm(`Delete the recipe for "${pizzaName}"?`);

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/recipes/${pizzaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success) {
        toast.success("Recipe deleted");

        setRecipes((previous) =>
          previous.filter(
            (recipe) =>
              String(recipe.pizzaId?._id || recipe.pizzaId) !== String(pizzaId),
          ),
        );

        if (String(selectedPizza) === String(pizzaId)) {
          setSelectedPizza("");
          setIngredients([]);
        }
      }
    } catch (error) {
      console.error("Delete Recipe Error:", error);

      toast.error(error.response?.data?.message || "Failed to delete recipe");
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getPizzaName = (recipe) => {
    return recipe.pizzaId?.name || recipe.pizzaName || "Pizza";
  };

  const getInventoryName = (ingredient) => {
    return (
      ingredient.inventoryItem?.itemName ||
      inventory.find(
        (item) =>
          String(item._id) ===
          String(ingredient.inventoryItem?._id || ingredient.inventoryItem),
      )?.itemName ||
      "Ingredient"
    );
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-dashboard">
      {/* ==================================================
          ADMIN SIDEBAR
      ================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">🍕</span>

          <div>
            <h2>PizzaVerse</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className="admin-nav-item"
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span className="admin-nav-icon">📦</span>
            <span>Inventory</span>
          </button>

          <button
            className="admin-nav-item"
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            <span className="admin-nav-icon">📋</span>
            <span>Orders</span>
          </button>

          <button
            className="admin-nav-item active"
            type="button"
            onClick={() => navigate("/admin/recipes")}
          >
            <span className="admin-nav-icon">🍕</span>
            <span>Pizza Recipes</span>
          </button>
        </nav>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="admin-main">
        {/* PAGE HEADER */}

        <header className="recipe-page-header">
          <div className="recipe-title-wrapper">
            <div className="recipe-title-icon">🍕</div>

            <div>
              <h1>Pizza Recipes</h1>

              <p>Define the ingredients and quantities used for each pizza.</p>
            </div>
          </div>

          <button
            className="recipe-refresh-button"
            type="button"
            onClick={loadData}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* ==================================================
            CREATE / EDIT RECIPE
        ================================================== */}

        <section className="recipe-editor-card">
          <div className="recipe-section-heading">
            <div>
              <h2>
                {recipes.some(
                  (recipe) =>
                    String(recipe.pizzaId?._id || recipe.pizzaId) ===
                    String(selectedPizza),
                )
                  ? "Edit Pizza Recipe"
                  : "Create Pizza Recipe"}
              </h2>

              <p>
                Select a pizza and add the ingredients required to prepare it.
              </p>
            </div>
          </div>

          <div className="recipe-form-divider" />

          {/* PIZZA */}

          <div className="recipe-form-group">
            <label htmlFor="pizza">Pizza</label>

            <select
              id="pizza"
              value={selectedPizza}
              onChange={handlePizzaChange}
              disabled={saving}
            >
              <option value="">Select a pizza</option>

              {pizzas.map((pizza) => (
                <option key={pizza._id} value={pizza._id}>
                  {pizza.name}
                </option>
              ))}
            </select>
          </div>

          {/* INGREDIENTS */}

          {selectedPizza && (
            <div className="ingredients-section">
              <div className="ingredients-heading">
                <div>
                  <h3>Ingredients</h3>
                  <p>Choose ingredients from your existing inventory.</p>
                </div>

                <button
                  type="button"
                  className="add-ingredient-button"
                  onClick={addIngredient}
                  disabled={saving}
                >
                  + Add Ingredient
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="ingredients-empty">
                  <div className="empty-recipe-icon">🍕</div>

                  <p>No ingredients added yet.</p>

                  <button
                    type="button"
                    onClick={addIngredient}
                    disabled={saving}
                  >
                    Add First Ingredient
                  </button>
                </div>
              ) : (
                <div className="ingredients-list">
                  {ingredients.map((ingredient, index) => {
                    const selectedInventory = inventory.find(
                      (item) =>
                        String(item._id) === String(ingredient.inventoryItem),
                    );

                    return (
                      <div className="ingredient-row" key={index}>
                        <div className="ingredient-number">{index + 1}</div>

                        <div className="ingredient-field">
                          <label>Ingredient</label>

                          <select
                            value={ingredient.inventoryItem}
                            onChange={(event) =>
                              updateIngredient(
                                index,
                                "inventoryItem",
                                event.target.value,
                              )
                            }
                            disabled={saving}
                          >
                            <option value="">Select ingredient</option>

                            {inventory.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.itemName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="ingredient-field quantity-field">
                          <label>Quantity</label>

                          <div className="quantity-input-wrapper">
                            <input
                              type="number"
                              min="0.0001"
                              step="0.0001"
                              value={ingredient.quantity}
                              onChange={(event) =>
                                updateIngredient(
                                  index,
                                  "quantity",
                                  event.target.value,
                                )
                              }
                              placeholder="0"
                              disabled={saving}
                            />

                            <span>{selectedInventory?.unit || "unit"}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="remove-ingredient-button"
                          onClick={() => removeIngredient(index)}
                          disabled={saving}
                          title="Remove ingredient"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ACTIONS */}

          {selectedPizza && (
            <div className="recipe-actions">
              <button
                type="button"
                className="recipe-clear-button"
                onClick={() => {
                  setSelectedPizza("");
                  setIngredients([]);
                }}
                disabled={saving}
              >
                Clear
              </button>

              <button
                type="button"
                className="recipe-save-button"
                onClick={saveRecipe}
                disabled={saving || ingredients.length === 0}
              >
                {saving ? "Saving..." : "💾 Save Recipe"}
              </button>
            </div>
          )}
        </section>

        {/* ==================================================
            SAVED RECIPES
        ================================================== */}

        <section className="saved-recipes-section">
          <div className="saved-recipes-heading">
            <div>
              <h2>Saved Recipes</h2>

              <p>
                {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}{" "}
                configured
              </p>
            </div>
          </div>

          {loading ? (
            <div className="recipes-loading">
              <div>🍕</div>
              <p>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="recipes-empty">
              <div>🍕</div>

              <h3>No recipes created yet</h3>

              <p>Select a pizza above and create its ingredient recipe.</p>
            </div>
          ) : (
            <div className="saved-recipes-grid">
              {recipes.map((recipe) => {
                const pizzaId = recipe.pizzaId?._id || recipe.pizzaId;

                return (
                  <div className="saved-recipe-card" key={recipe._id}>
                    <div className="saved-recipe-top">
                      <div className="saved-recipe-icon">🍕</div>

                      <div>
                        <h3>{getPizzaName(recipe)}</h3>

                        <span>
                          {recipe.ingredients?.length || 0} ingredients
                        </span>
                      </div>
                    </div>

                    <div className="saved-recipe-ingredients">
                      {recipe.ingredients?.map((ingredient, index) => (
                        <div
                          className="saved-ingredient"
                          key={ingredient._id || index}
                        >
                          <span>{getInventoryName(ingredient)}</span>

                          <strong>
                            {ingredient.quantity}{" "}
                            {ingredient.inventoryItem?.unit || ""}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="saved-recipe-actions">
                      <button
                        type="button"
                        className="edit-recipe-button"
                        onClick={() =>
                          handlePizzaChange({
                            target: {
                              value: pizzaId,
                            },
                          })
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="delete-recipe-button"
                        onClick={() =>
                          deleteRecipe(pizzaId, getPizzaName(recipe))
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PizzaRecipes;
