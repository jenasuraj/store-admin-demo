import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";
import { Exchange, Exchanges } from "@/Features/Exchange/type";

interface ExchangeState {
  entity: Exchanges | null;
  loading: boolean;
  error: boolean;
}
const initialState: ExchangeState = {
  entity: null,
  loading: true,
  error: false,
};

const fetchExchange = async (attribute: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/exchange/admin${attribute}`);
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchExchangeAsync = createAsyncThunk(
  "exchange/getExchange",
  async (params: string ) => {
    try {
      const response = await fetchExchange(params || "");
      const formattedData = {
        ...response,
        content: response.content?.map((d: Exchange) => ({
          ...d,
          customerName: `${d.firstName} ${d.lastName}`,
        })),
      };

      return formattedData;
    } catch (error) {
      console.error("Error fetching exchange data:", error);
      throw error;
    }
  }
);

export const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchExchangeAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchExchangeAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectExchangeEntity = (state: RootState) => state.exchange.entity;
export const selectExchangeError = (state: RootState) => state.exchange.error;
export const selectExchangeLoading = (state: RootState) =>
  state.exchange.loading;

export default exchangeSlice.reducer;
