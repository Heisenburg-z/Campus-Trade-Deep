// client/src/components/EnhancedMessagesTab/MessageStatusIndicator.js
import React from 'react';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

const MessageStatusIndicator = ({ status }) => {
  switch (status) {
    case 'sending':
      return <span className="text-xs text-gray-400 animate-pulse">⏳</span>;
    case 'delivered':
      return <FiCheck className="text-gray-500" size={14} />;
    case 'read':
      return <FiCheckCircle className="text-blue-500" size={14} />;
    case 'failed':
      return <span className="text-xs text-red-500">❌</span>;
    default:
      return null;
  }
};

export default MessageStatusIndicator;