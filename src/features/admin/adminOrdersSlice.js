// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = '/api';

// const getAuthHeader = () => {
//   const token = localStorage.getItem('access_token');
//   return { Authorization: `Bearer ${token}` };
// };

// export const fetchAllOrders = createAsyncThunk(
//   'adminOrders/fetchAll',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_URL}/orders`, {
//         headers: getAuthHeader(),
//       });
//       return response.data.result;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
//     }
//   }
// );

// export const updateOrderStatus = createAsyncThunk(
//   'adminOrders/updateStatus',
//   async ({ orderId, status }, { rejectWithValue }) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/orders/${orderId}/status`,
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
//   orders: [],
//   isLoading: false,
//   error: null,
//   success: null,
// };

// const adminOrdersSlice = createSlice({
//   name: 'adminOrders',
//   initialState,
//   reducers: {
//     clearMessages: (state) => {
//       state.error = null;
//       state.success = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllOrders.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllOrders.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orders = action.payload;
//       })
//       .addCase(fetchAllOrders.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(updateOrderStatus.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(updateOrderStatus.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const index = state.orders.findIndex(o => o.id === action.payload.id);
//         if (index !== -1) {
//           state.orders[index] = action.payload;
//         }
//         state.success = 'Cập nhật trạng thái đơn hàng thành công';
//       })
//       .addCase(updateOrderStatus.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearMessages } = adminOrdersSlice.actions;
// export default adminOrdersSlice.reducer;