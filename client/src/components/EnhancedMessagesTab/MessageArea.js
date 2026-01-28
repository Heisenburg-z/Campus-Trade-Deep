import React from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { FaComments } from 'react-icons/fa';

const MessageArea = ({
  selectedConversation,
  messages,
  user,
  getEmojiForUser,
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  handleSendMessage,
  messagesEndRef,
  isMobileView,
  setShowConversationList
}) => {
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

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-[#0B2A4A]/80 to-[#1B8ED1]/80">
        <div className="text-8xl mb-4">💬</div>
        <h3 className="text-3xl font-bold mb-3">Your Messages</h3>
        <p className="text-white/70 max-w-md">
          Start a conversation with sellers by clicking the message button on any product. Your inbox is currently empty.
        </p>
        <button 
          className="mt-6 px-8 py-3 bg-gradient-to-r from-[#ec463d] to-[#FF6B6B] rounded-xl font-bold shadow-lg hover:from-[#ec463d]/90 hover:to-[#FF6B6B]/90 transition-all"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0B2A4A]/80 to-[#1B8ED1]/80">
      <ChatHeader
        selectedConversation={selectedConversation}
        user={user}
        getEmojiForUser={getEmojiForUser}
        isMobileView={isMobileView}
        setShowConversationList={setShowConversationList}
      />
      
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
      }}>
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
              new Date(messages[idx-1].sent_at).getTime() > 300000;
            
            return (
              <div key={message.message_id}>
                {showTimestamp && idx > 0 && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">
                      {getTimeFormat(message.sent_at)}
                    </span>
                  </div>
                )}
                
                <MessageBubble
                  message={message}
                  isSender={isSender}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        onEmojiClick={onEmojiClick}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessageArea;