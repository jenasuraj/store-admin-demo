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

export const getProductsTypeAttribute = createAsyncThunk(
  "productTypeKey/getProductTypeKey",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL+
        "/api/productAttributes/productAttributeMappingList"
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const ProductTypeAttribute = createSlice({
  name: "productTypeKey",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductsTypeAttribute.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getProductsTypeAttribute.fulfilled, (state, action) => {
        state.loading = false;
        state.productType = action.payload;
        state.error = false;
      })
      .addCase(getProductsTypeAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default ProductTypeAttribute.reducer;

export const selectProductsTypeAttribute = (state: RootState) =>
  state.productTypeAttribute.productType;
export const productsTypeAttributeLoading = (state: RootState) =>
  state.productTypeAttribute.loading;
export const productsTypeAttributeError = (state: RootState) =>
  state.productTypeAttribute.error;
