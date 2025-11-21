// // import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// // import { BASE_URL } from "../lib/constants";
// // import axios from "axios";
// // import { toast } from "sonner";

// // export interface PriceListProduct {
// //   price: number;
// //   productName: string;
// //   basePrice: number;
// //   productId: number;
// // }

// // export interface PriceList {
// //   id: number;
// //   userid: number;
// //   name: string;
// //   productPrices: PriceListProduct[];
// //   firstname?: string;
// // }

// // interface PriceListState {
// //   priceLists: PriceList[];
// //   loading: boolean;
// //   error: any;
// // }

// // const initialState: PriceListState = {
// //   priceLists: [],
// //   loading: false,
// //   error: null,
// // };

// // export const fetchPriceLists = createAsyncThunk(
// //   "priceList/fetchAll",
// //   async (_, thunkAPI) => {
// //     try {
// //       const response = await axios.get(`${BASE_URL}/api/pricelist/all`);
// //       if (response.status === 200) {
// //         return response.data;
// //       }
// //       return thunkAPI.rejectWithValue(response.data);
// //     } catch (error: any) {
// //       toast.error("Failed to fetch price lists");
// //       return thunkAPI.rejectWithValue(error.response?.data || error.message);
// //     }
// //   }
// // );

// // export const createPriceList = createAsyncThunk(
// //   "priceList/create",
// //   async (data: Omit<PriceList, "id">, thunkAPI) => {
// //     try {
// //       const response = await axios.post(`${BASE_URL}/api/pricelist/create`, data);
// //       if (response.status === 200 || response.status === 201) {
// //         toast.success("Price list created successfully");
// //         return response.data;
// //       }
// //       return thunkAPI.rejectWithValue(response.data);
// //     } catch (error: any) {
// //       toast.error("Failed to create price list");
// //       return thunkAPI.rejectWithValue(error.response?.data || error.message);
// //     }
// //   }
// // );

// // export const deletePriceList = createAsyncThunk(
// //   "priceList/delete",
// //   async (id: string, thunkAPI) => {
// //     try {
// //       const response = await axios.delete(`${BASE_URL}/api/pricelist/delete/${id}`);
// //       if (response.status === 200) {
// //         toast.success("Price list deleted successfully");
// //         return id;
// //       }
// //       return thunkAPI.rejectWithValue(response.data);
// //     } catch (error: any) {
// //       toast.error("Failed to delete price list");
// //       return thunkAPI.rejectWithValue(error.response?.data || error.message);
// //     }
// //   }
// // );

// // const priceListSlice = createSlice({
// //   name: "priceList",
// //   initialState,
// //   reducers: {},
// //   extraReducers: (builder) => {
// //     // Fetch
// //     builder.addCase(fetchPriceLists.pending, (state) => {
// //       state.loading = true;
// //     });
// //     builder.addCase(fetchPriceLists.fulfilled, (state, action) => {
// //       state.loading = false;
// //       state.priceLists = action.payload;
// //     });
// //     builder.addCase(fetchPriceLists.rejected, (state, action) => {
// //       state.loading = false;
// //       state.error = action.payload;
// //     });

// //     // Create
// //     builder.addCase(createPriceList.pending, (state) => {
// //       state.loading = true;
// //     });
// //     builder.addCase(createPriceList.fulfilled, (state, action) => {
// //       state.loading = false;
// //       state.priceLists.push(action.payload);
// //     });
// //     builder.addCase(createPriceList.rejected, (state, action) => {
// //       state.loading = false;
// //       state.error = action.payload;
// //     });

// //     // Delete
// //     builder.addCase(deletePriceList.fulfilled, (state, action) => {
// //       state.priceLists = state.priceLists.filter((list) => `${ list.id }` !== action.payload);
// //     });
// //   },
// // });

// // export default priceListSlice.reducer;


// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { BASE_URL } from "../lib/constants";
// import axios from "axios";
// import { toast } from "sonner";

// // --- Types ---

// export interface PriceListProductRequest {
//   productId: number;
//   price: number;
// }

// export interface CreatePriceListRequest {
//   name: string;
//   userId: number;
//   productPrices: PriceListProductRequest[];
// }

// export interface PriceListProductResponse {
//   price: number;
//   productName: string;
//   basePrice: number;
//   productId: number;
// }

// export interface PriceList {
//   id: number;
//   userid: number;
//   name: string;
//   productPrices: PriceListProductResponse[];
//   firstname?: string;
// }

// interface PriceListState {
//   priceLists: PriceList[];
//   loading: boolean;
//   error: any;
// }

// const initialState: PriceListState = {
//   priceLists: [],
//   loading: false,
//   error: null,
// };

// // --- Thunks ---

