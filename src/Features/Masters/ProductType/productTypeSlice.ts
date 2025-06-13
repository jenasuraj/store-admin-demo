import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { ProductTypeList } from "./types";
import { BASE_URL } from "@/lib/constants";

const initialState: ProductTypeList = {
  productType: null,
  loading: false,
  error: false,
};

export const getProductsType = createAsyncThunk(
  "productType/getProductType",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/productsType");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const ProductTypeSlice = createSlice({
  name: "productType",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductsType.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getProductsType.fulfilled, (state, action) => {
        state.loading = false;
        state.productType = action.payload;
        state.error = false;
      })
      .addCase(getProductsType.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default ProductTypeSlice.reducer;

export const selectProductsType = (state: RootState) =>
  state.products.productType;
export const productsLoading = (state: RootState) => state.products.loading;
export const productsError = (state: RootState) => state.products.error;
