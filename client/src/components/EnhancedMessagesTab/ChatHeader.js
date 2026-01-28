import React from 'react';
import { FaPhone, FaVideo, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';

const ChatHeader = ({
  selectedConversation,
  user,
  getEmojiForUser,
  isMobileView,
  setShowConversationList
}) => {
  return (
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ec463d] to-[#FF6B6B] flex items-center justify-center text-xl font-bold">
              {getEmojiForUser(selectedConversation.participant1 === user.username ? 
                selectedConversation.participant2 : 
                selectedConversation.participant1)}
            </div>
            {selectedConversation.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0B2A4A]"></div>
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
  );
};

export default ChatHeader;