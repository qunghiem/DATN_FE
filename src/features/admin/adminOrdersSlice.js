import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;



const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all orders with pagination and search
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAll",
  async (
    { page = 0, size = 10, status = null, keyword = "", fromDate = null, toDate = null },
    { rejectWithValue }
  ) => {
    try {
      const url = `${VITE_API_URL}/api/orders/search`;
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("size", size);

      if (keyword && keyword.trim() !== "") {
        params.append("keyword", keyword.trim());
      }

      if (status && status !== "") {
        params.append("status", status);
      }

      if (fromDate) {
        params.append("fromDate", fromDate);
      }

      if (toDate) {
        params.append("toDate", toDate);
      }

      const response = await axios.get(`${url}?${params.toString()}`, {
        headers: getAuthHeader(),
      });

      console.log("API URL:", `${url}?${params.toString()}`);
      console.log("API Response:", response.data);

      if (response.data.code === 1000 && response.data.result) {
        const result = response.data.result;
        
        return {
          orders: result.data || [],
          totalPages: result.totalPages || 1,
          totalElements: result.totalElements || 0,
          currentPage: result.page || page,
          pageSize: result.size || size,
        };
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
        `${VITE_API_URL}/api/orders/${orderId}/status`,
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
  searchKeyword: "",
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
    setSearchKeyword: (state, action) => {
      state.searchKeyword = action.payload;
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

export const { clearMessages, setFilterStatus, setSearchKeyword } =
  adminOrdersSlice.actions;

export default adminOrdersSlice.reducer;
