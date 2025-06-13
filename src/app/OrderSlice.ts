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
  loading: false,
  error: false,
};

const fetchOrder = async (attribute: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/orders/admin${attribute}`);
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};
const fetchPaymentFailed = async (attribute: string) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/orders/admin/paymentStatus${attribute}`
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

export const fetchOrderAsync = createAsyncThunk(
  "order/getorder",
  async (params: string) => {
    const response = await fetchOrder(params);
    return response;
  }
);

export const fetchPaymentFailedAsync = createAsyncThunk(
  "order/getpaymentfailed",
  async (params: string) => {
    const response = await fetchPaymentFailed(params);
    return response;
  }
);

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchOrderAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchOrderAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(fetchPaymentFailedAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchPaymentFailedAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchPaymentFailedAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectOrderEntity = (state: RootState) => state.order.entity;
export const selectOrderError = (state: RootState) => state.order.error;
export const selectOrderLoading = (state: RootState) => state.order.loading;

export default orderSlice.reducer;
