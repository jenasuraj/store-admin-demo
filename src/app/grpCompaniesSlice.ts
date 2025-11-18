// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { RootState } from "@/app/store";
// import { BASE_URL } from "@/lib/constants";
// import axios from "axios";

// interface grpCompaniesType {
//   id: number;
//   groupCompanyName: string;
//   category: string;
//   extraFields: {
//     name: string;
//     type: string;
//     required: boolean;
//   }[];
// }

// interface grpCompaniesState {
//   entity: grpCompaniesType[] | null;
//   loading: boolean;
//   error: boolean;
// }
// const initialState: grpCompaniesState = {
//   entity: null,
//   loading: false,
//   error: false,
// };

// const fetchGrpCompanies = async () => {
//   try {
//     const res = await axios.get(`${BASE_URL}/api/allGroup`);
//     if (res.status === 200) {
//       return res.data;
//     } else {
//       console.error("Unexpected response status:", res.status);
//     }
//   } catch (error) {
//     console.error("Error fetching products:", error);
//   }
// };

// export const fetchGrpCompaniesAsync = createAsyncThunk(
//   "grpCompanies/getGrpCompanies",
//   async () => {
//     const response = await fetchGrpCompanies();
//     return response;
//   }
// );

// export const grpCompaniesSlice = createSlice({
//   name: "grpCompanies",
//   initialState,
//   reducers: {},
//   extraReducers(builder) {
//     builder
//       .addCase(fetchGrpCompaniesAsync.fulfilled, (state, action) => {
//         state.entity = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchGrpCompaniesAsync.rejected, (state) => {
//         state.loading = false;
//         state.error = true;
//       });
//   },
// });

// export const selectGrpCompaniesEntity = (state: RootState) =>
//   state.grpCompanies.entity;
// export const selectGrpCompaniesError = (state: RootState) =>
//   state.grpCompanies.error;
// export const selectGrpCompaniesLoading = (state: RootState) =>
//   state.grpCompanies.loading;

// export default grpCompaniesSlice.reducer;



import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";

interface grpCompaniesType {
  id: number;
  groupCompanyName: string;
  category: string;
  extraFields: {
    name: string;
    type: string;
    required: boolean;
  }[];
}

interface grpCompaniesState {
  entity: grpCompaniesType[] | null;
  loading: boolean;
  error: boolean;
}

const initialState: grpCompaniesState = {
  entity: null,
  loading: false,
  error: false,
};

const fetchGrpCompanies = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/allGroup`);
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Unexpected response status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchGrpCompaniesAsync = createAsyncThunk(
  "grpCompanies/getGrpCompanies",
  async () => {
    const response = await fetchGrpCompanies();
    return response;
  }
);

export const addGrpCompanyAsync = createAsyncThunk(
  "grpCompanies/addGrpCompany",
  async (companyData: {
    groupCompanyName: string;
    category: string;
    logoURL: string;
    qrData: string;
    authRequired: boolean;
    whatsApp: string;
    path: string;
    flowType: string;
    paymentURL: string;
  }) => {
    const res = await axios.post(
      `${BASE_URL}/store-uat/api/add`,
      companyData
    );
    return res.data;
  }
);

export const updateGrpCompanyAsync = createAsyncThunk(
  "grpCompanies/updateGrpCompany",
  async ({
    groupCompanyId,
    companyData,
  }: {
    groupCompanyId: number;
    companyData: {
      groupCompanyName: string;
      logoURL: string;
      authRequired: boolean;
      whatsApp: string;
    };
  }) => {
    const res = await axios.post(
      `${BASE_URL}/api/update/${groupCompanyId}`,
      companyData
    );
    return res.data;
  }
);

export const createAdminAsync = createAsyncThunk(
  "grpCompanies/createAdmin",
  async (adminData: {
    username: string;
    password: string;
    groupCompanyId: number;
  }) => {
    const res = await axios.post(`${BASE_URL}/API/saveAdmin`, adminData);
    return res.data;
  }
);

export const grpCompaniesSlice = createSlice({
  name: "grpCompanies",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchGrpCompaniesAsync.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.loading = false;
      })
      .addCase(fetchGrpCompaniesAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(addGrpCompanyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGrpCompanyAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addGrpCompanyAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(updateGrpCompanyAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGrpCompanyAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateGrpCompanyAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(createAdminAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAdminAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createAdminAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const selectGrpCompaniesEntity = (state: RootState) =>
  state.grpCompanies.entity;
export const selectGrpCompaniesError = (state: RootState) =>
  state.grpCompanies.error;
export const selectGrpCompaniesLoading = (state: RootState) =>
  state.grpCompanies.loading;

export default grpCompaniesSlice.reducer;
