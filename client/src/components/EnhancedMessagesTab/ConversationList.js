import React from 'react';
import { FaSearch } from 'react-icons/fa';

const ConversationList = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  searchQuery,
  setSearchQuery,
  user,
  getEmojiForUser,
  isMobileView
}) => {
  return (
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
            <button key={filter} className="px-4 py-2 bg-[#1B8ED1]/30 hover:bg-[#1B8ED1]/50 rounded-full whitespace-nowrap text-sm">
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-white/80">No conversations found</p>
            <p className="text-sm text-white/60 mt-2">Start messaging by clicking on a product!</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.conversation_id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-300 hover:bg-[#1B8ED1]/20 ${
                selectedConversation?.conversation_id === conv.conversation_id 
                  ? 'bg-[#1B8ED1]/30 backdrop-blur-md' 
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ec463d] to-[#FF6B6B] flex items-center justify-center text-2xl font-bold shadow-lg">
                    {getEmojiForUser(conv.participant1 === user.username ? 
                      conv.participant2 : conv.participant1)}
                  </div>
                  {conv.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0B2A4A]"></div>
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
                        <span className="text-xs bg-[#1B8ED1]/30 rounded-full px-2 py-0.5 mr-2">
                          {Math.random() > 0.5 ? '📱 Mobile' : '💻 Web'}
                        </span>
                      )}
                    </div>
                    {conv.unread > 0 && (
                      <div className="bg-gradient-to-r from-[#ec463d] to-[#FF6B6B] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
  );
};

export default ConversationList;