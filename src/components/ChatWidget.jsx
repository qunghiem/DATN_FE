import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { initChat, addMessage, markAsRead } from '../features/chat/chatSlice';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const ChatWidget = () => {
  const dispatch = useDispatch();
  const { messages, roomId, isLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Init chat khi component mount
  useEffect(() => {
    if (user) {
      dispatch(initChat());
    }
  }, [dispatch, user]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!user || !roomId) return;

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
          setIsConnected(true);
          setStompClient(client);

          // Subscribe để nhận tin nhắn
          client.subscribe('/user/queue/messages', (message) => {
            console.log('💬 NHẬN TIN NHẮN:', message.body);
            const chatMessage = JSON.parse(message.body);
            dispatch(addMessage(chatMessage));
          });

          console.log('✅ Subscribed');
        },
        (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          // Retry sau 3 giây
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      );
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [user, roomId, dispatch]);

  // Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = messageInput.trim();

    if (!content || !stompClient || !stompClient.connected || !roomId) {
      console.log('⚠️ Không thể gửi');
      return;
    }

    const chatMessage = {
      content: content,
      roomId: roomId
    };

    const token = localStorage.getItem('access_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    stompClient.send("/app/chat.send", headers, JSON.stringify(chatMessage));
    setMessageInput('');
    console.log('✅ Đã gửi tin nhắn');
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Đánh dấu đã đọc khi mở chat
    if (!isOpen && roomId) {
      dispatch(markAsRead(roomId));
    }
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

  // Đếm tin nhắn chưa đọc từ EMPLOYEE
  const unreadCount = messages.filter(m => !m.isRead && m.senderRole === 'EMPLOYEE').length;

  if (!user) return null;

  return (
    <>
      {/* Chat Button - Fixed ở góc phải */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-sky-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
                <p className="text-xs opacity-90">
                  {isConnected ? '🟢 Đang hoạt động' : '🔴 Đang kết nối...'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Chưa có tin nhắn. Hãy bắt đầu trò chuyện!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderEmail === user.email;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn
                          ? 'bg-sky-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
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
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-1">
                Đang kết nối lại...
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;