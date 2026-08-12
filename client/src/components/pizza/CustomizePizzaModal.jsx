import "../../styles/CustomizePizzaModal.css";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { closePizza } from "../../features/pizza/pizzaSlice";
import { addToCart, updateCartItem } from "../../features/cart/cartSlice";

import PizzaImage from "./PizzaImage";

const SIZE_OPTIONS = [
  { id: "Small", name: "Small", price: -80 },
  { id: "Medium", name: "Medium", price: 0 },
  { id: "Large", name: "Large", price: 80 },
];

const CRUST_OPTIONS = [
  { id: "regular", name: "Regular", price: 0 },
  { id: "thin", name: "Thin Crust", price: 40 },
  { id: "italian", name: "Italian Crust", price: 50 },
  { id: "stuffed", name: "Stuffed Crust", price: 70 },
  { id: "cheese-burst", name: "Cheese Burst", price: 80 },
];

const SAUCE_OPTIONS = [
  { id: "classic-tomato", name: "Classic Tomato", price: 0 },
  { id: "spicy-red", name: "Spicy Red", price: 20 },
  { id: "bbq", name: "BBQ Sauce", price: 25 },
  { id: "pesto", name: "Pesto Sauce", price: 30 },
  { id: "white-garlic", name: "White Garlic", price: 30 },
];

const CHEESE_OPTIONS = [
  { id: "mozzarella", name: "Mozzarella", price: 0 },
  { id: "cheddar", name: "Cheddar", price: 35 },
  { id: "parmesan", name: "Parmesan", price: 40 },
  { id: "smoked-cheese", name: "Smoked Cheese", price: 45 },
  { id: "extra-cheese", name: "Extra Cheese", price: 40 },
];

const VEG_TOPPINGS = [
  { id: "olives", name: "Olives", price: 30 },
  { id: "mushrooms", name: "Mushrooms", price: 35 },
  { id: "jalapenos", name: "Jalapeños", price: 25 },
  { id: "sweet-corn", name: "Sweet Corn", price: 20 },
  { id: "capsicum", name: "Capsicum", price: 25 },
  { id: "onion", name: "Onion", price: 20 },
  { id: "paneer", name: "Paneer", price: 50 },
];

const NON_VEG_TOPPINGS = [
  { id: "chicken", name: "Chicken", price: 70 },
  { id: "chicken-tikka", name: "Chicken Tikka", price: 80 },
  { id: "pepper-chicken", name: "Pepper Chicken", price: 85 },
  { id: "grilled-chicken", name: "Grilled Chicken", price: 90 },
  { id: "spicy-chicken", name: "Spicy Chicken", price: 85 },
];

