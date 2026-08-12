import { useSelector } from "react-redux";

import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";

import "../styles/Cart.css";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);

  console.log("Cart Items:", cartItems);

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map((pizza, index) => (
              <CartItem
                key={pizza.cartId || pizza._id || index}
                pizza={pizza}
              />
            ))}
          </div>

          <div className="cart-right">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
