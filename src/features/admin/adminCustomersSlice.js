// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = '/api';

// const getAuthHeader = () => {
//   const token = localStorage.getItem('access_token');
//   return { Authorization: `Bearer ${token}` };
// };

// export const fetchAllCustomers = createAsyncThunk(
//   'adminCustomers/fetchAll',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_URL}/customers`, {
//         headers: getAuthHeader(),
//       });
//       return response.data.result;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
//     }
//   }
// );

// export const updateCustomerStatus = createAsyncThunk(
//   'adminCustomers/updateStatus',
//   async ({ customerId, status }, { rejectWithValue }) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/customers/${customerId}/status`,
//         { status },
//         { headers: getAuthHeader() }
//       );
//       return response.data.result;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
//     }
//   }
// );

// const initialState = {
//   customers: [],
//   isLoading: false,
//   error: null,
//   success: null,
// };

// const adminCustomersSlice = createSlice({
//   name: 'adminCustomers',
//   initialState,
//   reducers: {
//     clearMessages: (state) => {
//       state.error = null;
//       state.success = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllCustomers.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllCustomers.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.customers = action.payload;
//       })
//       .addCase(fetchAllCustomers.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(updateCustomerStatus.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(updateCustomerStatus.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const index = state.customers.findIndex(c => c.id === action.payload.id);
//         if (index !== -1) {
//           state.customers[index] = action.payload;
//         }
//         state.success = 'Cập nhật trạng thái khách hàng thành công';
//       })
//       .addCase(updateCustomerStatus.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearMessages } = adminCustomersSlice.actions;
// export default adminCustomersSlice.reducer;