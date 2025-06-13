import { RootState } from "@/app/store";
import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "@/lib/constants";
import { DiscountResponse } from "@/Features/Discounts/type";

export interface discountState {
  entity: DiscountResponse | null;
  loading: boolean;
  error: boolean;
}

const initialState: discountState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchDiscount = async (attribute: string | null) => {
  try {
    const res = await axios.get(
      attribute
        ? `${BASE_URL}/api/discount/discountList${attribute}`
        : `${BASE_URL}/api/discount/discountList`
    );
    if (res.status === 200) {
      const formattedData = {
        ...res.data,
        content: res.data.content.map((d) => ({
          ...d,
          valueType: d.valueType === "PERCENTAGE" ? "Percentage" : "Amount",
          discountOn: d.discountOn === "PRODUCT" ? "Product" : "Collection",
        })),
      };
      return res.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) throw error?.response?.data;
    else throw "Something went wrong!";
  }
};

export const fetchDiscountAsync = createAsyncThunk<
  DiscountResponse,
  string | null
>("discount/getDiscount", async (attribute) => {
  const res = await fetchDiscount(attribute || "");
  return res;
});

export const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    sortedDiscount: (state, action) => {
      state.entity = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })

      .addCase(fetchDiscountAsync.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export const { sortedDiscount } = discountSlice.actions;

export const selectDiscountEntity = (state: RootState) => state.discount.entity;
export const selectDiscountError = (state: RootState) => state.discount.error;
export const selectDiscountLoading = (state: RootState) =>
  state.discount.loading;

export default discountSlice.reducer;
