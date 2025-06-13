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
      `${BASE_URL}/api/orders/admin?status=placed&${attribute}`
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

export const fetchPackedOrderAsync = createAsyncThunk(
  "order/getorder",
  async (params: string) => {
    const response = await fetchOrder(params);
    return response;
  }
);

export const packedOrderSlice = createSlice({
  name: "packedorder",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPackedOrderAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchPackedOrderAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectPacedOrderEntity = (state: RootState) =>
  state.packedorder.entity;
export const selectPacedOrderError = (state: RootState) =>
  state.packedorder.error;
export const selectPacedOrderLoading = (state: RootState) =>
  state.packedorder.loading;

export default packedOrderSlice.reducer;
