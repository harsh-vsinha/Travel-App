import { createSlice } from "@reduxjs/toolkit";

const loadState = (key, fallback) => {
  try {
    const serializedState = localStorage.getItem(key);
    return serializedState ? JSON.parse(serializedState) : fallback;
  } catch (err) {
    return fallback;
  }
};

// --- Wishlist Slice ---
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: loadState("darshan_wishlist", []),
  reducers: {
    toggleItem: (state, action) => {
      const existingIndex = state.findIndex(
        (item) => item.name === action.payload.name,
      );
      if (existingIndex >= 0) {
        state.splice(existingIndex, 1);
      } else {
        state.push(action.payload);
      }
    },
  },
});

export const { toggleItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
