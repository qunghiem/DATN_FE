import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Search,
  LogOut,
  User
} from 'lucide-react';
import { 
  initChat, 
  getRoomMessages, 
  addMessage, 
  markAsRead,
  setCurrentRoom 
} from '../features/chat/chatSlice';
import { logout } from '../features/auth/authSlice';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import logo from '../assets/logo.png';

const EmployeeChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatRooms, currentRoomMessages, roomId, isLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  
  const [messageInput, setMessageInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentRoomMessages]);

  // Init chat khi component mount
  useEffect(() => {
    if (user) {
      dispatch(initChat());
    }
  }, [dispatch, user]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      console.log('🔌 Connecting WebSocket...');
      const token = localStorage.getItem('access_token');
      const socket = new SockJS('http://localhost:8080/ws-chat');
      const client = Stomp.over(socket);
      
      client.debug = null;

      client.connect(
        { 'Authorization': `Bearer ${token}` },
        (frame) => {
          console.log('✅ WebSocket connected');
          console.log('📋 Frame:', frame);
          setIsConnected(true);
          setStompClient(client);

          // Subscribe để nhận tin nhắn
          client.subscribe('/user/queue/messages', (message) => {
            console.log('💬 NHẬN TIN NHẮN RAW:', message);
            console.log('💬 NHẬN TIN NHẮN BODY:', message.body);
            try {
              const chatMessage = JSON.parse(message.body);
              console.log('💬 PARSED MESSAGE:', chatMessage);
              console.log('💬 Current roomId:', roomId);
              console.log('💬 Message roomId:', chatMessage.roomId);
              dispatch(addMessage(chatMessage));
            } catch (error) {
              console.error('❌ Error parsing message:', error);
            }
          });

          console.log('✅ Subscribed to /user/queue/messages');
        },
        (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      );
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stompClient && stompClient.connected) {
        console.log('🔌 Disconnecting WebSocket...');
        stompClient.disconnect();
      }
    };
  }, [user, dispatch]);

  // Chọn room để chat
  const handleSelectRoom = async (room) => {
    console.log('🎯 handleSelectRoom called with room:', room);
    console.log('🎯 Setting current room to:', room.roomId);
    
    dispatch(setCurrentRoom(room.roomId));
    
    console.log('🎯 Fetching messages for room:', room.roomId);
    await dispatch(getRoomMessages(room.roomId));
    
    console.log('🎯 Marking room as read:', room.roomId);
    await dispatch(markAsRead(room.roomId));
    
    console.log('✅ Room selection complete');
  };

  // Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = messageInput.trim();

    console.log('📤 handleSendMessage called');
    console.log('📤 Content:', content);
    console.log('📤 stompClient:', stompClient);
    console.log('📤 stompClient.connected:', stompClient?.connected);
    console.log('📤 currentRoomId:', roomId);

    if (!content || !stompClient || !stompClient.connected || !roomId) {
      console.log('⚠️ Không thể gửi tin nhắn');
      console.log('⚠️ content:', !!content);
      console.log('⚠️ stompClient:', !!stompClient);
      console.log('⚠️ connected:', stompClient?.connected);
      console.log('⚠️ roomId:', roomId);
      return;
    }

    const chatMessage = {
      content: content,
      roomId: roomId
    };

    console.log('📤 Sending message:', chatMessage);

    const token = localStorage.getItem('access_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    console.log('📤 Headers:', headers);

    stompClient.send("/app/chat.send", headers, JSON.stringify(chatMessage));
    setMessageInput('');
    console.log('✅ Message sent successfully');
  };

  // Logout
  const handleLogout = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
    dispatch(logout());
    navigate('/login');
  };

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  // Filter chat rooms
  const filteredRooms = chatRooms.filter(room => 
    room.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính tổng số tin nhắn chưa đọc
  const totalUnread = chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-8" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Hỗ trợ khách hàng</h1>
            <p className="text-xs text-gray-500">
              {isConnected ? '🟢 Đang hoạt động' : '🔴 Đang kết nối...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Danh sách phòng chat */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khách hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm text-center">
                  {searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
                </p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => handleSelectRoom(room)}
                  className={`p-4 border-b border-gray-200 cursor-pointer transition ${
                    roomId === room.roomId
                      ? 'bg-sky-50 border-l-4 border-l-sky-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {room.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {room.userName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {room.userEmail}
                        </p>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {room.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(room.lastMessageTime)}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                          {room.unreadCount > 9 ? '9+' : room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {!roomId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Chọn một khách hàng để bắt đầu trò chuyện</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-semibold">
                    {filteredRooms.find(r => r.roomId === roomId)?.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {filteredRooms.find(r => r.roomId === roomId)?.userName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {filteredRooms.find(r => r.roomId === roomId)?.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {currentRoomMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Chưa có tin nhắn</p>
                  </div>
                ) : (
                  currentRoomMessages.map((msg) => {
                    const isOwn = msg.senderEmail === user.email;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[60%] rounded-lg p-4 ${
                            isOwn
                              ? 'bg-sky-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm break-words">{msg.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isOwn ? 'text-sky-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form 
                onSubmit={handleSendMessage} 
                className="p-4 bg-white border-t border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || !isConnected}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Gửi</span>
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2">
                    Đang kết nối lại...
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeChat;