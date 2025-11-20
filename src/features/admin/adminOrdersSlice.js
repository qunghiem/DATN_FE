import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all orders with pagination and search
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAll",
  async (
    { page = 0, size = 10, status = null, keyword = "" },
    { rejectWithValue }
  ) => {
    try {
      let url = `${API_URL}/orders`;
      const params = new URLSearchParams();

      // Nếu có keyword thì dùng API search
      if (keyword && keyword.trim() !== "") {
        url = `${API_URL}/orders/search`;
        params.append("keyword", keyword.trim());
        params.append("page", page);
        params.append("size", size);
        // ✅ Không gửi status khi search
      } else {
        // Không có keyword thì dùng API thông thường
        params.append("page", page);
        params.append("size", size);
        if (status) {
          params.append("status", status);
        }
      }

      const response = await axios.get(`${url}?${params.toString()}`, {
        headers: getAuthHeader(),
      });

      console.log("API URL:", `${url}?${params.toString()}`);
      console.log("Keyword:", keyword);
      console.log("API Response:", response.data);

      // Trường hợp 1: Response có code và result (API thông thường)
      if (response.data.code === 1000) {
        const result = response.data.result;

        console.log("Result:", result);

        // Result có cấu trúc pagination
        if (result && result.data) {
          return {
            orders: result.data,
            totalPages: result.totalPages || 1,
            totalElements: result.totalElements || result.data.length,
            currentPage: result.page || page,
            pageSize: result.size || size,
          };
        }
        // Result là array trực tiếp
        else if (Array.isArray(result)) {
          return {
            orders: result,
            totalPages: 1,
            totalElements: result.length,
            currentPage: page,
            pageSize: size,
          };
        }
        // Result là object đơn
        else {
          return {
            orders: [result],
            totalPages: 1,
            totalElements: 1,
            currentPage: page,
            pageSize: size,
          };
        }
      }

      // Trường hợp 2: Response trả về trực tiếp (API search không có code wrapper)
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        console.log("Direct response with data array");
        return {
          orders: response.data.data,
          totalPages: response.data.totalPages || 1,
          totalElements:
            response.data.totalElements || response.data.data.length,
          currentPage: response.data.page || page,
          pageSize: response.data.size || size,
        };
      }

      console.error("Unexpected response format:", response.data);
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
