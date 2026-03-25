import React from 'react';
import MessageBubble from './MessageBubble';
import TypingBubble from './TypingBubble';
import './ChatBox.css';

function ChatBox({ messages, message, setMessage, onSend, onRegenerate, typing, chatEndRef, characterName }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const showRegen =
    messages.length > 0 && messages[messages.length - 1].sender === 'ai' && !typing;

  return (
    <div className="chatbox-container">
      <div className="chatbox-messages" id="chatbox-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} characterName={characterName} />
        ))}

        {typing && <TypingBubble />}

        <div ref={chatEndRef}></div>
      </div>

      <div className="chatbox-input-section">
        <div className="chatbox-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <button onClick={onSend}>Send</button>
        </div>

        {showRegen && (
          <div className="regen-area">
            <button className="btn-regenerate" onClick={onRegenerate}>
              ↺ Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
