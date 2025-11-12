// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = '/api';

// const getAuthHeader = () => {
//   const token = localStorage.getItem('access_token');
//   return { Authorization: `Bearer ${token}` };
// };

// export const fetchRevenueStats = createAsyncThunk(
//   'adminRevenue/fetchStats',
//   async ({ period, startDate, endDate }, { rejectWithValue }) => {
//     try {
//       const params = { period };
//       if (startDate && endDate) {
//         params.startDate = startDate;
//         params.endDate = endDate;
//       }
//       const response = await axios.get(`${API_URL}/revenue`, {
//         headers: getAuthHeader(),
//         params,
//       });
//       return response.data.result;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
//     }
//   }
// );

// export const fetchDashboardStats = createAsyncThunk(
//   'adminRevenue/fetchDashboard',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_URL}/dashboard`, {
//         headers: getAuthHeader(),
//       });
//       return response.data.result;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
//     }
//   }
// );

// const initialState = {
//   stats: null,
//   dashboardData: null,
//   isLoading: false,
//   error: null,
// };

// const adminRevenueSlice = createSlice({
//   name: 'adminRevenue',
//   initialState,
//   reducers: {
//     clearMessages: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchRevenueStats.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchRevenueStats.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.stats = action.payload;
//       })
//       .addCase(fetchRevenueStats.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(fetchDashboardStats.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboardStats.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.dashboardData = action.payload;
//       })
//       .addCase(fetchDashboardStats.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearMessages } = adminRevenueSlice.actions;
// export default adminRevenueSlice.reducer;