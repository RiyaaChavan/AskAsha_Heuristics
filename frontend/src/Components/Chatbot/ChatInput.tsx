import React from 'react';
import { ChatInputProps } from './types';

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, sendMessage }) => {
  return (
    <div className="input-area">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatInput;