// client/src/components/EnhancedMessagesTab/MessageInput.js
import React from 'react';
import { IoIosSend } from 'react-icons/io';
import { BsEmojiSmile, BsImage, BsMic } from 'react-icons/bs';

const MessageInput = ({ 
  newMessage, 
  onMessageChange, 
  onKeyPress, 
  onSend,
  inputRef,
  showEmojiPicker,
  onToggleEmojiPicker
}) => {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleEmojiPicker}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <BsEmojiSmile size={20} />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={onMessageChange}
            onKeyPress={onKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            rows="1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <BsImage size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <BsMic size={20} />
          </button>
          <button
            onClick={onSend}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-xl ${
              newMessage.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-400'
            } transition-colors`}
          >
            <IoIosSend size={20} />
          </button>
        </div>
      </div>
      
      {showEmojiPicker && (
        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="grid grid-cols-8 gap-2">
            {['😀', '😂', '😍', '🤔', '👍', '👏', '🎉', '❤️', '🔥', '✨'].map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onMessageChange({ target: { value: newMessage + emoji } });
                  onToggleEmojiPicker();
                }}
                className="text-xl hover:bg-gray-100 rounded-lg p-2"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;