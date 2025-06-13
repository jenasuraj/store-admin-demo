import { RootState } from "@/app/store";
import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "@/lib/constants";
import { PromoResponse } from "@/Features/PromoCode/type";

export interface promoCodeState {
  entity: PromoResponse | null;
  loading: boolean;
  error: boolean;
}

const initialState: promoCodeState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchPromo = async (attribute: string | null) => {
  try {
    const res = await axios.get(
      attribute
        ? `${BASE_URL}/api/promoCode/list${attribute}`
        : `${BASE_URL}/api/promoCode/list`
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

export const fetchPromoAsync = createAsyncThunk<
  PromoResponse,
  string | null
>("promo/getPromo", async (attribute) => {
  const res = await fetchPromo(attribute || "");
  return res;
});

export const promoSlice = createSlice({
  name: "promo",
  initialState,
  reducers: {
    sortedDiscount: (state, action) => {
      state.entity = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPromoAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })

      .addCase(fetchPromoAsync.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export const { sortedDiscount } = promoSlice.actions;

export const selectPromoEntity = (state: RootState) => state.promo.entity;
export const selectPromoError = (state: RootState) => state.promo.error;
export const selectPromoLoading = (state: RootState) => state.promo.loading;

export default promoSlice.reducer;
