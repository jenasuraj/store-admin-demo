import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AttributeList } from "./types";
import { BASE_URL } from "@/lib/constants";

const initialState: AttributeList = {
  attribute: null,
  loading: false,
  error: false,
};

export const getAttributes = createAsyncThunk(
  "attribute/getAttributes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/attributes");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);
export const getAttributesByProductTypeId = createAsyncThunk(
  "attribute/getAttributes",
  async (productTypeId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        BASE_URL + `/api/productAttributes/attributes/${productTypeId}`
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

const AttributeSlice = createSlice({
  name: "attribute",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAttributes.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attribute = action.payload;
        state.error = false;
      })
      .addCase(getAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default AttributeSlice.reducer;

export const selectAttribute = (state: RootState) => state.attribute.attribute;
export const attributesLoading = (state: RootState) => state.attribute.loading;
export const attributesError = (state: RootState) => state.attribute.error;
