// components/EnhancedMessagesTab.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaComments, FaPaperPlane, FaPhone, FaVideo, 
  FaEllipsisH, FaSmile, FaPaperclip, FaImage, FaMicrophone,
  FaUserCircle, FaSearch, FaCheck, FaCheckDouble, FaStar, 
  FaTrash, FaArrowLeft, FaInfoCircle, FaBell
} from 'react-icons/fa';
import Picker from 'emoji-picker-react';

const EnhancedMessagesTab = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef(null);

  // Random emojis for profile placeholders
  const profileEmojis = ['😎', '🚀', '🌟', '🔥', '💫', '🌈', '✨', '🎯', '💥', '🦄'];
  
  // Get random emoji for a username
  const getEmojiForUser = (username) => {
    const charSum = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return profileEmojis[charSum % profileEmojis.length];
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('campusTradeToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/messages/conversations`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        const formattedConversations = response.data.map(conv => ({
          ...conv,
          participant1_id: conv.user1_id,
          participant2_id: conv.user2_id,
          participant1: conv.participant1,
          participant2: conv.participant2,
          last_message: conv.last_message || 'Start a conversation! 💬 Your inbox is waiting for new connections.',
          unread: Math.floor(Math.random() * 3), // Simulated unread count for visual effect
          last_active: getRandomLastActive(), // Simulated last active time
          status: Math.random() > 0.7 ? 'online' : 'offline' // Simulated online status
        }));
        
        setConversations(formattedConversations);
        
        // Auto-select first conversation if available
        if (formattedConversations.length > 0) {
          setSelectedConversation(formattedConversations[0]);
        }
      } catch (error) {
        setError('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
    
    // Handle responsive view
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate random last active time for demo
  function getRandomLastActive() {
    const options = ['Just now', '5m ago', '23m ago', '1h ago', '3h ago', 'Yesterday'];
    return options[Math.floor(Math.random() * options.length)];
  }

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      try {
        const token = localStorage.getItem('campusTradeToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/messages/${selectedConversation.conversation_id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // Add animation delay for visual staggering effect
        const enhancedMessages = response.data.map((msg, index) => ({
          ...msg,
          animationDelay: `${index * 0.1}s`,
          // Add simulated message status for outgoing messages
          status: msg.sender_id === user.user_id ? 
            (Math.random() > 0.3 ? 'read' : 'delivered') : undefined
        }));
        
        setMessages(enhancedMessages);
        
        if (isMobileView) {
          setShowConversationList(false);
        }
      } catch (error) {
        setError('Failed to load messages');
      }
    };

    fetchMessages();
  }, [selectedConversation, isMobileView]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
  
    // Optimistically add message to UI
    const tempId = Date.now();
    const newMsg = {
      message_id: `temp-${tempId}`,
      content: newMessage.trim(),
      sender_id: user.user_id,
      sent_at: new Date().toISOString(),
      status: 'sending',
      isNew: true
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    try {
      const token = localStorage.getItem('campusTradeToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        {
          conversationId: selectedConversation.conversation_id,
          content: newMsg.content,
          listingId: selectedConversation.listing_id,
          recipientId: selectedConversation.participant1 === user.username 
            ? selectedConversation.participant2_id 
            : selectedConversation.participant1_id
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === `temp-${tempId}` ? 
            { ...response.data, status: 'delivered' } : msg
        )
      );
      
      // Update conversation list to show latest message
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === selectedConversation.conversation_id ?
            { ...conv, last_message: newMsg.content } : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === `temp-${tempId}` ? 
            { ...msg, status: 'failed' } : msg
        )
      );
    }
  };

  const onEmojiClick = (event, emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const getTimeFormat = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (messageDate.getTime() > today.getTime() - 86400000) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.participant1 === user.username 
      ? conv.participant2.toLowerCase() 
      : conv.participant1.toLowerCase()
    ).includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-800 to-purple-900 p-6">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-xl font-bold">Loading your conversations...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-800 to-purple-900 p-6">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-xl max-w-md w-full">
        <div className="text-center text-red-300 mb-4 text-6xl">⚠️</div>
        <h3 className="text-white text-xl font-bold text-center mb-2">Connection Error</h3>
        <p className="text-white/80 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 w-full py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg font-bold"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-3xl shadow-2xl p-5 text-white">
      <h2 className="text-4xl font-bold mb-8 flex items-center">
        <span className="bg-gradient-to-r from-pink-500 to-orange-500 p-3 rounded-xl mr-4 shadow-lg">
          <FaComments className="w-8 h-8" />
        </span>
        Messages Hub 💬
      </h2>
      
      <div className="flex h-[600px] bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        {/* Conversation List */}
        {(showConversationList || !isMobileView) && (
          <div className="w-full md:w-2/5 lg:w-1/3 border-r border-white/20 flex flex-col">
            <div className="p-4 border-b border-white/20 bg-white/5">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-white/60" />
                </div>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder-white/60 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
                {['All', 'Unread', 'Favorites', 'Archived'].map(filter => (
                  <button key={filter} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full whitespace-nowrap text-sm">
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-white/80">No conversations found</p>
                  <p className="text-sm text-white/60 mt-2">Start messaging by clicking on a product!</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <div
                    key={conv.conversation_id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                      selectedConversation?.conversation_id === conv.conversation_id 
                        ? 'bg-white/20 backdrop-blur-md' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                          {getEmojiForUser(conv.participant1 === user.username ? 
                            conv.participant2 : conv.participant1)}
                        </div>
                        {conv.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-indigo-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-lg truncate">
                            {conv.participant1 === user.username ? 
                              conv.participant2 : conv.participant1}
                          </p>
                          <p className="text-xs opacity-70">{conv.last_active}</p>
                        </div>
                        <p className="text-sm opacity-80 truncate mr-1">{conv.last_message}</p>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center">
                            {Math.random() > 0.7 && (
                              <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 mr-2">
                                {Math.random() > 0.5 ? '📱 Mobile' : '💻 Web'}
                              </span>
                            )}
                          </div>
                          {conv.unread > 0 && (
                            <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {conv.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-indigo-900/80 to-purple-900/80">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  {isMobileView && (
                    <button 
                      onClick={() => setShowConversationList(true)}
                      className="mr-2 p-2 rounded-full bg-white/10 hover:bg-white/20"
                    >
                      <FaArrowLeft />
                    </button>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-xl font-bold">
                        {getEmojiForUser(selectedConversation.participant1 === user.username ? 
                          selectedConversation.participant2 : 
                          selectedConversation.participant1)}
                      </div>
                      {selectedConversation.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {selectedConversation.participant1 === user.username ? 
                          selectedConversation.participant2 : 
                          selectedConversation.participant1}
                      </p>
                      <p className="text-xs text-white/70">
                        {selectedConversation.status === 'online' ? 'Online now' : selectedConversation.last_active}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <FaPhone />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <FaVideo />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <FaInfoCircle />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                <div className="sticky top-0 w-full text-center">
                  <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-white/70 mb-4">
                    {new Date(messages?.[0]?.sent_at || Date.now()).toLocaleDateString([], {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-4">
                      <span className="text-5xl">👋</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Start a Conversation</h3>
                    <p className="text-center text-white/70 max-w-sm">
                      Say hello and start chatting about products, orders, or anything else!
                    </p>
                  </div>
                ) : (
                  messages.map((message, idx) => {
                    const isSender = message.sender_id === user.user_id;
                    const showTimestamp = idx === 0 || 
                      new Date(message.sent_at).getTime() - 
                      new Date(messages[idx-1].sent_at).getTime() > 300000; // 5 min
                    
                    return (
                      <div key={message.message_id}>
                        {showTimestamp && idx > 0 && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">
                              {getTimeFormat(message.sent_at)}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                          style={{ animationDelay: message.animationDelay || '0s' }}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                              message.isNew ? 'animate-pop' : ''
                            } ${
                              isSender 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-900/20' 
                                : 'bg-white/20 backdrop-blur-md text-white rounded-tl-none'
                            }`}
                          >
                            <p className="text-md">{message.content}</p>
                            <div className="flex justify-end items-center mt-1 text-xs opacity-70 space-x-1">
                              <span>{new Date(message.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              {isSender && (
                                <span>
                                  {message.status === 'sending' && '⏳'}
                                  {message.status === 'delivered' && <FaCheck />}
                                  {message.status === 'read' && <FaCheckDouble />}
                                  {message.status === 'failed' && '❌'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-8xl mb-4">💬</div>
              <h3 className="text-3xl font-bold mb-3">Your Messages</h3>
              <p className="text-white/70 max-w-md">
                Start a conversation with sellers by clicking the message button on any product. Your inbox is currently empty.
              </p>
              <button 
                className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl font-bold shadow-lg hover:from-pink-600 hover:to-orange-600 transition-all"
              >
                Browse Products
              </button>
            </div>
          )}

          {/* Input Area */}
          {selectedConversation && (
            <div className="relative">
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-4">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="border-t border-white/20 p-4 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                      <FaSmile className="w-5 h-5" />
                    </button>
                    <button 
                      type="button"
                      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                      <FaPaperclip className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                  />
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-4 ${
                      newMessage.trim() 
                        ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' 
                        : 'bg-white/10'
                    } text-white rounded-full transition-all shadow-lg`}
                  >
                    <FaPaperPlane className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-4 text-white/50 text-sm">
                    <button type="button" className="flex items-center space-x-1">
                      <FaImage className="w-4 h-4" />
                      <span>Photos</span>
                    </button>
                    <button type="button" className="flex items-center space-x-1">
                      <FaMicrophone className="w-4 h-4" />
                      <span>Voice</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Chat Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20 mr-2">
              <FaBell className="text-blue-300" />
            </div>
            <h3 className="font-bold">Quick Responses</h3>
          </div>
          <p className="text-sm text-white/70">
            Use 👍 and other reactions to quickly respond without typing
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-green-500/20 mr-2">
              <FaImage className="text-green-300" />
            </div>
            <h3 className="font-bold">Share Photos</h3>
          </div>
          <p className="text-sm text-white/70">
            Easily share product images by clicking the photo icon
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 mr-2">
              <FaStar className="text-purple-300" />
            </div>
            <h3 className="font-bold">Favorite Contacts</h3>
          </div>
          <p className="text-sm text-white/70">
            Save frequent contacts as favorites for quick access
          </p>
        </div>
      </div>
    </div>
  );
};



export default EnhancedMessagesTab;