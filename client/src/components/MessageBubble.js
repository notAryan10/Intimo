import React from 'react';
import './MessageBubble.css';
import { parseMessage } from '../utils/messageFormatter';

function FormattedMessage({ text, sender }) {
  if (!text) return null;

  const segments = parseMessage(text, sender);

  return (
    <div className="formatted-message">
      {segments.map((segment, index) => {
        const className = segment.type; 
        return (
          <span key={index} className={className}>
            {segment.content}
          </span>
        );
      })}
    </div>
  );
}

function MessageBubble({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div className={`message-container ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
        <FormattedMessage text={text} sender={sender} />
      </div>
    </div>
  );
}

export default MessageBubble;
