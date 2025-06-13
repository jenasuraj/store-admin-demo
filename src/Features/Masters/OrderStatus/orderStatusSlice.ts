import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { OrderStatusState } from "./types";
import { BASE_URL } from "@/lib/constants";

const initialState: OrderStatusState = {
  entity: null,
  loading: false,
  error: false,
};

export const getOrderStatusAsync = createAsyncThunk(
  "orderStatus/getOrderStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/orderstatus/getStatus");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const orderStatusSlice = createSlice({
  name: "orderStatus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrderStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getOrderStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload;
        state.error = false;
      })
      .addCase(getOrderStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default orderStatusSlice.reducer;

export const selectOrderStatus = (state: RootState) => state.orderStatus.entity;
export const orderStatusLoading = (state: RootState) =>
  state.orderStatus.loading;
export const orderStatusError = (state: RootState) => state.orderStatus.error;