// export const fetchPriceLists = createAsyncThunk(
//   "priceList/fetchAll",
//   async (_, thunkAPI) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/pricelist/all`);
//       return response.data;
//     } catch (error: any) {
//       toast.error("Failed to fetch price lists");
//       return thunkAPI.rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const createPriceList = createAsyncThunk(
//   "priceList/create",
//   async (data: CreatePriceListRequest, thunkAPI) => {
//     try {
//       const response = await axios.post(`${BASE_URL}/api/pricelist/create`, data);
//       if (response.status === 200 || response.status === 201) {
//         toast.success("Price list created successfully");
//         return response.data;
//       }
//       return thunkAPI.rejectWithValue(response.data);
//     } catch (error: any) {
//       toast.error("Failed to create price list");
//       return thunkAPI.rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const deletePriceList = createAsyncThunk(
//   "priceList/delete",
//   async (id: string, thunkAPI) => {
//     try {
//       const response = await axios.delete(`${BASE_URL}/api/pricelist/delete/${id}`);
//       if (response.status === 200) {
//         toast.success("Price list deleted successfully");
//         return id;
//       }
//       return thunkAPI.rejectWithValue(response.data);
//     } catch (error: any) {
//       toast.error("Failed to delete price list");
//       return thunkAPI.rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // --- Slice ---

// const priceListSlice = createSlice({
//   name: "priceList",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     // Fetch
//     builder.addCase(fetchPriceLists.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(fetchPriceLists.fulfilled, (state, action) => {
//       state.loading = false;
//       state.priceLists = action.payload;
//     });
//     builder.addCase(fetchPriceLists.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });

//     // Create
//     builder.addCase(createPriceList.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(createPriceList.fulfilled, (state, action) => {
//       state.loading = false;
//       // Assuming backend returns the created object
//       state.priceLists.push(action.payload);
//     });
//     builder.addCase(createPriceList.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });

//     // Delete
//     builder.addCase(deletePriceList.fulfilled, (state, action) => {
//       state.priceLists = state.priceLists.filter((list) => `${list.id}` !== action.payload);
//     });
//   },
// });

// export default priceListSlice.reducer;


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "../lib/constants";
import axios from "axios";
import { toast } from "sonner";

// --- Types ---

export interface PriceListProductRequest {
  productId: number;
  price: number;
}

export interface CreatePriceListRequest {
  name: string;
  userId: number;
  productPrices: PriceListProductRequest[];
}

export interface UpdatePriceListRequest {
  id: number;
  data: CreatePriceListRequest; // Same payload structure as create
}

export interface PriceListProductResponse {
  price: number;
  productName: string;
  basePrice: number;
  productId: number;
}

export interface PriceList {
  id: number;
  userid: number;
  name: string;
  productPrices: PriceListProductResponse[];
  firstname?: string;
}

interface PriceListState {
  priceLists: PriceList[];
  loading: boolean;
  error: any;
}

const initialState: PriceListState = {
  priceLists: [],
  loading: false,
  error: null,
};

// --- Thunks ---

export const fetchPriceLists = createAsyncThunk(
  "priceList/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/pricelist/all`);
      return response.data;
    } catch (error: any) {
      toast.error("Failed to fetch price lists");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPriceList = createAsyncThunk(
  "priceList/create",
  async (data: CreatePriceListRequest, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/pricelist/create`, data);
      if (response.status === 200 || response.status === 201) {
        toast.success("Price list created successfully");
        // REFETCH as per requirement: "reftech the pricelists data... dont take the response"
        thunkAPI.dispatch(fetchPriceLists());
        return response.data;
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to create price list");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePriceList = createAsyncThunk(
  "priceList/update",
  async ({ id, data }: UpdatePriceListRequest, thunkAPI) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/pricelist/update/${id}`, data);
      if (response.status === 200) {
        toast.success("Price list updated successfully");
        // REFETCH to get the updated list state
        thunkAPI.dispatch(fetchPriceLists());
        return response.data;
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to update price list");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePriceList = createAsyncThunk(
  "priceList/delete",
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/pricelist/delete/${id}`);
      if (response.status === 200) {
        toast.success("Price list deleted successfully");
        return id;
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to delete price list");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Slice ---

const priceListSlice = createSlice({
  name: "priceList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchPriceLists.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPriceLists.fulfilled, (state, action) => {
      state.loading = false;
      state.priceLists = action.payload;
    });
    builder.addCase(fetchPriceLists.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createPriceList.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createPriceList.fulfilled, (state) => {
      state.loading = false;
      // We do NOT push payload here, we rely on the dispatched fetchPriceLists
    });
    builder.addCase(createPriceList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update
    builder.addCase(updatePriceList.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updatePriceList.fulfilled, (state) => {
      state.loading = false;
      // We do NOT update state manually, we rely on the dispatched fetchPriceLists
    });
    builder.addCase(updatePriceList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete
    builder.addCase(deletePriceList.fulfilled, (state, action) => {
      state.priceLists = state.priceLists.filter((list) => `${list.id}` !== action.payload);
    });
  },
});

export default priceListSlice.reducer;