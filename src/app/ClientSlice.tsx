


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from './store';

export interface Client {
  id: number;
  groupCompanyName: string;
}

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXN0ZXIiLCJhdXRob3JpdHlJZCI6MSwiaWF0IjoxNzc2NDIwMzQxLCJleHAiOjE3NzkwMTIzNDF9.QdhNOxggWwJXi83x0vupOb9o1XxqLDxVOSkxDs4DgsA';


// ✅ async thunk
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async () => {
    const { data } = await axios.get(
      'https://store-admin-uat.actifyzone.com/store-uat/api/getAllgroup',
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    return data.map((item: any) => ({
      id: item.id,
      groupCompanyName: item.groupCompanyName,
    }));
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},

  // ✅ auto handles loading/success/error
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.error = action.error.message || 'Failed';
        state.loading = false;
      });
  },
});

export const selectClients = (state: RootState) => state.clients.clients;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsError = (state: RootState) => state.clients.error;

export default clientsSlice.reducer;