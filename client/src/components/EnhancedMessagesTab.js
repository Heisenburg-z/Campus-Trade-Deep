// components/EnhancedMessagesTab.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaComments, FaPaperPlane, FaPhone, FaVideo, 
  FaEllipsisH, FaSmile, FaPaperclip, FaImage, FaMicrophone
} from 'react-icons/fa';

const EnhancedMessagesTab = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          participant1_id: conv.user1_id,  // Add these
          participant2_id: conv.user2_id,  // Add these
          participant1: conv.participant1,
          participant2: conv.participant2,
          last_message: conv.last_message || 'Start a conversation with sellers by clicking the message button on any product. Your inbox is currently empty',
          unread: 0
        }));
        
        setConversations(formattedConversations);
      } catch (error) {
        setError('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      try {
        const token = localStorage.getItem('campusTradeToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/messages/${selectedConversation.conversation_id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        setMessages(response.data);
      } catch (error) {
        setError('Failed to load messages');
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
  
    try {
      const token = localStorage.getItem('campusTradeToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        {
          conversationId: selectedConversation.conversation_id, // Changed from conversation_id
          content: newMessage.trim(),
          // Add these if creating new conversation:
          listingId: selectedConversation.listing_id,
          recipientId: selectedConversation.participant1 === user.username 
            ? selectedConversation.participant2_id 
            : selectedConversation.participant1_id
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.participant1 === user.username 
      ? conv.participant2.toLowerCase() 
      : conv.participant1.toLowerCase()
    ).includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-4 text-center">Loading messages...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl shadow-2xl p-4 text-white">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <span className="bg-white text-indigo-700 p-2 rounded-lg mr-3">💬</span>
        Messages
      </h2>
      
      <div className="flex h-96 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-inner border border-white/20">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-white/20 flex flex-col">
          <div className="p-3 border-b border-white/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/60 py-2 pl-4 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <div
                key={conv.conversation_id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-3 border-b border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/20 ${
                  selectedConversation?.conversation_id === conv.conversation_id 
                    ? 'bg-white/30 backdrop-blur-md' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-lg font-bold shadow-lg">
                      {conv.participant1 === user.username ? 
                        conv.participant2.charAt(0).toUpperCase() : 
                        conv.participant1.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold truncate">
                        {conv.participant1 === user.username ? 
                          conv.participant2 : conv.participant1}
                      </p>
                    </div>
                    <p className="text-sm opacity-70 truncate mr-1">{conv.last_message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-indigo-800/50 to-purple-900/50">
          {selectedConversation && (
            <>
              <div className="p-3 border-b border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-lg font-bold">
                      {selectedConversation.participant1 === user.username ? 
                        selectedConversation.participant2.charAt(0).toUpperCase() : 
                        selectedConversation.participant1.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">
                        {selectedConversation.participant1 === user.username ? 
                          selectedConversation.participant2 : 
                          selectedConversation.participant1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.message_id}
                    className={`flex ${message.sender_id === user.user_id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 shadow-md ${
                        message.sender_id === user.user_id 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white/20 backdrop-blur-md text-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex justify-end items-center mt-1 text-xs opacity-70 space-x-1">
                        <span>{new Date(message.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-white/20 p-3 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full hover:from-pink-600 hover:to-orange-600 transition-colors shadow-lg"
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessagesTab;