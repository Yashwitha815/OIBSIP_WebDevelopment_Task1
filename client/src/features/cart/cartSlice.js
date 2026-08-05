import { createSlice } from "@reduxjs/toolkit";

// ==========================
// LocalStorage Helpers
// ==========================

const getCartKey = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  return user?.email ? `cart_${user.email}` : "cart_guest";
};

const loadCart = () => {
  const savedCart = localStorage.getItem(getCartKey());
  return savedCart ? JSON.parse(savedCart) : [];
};

const saveCart = (cartItems) => {
  localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
};

// ==========================
// Initial State
// ==========================

const initialState = {
  cartItems: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    // ==========================
    // Load Current User Cart
    // ==========================

    loadUserCart: (state) => {
      state.cartItems = loadCart();
    },

    // ==========================
    // Add to Cart
    // ==========================

    addToCart: (state, action) => {
      const pizza = action.payload;

      const existingItem = state.cartItems.find(
        (item) => item.cartId === pizza.cartId
      );

      if (existingItem) {
        existingItem.quantity += pizza.quantity || 1;
      } else {
        state.cartItems.push({
          ...pizza,
          quantity: pizza.quantity || 1,
        });
      }

      saveCart(state.cartItems);
    },

    // ==========================
    // Update Existing Cart Item
    // ==========================

    updateCartItem: (state, action) => {
      const { oldCartId, updatedItem } = action.payload;

      state.cartItems = state.cartItems.filter(
        (item) => item.cartId !== oldCartId
      );

      const existingItem = state.cartItems.find(
        (item) => item.cartId === updatedItem.cartId
      );

      if (existingItem) {
        existingItem.quantity += updatedItem.quantity;
      } else {
        state.cartItems.push(updatedItem);
      }

      saveCart(state.cartItems);
    },

    // ==========================
    // Increase Quantity
    // ==========================

    increaseQuantity: (state, action) => {
      const item = state.cartItems.find(
        (item) => item.cartId === action.payload
      );

      if (item) {
        item.quantity++;
      }

      saveCart(state.cartItems);
    },

    // ==========================
    // Decrease Quantity
    // ==========================

    decreaseQuantity: (state, action) => {
      const item = state.cartItems.find(
        (item) => item.cartId === action.payload
      );

      if (item) {
        item.quantity--;

        if (item.quantity <= 0) {
          state.cartItems = state.cartItems.filter(
            (pizza) => pizza.cartId !== action.payload
          );
        }
      }

      saveCart(state.cartItems);
    },

    // ==========================
    // Remove Item
    // ==========================

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.cartId !== action.payload
      );

      saveCart(state.cartItems);
    },

    // ==========================
    // Clear Cart
    // ==========================

    clearCart: (state) => {
      state.cartItems = [];

      saveCart(state.cartItems);
    },
  },
});

export const {
  loadUserCart,
  addToCart,
  updateCartItem,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;