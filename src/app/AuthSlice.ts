import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { BASE_URL } from "../lib/constants";
import { toast } from "sonner";
import { Module } from "@/components/sidebarManager/sidebarSlice";

export interface User {
  id: string;
  username: string;
  authority_id: number;
  authority: string;
  path: string;
  modules: Module[] | [];
  [key: string]: any;
}

interface UserState {
  user: User;
  isAuthenticated: boolean;
  error: any;
  loading: boolean;
}

const initialState: UserState = {
  user: {} as User,
  isAuthenticated: false,
  error: null,
  loading: false,
};

export const userLogin = createAsyncThunk(
  "user/login",
  async (data: any, thunkAPI) => {
    try {
      const response = await fetch(`${BASE_URL}/API/Login/Check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.status === 200) {
        toast.success("Login successful", { duration: 800 });
        localStorage.setItem("token", `${"Bearer " + result?.accesstoken}`);
        return result;
      } else {
        return thunkAPI.rejectWithValue(result);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = {} as User;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
     setAuth: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(userLogin.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(userLogin.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(userLogin.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    });
  },
});

export default userSlice.reducer;

export const { logout, setAuth } = userSlice.actions;

export const selectUser = (state: RootState) => state.user;
