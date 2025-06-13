import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Collection, collectionType } from "./type";
import { BASE_URL } from "@/lib/constants";

export interface collectionState {
  entity: Collection[] | null;
  loading: boolean;
  error: boolean;
}

const initialState: collectionState = {
  entity: null,
  loading: false,
  error: false,
};

export const FetchCollectionAsync = createAsyncThunk(
  "collection/getcollection",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/collections/list");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(FetchCollectionAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload;
        state.error = false;
      })
      .addCase(FetchCollectionAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default collectionSlice.reducer;

export const collectionData = (state: RootState) => state.collection.entity;
export const collectionLoading = (state: RootState) => state.collection.loading;
export const collectionError = (state: RootState) => state.collection.error;
