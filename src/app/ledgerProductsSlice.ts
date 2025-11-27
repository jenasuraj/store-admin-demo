import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../lib/constants";

// --- Types ---

export type LedgerProductsAttributes = {
  sku: string;
  price: number;
  title: string;
  width: number;
  height: number;
  quantity: number;
};

export type ledgerProductsDataType = {
  productId: number;
  defaultSku: string;
  name: string;
  status: "active" | "inactive" | null;
  attributes: LedgerProductsAttributes[];
  productTypeId: number;
};

// Type for the Paginated Response
export interface PaginatedResponse {
  content: ledgerProductsDataType[];
  last: boolean;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

interface ledgerProductsState {
  infiniteList: ledgerProductsDataType[];
  hasMore: boolean;
  currentPage: number;
  loading: boolean;
  error: any;
  isSearching: boolean; // Critical flag to disable infinite scroll during search
}

const initialState: ledgerProductsState = {
  infiniteList: [],
  hasMore: true,
  currentPage: 0,
  loading: false,
  error: null,
  isSearching: false,
};

// --- Thunk ---

export const fetchLedgerProducts = createAsyncThunk(
  "ledgerProducts/fetchMixed",
  async (
    { page, size, search = "" }: { page: number; size: number; search?: string },
    thunkAPI
  ) => {
    try {
      // Case 1: Search (Flat Array, No Pagination)
      if (search.trim().length > 0) {
        // Crucial: Encode special characters like '+' in "E+L"
        const encodedQuery = encodeURIComponent(search.trim());
        const response = await axios.get(
          `${BASE_URL}/api/products/search/all?keyword=${encodedQuery}`
        );
        return { type: 'search', data: response.data }; 
      } 
      
      // Case 2: Default Pagination
      else {
        const response = await axios.get(
          `${BASE_URL}/api/products?page=${page}&size=${size}`
        );
        return { type: 'paginated', data: response.data };
      }
    } catch (error: AxiosError | any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Slice ---

export const ledgerProductsSlice = createSlice({
  name: "ledgerProducts",
  initialState,
  reducers: {
    resetProductList: (state) => {
      state.infiniteList = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.isSearching = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLedgerProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLedgerProducts.fulfilled, (state, action) => {
      state.loading = false;
      const { type, data } = action.payload;

      if (type === 'search') {
        // SEARCH MODE: API returns direct array [ { product }, ... ]
        // We replace the whole list and disable scrolling
        state.infiniteList = Array.isArray(data) ? data : [];
        state.hasMore = false; 
        state.isSearching = true;
        state.currentPage = 0;
      } else {
        // PAGINATED MODE: API returns { content: [...], pageable: ... }
        const pageResponse = data as PaginatedResponse;
        const pageReceived = pageResponse.pageable?.pageNumber || 0;

        // If it's the first page OR we are switching back from search mode
        if (pageReceived === 0 || state.isSearching) {
          state.infiniteList = pageResponse.content;
        } else {
          // Append new items, filtering duplicates just to be safe
          const newItems = pageResponse.content.filter(
            (newItem) =>
              !state.infiniteList.some((existing) => existing.productId === newItem.productId)
          );
          state.infiniteList = [...state.infiniteList, ...newItems];
        }

        state.hasMore = !pageResponse.last;
        state.currentPage = pageReceived;
        state.isSearching = false;
      }
    });
    builder.addCase(fetchLedgerProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetProductList } = ledgerProductsSlice.actions;
export default ledgerProductsSlice.reducer;