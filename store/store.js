import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../slice/cartSlice.js";
import authReducer from "../slice/authSlice.js";
import wishlistReducer from "../slice/whishlist.js";
// --- Configure Store ---
const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },
});

export default store;
