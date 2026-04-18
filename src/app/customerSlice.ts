import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "../lib/constants";
import axios from "axios";
import { toast } from "sonner";

export interface Customer {
  id: string;
  firstname: string;
  number: string;
  address: string;
  aadharCard: string;
  createdAt?: string;
  localAddress?: string;
  height: string;
  width: string;
  basePrice: string;
  sqFt: string;
  customerId?: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: any;
  uploadProgress: number;
  uploadedAadharUrl: string | null;
  isUploading: boolean;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  uploadProgress: 0,
  uploadedAadharUrl: null,
  isUploading: false,
};

export const createCustomer = createAsyncThunk(
  "customer/create",
  async (data: Omit<Customer, "id">, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/create`, data);
      if (response.status === 200 || response.status === 201) {
        toast.success("Customer created successfully");
        return response.data;
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to create customer");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const uploadAadhar = createAsyncThunk(
  "customer/uploadAadhar",
  async (file: File, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${BASE_URL}/api/user/upload?folder=aadhar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            thunkAPI.dispatch(setUploadProgress(progress));
          },
        },
      );

      if (response.status === 200) {
        toast.success("Aadhar uploaded successfully");
        return response.data.url; // Assuming API returns { url: "..." }
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to upload Aadhar");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteAadhar = createAsyncThunk(
  "customer/deleteAadhar",
  async (url: string, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/user/delete-blob?url=${url}`,
      );
      if (response.status === 200) {
        toast.success("Aadhar deleted successfully");
        return url;
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to delete Aadhar");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, data }: { id: string; data: Partial<Customer> }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/user/update/${id}`,
        data,
      );
      if (response.status === 200) {
        toast.success("Customer updated successfully");
        return response.data;
      }
      return thunkAPI.rejectWithValue(response.data);
    } catch (error: any) {
      toast.error("Failed to update customer");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchCustomers = createAsyncThunk(
  "customer/fetchMixed",
  async ({ search = "" }: { search?: string }, thunkAPI) => {
    try {
      if (search.trim().length > 0) {
        const encoded = encodeURIComponent(search.trim());

        const res = await axios.get(
          `${BASE_URL}/api/user/search?keyword=${encoded}`,
        );

        return { type: "search", data: res.data };
      } else {
        const res = await axios.get(`${BASE_URL}/api/user/list`);
        return { type: "list", data: res.data };
      }
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetCustomerState: (state) => {
      state.uploadedAadharUrl = null;
      state.uploadProgress = 0;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Create Customer
    builder.addCase(createCustomer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.uploadedAadharUrl = null; // Reset after success
      state.uploadProgress = 0;
    });
    builder.addCase(createCustomer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Upload Aadhar
    builder.addCase(uploadAadhar.pending, (state) => {
      state.isUploading = true;
      state.uploadProgress = 0;
    });
    builder.addCase(uploadAadhar.fulfilled, (state, action) => {
      state.isUploading = false;
      state.uploadedAadharUrl = action.payload;
      state.uploadProgress = 100;
    });
    builder.addCase(uploadAadhar.rejected, (state, action) => {
      state.isUploading = false;
      state.error = action.payload;
      state.uploadProgress = 0;
    });

    // Delete Aadhar
    builder.addCase(deleteAadhar.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteAadhar.fulfilled, (state) => {
      state.loading = false;
      state.uploadedAadharUrl = null;
      state.uploadProgress = 0;
    });
    builder.addCase(deleteAadhar.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Customer
    builder.addCase(updateCustomer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.uploadedAadharUrl = null;
      state.uploadProgress = 0;
    });
    builder.addCase(updateCustomer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Customers
    builder.addCase(fetchCustomers.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.loading = false;

      const { type, data } = action.payload;

      const normalized = (Array.isArray(data) ? data : []).map((c: any) => ({
        id: (c.id || c.customerId)?.toString(),
        customerId: c.customerId,
        firstname: c.firstname,
        number: c.number,
        address: c.address,
        aadharCard: c.aadharCard,
      }));

      state.customers = normalized;
    });

    builder.addCase(fetchCustomers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setUploadProgress, resetCustomerState } = customerSlice.actions;
export default customerSlice.reducer;
