import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chat';

// Async thunks
export const initChat = createAsyncThunk(
  'chat/init',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/init`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const getRoomMessages = createAsyncThunk(
  'chat/getRoomMessages',
  async (roomId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.code === 1000) {
        return { roomId, messages: response.data.result };
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (roomId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_URL}/rooms/${roomId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.code === 200 || response.data.code === 1000) {
        return roomId;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Initial state
const initialState = {
  userRole: null,
  roomId: null,
  chatRooms: [],
  messages: [],
  currentRoomMessages: [],
  isLoading: false,
  error: null,
  isConnected: false,
  unreadCount: 0,
};

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      
      // Nếu là EMPLOYEE: thêm vào currentRoomMessages nếu đúng room
      if (state.userRole === 'EMPLOYEE') {
        if (state.roomId === message.roomId) {
          // Kiểm tra xem message đã tồn tại chưa
          const exists = state.currentRoomMessages.some(m => m.id === message.id);
          if (!exists) {
            state.currentRoomMessages.push(message);
          }
        }
        
        // Cập nhật chatRooms list
        const roomIndex = state.chatRooms.findIndex(r => r.roomId === message.roomId);
        if (roomIndex !== -1) {
          state.chatRooms[roomIndex].lastMessage = message.content;
          state.chatRooms[roomIndex].lastMessageTime = message.createdAt;
          
          // Tăng unreadCount nếu không phải room đang mở và không phải tin nhắn của mình
          if (state.roomId !== message.roomId && message.senderRole === 'CUSTOMER') {
            state.chatRooms[roomIndex].unreadCount = (state.chatRooms[roomIndex].unreadCount || 0) + 1;
          }
          
          // Đưa room lên đầu danh sách
          const room = state.chatRooms.splice(roomIndex, 1)[0];
          state.chatRooms.unshift(room);
        }
      } 
      // Nếu là CUSTOMER: luôn thêm vào messages
      else {
        const exists = state.messages.some(m => m.id === message.id);
        if (!exists) {
          state.messages.push(message);
        }
      }
    },
    setCurrentRoom: (state, action) => {
      state.roomId = action.payload;
    },
    clearCurrentRoomMessages: (state) => {
      state.currentRoomMessages = [];
    },
    updateRoomUnreadCount: (state, action) => {
      const { roomId, count } = action.payload;
      const room = state.chatRooms.find(r => r.roomId === roomId);
      if (room) {
        room.unreadCount = count;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Init Chat
    builder
      .addCase(initChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRole = action.payload.userRole;
        
        if (action.payload.userRole === 'CUSTOMER') {
          state.roomId = action.payload.roomId;
          state.messages = action.payload.messages || [];
        } else if (action.payload.userRole === 'EMPLOYEE') {
          state.chatRooms = action.payload.chatRooms || [];
        }
      })
      .addCase(initChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Room Messages
    builder
      .addCase(getRoomMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoomMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoomMessages = action.payload.messages;
        state.roomId = action.payload.roomId;
      })
      .addCase(getRoomMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Mark as Read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const roomId = action.payload;
        const room = state.chatRooms.find(r => r.roomId === roomId);
        if (room) {
          room.unreadCount = 0;
        }
      });
  },
});

export const { 
  setConnected, 
  addMessage, 
  setCurrentRoom, 
  clearCurrentRoomMessages,
  updateRoomUnreadCount,
  clearError 
} = chatSlice.actions;

export default chatSlice.reducer;