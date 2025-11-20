import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all orders with pagination
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAll",
  async ({ page = 0, size = 10, status = null, keyword = "" }, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/orders`;

      if (keyword) {
        url = `${API_URL}/orders/search?keyword=${keyword}&page=${page}&size=${size}`;
      } else {
        url += `?page=${page}&size=${size}`;
      }

      if (status) {
        url += `&status=${status}`;
      }

      const response = await axios.get(url, { headers: getAuthHeader() });

      if (response.data.code === 1000) {
        const result = response.data.result;

        if (result && result.data) {
          return {
            orders: result.data,
            totalPages: result.totalPages || 1,
            totalElements: result.totalElements || result.data.length,
            currentPage: result.page || page,
            pageSize: result.size || size,
          };
        } else if (Array.isArray(result)) {
          return {
            orders: result,
            totalPages: 1,
            totalElements: result.length,
            currentPage: page,
            pageSize: size,
          };
        } else {
          return {
            orders: [result],
            totalPages: 1,
            totalElements: 1,
            currentPage: page,
            pageSize: size,
          };
        }
      }

      return rejectWithValue(response.data.message || "Có lỗi xảy ra");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Có lỗi xảy ra"
      );
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { headers: getAuthHeader() }
      );

      console.log("Update status response:", response.data);

      if (response.data.code === 1000) {
        return response.data.result;
      }

      return rejectWithValue(response.data.message || "Có lỗi xảy ra");
    } catch (error) {
      console.error("Update status error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Có lỗi xảy ra"
      );
    }
  }
);

const initialState = {
  orders: [],
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  filterStatus: null,
  isLoading: false,
  error: null,
  success: null,
};

const adminOrdersSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orders = [];
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.success = "Cập nhật trạng thái đơn hàng thành công";
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, setFilterStatus } = adminOrdersSlice.actions;

export default adminOrdersSlice.reducer;
