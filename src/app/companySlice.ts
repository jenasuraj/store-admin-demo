import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";

interface companiesType {
  id: number;
  companyName: string;
  groupCompanyId: number;
}

interface companiesState {
  entity: companiesType[] | null;
  loading: boolean;
  error: boolean;
}
const initialState: companiesState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchCompanies = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/allCompany`);
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchCompaniesAsync = createAsyncThunk(
  "companies/getCompanies",
  async () => {
    const response = await fetchCompanies();
    return response;
  }
);

export const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCompaniesAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.loading = false;
      })
      .addCase(fetchCompaniesAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectCompaniesEntity = (state: RootState) =>
  state.companies.entity;
export const selectCompaniesError = (state: RootState) => state.companies.error;
export const selectCompaniesLoading = (state: RootState) =>
  state.companies.loading;

export default companiesSlice.reducer;
