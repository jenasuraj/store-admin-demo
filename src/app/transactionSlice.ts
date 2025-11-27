import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

export interface Transaction {
  amount: number;
  paymentMode: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
  description: string;
  imgUrl: string;
  date: string; 
  customerName: string;
  customerId: number;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  // Filters
  filterCustomerId: string;
  filterStartDate: string;
  filterEndDate: string;
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  filterCustomerId: '',
  filterStartDate: '',
  filterEndDate: '',
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
};

// --- Thunk ---

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { transaction: TransactionState };
    const { 
      filterCustomerId, 
      filterStartDate, 
      filterEndDate, 
      currentPage, 
      pageSize 
    } = state.transaction;

    try {
      // Determine which endpoint to use based on filters
      const hasFilters = filterCustomerId || filterStartDate || filterEndDate;
      const endpoint = hasFilters 
        ? `${BASE_URL}/api/payments/filter?sortField=id&direction=desc` 
        : `${BASE_URL}/api/payments/ledgerPayments?sortField=id&direction=desc`;

      // Build Query Params
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (hasFilters) {
        if (filterCustomerId) params.customerId = filterCustomerId;
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;
      }

      const response = await axios.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch transactions");
    }
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setTransactionFilters: (state, action: PayloadAction<{ customerId?: string; startDate?: string; endDate?: string }>) => {
      if (action.payload.customerId !== undefined) state.filterCustomerId = action.payload.customerId;
      if (action.payload.startDate !== undefined) state.filterStartDate = action.payload.startDate;
      if (action.payload.endDate !== undefined) state.filterEndDate = action.payload.endDate;
      
      // Reset to page 0 when filters change
      state.currentPage = 0;
    },
    resetTransactionFilters: (state) => {
      state.filterCustomerId = '';
      state.filterStartDate = '';
      state.filterEndDate = '';
      state.currentPage = 0;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 0; // Reset to first page on size change
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        // Map API response fields to state
        state.transactions = action.payload.content || [];
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
        state.currentPage = action.payload.number || 0;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        toast.error("Failed to load transactions");
        console.error("Transaction Fetch Error:", action.payload);
      });
  },
});

export const { 
  setTransactionFilters, 
  resetTransactionFilters, 
  setPage, 
  setPageSize 
} = transactionSlice.actions;

export default transactionSlice.reducer;