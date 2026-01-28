import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ConversationList from './EnhancedMessagesTab/ConversationList';
import MessageArea from './EnhancedMessagesTab/MessageArea';
import QuickTips from './EnhancedMessagesTab/QuickTips';
import LoadingErrorStates from './EnhancedMessagesTab/LoadingErrorStates';
import { FaComments } from 'react-icons/fa';

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

  // Profile emojis
  const profileEmojis = ['😎', '🚀', '🌟', '🔥', '💫', '🌈', '✨', '🎯', '💥', '🦄'];
  
  const getEmojiForUser = (username) => {
    const charSum = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return profileEmojis[charSum % profileEmojis.length];
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('campusTradeToken');
        const response = await axios.get(
          `https://campus-trade-deep-production-7247.up.railway.app/api/messages/conversations`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        const formattedConversations = response.data.map(conv => ({
          ...conv,
          participant1_id: conv.user1_id,
          participant2_id: conv.user2_id,
          participant1: conv.participant1,
          participant2: conv.participant2,
          last_message: conv.last_message || 'Start a conversation! 💬 Your inbox is waiting for new connections.',
          unread: Math.floor(Math.random() * 3),
          last_active: getRandomLastActive(),
          status: Math.random() > 0.7 ? 'online' : 'offline'
        }));
        
        setConversations(formattedConversations);
        
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
          `https://campus-trade-deep-production-7247.up.railway.app/api/messages/${selectedConversation.conversation_id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        const enhancedMessages = response.data.map((msg, index) => ({
          ...msg,
          animationDelay: `${index * 0.1}s`,
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
  
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
        `https://campus-trade-deep-production-7247.up.railway.app/api/messages`,
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
      
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === `temp-${tempId}` ? 
            { ...response.data, status: 'delivered' } : msg
        )
      );
      
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === selectedConversation.conversation_id ?
            { ...conv, last_message: newMsg.content } : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
      
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

  const filteredConversations = conversations.filter(conv => 
    (conv.participant1 === user.username 
      ? conv.participant2.toLowerCase() 
      : conv.participant1.toLowerCase()
    ).includes(searchQuery.toLowerCase())
  );

  if (isLoading || error) {
    return <LoadingErrorStates isLoading={isLoading} error={error} />;
  }

  return (
    <div className="bg-gradient-to-br from-[#0B2A4A] to-[#1B8ED1] rounded-3xl shadow-2xl p-5 text-white">
      <h2 className="text-4xl font-bold mb-8 flex items-center">
        <span className="bg-gradient-to-r from-[#ec463d] to-[#FF6B6B] p-3 rounded-xl mr-4 shadow-lg">
          <FaComments className="w-8 h-8" />
        </span>
        Messages Hub 💬
      </h2>
      
      <div className="flex h-[600px] bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        {/* Conversation List */}
        {(showConversationList || !isMobileView) && (
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            user={user}
            getEmojiForUser={getEmojiForUser}
            isMobileView={isMobileView}
          />
        )}

        {/* Messages Area */}
        <MessageArea
          selectedConversation={selectedConversation}
          messages={messages}
          user={user}
          getEmojiForUser={getEmojiForUser}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          onEmojiClick={onEmojiClick}
          handleSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          isMobileView={isMobileView}
          setShowConversationList={setShowConversationList}
        />
      </div>
      
      <QuickTips />
    </div>
  );
};

export default EnhancedMessagesTab;