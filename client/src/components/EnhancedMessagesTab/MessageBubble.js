import React from 'react';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageBubble = ({ message, isSender }) => {
  return (
    <div
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fadeIn`}
      style={{ animationDelay: message.animationDelay || '0s' }}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
          message.isNew ? 'animate-pop' : ''
        } ${
          isSender 
            ? 'bg-gradient-to-r from-[#1B8ED1] to-[#0B2A4A] text-white rounded-tr-none shadow-[#1B8ED1]/20' 
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
  );
};

export default MessageBubble;