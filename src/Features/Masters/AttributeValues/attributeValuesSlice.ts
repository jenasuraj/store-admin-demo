import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AttributeList } from "./types";
import { BASE_URL } from "@/lib/constants";

const initialState: AttributeList = {
  attribute: null,
  loading: false,
  error: false,
  attributesByProdTypeId: null,
  attributesByAttributeId: null,
};

export const getAttributeValues = createAsyncThunk(
  "attributeValue/getAttributeValues",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/keyValues");
      return response.data ? response.data : [];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const getAttributeValuesByProductTypeId = createAsyncThunk(
  "attributeValue/getAttributeValuesById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        BASE_URL + `/api/productAttributes/attributes/${id}`
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
export const getAttributeValuesByAttributeId = createAsyncThunk(
  "attributeValue/getAttributeValuesByAttributeId",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + `/api/getKeyValues/${id}`);
      return response.data ? response.data : [""];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const AttributeValuesSlice = createSlice({
  name: "attributeValue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAttributeValues.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getAttributeValues.fulfilled, (state, action) => {
        state.loading = false;
        state.attribute = action.payload;
        state.error = false;
      })
      .addCase(getAttributeValues.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(getAttributeValuesByProductTypeId.fulfilled, (state, action) => {
        state.attributesByProdTypeId = action.payload;
      })
      .addCase(getAttributeValuesByAttributeId.fulfilled, (state, action) => {
        state.attributesByAttributeId = action.payload;
      });
  },
});

export default AttributeValuesSlice.reducer;

export const selectAttributeValues = (state: RootState) =>
  state.attributeValue.attribute;
export const attributeValuesLoading = (state: RootState) =>
  state.attributeValue.loading;
export const attributesValueError = (state: RootState) =>
  state.attributeValue.error;
export const selectAttributeByProductTypeValues = (state: RootState) =>
  state.attributeValue.attributesByProdTypeId;
export const selectValuesByAttributeId = (state: RootState) =>
  state.attributeValue.attributesByAttributeId;
