import React, { useState } from 'react';
import { MoreHorizontal, Search, Smile, Paperclip, Send, Phone, Video, Mic, Image, Pin } from 'lucide-react';

const EnhancedMessagesTab = () => {
  // Demo data
  const user = { user_id: 1, username: 'current_user', avatar: '/api/placeholder/40/40' };
  
  const [conversations, setConversations] = useState([
    { conversation_id: 1, participant1: 'current_user', participant2: 'Alex Johnson', last_message: 'See you tomorrow at 2pm!', unread: 0, online: true, typing: false, last_active: '2 min ago' },
    { conversation_id: 2, participant1: 'current_user', participant2: 'Maya Williams', last_message: 'I loved that restaurant you recommended!', unread: 3, online: true, typing: true, last_active: 'now' },
    { conversation_id: 3, participant1: 'current_user', participant2: 'Team Alpha', last_message: 'Project deadline extended to Friday', unread: 0, online: false, typing: false, last_active: '1 hour ago', group: true, participants: 5 },
    { conversation_id: 4, participant1: 'current_user', participant2: 'Sophie Chen', last_message: 'Check out this new design concept', unread: 1, online: true, typing: false, last_active: '5 min ago' },
    { conversation_id: 5, participant1: 'current_user', participant2: 'Raj Patel', last_message: 'Thanks for your help with the code review', unread: 0, online: false, typing: false, last_active: '3 hours ago' }
  ]);
  
  const [messages, setMessages] = useState([
    { message_id: 1, conversation_id: 1, sender_id: 2, content: "Hey there! How's your project coming along?", sent_at: new Date(Date.now() - 3600000).toISOString(), read: true },
    { message_id: 2, conversation_id: 1, sender_id: 1, content: "It's going well! Just finishing up the last few details.", sent_at: new Date(Date.now() - 3500000).toISOString(), read: true },
    { message_id: 3, conversation_id: 1, sender_id: 2, content: "Great! Do you think you'll be able to present it at tomorrow's meeting?", sent_at: new Date(Date.now() - 3400000).toISOString(), read: true },
    { message_id: 4, conversation_id: 1, sender_id: 1, content: "Yes, definitely! I've prepared all the slides and demos.", sent_at: new Date(Date.now() - 3300000).toISOString(), read: true },
    { message_id: 5, conversation_id: 1, sender_id: 1, content: "By the way, what time is the meeting scheduled for?", sent_at: new Date(Date.now() - 3200000).toISOString(), read: true },
    { message_id: 6, conversation_id: 1, sender_id: 2, content: "It starts at 2pm in Conference Room B. Looking forward to seeing your work!", sent_at: new Date(Date.now() - 3100000).toISOString(), read: true },
    { message_id: 7, conversation_id: 1, sender_id: 1, content: "Perfect, see you tomorrow at 2pm!", sent_at: new Date(Date.now() - 3000000).toISOString(), read: true },
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  
  const filteredConversations = conversations.filter(conv => 
    (conv.participant1 === user.username 
      ? conv.participant2.toLowerCase() 
      : conv.participant1.toLowerCase()
    ).includes(searchQuery.toLowerCase())
  );
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      message_id: messages.length + 1,
      conversation_id: selectedConversation.conversation_id,
      sender_id: user.user_id,
      content: newMessage,
      sent_at: new Date().toISOString(),
      read: false
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  const getFilteredMessages = () => {
    return messages.filter(msg => msg.conversation_id === selectedConversation?.conversation_id);
  };
  
  const getEmojis = () => {
    return ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🙏', '😊'];
  };
  
  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl shadow-2xl p-4 text-white">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <span className="bg-white text-indigo-700 p-2 rounded-lg mr-3">💬</span>
        Messages
        <span className="ml-2 text-lg bg-yellow-500 text-white px-2 py-1 rounded-full animate-pulse">LIVE</span>
      </h2>
      
      <div className="flex h-96 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-inner border border-white/20">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-white/20 flex flex-col">
          <div className="p-3 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/60 py-2 pl-10 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
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
                      {conv.group ? 
                        <div className="flex items-center justify-center">
                          <Pin className="w-6 h-6" />
                        </div> : 
                        (conv.participant1 === user.username ? 
                          conv.participant2.charAt(0).toUpperCase() : 
                          conv.participant1.charAt(0).toUpperCase())
                      }
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-indigo-700"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold truncate">
                        {conv.group ? conv.participant2 : 
                          (conv.participant1 === user.username ? 
                            conv.participant2 : conv.participant1)}
                      </p>
                      <div className="flex flex-col items-end">
                        <span className="text-xs opacity-70">{conv.last_active}</span>
                        {conv.unread > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm opacity-70 truncate mr-1">{conv.last_message}</p>
                      {conv.typing && (
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full animate-pulse">
                          typing...
                        </span>
                      )}
                    </div>
                    {conv.group && (
                      <div className="flex -space-x-2 mt-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-indigo-300 border border-indigo-700" />
                        ))}
                        <div className="w-5 h-5 rounded-full bg-white/20 border border-indigo-700 flex items-center justify-center text-xs">
                          +{conv.participants - 3}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-indigo-800/50 to-purple-900/50">
          {/* Header */}
          {selectedConversation && (
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
                    <p className="text-xs opacity-70">
                      {selectedConversation.online ? 
                        'Online now' : 
                        `Last seen ${selectedConversation.last_active}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {getFilteredMessages().map(message => (
              <div
                key={message.message_id}
                className={`flex ${message.sender_id === user.user_id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {message.sender_id !== user.user_id && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-sm font-bold mr-2 self-end">
                    {selectedConversation.participant2.charAt(0).toUpperCase()}
                  </div>
                )}
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
                    {message.sender_id === user.user_id && (
                      <span className="text-blue-300">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {selectedConversation?.typing && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-sm font-bold mr-2 self-end">
                  {selectedConversation.participant2.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-white/20 p-3 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                onClick={() => setShowEmojis(!showEmojis)}
              >
                <Smile className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="button" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full hover:from-pink-600 hover:to-orange-600 transition-colors shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {showEmojis && (
              <div className="mt-2 p-2 bg-white/30 backdrop-blur-lg rounded-xl flex flex-wrap justify-center gap-2 animate-fadeIn">
                {getEmojis().map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setNewMessage(prev => prev + emoji)}
                    className="w-8 h-8 text-lg hover:bg-white/20 rounded-full flex items-center justify-center transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessagesTab;