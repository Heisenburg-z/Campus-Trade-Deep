// client/src/components/EnhancedMessagesTab/ConversationList.js
import React from 'react';
import { FiClock } from 'react-icons/fi';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  user,
  getColorForUser
}) => {
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participant1 === user.username ? conv.participant2 : conv.participant1;
    return otherUser.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Conversations</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-4xl mb-4">💭</div>
            <p className="text-gray-600 font-medium mb-2">No conversations</p>
            <p className="text-sm text-gray-500">Start messaging from a product page</p>
          </div>
        ) : (
          filteredConversations.map(conv => {
            const otherUser = conv.participant1 === user.username ? conv.participant2 : conv.participant1;
            const isSelected = selectedConversation?.conversation_id === conv.conversation_id;
            
            return (
              <div
                key={conv.conversation_id}
                onClick={() => onSelectConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full ${getColorForUser(otherUser)} flex items-center justify-center text-white font-semibold`}>
                      {otherUser.charAt(0).toUpperCase()}
                    </div>
                    {conv.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800 truncate">{otherUser}</h4>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiClock className="mr-1" size={10} />
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage || 'Start chatting...'}</p>
                    {conv.unread > 0 && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-blue-600 font-medium">
                          {conv.unread} new message{conv.unread > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;