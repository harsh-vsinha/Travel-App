import { createSlice } from "@reduxjs/toolkit";

// --- Cart Slice ---
const cartSlice = createSlice({
  name: "cart",
  initialState: loadState("darshan_cart", []),
  reducers: {
    addItem: (state, action) => {
      state.push(action.payload);
    },
    removeItem: (state, action) => {
      state.splice(action.payload, 1);
    },
    clearCart: () => {
      return [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
