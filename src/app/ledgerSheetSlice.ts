import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../lib/constants";
import { toast } from "sonner";


export interface LedgerRow {
  ledgerId: number;
  itemId: number;
  date: string;         // "2025-11-24"
  customerId: number;
  customerName: string;
  paymentStatus: string; // "PENDING", etc.
  
  productId: number;
  productName: string;   
  
  width: number;
  height: number;
  sqFt: number;          
  totalSqft: number;          
  quantity: number;
  
  basePrice: number;
  ratePerPiece: number;
  extraCharge: number;
  amount: number;
  
  location: string;
  imageUrl: string;
}

interface LedgerState {
  entries: LedgerRow[];
  loading: boolean;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  
  // Filters
  filterCustomerId: string;
  filterStartDate: string;
  filterEndDate: string;
}

const initialState: LedgerState = {
  entries: [],
  loading: false,
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  pageSize: 20,
  filterCustomerId: '',
  filterStartDate: '',
  filterEndDate: '',
};

// --- Thunks ---

export const fetchLedgerEntries = createAsyncThunk(
  "ledgerSheet/fetch",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { ledgerSheet: LedgerState };
    const { currentPage, pageSize, filterCustomerId, filterStartDate, filterEndDate } = state.ledgerSheet;

    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("size", pageSize.toString());

      // Logic: Switch API based on filters
      const hasFilters = filterCustomerId || filterStartDate || filterEndDate;
      let endpoint = `${BASE_URL}/api/ledger/all`;

      if (hasFilters) {
        endpoint = `${BASE_URL}/api/ledger/filter`;
        if (filterStartDate) params.append("startDate", filterStartDate);
        if (filterEndDate) params.append("endDate", filterEndDate);
        if (filterCustomerId && filterCustomerId.trim() !== "") {
          params.append("customerId", filterCustomerId);
        }
      }

      const response = await axios.get(`${endpoint}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      toast.error("Failed to load ledger entries");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const ledgerSheetSlice = createSlice({
  name: "ledgerSheet",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setFilters: (state, action: PayloadAction<{ customerId?: string; startDate?: string; endDate?: string }>) => {
      if (action.payload.customerId !== undefined) state.filterCustomerId = action.payload.customerId;
      if (action.payload.startDate !== undefined) state.filterStartDate = action.payload.startDate;
      if (action.payload.endDate !== undefined) state.filterEndDate = action.payload.endDate;
      state.currentPage = 0;
    },
    resetFilters: (state) => {
      state.filterCustomerId = '';
      state.filterStartDate = '';
      state.filterEndDate = '';
      state.currentPage = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgerEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLedgerEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchLedgerEntries.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setPage, setFilters, resetFilters } = ledgerSheetSlice.actions;
export default ledgerSheetSlice.reducer;