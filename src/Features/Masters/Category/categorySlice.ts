import { RootState } from "@/app/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Category, CategoryList, SubCategory } from "./types";
import { BASE_URL } from "@/lib/constants";

const initialState: CategoryList = {
  categories: null,
  loading: false,
  error: false,
  subCategories: null,
  subCategoriesloading: false,
  subCategorieserror: false,
};

export const getParentCategories = createAsyncThunk(
  "category/getParentCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        BASE_URL + "/api/categories/AllCategory"
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

export const getSubCategories = createAsyncThunk(
  "category/getSubCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        BASE_URL + "/api/categoryMappings/subCategories"
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

const CategorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getParentCategories.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getParentCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = false;
      })
      .addCase(getParentCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(getSubCategories.pending, (state) => {
        state.subCategoriesloading = true;
        state.subCategorieserror = false;
      })
      .addCase(getSubCategories.fulfilled, (state, action) => {
        state.subCategoriesloading = false;
        state.subCategories = action.payload;
        state.subCategorieserror = false;
      })
      .addCase(getSubCategories.rejected, (state, action) => {
        state.subCategoriesloading = false;
        state.subCategorieserror = true;
      });
  },
});

export default CategorySlice.reducer;

export const selectCategories = (state: RootState) => state.category.categories;

export const selectSubCategories = (state: RootState) =>
  state.category.subCategories;
export const subCategoriesLoading = (state: RootState) =>
  state.category.subCategoriesloading;
export const subCategoriesError = (state: RootState) =>
  state.category.subCategorieserror;