function CustomizePizzaModal() {
  const dispatch = useDispatch();

  const { isOpen, selectedPizza, mode, editingCartId } = useSelector(
    (state) => state.pizza,
  );

  /*
   * State is initialized when the component instance is created.
   * The key on the modal content below forces a fresh state when
   * another pizza is selected.
   */
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedCrust, setSelectedCrust] = useState("regular");
  const [selectedSauce, setSelectedSauce] = useState("classic-tomato");
  const [selectedCheese, setSelectedCheese] = useState("mozzarella");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [toppingCategory, setToppingCategory] = useState("veg");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen || !selectedPizza) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch(closePizza());
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, isOpen, selectedPizza]);

  if (!isOpen || !selectedPizza) {
    return null;
  }

  const basePrice = Number(selectedPizza.price) || 0;

  const sizeOption =
    SIZE_OPTIONS.find((item) => item.id === selectedSize) || SIZE_OPTIONS[1];

  const crustOption =
    CRUST_OPTIONS.find((item) => item.id === selectedCrust) || CRUST_OPTIONS[0];

  const sauceOption =
    SAUCE_OPTIONS.find((item) => item.id === selectedSauce) || SAUCE_OPTIONS[0];

  const cheeseOption =
    CHEESE_OPTIONS.find((item) => item.id === selectedCheese) ||
    CHEESE_OPTIONS[0];

  const allToppings = [...VEG_TOPPINGS, ...NON_VEG_TOPPINGS];

  const toppingsPrice = selectedToppings.reduce((total, id) => {
    const topping = allToppings.find((item) => item.id === id);
    return total + (topping ? topping.price : 0);
  }, 0);

  const singlePizzaPrice =
    basePrice +
    sizeOption.price +
    crustOption.price +
    sauceOption.price +
    cheeseOption.price +
    toppingsPrice;

  const totalPrice = singlePizzaPrice * quantity;

  const visibleToppings =
    toppingCategory === "veg" ? VEG_TOPPINGS : NON_VEG_TOPPINGS;

  const toggleTopping = (id) => {
    setSelectedToppings((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const resetCustomization = () => {
    setSelectedSize("Medium");
    setSelectedCrust("regular");
    setSelectedSauce("classic-tomato");
    setSelectedCheese("mozzarella");
    setSelectedToppings([]);
    setToppingCategory("veg");
    setQuantity(1);
  };

  const handleQuantityChange = (change) => {
    setQuantity((current) => {
      const next = current + change;
      return Math.min(10, Math.max(1, next));
    });
  };

  const handleSubmit = () => {
    if (!selectedSize || !selectedCrust || !selectedSauce || !selectedCheese) {
      return;
    }

    const cartId = `${selectedPizza._id}-${selectedSize}-${selectedCrust}-${selectedSauce}-${selectedCheese}-${selectedToppings
      .slice()
      .sort()
      .join("-")}`;

    const cartItem = {
      ...selectedPizza,
      cartId,
      size: selectedSize,
      crust: selectedCrust,
      sauce: selectedSauce,
      cheese: selectedCheese,
      toppings: [...selectedToppings],
      basePrice,
      singlePizzaPrice,
      quantity,
    };

    if (mode === "edit") {
      dispatch(
        updateCartItem({
          oldCartId: editingCartId,
          updatedItem: cartItem,
        }),
      );
    } else {
      dispatch(addToCart(cartItem));
    }

    dispatch(closePizza());
  };

  return (
    <div className="pizza-modal-overlay" onClick={() => dispatch(closePizza())}>
      <div className="pizza-modal" onClick={(event) => event.stopPropagation()}>
        <button
          className="close-btn"
          type="button"
          onClick={() => dispatch(closePizza())}
          aria-label="Close"
        >
          ×
        </button>

        <div className="pizza-layout">
          {/* LEFT */}
          <section className="left-panel">
            <PizzaImage pizza={selectedPizza} />

            <div className="pizza-info-overlay">
              <h2>{selectedPizza.name || selectedPizza.pizzaName}</h2>

              {selectedPizza.description && <p>{selectedPizza.description}</p>}

              <div className="pizza-base-price">₹{basePrice}</div>
            </div>
          </section>

          {/* MIDDLE */}
          <section className="middle-panel">
            <div className="customize-header">
              <div>
                <span className="eyebrow">PIZZAVERSE</span>
                <h1>Customize Your Pizza</h1>
                <p>Build it exactly the way you want.</p>
              </div>

              <button
                type="button"
                className="reset-btn"
                onClick={resetCustomization}
              >
                Reset All
              </button>
            </div>

            {/* SIZE */}
            <div className="custom-section">
              <div className="section-heading">
                <div>
                  <h3>Choose Size</h3>
                  <span>Required</span>
                </div>
              </div>

              <div className="option-grid three">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    type="button"
                    key={size.id}
                    className={`option-card ${
                      selectedSize === size.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSize(size.id)}
                  >
                    <strong>{size.name}</strong>
                    <small>
                      {size.price === 0
                        ? "Included"
                        : size.price > 0
                          ? `+₹${size.price}`
                          : `-₹${Math.abs(size.price)}`}
                    </small>
                  </button>
                ))}
              </div>
            </div>

            {/* CRUST */}
            <div className="custom-section">
              <div className="section-heading">
                <div>
                  <h3>Choose Crust</h3>
                  <span>Required</span>
                </div>
              </div>

              <select
                className="custom-select"
                value={selectedCrust}
                onChange={(event) => setSelectedCrust(event.target.value)}
              >
                {CRUST_OPTIONS.map((crust) => (
                  <option key={crust.id} value={crust.id}>
                    {crust.name}{" "}
                    {crust.price === 0 ? "(Included)" : `(+₹${crust.price})`}
                  </option>
                ))}
              </select>
            </div>

            {/* SAUCE */}
            <div className="custom-section">
              <div className="section-heading">
                <div>
                  <h3>Choose Sauce</h3>
                  <span>Required</span>
                </div>
              </div>

              <select
                className="custom-select"
                value={selectedSauce}
                onChange={(event) => setSelectedSauce(event.target.value)}
              >
                {SAUCE_OPTIONS.map((sauce) => (
                  <option key={sauce.id} value={sauce.id}>
                    {sauce.name}{" "}
                    {sauce.price === 0 ? "(Included)" : `(+₹${sauce.price})`}
                  </option>
                ))}
              </select>
            </div>

            {/* CHEESE */}
            <div className="custom-section">
              <div className="section-heading">
                <div>
                  <h3>Choose Cheese</h3>
                  <span>Required</span>
                </div>
              </div>

              <select
                className="custom-select"
                value={selectedCheese}
                onChange={(event) => setSelectedCheese(event.target.value)}
              >
                {CHEESE_OPTIONS.map((cheese) => (
                  <option key={cheese.id} value={cheese.id}>
                    {cheese.name}{" "}
                    {cheese.price === 0 ? "(Included)" : `(+₹${cheese.price})`}
                  </option>
                ))}
              </select>
            </div>

            {/* TOPPINGS */}
            <div className="custom-section">
              <div className="section-heading">
                <div>
                  <h3>Extra Toppings</h3>
                  <span>Optional • Multiple allowed</span>
                </div>
              </div>

              <div className="category-tabs">
                <button
                  type="button"
                  className={toppingCategory === "veg" ? "active" : ""}
                  onClick={() => setToppingCategory("veg")}
                >
                  Veg
                </button>

                <button
                  type="button"
                  className={toppingCategory === "nonveg" ? "active" : ""}
                  onClick={() => setToppingCategory("nonveg")}
                >
                  Non-Veg
                </button>
              </div>

              <select
                className="custom-select topping-select"
                value=""
                onChange={(event) => {
                  if (event.target.value) {
                    toggleTopping(event.target.value);
                  }
                }}
              >
                <option value="">Select toppings...</option>

                {visibleToppings.map((topping) => (
                  <option key={topping.id} value={topping.id}>
                    {selectedToppings.includes(topping.id) ? "✓ " : ""}
                    {topping.name} (+₹{topping.price})
                  </option>
                ))}
              </select>

              {selectedToppings.length > 0 && (
                <div className="selected-toppings">
                  {selectedToppings.map((id) => {
                    const topping = allToppings.find((item) => item.id === id);

                    if (!topping) return null;

                    return (
                      <button
                        type="button"
                        key={id}
                        className="selected-topping"
                        onClick={() => toggleTopping(id)}
                      >
                        {topping.name}
                        <span>×</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* QUANTITY */}
            <div className="quantity-row">
              <div>
                <h3>Quantity</h3>
                <span>How many pizzas?</span>
              </div>

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>

                <strong>{quantity}</strong>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="summary-panel">
            <div className="summary-header">
              <h2>Your Selection</h2>
              <span>Live Summary</span>
            </div>

            <div className="selection-list">
              <div className="selection-row">
                <span>Pizza</span>
                <strong>{selectedPizza.name || selectedPizza.pizzaName}</strong>
              </div>

              <div className="selection-row">
                <span>Size</span>
                <strong>{sizeOption.name}</strong>
              </div>

              <div className="selection-row">
                <span>Crust</span>
                <strong>{crustOption.name}</strong>
              </div>

              <div className="selection-row">
                <span>Sauce</span>
                <strong>{sauceOption.name}</strong>
              </div>

              <div className="selection-row">
                <span>Cheese</span>
                <strong>{cheeseOption.name}</strong>
              </div>

              <div className="selection-row vertical">
                <span>Toppings</span>

                {selectedToppings.length === 0 ? (
                  <small>No extra toppings</small>
                ) : (
                  <div className="summary-toppings">
                    {selectedToppings.map((id) => {
                      const topping = allToppings.find(
                        (item) => item.id === id,
                      );

                      return topping ? (
                        <span key={id}>{topping.name}</span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="price-breakdown">
              <div>
                <span>Base Pizza</span>
                <strong>₹{basePrice}</strong>
              </div>

              <div>
                <span>Size</span>
                <strong>
                  {sizeOption.price >= 0
                    ? `+₹${sizeOption.price}`
                    : `-₹${Math.abs(sizeOption.price)}`}
                </strong>
              </div>

              <div>
                <span>Crust</span>
                <strong>
                  {crustOption.price === 0
                    ? "Included"
                    : `+₹${crustOption.price}`}
                </strong>
              </div>

              <div>
                <span>Sauce</span>
                <strong>
                  {sauceOption.price === 0
                    ? "Included"
                    : `+₹${sauceOption.price}`}
                </strong>
              </div>

              <div>
                <span>Cheese</span>
                <strong>
                  {cheeseOption.price === 0
                    ? "Included"
                    : `+₹${cheeseOption.price}`}
                </strong>
              </div>

              <div>
                <span>Toppings</span>
                <strong>
                  {toppingsPrice === 0 ? "None" : `+₹${toppingsPrice}`}
                </strong>
              </div>
            </div>

            <div className="total-box">
              <div>
                <span>Total</span>
                <small>
                  ₹{singlePizzaPrice} × {quantity}
                </small>
              </div>

              <strong>₹{totalPrice}</strong>
            </div>

            <div className="validation-message">
              <span>✓</span>
              <p>All required selections are complete.</p>
            </div>

            <button
              type="button"
              className="add-cart-btn"
              onClick={handleSubmit}
            >
              {mode === "edit"
                ? `Update Cart • ₹${totalPrice}`
                : `Add to Cart • ₹${totalPrice}`}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CustomizePizzaModal;
