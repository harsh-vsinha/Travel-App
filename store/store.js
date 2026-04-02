import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../slice/cartSlice";
import authSlice from "../slice/authSlice";
// --- Configure Store ---
const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    wishlist: wishlistSlice.reducer,
    auth: authSlice.reducer,
  },
});

export default store;
