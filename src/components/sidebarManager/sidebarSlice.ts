import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

type SubModule = {
  id: number;
  subModuleName: string;
  icon: string;
};

export type Module = {
  url: string;
  id: number;
  moduleName: string;
  icon: string;
  subModules: SubModule[];
};

interface sidebarManagerState {
  Entity: Module[] | null;
  loading: boolean;
  error: boolean;
}

const initialState: sidebarManagerState = {
  Entity: null,
  loading: false,
  error: false,
};

export const fetchSidebarAsync = createAsyncThunk(
  "sidebarManager/getModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + `/api/moduleAccess/all`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const sidebarSlice = createSlice({
  name: "sidebarManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSidebarAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.Entity = action.payload;
        state.error = false;
      })
      .addCase(fetchSidebarAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default sidebarSlice.reducer;

export const selectSidebar = (state: RootState) => state.sidebarManager.Entity;
export const sidebarLoading = (state: RootState) =>
  state.sidebarManager.loading;
export const sidebarError = (state: RootState) => state.sidebarManager.error;
