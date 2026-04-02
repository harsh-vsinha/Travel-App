import { createSlice } from "@reduxjs/toolkit";

const loadState = (key, fallback) => {
  try {
    const serializedState = localStorage.getItem(key);
    return serializedState ? JSON.parse(serializedState) : fallback;
  } catch (err) {
    return fallback;
  }
};

// --- Auth Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState: loadState("darshan_auth", { isLoggedIn: false, user: null }),
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
