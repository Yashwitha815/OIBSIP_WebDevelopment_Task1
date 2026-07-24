import "../../styles/CartItem.css";

import { useDispatch } from "react-redux";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../../features/cart/cartSlice";

import { openPizza } from "../../features/pizza/pizzaSlice";

const CartItem = ({ pizza }) => {
  const dispatch = useDispatch();

  const displayPrice = (pizza.singlePizzaPrice || pizza.price) * pizza.quantity;

  const handleEdit = () => {
    dispatch(
      openPizza({
        pizza,
        mode: "edit",
        editingCartId: pizza.cartId,
      }),
    );
  };

  return (
    <div className="cart-item">
      <img src={pizza.image} alt={pizza.name} />

      <div className="item-details">
        <h3>{pizza.name}</h3>

        <p>{pizza.category}</p>

        <div className="pizza-customization">
          <p>
            <strong>📏 Size:</strong> {pizza.size}
          </p>

          <p>
            <strong>🍞 Crust:</strong>{" "}
            {pizza.crust === "regular"
              ? "Regular"
              : pizza.crust === "thin"
                ? "Thin Crust"
                : "Cheese Burst"}
          </p>

          <p>
            <strong>🧀 Toppings:</strong>{" "}
            {pizza.toppings?.length > 0 ? pizza.toppings.join(", ") : "None"}
          </p>
        </div>

        <div className="quantity">
          <button onClick={() => dispatch(decreaseQuantity(pizza.cartId))}>
            −
          </button>

          <span>{pizza.quantity}</span>

          <button onClick={() => dispatch(increaseQuantity(pizza.cartId))}>
            +
          </button>
        </div>
      </div>

      <div className="item-price">
        <h3>₹{displayPrice}</h3>

        <button className="edit-btn" onClick={handleEdit}>
          ✏️ Edit
        </button>

        <button
          className="remove-btn"
          onClick={() => dispatch(removeFromCart(pizza.cartId))}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
