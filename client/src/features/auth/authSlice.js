import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// ==========================
// Get user from localStorage
// ==========================

const userInfo = JSON.parse(
  localStorage.getItem("userInfo")
);

const initialState = {
  userInfo: userInfo || null,
  isAuthenticated: !!userInfo,
  loading: false,
  success: false,
  error: false,
  message: "",
};

// ==========================
// REGISTER USER
// ==========================

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration Failed";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================
// LOGIN USER
// ==========================

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login Failed";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================
// AUTH SLICE
// ==========================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    reset: (state) => {
      state.loading = false;
      state.success = false;
      state.error = false;
      state.message = "";
    },

    // ==========================================
    // UPDATE USER INFO AFTER PROFILE EDIT
    // ==========================================

    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // ==========================================
    // LOGOUT
    // ==========================================

    logout: (state) => {
      authService.logout();

      state.userInfo = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.success = false;
      state.error = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================
      // REGISTER
      // =====================

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = false;
        state.message = "";
      })

      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = "";
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })

      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.message = action.payload;
      })

      // =====================
      // LOGIN
      // =====================

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = false;
        state.message = "";
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = false;
        state.message = "";
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.message = action.payload;
      });
  },
});

export const {
  reset,
  logout,
  setUserInfo,
} = authSlice.actions;

export default authSlice.reducer;