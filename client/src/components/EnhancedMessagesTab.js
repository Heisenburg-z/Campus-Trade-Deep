// client/src/components/EnhancedMessagesTab.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ConversationList from './EnhancedMessagesTab/ConversationList';
import MessageArea from './EnhancedMessagesTab/MessageArea';
import MessageHeader from './EnhancedMessagesTab/MessageHeader';
import MessageInput from './EnhancedMessagesTab/MessageInput';
import MessageStatusIndicator from './EnhancedMessagesTab/MessageStatusIndicator';
import { FiMessageSquare, FiSearch, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { IoIosSend } from 'react-icons/io';
import { BsEmojiSmile, BsImage, BsMic } from 'react-icons/bs';

const EnhancedMessagesTab = ({ user }) => {
  const [state, setState] = useState({
    conversations: [],
    messages: [],
    selectedConversation: null,
    newMessage: '',
    searchQuery: '',
    isLoading: true,
    error: null,
    showEmojiPicker: false,
    isMobileView: window.innerWidth < 768,
    showConversationList: window.innerWidth >= 768,
    unreadCount: 0,
    onlineUsers: [],
    typingUsers: {}
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update multiple state properties
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Profile colors based on username
  const getColorForUser = useCallback((username) => {
    const colors = [
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-blue-500 to-cyan-500',
      'bg-gradient-to-r from-green-500 to-emerald-500',
      'bg-gradient-to-r from-orange-500 to-red-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500'
    ];
    const charSum = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('campusTradeToken');
      const response = await axios.get(
        `https://campus-trade-deep-production-7247.up.railway.app/api/messages/conversations`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const formattedConversations = response.data.map(conv => ({
        ...conv,
        color: getColorForUser(conv.participant1 === user.username ? conv.participant2 : conv.participant1),
        unread: conv.unread || Math.floor(Math.random() * 3),
        lastActive: conv.lastActive || getRandomLastActive(),
        status: Math.random() > 0.7 ? 'online' : 'offline'
      }));
      
      // Calculate total unread count
      const totalUnread = formattedConversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);
      
      updateState({
        conversations: formattedConversations,
        selectedConversation: formattedConversations[0] || null,
        unreadCount: totalUnread,
        isLoading: false
      });
      
    } catch (error) {
      updateState({ error: 'Failed to load conversations', isLoading: false });
    }
  }, [user, getColorForUser]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const token = localStorage.getItem('campusTradeToken');
      const response = await axios.get(
        `https://campus-trade-deep-production-7247.up.railway.app/api/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      updateState({
        messages: response.data,
        showConversationList: state.isMobileView ? false : true
      });
    } catch (error) {
      updateState({ error: 'Failed to load messages' });
    }
  }, [state.isMobileView]);

  // Send message
  const sendMessage = useCallback(async () => {
    const { newMessage, selectedConversation } = state;
    if (!newMessage.trim() || !selectedConversation) return;

    const tempId = Date.now();
    const newMsg = {
      id: `temp-${tempId}`,
      content: newMessage.trim(),
      senderId: user.user_id,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    // Optimistic update
    updateState(prev => ({
      messages: [...prev.messages, newMsg],
      newMessage: '',
      conversations: prev.conversations.map(conv => 
        conv.conversation_id === selectedConversation.conversation_id
          ? { ...conv, lastMessage: newMsg.content, lastMessageAt: new Date().toISOString() }
          : conv
      )
    }));

    try {
      const token = localStorage.getItem('campusTradeToken');
      const recipient = selectedConversation.participant1 === user.username 
        ? selectedConversation.participant2_id 
        : selectedConversation.participant1_id;

      const response = await axios.post(
        `https://campus-trade-deep-production-7247.up.railway.app/api/messages`,
        {
          conversationId: selectedConversation.conversation_id,
          content: newMsg.content,
          listingId: selectedConversation.listing_id,
          recipientId: recipient
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Update with real message
      updateState(prev => ({
        messages: prev.messages.map(msg => 
          msg.id === `temp-${tempId}` ? { ...response.data, status: 'delivered' } : msg
        )
      }));
    } catch (error) {
      // Mark as failed
      updateState(prev => ({
        messages: prev.messages.map(msg => 
          msg.id === `temp-${tempId}` ? { ...msg, status: 'failed' } : msg
        ),
        error: error.response?.data?.error || 'Failed to send message'
      }));
    }
  }, [state.newMessage, state.selectedConversation, user]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping) => {
    if (!state.selectedConversation) return;
    
    // Here you would typically send a socket event to notify other users
    console.log(`User is ${isTyping ? 'typing...' : 'stopped typing'}`);
  }, [state.selectedConversation]);

  // Handle message input
  const handleMessageChange = useCallback((e) => {
    const value = e.target.value;
    updateState({ newMessage: value });
    handleTyping(value.length > 0);
  }, [handleTyping]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize
  useEffect(() => {
    fetchConversations();
    
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      updateState({
        isMobileView: mobileView,
        showConversationList: !mobileView
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (state.selectedConversation) {
      fetchMessages(state.selectedConversation.conversation_id);
    }
  }, [state.selectedConversation, fetchMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  // Helper functions
  function getRandomLastActive() {
    const options = ['Just now', '5m ago', '15m ago', '1h ago', '3h ago'];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Render loading/error states
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{state.error}</p>
          <button 
            onClick={fetchConversations}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] overflow-hidden flex flex-col">
      {/* Header */}
      <MessageHeader
        title="Messages"
        unreadCount={state.unreadCount}
        isMobileView={state.isMobileView}
        showConversationList={state.showConversationList}
        onToggleConversationList={() => updateState({ showConversationList: !state.showConversationList })}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        {(!state.isMobileView || state.showConversationList) && (
          <ConversationList
            conversations={state.conversations}
            selectedConversation={state.selectedConversation}
            onSelectConversation={(conv) => updateState({ selectedConversation: conv })}
            searchQuery={state.searchQuery}
            onSearchChange={(value) => updateState({ searchQuery: value })}
            user={user}
            getColorForUser={getColorForUser}
          />
        )}

        {/* Messages Area */}
        {state.selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${getColorForUser(
                  state.selectedConversation.participant1 === user.username 
                    ? state.selectedConversation.participant2 
                    : state.selectedConversation.participant1
                )} flex items-center justify-center text-white font-semibold`}>
                  {(state.selectedConversation.participant1 === user.username 
                    ? state.selectedConversation.participant2 
                    : state.selectedConversation.participant1
                  ).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {state.selectedConversation.participant1 === user.username 
                      ? state.selectedConversation.participant2 
                      : state.selectedConversation.participant1}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      state.selectedConversation.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    {state.selectedConversation.status === 'online' ? 'Online' : state.selectedConversation.lastActive}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FiUsers size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {state.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FiMessageSquare className="text-blue-500" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Start a conversation</h3>
                  <p className="text-gray-500 max-w-sm">
                    Say hello and start chatting about products, orders, or anything else!
                  </p>
                </div>
              ) : (
                state.messages.map((msg, idx) => {
                  const isSender = msg.sender_id === user.user_id;
                  return (
                    <div key={msg.message_id || idx} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isSender 
                          ? 'bg-blue-500 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className="text-xs opacity-80">
                            {new Date(msg.sent_at || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isSender && <MessageStatusIndicator status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              newMessage={state.newMessage}
              onMessageChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              onSend={sendMessage}
              inputRef={inputRef}
              showEmojiPicker={state.showEmojiPicker}
              onToggleEmojiPicker={() => updateState({ showEmojiPicker: !state.showEmojiPicker })}
            />
          </div>
        )}

        {/* No conversation selected */}
        {!state.selectedConversation && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <FiMessageSquare className="text-blue-500" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Select a conversation</h3>
            <p className="text-gray-600 max-w-md mb-6">
              Choose a conversation from the list to start messaging, or start a new conversation from a product page.
            </p>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            {state.onlineUsers.length} online
          </span>
          <span>•</span>
          <span>{state.conversations.length} conversations</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessagesTab;