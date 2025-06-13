import { RootState } from "@/app/store";
import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "@/lib/constants";
import { OfferResponse } from "@/Features/Offer/type";

export interface offerState {
  entity: OfferResponse | null;
  loading: boolean;
  error: boolean;
}

const initialState: offerState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchOffer = async (attribute: string | null) => {
  try {
    const res = await axios.get(
      attribute
        ? `${BASE_URL}/api/offer/all${attribute}`
        : `${BASE_URL}/api/offer/all`
    );
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) throw error?.response?.data;
    else throw "Something went wrong!";
  }
};

export const fetchOfferAsync = createAsyncThunk<
  OfferResponse,
  string | null
>("offer/getOffer", async (attribute) => {
  const res = await fetchOffer(attribute || "");
  return res;
});

export const offerSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {
    sortedOffer: (state, action) => {
      state.entity = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchOfferAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.error = false;
        state.loading = false;
      })

      .addCase(fetchOfferAsync.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export const { sortedOffer } = offerSlice.actions;

export const selectOfferEntity = (state: RootState) => state.offer.entity;
export const selectOfferError = (state: RootState) => state.offer.error;
export const selectOfferLoading = (state: RootState) => state.offer.loading;

export default offerSlice.reducer;
