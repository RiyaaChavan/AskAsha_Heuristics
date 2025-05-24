import React, { useState } from 'react';
import { ChatInputProps } from './types';

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, sendMessage }) => {
  // Add state to track if a file is selected
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  
  // Create a reference to the hidden file input element
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file button click
  const handleFileButtonClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      const fileSize = (file.size / 1024).toFixed(2) + ' KB';
      
      // Update the input with information about the attached file
      setInput(`I'm attaching a file: ${fileName} (${fileSize})`);
      
      // Indicate that a file is selected
      setFileSelected(true);
      
      // Reset the file input so the same file can be selected again if needed
      event.target.value = '';
      
      // Optionally, you could upload the file to a server here using FormData
      // const formData = new FormData();
      // formData.append('file', file);
      // fetch('your-upload-endpoint', { method: 'POST', body: formData });
    }
  };

  // Clear file selection when the message is sent
  const handleSendMessage = () => {
    sendMessage();
    setFileSelected(false);
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          className="chat-input"
        />
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx"
        />
        <button 
          className={`attach-button ${fileSelected ? 'file-selected' : ''}`}
          type="button"
          onClick={handleFileButtonClick}
          aria-label="Attach file"
          title="Attach a document (.pdf, .doc, .docx)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <button className="send-button" onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatInput;