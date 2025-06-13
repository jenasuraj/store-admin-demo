import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";
import { Orders } from "@/Features/Orders/type";

interface OrderHistoryState {
  entity: Orders | null;
  loading: boolean;
  error: boolean;
}
const initialState: OrderHistoryState = {
  entity: null,
  loading: true,
  error: false,
};

const fetchOrder = async (attribute) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/orders/admin?status=pending&${attribute}`
    );
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchPendingOrderAsync = createAsyncThunk(
  "pendingOrder/getPendingorder",
  async (params: string) => {
    const response = await fetchOrder(params);
    return response;
  }
);

export const pendingOrderSlice = createSlice({
  name: "pendingOrder",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPendingOrderAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchPendingOrderAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectPendingOrderEntity = (state: RootState) =>
  state.pendingOrder.entity;
export const selectPendingOrderError = (state: RootState) =>
  state.pendingOrder.error;
export const selectPendingOrderLoading = (state: RootState) =>
  state.pendingOrder.loading;

export default pendingOrderSlice.reducer;
