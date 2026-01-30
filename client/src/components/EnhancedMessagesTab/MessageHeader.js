// client/src/components/EnhancedMessagesTab/MessageHeader.js
import React from 'react';
import { FiSearch, FiChevronLeft, FiMessageSquare } from 'react-icons/fi';

const MessageHeader = ({ title, unreadCount, isMobileView, showConversationList, onToggleConversationList }) => {
  return (
    <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {isMobileView && (
          <button
            onClick={onToggleConversationList}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiChevronLeft size={20} className={showConversationList ? 'rotate-0' : 'rotate-180'} />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <FiMessageSquare size={24} className="text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;