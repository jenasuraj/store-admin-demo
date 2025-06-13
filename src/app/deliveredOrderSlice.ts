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
      `${BASE_URL}/api/orders/admin?status=Delivered&${attribute}`
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

export const fetchDeliveredOrderAsync = createAsyncThunk(
  "order/getorder",
  async (params: string) => {
    const response = await fetchOrder(params);
    return response;
  }
);

export const deliverOrderSlice = createSlice({
  name: "deliverOrder",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchDeliveredOrderAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchDeliveredOrderAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectDeliveredOrderEntity = (state: RootState) =>
  state.deliverOrder.entity;
export const selectDeliveredOrderError = (state: RootState) =>
  state.deliverOrder.error;
export const selectDeliveredOrderLoading = (state: RootState) =>
  state.deliverOrder.loading;

export default deliverOrderSlice.reducer;
