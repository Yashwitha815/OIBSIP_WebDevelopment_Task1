import { createSlice } from "@reduxjs/toolkit";

// ==========================
// LocalStorage Helpers
// ==========================

const getWishlistKey = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const email = userInfo?.user?.email;

  return email ? `wishlist_${email}` : "wishlist_guest";
};

const loadWishlist = () => {
  const savedWishlist = localStorage.getItem(getWishlistKey());

  return savedWishlist ? JSON.parse(savedWishlist) : [];
};

const saveWishlist = (wishlistItems) => {
  localStorage.setItem(
    getWishlistKey(),
    JSON.stringify(wishlistItems)
  );
};

// ==========================
// Initial State
// ==========================

const initialState = {
  wishlistItems: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState,

  reducers: {
    // ==========================
    // Load Logged-in User Wishlist
    // ==========================

    loadUserWishlist: (state) => {
      state.wishlistItems = loadWishlist();
    },

    // ==========================
    // Toggle Wishlist
    // ==========================

    toggleWishlist: (state, action) => {
      const pizza = action.payload;

      const exists = state.wishlistItems.find(
        (item) => item._id === pizza._id
      );

      if (exists) {
        state.wishlistItems = state.wishlistItems.filter(
          (item) => item._id !== pizza._id
        );
      } else {
        state.wishlistItems.push(pizza);
      }

      saveWishlist(state.wishlistItems);
    },

    // ==========================
    // Clear Wishlist
    // ==========================

    clearWishlist: (state) => {
      state.wishlistItems = [];

      saveWishlist([]);
    },
  },
});

export const {
  toggleWishlist,
  clearWishlist,
  loadUserWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;