import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";

interface branchType {
  id: number;
  groupCompanyId: number;
  companyId: number;
  locationId: number;
  branchName: string;
}

interface branchCompaniesState {
  entity: branchType[] | null;
  loading: boolean;
  error: boolean;
}
const initialState: branchCompaniesState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchBranchCompanies = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/allBranch`);
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchBranchCompaniesAsync = createAsyncThunk(
  "branchCompanies/getBranchCompanies",
  async () => {
    const response = await fetchBranchCompanies();
    return response;
  }
);

export const branchCompaniesSlice = createSlice({
  name: "branchCompanies",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBranchCompaniesAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.loading = false;
      })
      .addCase(fetchBranchCompaniesAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectBranchCompaniesEntity = (state: RootState) =>
  state.branchCompanies.entity;
export const selectBranchCompaniesError = (state: RootState) =>
  state.branchCompanies.error;
export const selectBranchCompaniesLoading = (state: RootState) =>
  state.branchCompanies.loading;

export default branchCompaniesSlice.reducer;
