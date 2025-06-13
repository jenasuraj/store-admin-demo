import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";
import { Returns } from "@/Features/Returns/type";

interface ReturnHistoryState {
  entity: Returns;
  loading: boolean;
  error: boolean;
}
const initialState: ReturnHistoryState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchReturn = async (attribute: any) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/returns/admin${attribute || ""}`
    );
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchReturnAsync = createAsyncThunk(
  "return/getReturn",
  async (params: string) => {
    try {
      const response = await fetchReturn(params);
      const modifiedContent = response.content?.map((d) => ({
        ...d,
        customerName: `${d.firstName} ${d.lastName}`,
      }));

      return {
        ...response, // totalPages, pageable, etc.
        content: modifiedContent, // overwrite content with the modified one
      };
    } catch (error) {}
  }
);

export const returnSlice = createSlice({
  name: "return",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchReturnAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })
      .addCase(fetchReturnAsync.pending, (state) => {
        state.loading = false;
        state.error = false;
      })
      .addCase(fetchReturnAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectReturnEntity = (state: RootState) => state.return.entity;
export const selectReturnError = (state: RootState) => state.return.error;
export const selectReturnLoading = (state: RootState) => state.return.loading;

export default returnSlice.reducer;
