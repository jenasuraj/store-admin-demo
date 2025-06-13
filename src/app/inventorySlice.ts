import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";

export interface InventoryItem {
  id: number;
  sku: string;
  openStock: number;
  newStock: number;
  sales: number;
  returnGood: number;
  netStockMovement: number;
  finalInStock: number;
  createdAt: string;
  branchId: number;
  productId: number;
  productName: string;
  defaultSku: string;
  quantity: number;
  lowStockThreshold: number;
  exchangeGoods: number;
  exchangeOnHold: number;
}

export interface InventoryResponse {
  totalItems: number;
  totalPages: number;
  inventory: InventoryItem[];
  currentPage: number;
}

interface inventoryState {
  entity: InventoryResponse | null;
  loading: boolean;
  error: boolean;
}
const initialState: inventoryState = {
  entity: null,
  loading: true,
  error: false,
};

const fetchProducts = async (params: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/inventory?${params}`);
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchInventoryAsync = createAsyncThunk(
  "inventory/getinventory",
  async (params: string) => {
    const response = await fetchProducts(params);
    return response;
  }
);

export const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchInventoryAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchInventoryAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectinventoryEntity = (state: RootState) =>
  state.inventory.entity;
export const selectinventoryError = (state: RootState) => state.inventory.error;
export const selectinventoryLoading = (state: RootState) =>
  state.inventory.loading;

export default inventorySlice.reducer;
