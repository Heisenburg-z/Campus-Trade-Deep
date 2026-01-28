import React from 'react';
import Picker from 'emoji-picker-react';
import { FaSmile, FaPaperclip, FaImage, FaMicrophone, FaPaperPlane } from 'react-icons/fa';

const MessageInput = ({
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  handleSendMessage
}) => {
  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-10">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="border-t border-white/20 p-4 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <FaSmile className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <FaPaperclip className="w-5 h-5" />
            </button>
          </div>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-4 ${
              newMessage.trim() 
                ? 'bg-gradient-to-r from-[#ec463d] to-[#FF6B6B] hover:from-[#ec463d]/90 hover:to-[#FF6B6B]/90' 
                : 'bg-white/10'
            } text-white rounded-full transition-all shadow-lg`}
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-center mt-2">
          <div className="flex space-x-4 text-white/50 text-sm">
            <button type="button" className="flex items-center space-x-1 hover:text-white/80">
              <FaImage className="w-4 h-4" />
              <span>Photos</span>
            </button>
            <button type="button" className="flex items-center space-x-1 hover:text-white/80">
              <FaMicrophone className="w-4 h-4" />
              <span>Voice</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;